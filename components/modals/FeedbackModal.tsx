
import React, { useState } from 'react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text);
      setText('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-nova-navy/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-sm glass p-8 rounded-[40px] border-none shadow-2xl space-y-6 relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors">
          <i className="fas fa-times text-xs"></i>
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-nova-gold/10 text-nova-gold rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-comment-alt-heart text-lg"></i>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight uppercase">Service Feedback</h2>
          <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Institutional Quality Control</p>
        </div>

        <div className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Provide your experience with Nova AI..."
            className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-nova-gold/40 transition-all resize-none font-medium leading-relaxed"
          />
          
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="w-full py-5 bg-nova-gold text-nova-navy rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] disabled:opacity-20 active:scale-95 transition-all shadow-xl shadow-nova-gold/10"
          >
            Submit Briefing
          </button>
        </div>

        <p className="text-[8px] text-center text-white/10 uppercase tracking-widest font-black pt-2">
          Encrypted Institutional Link
        </p>
      </div>
    </div>
  );
};

export default FeedbackModal;
