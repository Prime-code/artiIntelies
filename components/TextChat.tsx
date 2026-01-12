
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { Message, UserProfile, AppMode } from '../types';
import { NOVA_AI_SYSTEM_INSTRUCTION } from '../constants';

const MessageBubble: React.FC<{ msg: Message; userName: string }> = ({ msg, userName }) => (
  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
    <div className={`max-w-[85%] space-y-2`}>
      <span className="text-[8px] font-black uppercase tracking-widest opacity-30 block ml-2">
        {msg.role === 'user' ? userName : 'Nova AI'}
      </span>
      <div className={`p-6 rounded-[32px] text-sm leading-relaxed border ${
        msg.role === 'user' 
          ? 'bg-white/5 border-white/10 rounded-br-none' 
          : 'bg-nova-gold/5 border-nova-gold/10 rounded-bl-none'
      }`}>
        <div className="markdown-content"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
      </div>
    </div>
  </div>
);

interface TextChatProps {
  userProfile: UserProfile;
  appMode: AppMode;
  onLog?: (messages: Message[]) => void;
  onDeduct: (wordCount: number) => void;
}

const TextChat: React.FC<TextChatProps> = ({ userProfile, appMode, onLog, onDeduct }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello ${userProfile.name}. I am Nova AI. How can I assist you today?`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    onDeduct(input.trim().split(/\s+/).length);
    const userMessage: Message = { role: 'user', content: input, timestamp: Date.now() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: input }] }],
        config: { systemInstruction: NOVA_AI_SYSTEM_INSTRUCTION, tools: [{ googleSearch: {} }] }
      });

      const textOutput = response.text || "Thinking...";
      onDeduct(textOutput.trim().split(/\s+/).length);
      const aiMessage: Message = { role: 'assistant', content: textOutput, timestamp: Date.now() };
      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);
      if (onLog) onLog(finalMessages);
    } catch (e) {
      console.error("Nova AI Chat Error:", e);
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection error. Check console and API key.", timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full px-4 overflow-hidden">
      <div className="flex-1 overflow-y-auto space-y-8 py-10 custom-scrollbar pr-4">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} msg={msg} userName={userProfile.name} />
        ))}
        {isTyping && <div className="text-[10px] font-bold text-nova-gold/40 animate-pulse ml-2">Nova AI is thinking...</div>}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className="pb-8 pt-4">
        <div className="glass p-2 rounded-full flex items-center border border-white/10">
          <input 
            type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your query..."
            className="flex-1 bg-transparent px-8 py-4 focus:outline-none text-sm text-white"
          />
          <button onClick={handleSend} disabled={isTyping} className="w-12 h-12 rounded-full bg-nova-gold text-nova-navy flex items-center justify-center transition-all hover:scale-105 active:scale-95">
            <i className="fas fa-paper-plane text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextChat;
