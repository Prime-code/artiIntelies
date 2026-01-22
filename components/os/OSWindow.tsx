import React, { useState } from 'react';
import { WindowState } from '../../types';

interface OSWindowProps {
  window: WindowState;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  children: React.ReactNode;
}

const OSWindow: React.FC<OSWindowProps> = ({ window: win, onClose, onMinimize, onFocus, children }) => {
  const [isMaximized, setIsMaximized] = useState(false);

  if (win.isMinimized) return null;

  return (
    <div 
      onClick={onFocus}
      style={{ 
        zIndex: win.zIndex,
        width: isMaximized ? '100vw' : '1080px',
        height: isMaximized ? 'calc(100vh - 48px)' : '720px',
        top: isMaximized ? '0' : '80px',
        left: isMaximized ? '0' : '220px',
        position: 'absolute'
      }}
      className={`glass border border-white/10 win-shadow flex flex-col transition-all duration-300 ${isMaximized ? 'rounded-none' : 'rounded-t-lg'}`}
    >
      {/* Title Bar */}
      <div 
        className="h-9 bg-white/5 border-b border-white/5 flex items-center justify-between pl-4 cursor-default select-none overflow-hidden"
      >
        <div className="flex items-center gap-3">
          <i className={`fas ${win.icon} text-nova-gold text-[10px]`}></i>
          <span className="text-[10px] font-bold text-white/80 tracking-wide truncate">{win.title}</span>
        </div>
        
        <div className="flex h-full">
          <button 
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            className="w-11 h-full hover:bg-white/5 transition-all flex items-center justify-center group"
          >
            <div className="w-2.5 h-[1px] bg-white group-hover:bg-nova-gold"></div>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMaximized(!isMaximized); }}
            className="w-11 h-full hover:bg-white/5 transition-all flex items-center justify-center group"
          >
            <div className="w-2.5 h-2.5 border border-white group-hover:border-nova-gold"></div>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-11 h-full hover:bg-red-600 transition-all flex items-center justify-center group"
          >
            <i className="fas fa-times text-[10px] text-white"></i>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-nova-navy/60 backdrop-blur-3xl relative overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default OSWindow;