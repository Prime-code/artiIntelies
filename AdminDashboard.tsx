
import React, { useState } from 'react';
// Fix: Corrected import path to reference types in the same directory and use ChatLog
import { UserProfile, AuditLog, SystemConfig, ChatLog } from './types';

interface AdminDashboardProps {
  onLogout: () => void;
  leads: UserProfile[];
  auditLogs: AuditLog[];
  chatSummaries: ChatLog[];
  sysConfig: SystemConfig;
  onUpdateQuota: (quota: number) => void;
  onToggleSystem: (active: boolean) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  onLogout, leads, auditLogs, chatSummaries, sysConfig, onUpdateQuota, onToggleSystem 
}) => {
  const [activeTab, setActiveTab] = useState<'system' | 'leads' | 'transcripts' | 'logs'>('system');
  const [quotaInput, setQuotaInput] = useState(sysConfig.totalQuota.toString());

  return (
    <div className="flex-1 flex flex-col bg-nova-navy overflow-hidden animate-in fade-in duration-300">
      {/* Header Panel */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
         <div>
            <h2 className="text-xl font-black text-white tracking-tighter uppercase">Governance</h2>
            <p className="text-[7px] font-black text-nova-gold uppercase tracking-[0.4em]">Administrative Authority</p>
         </div>
         <button onClick={onLogout} className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-[8px] font-black uppercase tracking-widest border border-red-500/10">Purge Session</button>
      </div>

      {/* Internal Navigation */}
      <div className="flex border-b border-white/5 overflow-x-auto no-scrollbar shrink-0">
        {['system', 'leads', 'transcripts', 'logs'].map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-4 text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'text-nova-gold border-b border-nova-gold bg-white/5' : 'text-white/20'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="glass p-6 rounded-2xl border-none space-y-4">
               <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-black uppercase text-white/60">Institutional Quota</h3>
                  <span className="text-[10px] font-bold text-nova-gold">{(sysConfig.usedQuota / sysConfig.totalQuota * 100).toFixed(1)}% Used</span>
               </div>
               <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-nova-gold transition-all duration-1000" style={{ width: `${Math.min(100, (sysConfig.usedQuota / sysConfig.totalQuota) * 100)}%` }}></div>
               </div>
               <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    value={quotaInput} 
                    onChange={(e) => setQuotaInput(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-nova-gold"
                    placeholder="Set Word Pool..."
                  />
                  <button onClick={() => onUpdateQuota(Number(quotaInput))} className="px-6 py-3 bg-nova-gold text-nova-navy rounded-xl text-[9px] font-black uppercase tracking-widest">Update</button>
               </div>
               <div className="flex justify-between text-[8px] font-black uppercase text-white/20">
                 <span>Consumed: {sysConfig.usedQuota.toLocaleString()}</span>
                 <span>Limit: {sysConfig.totalQuota.toLocaleString()}</span>
               </div>
            </div>

            <div className="glass p-6 rounded-2xl border-none flex justify-between items-center">
               <div>
                  <h3 className="text-[10px] font-black uppercase text-white">Master Switch</h3>
                  <p className="text-[8px] text-white/30 uppercase mt-1">Global AI Functionality</p>
               </div>
               <button 
                 onClick={() => onToggleSystem(!sysConfig.isActive)}
                 className={`w-12 h-6 rounded-full transition-all relative ${sysConfig.isActive ? 'bg-green-500' : 'bg-red-500'}`}
               >
                 <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${sysConfig.isActive ? 'right-1' : 'left-1'}`}></div>
               </button>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="space-y-3">
            {leads.map((lead) => (
              <div key={lead.email} className="glass p-4 rounded-xl border-none flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-nova-gold/10 text-nova-gold flex items-center justify-center font-black">{lead.name ? lead.name[0] : '?'}</div>
                <div className="flex-1 overflow-hidden">
                   <p className="text-[11px] font-bold text-white truncate">{lead.name || 'Anonymous'}</p>
                   <p className="text-[8px] text-white/30 uppercase tracking-tighter truncate">{lead.email}</p>
                </div>
                <div className="text-right shrink-0">
                   <p className="text-[9px] font-black text-nova-gold">{new Date(lead.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                   <p className="text-[7px] text-white/20 uppercase">Last Entry</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'transcripts' && (
          <div className="space-y-3">
            {chatSummaries.map((chat, i) => (
              <div key={i} className="glass p-4 rounded-xl border-none space-y-2">
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-nova-gold uppercase tracking-widest">{chat.userName}</span>
                    <span className="text-[8px] text-white/20">{new Date(chat.timestamp).toLocaleTimeString()}</span>
                 </div>
                 <p className="text-[10px] text-white/60 leading-relaxed italic">"{chat.summary}"</p>
                 <div className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">Consumption: {chat.wordCount} words</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-2">
            {auditLogs.map((log, i) => (
              <div key={i} className="text-[8px] flex items-start gap-3 p-4 glass rounded-xl border-none">
                 <div className="w-1.5 h-1.5 bg-nova-gold/40 rounded-full mt-1 shrink-0"></div>
                 <div className="flex-1">
                    <p className="text-white/80 font-bold uppercase tracking-widest">{log.type.replace('_', ' ')}</p>
                    <p className="text-white/30 mt-0.5">{log.details}</p>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
