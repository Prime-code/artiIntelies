
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

// Custom components for consistent Markdown rendering
const MarkdownComponents = {
  p: ({ children }: any) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
  h1: ({ children }: any) => <h1 className="text-base font-black mt-4 mb-2 uppercase tracking-tighter text-white border-b border-white/5 pb-1">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-sm font-black mt-3 mb-1 uppercase tracking-tight text-white/90">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-[13px] font-bold mt-2 mb-1 text-white/80">{children}</h3>,
  ul: ({ children }: any) => <ul className="list-disc ml-5 mb-3 space-y-1.5">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal ml-5 mb-3 space-y-1.5">{children}</ol>,
  li: ({ children }: any) => <li className="text-[13px] marker:text-nova-gold/50">{children}</li>,
  code: ({ node, inline, className, children, ...props }: any) => {
    return inline ? (
      <code className="bg-white/10 px-1.5 py-0.5 rounded text-nova-gold font-mono text-[11px] font-bold" {...props}>
        {children}
      </code>
    ) : (
      <div className="relative my-4 group">
        <div className="absolute -top-3 right-4 px-2 py-1 bg-nova-navy border border-white/10 rounded text-[7px] font-black uppercase tracking-widest text-white/30 z-10">Data Block</div>
        <pre className="bg-black/40 p-4 rounded-xl border border-white/10 overflow-x-auto custom-scrollbar shadow-inner">
          <code className="font-mono text-[11px] text-nova-gold/90 leading-tight block" {...props}>
            {children}
          </code>
        </pre>
      </div>
    );
  },
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-2 border-nova-gold/40 pl-4 py-1 italic text-white/50 my-3 bg-white/5 rounded-r-lg">
      {children}
    </blockquote>
  ),
  img: ({ src, alt }: any) => (
    <div className="my-4 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-white/5 animate-in fade-in duration-500">
      <img src={src} alt={alt} className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
      {alt && <div className="p-3 bg-black/20 text-[10px] text-white/40 uppercase tracking-widest font-black border-t border-white/5">{alt}</div>}
    </div>
  ),
  a: ({ children, href }: any) => {
    const ytId = getYouTubeId(href);
    if (ytId) {
      return (
        <div className="my-4 aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black animate-in fade-in duration-500">
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
        <div className="my-4 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black animate-in fade-in duration-500">
          <video src={href} controls className="w-full h-auto max-h-[400px]" />
        </div>
      );
    }

    return (
      <a href={href} className="text-nova-gold underline underline-offset-4 decoration-nova-gold/30 hover:text-white transition-colors font-bold" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
  hr: () => <hr className="my-6 border-white/5" />,
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
      <div className={`max-w-[85%] space-y-1`}>
        <div className={`flex items-center gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} ml-1`}>
          <span className="text-[7px] font-black uppercase tracking-widest opacity-20">
            {msg.role === 'user' ? userName : 'Nova AI'}
          </span>
          <span className="text-[6px] font-bold opacity-0 group-hover:opacity-10 transition-opacity uppercase tracking-tighter">
            {timeString}
          </span>
        </div>
        
        <div className={`px-5 py-4 rounded-2xl text-[13px] leading-relaxed relative ${
          msg.role === 'user' 
            ? 'bg-white/5 text-white/80' 
            : 'bg-nova-gold/5 text-nova-gold/90'
        }`}>
          <ReactMarkdown components={MarkdownComponents as any}>{msg.content}</ReactMarkdown>
          
          {msg.sources && msg.sources.length > 0 && (
            <div className="mt-4 pt-4 border-t border-nova-gold/10 space-y-1.5">
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Verification Sources</p>
              <div className="flex flex-wrap gap-2">
                {msg.sources.map((source, idx) => (
                  <a 
                    key={idx} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[9px] font-bold text-nova-gold/60 hover:text-nova-gold underline decoration-nova-gold/20"
                  >
                    {source.title || 'Institutional Record'}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Feedback area only shown for Assistant messages (excluding first two messages as per global rules) */}
          {showFeedback && msg.role === 'assistant' && (
            <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
              <p className="text-[7px] font-black uppercase tracking-widest text-white/20">Response Feedback</p>
              {submitted ? (
                <div className="text-[8px] font-bold text-nova-gold/40 italic">Briefing logged. Thank you.</div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Impute feedback text only..."
                    className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-[10px] text-white focus:outline-none placeholder:text-white/10"
                    onKeyDown={(e) => e.key === 'Enter' && handleFeedbackSubmit()}
                  />
                  <button 
                    onClick={handleFeedbackSubmit}
                    disabled={!feedbackText.trim()}
                    className="px-3 py-2 bg-nova-gold/10 text-nova-gold rounded-lg text-[8px] font-black uppercase disabled:opacity-20"
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Subtle timestamp always visible at bottom for mobile accessibility or fixed context */}
        <div className={`text-[6px] opacity-10 font-medium px-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
          {timeString}
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
        content: `Welcome, ${userProfile.name || 'Visitor'}. How may I facilitate your institutional discovery?`,
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
      setError("Authorization Missing.");
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
          systemInstruction: NOVA_AI_SYSTEM_INSTRUCTION + `\nUser: ${userProfile.name}. Role: ${userProfile.type}.`, 
          tools: [{ googleSearch: {} }] 
        }
      });

      const textOutput = response.text || "Data uplink interrupted.";
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
      setError("Institutional uplink unstable. Retry requested.");
    } finally {
      setIsTyping(false);
    }
  };

  if (isSystemRestricted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-red-500 mb-8 shadow-2xl ring-1 ring-white/10">
          <i className="fas fa-shield-slash text-2xl animate-pulse"></i>
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">{systemReason}</h2>
        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em] mt-4 max-w-[240px] leading-relaxed">
          The institutional AI uplink has been suspended by governance protocols.
        </p>
        <div className="mt-12 pt-12 border-t border-white/5 w-full">
           <p className="text-[8px] font-bold text-white/10 uppercase tracking-widest">Protocol Version 5.4.0</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto space-y-6 p-6 custom-scrollbar pb-32">
        {messages.map((msg, idx) => (
          <MessageBubble 
            key={idx} 
            msg={msg} 
            userName={userProfile.name || 'Visitor'} 
            showFeedback={idx >= 2}
            onFeedback={(text) => onFeedback(`[Inline Message #${idx+1}] ${text}`)}
          />
        ))}
        {isTyping && <div className="text-[8px] font-black text-nova-gold/40 animate-pulse tracking-widest uppercase ml-1">Nova AI  ...</div>}
        {error && <div className="text-[8px] font-bold text-red-500 uppercase text-center p-3 glass rounded-xl">{error}</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-nova-navy via-nova-navy/80 to-transparent z-20">
        <div className="flex justify-between items-center mb-2 px-4">
           <span className={`text-[7px] font-black uppercase tracking-widest transition-colors ${isQuotaExceeded ? 'text-red-500' : 'text-nova-gold/40'}`}>
             {isQuotaExceeded ? 'Quota Exceeded' : `Pool Remaining: ${remainingQuota.toLocaleString()} words`}
           </span>
           {input.trim() && (
             <span className="text-[7px] font-black uppercase tracking-widest text-white/20">
               Current: {currentWordCount} words
             </span>
           )}
        </div>

        <div className={`glass p-1.5 rounded-2xl flex items-center border-none shadow-2xl transition-all duration-300 ${isQuotaExceeded ? 'ring-2 ring-red-500/20' : ''}`}>
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isQuotaExceeded ? "Word pool exhausted..." : "Type institutional inquiry..."}
            disabled={isQuotaExceeded}
            className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/20"
          />
          <button 
            onClick={handleSend} 
            disabled={isTyping || !input.trim() || isQuotaExceeded} 
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              (isTyping || !input.trim() || isQuotaExceeded) 
                ? 'bg-white/5 text-white/10' 
                : 'bg-nova-gold text-nova-navy shadow-lg shadow-nova-gold/20 active:scale-90'
            }`}
          >
            <i className={`fas ${isQuotaExceeded ? 'fa-lock' : 'fa-chevron-up'} text-xs`}></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextChat;
