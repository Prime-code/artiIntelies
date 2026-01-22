import React, { useState, useEffect } from 'react';
import { WindowState } from '../../types';

interface TaskbarProps {
  windows: WindowState[];
  onStartClick: () => void;
  onWindowClick: (id: string) => void;
}

const Taskbar: React.FC<TaskbarProps> = ({ windows, onStartClick, onWindowClick }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-12 bg-win-taskbar backdrop-blur-2xl border-t border-white/10 z-[1000] flex items-center relative">
      {/* Start Button */}
      <button 
        onClick={onStartClick}
        className="w-12 h-full flex items-center justify-center hover:bg-white/10 transition-all group active:bg-white/20"
      >
        <div className="w-5 h-5 bg-nova-gold text-nova-navy rounded-sm flex items-center justify-center font-black text-xs shadow-lg group-active:scale-90 transition-transform">N</div>
      </button>

      {/* App Icons */}
      <div className="flex-1 flex h-full items-center px-1">
        {windows.filter(w => w.isOpen).map(win => (
          <button 
            key={win.id}
            onClick={() => onWindowClick(win.id)}
            className={`h-full px-4 flex items-center gap-3 relative transition-all hover:bg-white/5 group ${win.isMinimized ? 'opacity-40' : 'bg-white/5'}`}
          >
            <i className={`fas ${win.icon} ${win.isMinimized ? 'text-white/40' : 'text-nova-gold'} text-xs`}></i>
            <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block truncate max-w-[120px]">{win.title}</span>
            {!win.isMinimized && <div className="active-indicator"></div>}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        ))}
      </div>

      {/* System Tray */}
      <div className="h-full px-2 flex items-center gap-1">
        <div className="flex h-full items-center gap-3 px-3 hover:bg-white/5 cursor-pointer">
           <i className="fas fa-chevron-up text-[9px] opacity-40"></i>
           <i className="fas fa-wifi text-[10px] opacity-60"></i>
           <i className="fas fa-volume-up text-[10px] opacity-60"></i>
           <i className="fas fa-battery-three-quarters text-[10px] opacity-60"></i>
        </div>
        <div className="h-full px-3 flex flex-col items-center justify-center hover:bg-white/5 cursor-pointer">
          <span className="text-[10px] font-semibold">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="text-[9px] opacity-40 font-medium">{time.toLocaleDateString([], { month: '2-digit', day: '2-digit', year: 'numeric' })}</span>
        </div>
        <div className="w-1.5 h-full bg-white/5 border-l border-white/10 ml-1"></div>
      </div>
    </div>
  );
};

export default Taskbar;