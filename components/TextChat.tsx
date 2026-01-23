import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { Message, UserProfile, SystemConfig } from '../types';
import { NOVA_AI_SYSTEM_INSTRUCTION } from '../constants';

const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const isVideoUrl = (url: string) => {
  return url.match(/\.(mp4|webm|ogg)$/i);
};

const MarkdownComponents = {
  p: ({ children }: any) => <p className="mb-4 last:mb-0 leading-relaxed text-white/80 font-medium">{children}</p>,
  h1: ({ children }: any) => <h1 className="text-lg font-black mt-6 mb-3 uppercase tracking-tighter text-white border-b border-white/10 pb-2">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-base font-black mt-5 mb-2 uppercase tracking-tight text-nova-gold">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-[14px] font-bold mt-4 mb-2 text-white/90 underline underline-offset-4 decoration-nova-gold/30">{children}</h3>,
  ul: ({ children }: any) => <ul className="list-none mb-4 space-y-2 ml-1">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal ml-6 mb-4 space-y-2 font-bold text-nova-gold/80">{children}</ol>,
  li: ({ children, node }: any) => {
    const isOrdered = node?.parent?.tagName === 'ol';
    return (
      <li className={`text-[13px] ${isOrdered ? 'mb-1' : 'flex items-start gap-3'}`}>
        {!isOrdered && <i className="fas fa-caret-right text-nova-gold/40 mt-1.5 text-[10px]"></i>}
        <span className="font-medium text-white/70">{children}</span>
      </li>
    );
  },
  strong: ({ children }: any) => <strong className="font-black text-nova-gold uppercase tracking-tighter">{children}</strong>,
  em: ({ children }: any) => <em className="italic text-white underline decoration-nova-gold/20">{children}</em>,
  code: ({ node, inline, className, children, ...props }: any) => {
    return inline ? (
      <code className="bg-white/10 px-1.5 py-0.5 rounded text-nova-gold font-mono text-[11px] font-bold border border-white/5" {...props}>
        {children}
      </code>
    ) : (
      <div className="relative my-6 group">
        <div className="absolute -top-3 left-4 px-3 py-1 bg-nova-navy border border-white/10 rounded-full text-[7px] font-black uppercase tracking-[0.2em] text-nova-gold z-10 shadow-xl">
          <i className="fas fa-terminal mr-2 opacity-50"></i>
          Institutional Data Script
        </div>
        <pre className="bg-black/60 p-6 pt-8 rounded-2xl border border-white/10 overflow-x-auto custom-scrollbar shadow-2xl backdrop-blur-md">
          <code className="font-mono text-[11px] text-nova-gold/80 leading-relaxed block" {...props}>
            {children}
          </code>
        </pre>
      </div>
    );
  },
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-nova-gold/60 pl-6 py-2 italic text-white/60 my-5 bg-nova-gold/5 rounded-r-2xl border-dashed">
      {children}
    </blockquote>
  ),
  table: ({ children }: any) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-white/10 bg-white/5 shadow-inner">
      <table className="w-full text-left border-collapse text-[12px]">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: any) => <thead className="bg-white/5 border-b border-white/10">{children}</thead>,
  th: ({ children }: any) => <th className="p-3 font-black uppercase tracking-widest text-nova-gold/60 text-[10px]">{children}</th>,
  td: ({ children }: any) => <td className="p-3 border-b border-white/5 text-white/70 font-medium">{children}</td>,
  img: ({ src, alt }: any) => (
    <div className="my-6 rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-white/5 animate-in fade-in duration-700 ring-1 ring-white/5">
      <img src={src} alt={alt} className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-700" loading="lazy" />
      {alt && <div className="p-4 bg-black/40 text-[9px] text-white/30 uppercase tracking-[0.3em] font-black border-t border-white/5 text-center">{alt}</div>}
    </div>
  ),
  a: ({ children, href }: any) => {
    const ytId = getYouTubeId(href);
    if (ytId) {
      return (
        <div className="my-6 aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black animate-in fade-in duration-500 ring-4 ring-white/5">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${ytId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
      );
    }

    if (isVideoUrl(href)) {
      return (
        <div className="my-6 rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black animate-in fade-in duration-500 ring-4 ring-white/5">
          <video src={href} controls className="w-full h-auto max-h-[400px]" />
        </div>
      );
    }

    return (
      <a href={href} className="text-nova-gold underline underline-offset-8 decoration-nova-gold/30 hover:text-white hover:decoration-nova-gold transition-all font-black uppercase tracking-tighter text-[11px]" target="_blank" rel="noopener noreferrer">
        {children} <i className="fas fa-external-link-alt text-[8px] ml-1 opacity-40"></i>
      </a>
    );
  },
  hr: () => <hr className="my-8 border-white/10 border-dashed" />,
};

const MessageBubble: React.FC<{ 
  msg: Message; 
  userName: string; 
  showFeedback: boolean;
  onFeedback: (text: string) => void;
}> = ({ msg, userName, showFeedback, onFeedback }) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleFeedbackSubmit = () => {
    if (feedbackText.trim()) {
      onFeedback(feedbackText);
      setSubmitted(true);
      setFeedbackText('');
    }
  };

  const timeString = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300 group`}>
      <div className={`max-w-[88%] space-y-1`}>
        <div className={`flex items-center gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} ml-1`}>
          <span className="text-[7px] font-black uppercase tracking-[0.2em] opacity-30">
            {msg.role === 'user' ? userName : 'Nova AI'}
          </span>
          <span className="text-[6px] font-bold opacity-0 group-hover:opacity-30 transition-opacity uppercase tracking-tighter">
            {timeString}
          </span>
        </div>
        
        <div className={`px-6 py-5 rounded-[32px] text-[13px] leading-relaxed relative shadow-2xl ${
          msg.role === 'user' 
            ? 'bg-white/5 text-white/80 rounded-tr-sm border border-white/5' 
            : 'bg-nova-gold/5 text-nova-gold/90 rounded-tl-sm border border-nova-gold/10'
        }`}>
          <ReactMarkdown components={MarkdownComponents as any}>{msg.content}</ReactMarkdown>
          
          {msg.sources && msg.sources.length > 0 && (
            <div className="mt-5 pt-5 border-t border-nova-gold/10 space-y-2">
              <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-30">Institutional Verification</p>
              <div className="flex flex-wrap gap-2">
                {msg.sources.map((source, idx) => (
                  <a 
                    key={idx} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-nova-gold/5 hover:bg-nova-gold/10 px-3 py-1.5 rounded-full text-[9px] font-bold text-nova-gold/70 hover:text-nova-gold transition-all border border-nova-gold/10"
                  >
                    <i className="fas fa-link text-[7px] opacity-40"></i>
                    {source.title || 'Official Record'}
                  </a>
                ))}
              </div>
            </div>
          )}

          {showFeedback && msg.role === 'assistant' && (
            <div className="mt-6 pt-5 border-t border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[7px] font-black uppercase tracking-[0.3em] text-white/20">Quality Assurance Briefing</p>
                {submitted && <i className="fas fa-check-circle text-nova-gold text-[10px] animate-pulse"></i>}
              </div>
              
              {submitted ? (
                <div className="text-[9px] font-bold text-nova-gold/50 italic py-2 bg-nova-gold/5 rounded-xl text-center">Protocol acknowledged. Briefing archived.</div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Impute institutional feedback..."
                    className="flex-1 bg-white/5 rounded-xl px-4 py-2.5 text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-nova-gold/30 placeholder:text-white/10 transition-all"
                    onKeyDown={(e) => e.key === 'Enter' && handleFeedbackSubmit()}
                  />
                  <button 
                    onClick={handleFeedbackSubmit}
                    disabled={!feedbackText.trim()}
                    className="px-4 py-2 bg-nova-gold text-nova-navy rounded-xl text-[8px] font-black uppercase tracking-widest disabled:opacity-10 active:scale-95 transition-all shadow-lg shadow-nova-gold/5"
                  >
                    Transmit
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className={`text-[6px] opacity-10 font-medium px-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
          {timeString} • ENCRYPTED PROTOCOL
        </div>
      </div>
    </div>
  );
};

interface TextChatProps {
  userProfile: UserProfile;
  sysConfig: SystemConfig;
  isSystemRestricted: boolean;
  systemReason: string;
  onWordCount: (count: number, summary: string) => void;
  onFeedback: (text: string) => void;
}

const TextChat: React.FC<TextChatProps> = ({ userProfile, sysConfig, isSystemRestricted, systemReason, onWordCount, onFeedback }) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(`chat_history_${userProfile.email}`);
    return saved ? JSON.parse(saved) : [
      {
        role: 'assistant',
        content: `**Uplink Established.**\n\nWelcome, ${userProfile.name}. I am Nova AI, representing the institutional excellence of Nova Crest School. \n\nHow may I facilitate your multimedia discovery protocols today?`,
        timestamp: Date.now()
      }
    ];
  });
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(`chat_history_${userProfile.email}`, JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const countWords = (str: string) => str.trim().split(/\s+/).filter(Boolean).length;

  const currentWordCount = useMemo(() => countWords(input), [input]);
  const remainingQuota = Math.max(0, sysConfig.totalQuota - sysConfig.usedQuota - currentWordCount);
  const isQuotaExceeded = currentWordCount > (sysConfig.totalQuota - sysConfig.usedQuota);

  const handleSend = async () => {
    if (!input.trim() || isTyping || isSystemRestricted || isQuotaExceeded) return;
    
    const key = process.env.API_KEY;
    if (!key) {
      setError("Authorization Missing. Uplink Failed.");
      return;
    }

    const currentInput = input;
    const userWordCount = countWords(currentInput);
    
    onWordCount(userWordCount, currentInput);
    
    const userMessage: Message = { role: 'user', content: currentInput, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: currentInput,
        config: { 
          systemInstruction: NOVA_AI_SYSTEM_INSTRUCTION + `\nUser: ${userProfile.name}. Role: ${userProfile.type}. Portal: Multimedia-Active.`, 
          tools: [{ googleSearch: {} }] 
        }
      });

      const textOutput = response.text || "Institutional data uplink interrupted. Record lost.";
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources = groundingChunks
        ?.map((chunk: any) => {
          if (chunk.web) {
            return { title: chunk.web.title, uri: chunk.web.uri };
          }
          return null;
        })
        .filter((s): s is { title: string; uri: string } => !!s);

      const aiMessage: Message = { 
        role: 'assistant', 
        content: textOutput, 
        timestamp: Date.now(),
        sources: sources && sources.length > 0 ? sources : undefined
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (e: any) {
      const errorMsg = e?.message || e?.toString() || "";
      if (errorMsg.includes('429') || errorMsg.includes('Too Many Requests')) {
        setError("Uplink Saturation: Institutional servers are handling too many requests. Please pause for 60 seconds.");
      } else {
        setError("Institutional uplink unstable. Protocols suggest immediate retry.");
      }
    } finally {
      setIsTyping(false);
    }
  };

  if (isSystemRestricted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 rounded-[40px] bg-white/5 flex items-center justify-center text-red-500 mb-10 shadow-[0_0_50px_rgba(239,68,68,0.1)] ring-1 ring-white/10">
          <i className="fas fa-shield-slash text-3xl animate-pulse"></i>
        </div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{systemReason}</h2>
        <p className="text-white/30 text-[11px] font-black uppercase tracking-[0.5em] mt-6 max-w-[280px] leading-relaxed">
          The institutional AI uplink has been suspended by governance protocols for system maintenance.
        </p>
        <div className="mt-16 pt-12 border-t border-white/5 w-full max-w-[200px]">
           <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em]">Protocol v5.4.3 SECURED</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto space-y-10 p-6 custom-scrollbar pb-40">
        {messages.map((msg, idx) => (
          <MessageBubble 
            key={idx} 
            msg={msg} 
            userName={userProfile.name || 'Visitor'} 
            showFeedback={idx >= 2}
            onFeedback={(text) => onFeedback(`[Message #${idx+1}] ${text}`)}
          />
        ))}
        {isTyping && (
          <div className="flex items-center gap-3 ml-2">
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 bg-nova-gold/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-nova-gold/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-nova-gold/60 rounded-full animate-bounce"></div>
            </div>
            <span className="text-[8px] font-black text-nova-gold/40 tracking-[0.4em] uppercase">Retrieving Institutional Records</span>
          </div>
        )}
        {error && <div className="text-[9px] font-black text-red-500 uppercase text-center p-4 glass rounded-[24px] border border-red-500/20 shadow-xl shadow-red-500/5">{error}</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-nova-navy via-nova-navy/95 to-transparent z-20">
        <div className="flex justify-between items-center mb-3 px-6">
           <div className="flex items-center gap-3">
             <div className={`w-2 h-2 rounded-full ${isQuotaExceeded ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`}></div>
             <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-colors ${isQuotaExceeded ? 'text-red-500' : 'text-nova-gold/40'}`}>
               {isQuotaExceeded ? 'Uplink Blocked' : `Word Pool: ${remainingQuota.toLocaleString()} REMAINING`}
             </span>
           </div>
           {input.trim() && (
             <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 animate-in fade-in">
               Drafting: {currentWordCount} Words
             </span>
           )}
        </div>

        <div className={`glass p-2 rounded-[32px] flex items-center border-none shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 ${isQuotaExceeded ? 'ring-2 ring-red-500/30 bg-red-500/5' : 'ring-1 ring-white/5 focus-within:ring-nova-gold/30'}`}>
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isQuotaExceeded ? "Uplink restricted. Quota exhausted." : "Enter discovery prompt..."}
            disabled={isQuotaExceeded}
            className="flex-1 bg-transparent px-6 py-4 text-sm text-white placeholder:text-white/10 font-medium"
          />
          <button 
            onClick={handleSend} 
            disabled={isTyping || !input.trim() || isQuotaExceeded} 
            className={`w-12 h-12 rounded-[22px] flex items-center justify-center transition-all ${
              (isTyping || !input.trim() || isQuotaExceeded) 
                ? 'bg-white/5 text-white/10' 
                : 'bg-nova-gold text-nova-navy shadow-xl shadow-nova-gold/20 active:scale-90 hover:brightness-110'
            }`}
          >
            {isTyping ? (
              <i className="fas fa-circle-notch fa-spin text-xs"></i>
            ) : (
              <i className={`fas ${isQuotaExceeded ? 'fa-lock' : 'fa-paper-plane'} text-xs`}></i>
            )}
          </button>
        </div>
        
        <p className="text-center mt-4 text-[7px] font-black text-white/10 uppercase tracking-[0.4em]">Nova Crest AI Protocol v5.4.3 SECURED</p>
      </div>
    </div>
  );
};

export default TextChat;