import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { Message, UserProfile, AppMode } from '../types';
import { NOVA_AI_SYSTEM_INSTRUCTION } from '../constants';

const MessageBubble: React.FC<{ msg: Message; userName: string }> = ({ msg, userName }) => (
  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
    <div className={`max-w-[90%] space-y-1.5`}>
      <span className="text-[7px] font-black uppercase tracking-widest opacity-30 block ml-1">
        {msg.role === 'user' ? userName : 'Nova AI'}
      </span>
      <div className={`px-5 py-4 rounded-[24px] text-sm leading-relaxed border ${
        msg.role === 'user' 
          ? 'bg-white/5 border-white/10 rounded-br-none' 
          : 'bg-nova-gold/5 border-nova-gold/10 rounded-bl-none'
      }`}>
        <div className="markdown-content text-white/90">
          <ReactMarkdown>{msg.content}</ReactMarkdown>
        </div>
        {msg.sources && msg.sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
            <p className="text-[7px] font-black uppercase tracking-widest opacity-20">Verified Sources:</p>
            {msg.sources.map((source, idx) => (
              <a 
                key={idx} 
                href={source.uri} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block text-[9px] text-nova-gold hover:underline truncate"
              >
                <i className="fas fa-link mr-1 opacity-40"></i> {source.title || source.uri}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

interface TextChatProps {
  userProfile: UserProfile;
  appMode: AppMode;
  onDeduct: (wordCount: number) => void;
  speechEnabled: boolean;
}

const TextChat: React.FC<TextChatProps> = ({ userProfile, appMode, onDeduct }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Greetings, ${userProfile.name}. I am Nova AI. I can assist with admissions inquiries, program details, and institutional records. What can I help you find today?`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const getEffectiveApiKey = () => {
    const custom = localStorage.getItem('NOVA_CUSTOM_API_KEY');
    return (custom && custom.trim() !== '') ? custom : (process.env.API_KEY || '');
  };

  const handleSend = async () => {
    const key = getEffectiveApiKey();
    if (!key) {
      setError("Institutional authorization key missing.");
      return;
    }

    if (!input.trim() || isTyping) return;
    
    setError(null);
    const wordCount = input.trim().split(/\s+/).length;
    onDeduct(wordCount);
    
    const userMessage: Message = { role: 'user', content: input, timestamp: Date.now() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: input,
        config: { 
          systemInstruction: NOVA_AI_SYSTEM_INSTRUCTION + `\nUser's name is ${userProfile.name}. User Role: ${userProfile.type}.`, 
          tools: [{ googleSearch: {} }] 
        }
      });

      const textOutput = response.text || "I was unable to retrieve that information.";
      
      const sources: Array<{ title: string; uri: string }> = [];
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks) {
        groundingChunks.forEach((chunk: any) => {
          if (chunk.web) {
            sources.push({ title: chunk.web.title || chunk.web.uri, uri: chunk.web.uri });
          }
        });
      }

      onDeduct(textOutput.trim().split(/\s+/).length);
      const aiMessage: Message = { 
        role: 'assistant', 
        content: textOutput, 
        timestamp: Date.now(),
        sources: sources.length > 0 ? sources : undefined
      };
      
      setMessages([...newMessages, aiMessage]);

    } catch (e: any) {
      console.error("Nova AI Chat Error:", e);
      let errMsg = "Institutional query interrupted. Please try again.";
      if (e.message?.includes('429')) errMsg = "Quota limit reached. Please wait 60 seconds.";
      setError(errMsg);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="flex-1 overflow-y-auto space-y-6 p-6 custom-scrollbar">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} msg={msg} userName={userProfile.name} />
        ))}
        {isTyping && <div className="text-[9px] font-black text-nova-gold/40 animate-pulse ml-1 tracking-widest uppercase">Searching Records...</div>}
        {error && (
          <div className="text-[9px] font-bold p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <i className="fas fa-exclamation-circle mr-2"></i> {error}
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className="p-6 pt-2">
        <div className="glass p-1.5 rounded-full flex items-center border border-white/10 shadow-lg">
          <input 
            type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-transparent px-5 py-3 text-sm text-white placeholder:text-white/20"
          />
          <button 
            onClick={handleSend} 
            disabled={isTyping || !input.trim()} 
            className="w-10 h-10 rounded-full bg-nova-gold text-nova-navy flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-20"
          >
            <i className="fas fa-paper-plane text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextChat;