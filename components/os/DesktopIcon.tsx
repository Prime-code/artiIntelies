import React from 'react';

interface DesktopIconProps {
  icon: string;
  label: string;
  onClick: () => void;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ icon, label, onClick }) => {
  return (
    <div 
      onDoubleClick={onClick}
      className="w-20 h-24 flex flex-col items-center justify-center gap-1.5 group cursor-default p-1 hover:bg-white/10 border border-transparent hover:border-white/20 transition-all rounded"
    >
      <div className="w-11 h-11 bg-gradient-to-br from-nova-gold to-yellow-600 text-nova-navy rounded flex items-center justify-center text-xl shadow-lg shadow-black/40 group-active:scale-95 transition-transform">
        <i className={`fas ${icon}`}></i>
      </div>
      <span className="text-[10px] font-medium text-white text-center drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] leading-tight px-1">
        {label}
      </span>
    </div>
  );
};

export default DesktopIcon;