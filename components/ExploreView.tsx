import React, { useState } from 'react';
import { EXPLORE_UPDATES } from '../constants';

const ExploreView: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-500">
      <div className="p-8 pb-4">
         <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Institutional Feed</h1>
         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-nova-gold opacity-60">Strategic Updates & Insight</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar pb-24">
        {EXPLORE_UPDATES.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div 
              key={item.id} 
              onClick={() => toggleExpand(item.id)}
              className={`glass p-6 rounded-[32px] border transition-all duration-500 cursor-pointer overflow-hidden ${
                isExpanded ? 'border-nova-gold/50 bg-white/5 ring-1 ring-nova-gold/20' : 'border-white/10 hover:bg-white/5 active:scale-[0.98]'
              }`}
            >
               <div className="flex justify-between items-center mb-4">
                  <span className="text-[7px] font-black uppercase bg-nova-gold/10 text-nova-gold px-3 py-1 rounded-full border border-nova-gold/20 tracking-widest">
                    {item.category}
                  </span>
                  <span className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">{item.date}</span>
               </div>
               
               <div className="space-y-4">
                  <h3 className={`text-xl font-black text-white leading-tight transition-all ${isExpanded ? 'text-nova-gold' : ''}`}>
                    {item.title}
                  </h3>
                  
                  <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-12 opacity-40 overflow-hidden'}`}>
                    <p className={`text-[13px] leading-relaxed transition-all ${isExpanded ? 'text-white/80' : 'text-white/40 italic line-clamp-2'}`}>
                      {isExpanded ? item.details : item.excerpt}
                    </p>
                    
                    {isExpanded && (
                      <div className="mt-6 p-5 rounded-2xl bg-white/5 border border-white/5 animate-in slide-in-from-top-4">
                        <p className="text-[8px] font-black uppercase text-nova-gold tracking-widest mb-2">Institutional Context:</p>
                        <p className="text-[11px] text-white/50 leading-relaxed italic">
                          This strategic directive is part of the Horizon 2030 framework, prioritizing excellence in modern education.
                        </p>
                      </div>
                    )}
                  </div>
               </div>

               <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="flex items-center gap-2 text-[9px] font-black text-nova-gold uppercase tracking-widest">
                    {isExpanded ? 'Collapse Briefing' : 'Request Detailed Record'}
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${isExpanded ? 'bg-nova-gold text-nova-navy rotate-180' : 'bg-white/5 text-nova-gold'}`}>
                    <i className="fas fa-chevron-down text-[8px]"></i>
                  </div>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExploreView;