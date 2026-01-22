import React from 'react';
import { UserProfile } from '../../types';

interface StartMenuProps {
  isOpen: boolean;
  profile: UserProfile;
  onAppClick: (id: string) => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ isOpen, profile, onAppClick }) => {
  if (!isOpen) return null;

  const appIcons: Record<string, string> = {
    'nova-ai': 'fa-robot',
    'admissions': 'fa-user-plus',
    'explorer': 'fa-folder-open',
    'settings': 'fa-cog'
  };

  return (
    <div className="absolute bottom-12 left-0 w-[640px] h-[640px] bg-[#00152a] backdrop-blur-3xl z-[900] border-t border-r border-white/10 flex animate-slide-up win-shadow">
      {/* Sidebar (Left Rail) */}
      <div className="w-12 h-full flex flex-col items-center py-4 gap-4 bg-black/20">
         <button title="Expand" className="w-full h-10 flex items-center justify-center hover:bg-white/10"><i className="fas fa-bars opacity-60"></i></button>
         <div className="mt-auto flex flex-col w-full">
            <button title={profile.name} className="w-full h-12 flex items-center justify-center hover:bg-white/10 transition-all">
              <div className="w-7 h-7 bg-nova-gold text-nova-navy rounded-full flex items-center justify-center font-black text-[9px]">
                {profile.name.charAt(0)}
              </div>
            </button>
            <button onClick={() => onAppClick('settings')} title="Settings" className="w-full h-12 flex items-center justify-center hover:bg-white/10 transition-all"><i className="fas fa-cog opacity-60"></i></button>
            <button onClick={() => window.location.reload()} title="Power" className="w-full h-12 flex items-center justify-center hover:bg-white/10 transition-all"><i className="fas fa-power-off text-red-500 opacity-60"></i></button>
         </div>
      </div>

      {/* App List (Center) */}
      <div className="w-60 h-full py-4 space-y-6 overflow-y-auto custom-scrollbar">
         <div className="px-4 space-y-4">
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 px-2">Recently Added</h3>
           <div className="space-y-0.5">
             {['nova-ai', 'admissions', 'explorer', 'settings'].map(id => (
               <button 
                 key={id} 
                 onClick={() => onAppClick(id)}
                 className="w-full p-2.5 rounded hover:bg-white/10 transition-all flex items-center gap-3 text-left group"
                >
                  <div className="w-8 h-8 rounded bg-nova-gold/10 text-nova-gold flex items-center justify-center group-hover:bg-nova-gold group-hover:text-nova-navy transition-all">
                    <i className={`fas ${appIcons[id] || 'fa-cube'} text-xs`}></i>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">{id.replace('-', ' ')}</span>
               </button>
             ))}
           </div>
         </div>
         
         <div className="px-4 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 px-2">A</h3>
            <div className="space-y-0.5">
               <button onClick={() => onAppClick('admissions')} className="w-full p-2.5 rounded hover:bg-white/10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-win-taskbar border border-white/10 flex items-center justify-center text-nova-gold"><i className="fas fa-user-plus text-xs"></i></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Admissions</span>
               </button>
            </div>
         </div>
      </div>

      {/* Tiles (Right) */}
      <div className="flex-1 h-full p-6 bg-white/5 overflow-y-auto custom-scrollbar">
         <div className="grid grid-cols-2 gap-3">
            <div 
              onClick={() => onAppClick('nova-ai')}
              className="col-span-2 p-5 bg-nova-gold text-nova-navy rounded-sm flex flex-col justify-between h-40 cursor-pointer tile-hover transition-all"
            >
               <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Nova AI Assistant</span>
                  <i className="fas fa-robot text-lg"></i>
               </div>
               <div className="space-y-1">
                  <h3 className="text-xl font-black leading-tight">Live Support Available</h3>
                  <p className="text-[9px] font-bold uppercase tracking-wider opacity-60">Ask about session dates</p>
               </div>
            </div>

            <div 
              onClick={() => onAppClick('admissions')}
              className="p-5 bg-nova-accent text-white rounded-sm flex flex-col justify-between h-32 cursor-pointer tile-hover transition-all"
            >
               <i className="fas fa-graduation-cap text-xl"></i>
               <span className="text-[10px] font-bold uppercase tracking-widest">Enroll Now</span>
            </div>

            <div className="p-5 glass border border-white/10 rounded-sm flex flex-col justify-between h-32 cursor-pointer tile-hover transition-all">
               <i className="fas fa-images text-nova-gold text-xl"></i>
               <span className="text-[10px] font-bold uppercase tracking-widest">Campus Gallery</span>
            </div>

            <div className="col-span-2 p-5 bg-white/5 border border-white/10 rounded-sm flex flex-col justify-between h-24 cursor-pointer tile-hover transition-all">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-nova-gold/20 flex items-center justify-center text-nova-gold">
                    <i className="fas fa-calendar-check"></i>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">School Calendar</h4>
                    <p className="text-[9px] opacity-40">Mid-term break starts Nov 15th</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default StartMenu;