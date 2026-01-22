
import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import TextChat from './components/TextChat';
import AdminDashboard from './components/AdminDashboard';
import OnboardingOverlay from './components/modals/OnboardingOverlay';
import FeedbackModal from './components/modals/FeedbackModal';
import ExploreView from './components/ExploreView';
import { UserProfile, AuditLog, SystemConfig, ChatLog, FeedbackLog } from './types';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nova_user_profile_v5');
    return saved ? JSON.parse(saved) : { 
      name: '', email: '', type: null, role: 'user', 
      creditsUsed: 0, creditLimit: 3000, isRestricted: false,
      isAuthenticated: false, isOnboarded: false, lastActive: Date.now()
    };
  });

  const [sysConfig, setSysConfig] = useState<SystemConfig>(() => {
    const saved = localStorage.getItem('nova_sys_config');
    return saved ? JSON.parse(saved) : { isActive: true, totalQuota: 10000, usedQuota: 0 };
  });

  const [chatSummaries, setChatSummaries] = useState<ChatLog[]>(() => {
    const saved = localStorage.getItem('nova_chat_summaries');
    return saved ? JSON.parse(saved) : [];
  });

  const [feedbackLogs, setFeedbackLogs] = useState<FeedbackLog[]>(() => {
    const saved = localStorage.getItem('nova_feedback_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [leads, setLeads] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('nova_leads_v5');
    return saved ? JSON.parse(saved) : [];
  });

  const [view, setView] = useState<'chat' | 'explore' | 'admin'>('chat');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [initialAuthMode, setInitialAuthMode] = useState<'standard' | 'governance'>('standard');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('nova_user_profile_v5', JSON.stringify(profile));
    localStorage.setItem('nova_sys_config', JSON.stringify(sysConfig));
    localStorage.setItem('nova_chat_summaries', JSON.stringify(chatSummaries));
    localStorage.setItem('nova_feedback_logs', JSON.stringify(feedbackLogs));
    
    if (profile.isAuthenticated && profile.role !== 'admin' && profile.isOnboarded) {
      setLeads(prev => {
        const index = prev.findIndex(l => l.email === profile.email);
        const updated = [...prev];
        const leadData = { ...profile, lastActive: Date.now() };
        if (index > -1) {
          updated[index] = leadData;
        } else {
          updated.push(leadData);
        }
        localStorage.setItem('nova_leads_v5', JSON.stringify(updated));
        return updated;
      });
    }
  }, [profile, sysConfig, chatSummaries, feedbackLogs]);

  const recordAudit = (type: AuditLog['type'], details: string) => {
    const log: AuditLog = { type, userName: profile.name || profile.email, details, timestamp: Date.now() };
    setAuditLogs(prev => [log, ...prev].slice(0, 100));
  };

  const handleWordCount = (count: number, summaryText: string) => {
    setSysConfig(prev => ({ ...prev, usedQuota: Math.min(prev.totalQuota, prev.usedQuota + count) }));
    
    const summary: ChatLog = {
      email: profile.email,
      userName: profile.name || 'Visitor',
      timestamp: Date.now(),
      summary: summaryText.length > 60 ? summaryText.substring(0, 60) + '...' : summaryText,
      wordCount: count
    };
    setChatSummaries(prev => [summary, ...prev].slice(0, 200));
  };

  const handleGlobalFeedback = (content: string) => {
    const log: FeedbackLog = {
      id: Math.random().toString(36).substr(2, 9),
      userName: profile.name || profile.email,
      content,
      timestamp: Date.now()
    };
    setFeedbackLogs(prev => [log, ...prev]);
    recordAudit('success', `Feedback briefing submitted by ${profile.name || profile.email}`);
  };

  const handleUpdateQuota = (newQuota: number) => {
    setSysConfig(prev => ({ ...prev, totalQuota: newQuota }));
    recordAudit('system_update', `Institutional quota adjusted to ${newQuota} words.`);
  };

  const handleToggleSystem = (active: boolean) => {
    setSysConfig(prev => ({ ...prev, isActive: active }));
    recordAudit('system_update', `Institutional system ${active ? 'activated' : 'deactivated'} by administrator.`);
  };

  const handleLogin = (email: string, role: 'admin' | 'user' = 'user') => {
    setProfile(prev => ({ 
      ...prev, 
      email, 
      isAuthenticated: true, 
      role, 
      isOnboarded: role === 'admin' 
    }));
    recordAudit('login', `Security clearance granted for ${role}: ${email}`);
    if (role === 'admin') setView('admin');
    setInitialAuthMode('standard');
  };

  const handleLogout = (targetMode: 'standard' | 'governance' = 'standard') => {
    if (profile.role === 'admin') recordAudit('system_update', 'Governance session terminated.');
    setInitialAuthMode(targetMode);
    setProfile({ 
      name: '', email: '', type: null, role: 'user', creditsUsed: 0, 
      creditLimit: 3000, isRestricted: false, isAuthenticated: false, 
      isOnboarded: false, lastActive: Date.now() 
    });
    setView('chat');
    localStorage.removeItem('nova_user_profile_v5');
  };

  if (!profile.isAuthenticated) return <Auth onLogin={handleLogin} prefillMode={initialAuthMode} />;

  const isSystemRestricted = !sysConfig.isActive || sysConfig.usedQuota >= sysConfig.totalQuota;

  return (
    <div className="h-screen w-screen bg-nova-navy flex justify-center overflow-hidden font-sans">
      <div className="w-full max-w-md bg-nova-navy relative overflow-hidden flex flex-col">
        
        {!profile.isOnboarded && profile.role !== 'admin' && (
          <OnboardingOverlay 
            profile={profile} 
            setProfile={setProfile}
          />
        )}

        <FeedbackModal 
          isOpen={isFeedbackOpen} 
          onClose={() => setIsFeedbackOpen(false)}
          onSubmit={handleGlobalFeedback}
        />

        <header className="z-10 px-6 py-5 flex justify-between items-center glass shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-nova-gold text-nova-navy rounded-lg flex items-center justify-center font-black text-md">N</div>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-widest text-white">Nova AI</span>
              <span className="text-[8px] font-bold text-nova-gold/40 uppercase">
                {profile.role === 'admin' ? 'Governance Terminal' : 'Institutional Hub'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {profile.role !== 'admin' && (
               <>
                 <button onClick={() => setIsFeedbackOpen(true)} className="text-[8px] font-black text-white/40 uppercase tracking-widest hover:text-nova-gold transition-colors flex items-center gap-1.5">
                   <i className="fas fa-comment-alt text-[7px]"></i> Feedback
                 </button>
                 <button onClick={() => handleLogout('governance')} className="text-[8px] font-black text-white/20 uppercase tracking-widest hover:text-nova-gold transition-colors flex items-center gap-1.5">
                   <i className="fas fa-lock text-[7px]"></i> Governance
                 </button>
               </>
             )}
          </div>
        </header>

        <main className="flex-1 relative overflow-hidden z-10 flex flex-col">
          {view === 'admin' ? (
            <AdminDashboard 
              onLogout={() => handleLogout('standard')} 
              leads={leads}
              auditLogs={auditLogs}
              chatSummaries={chatSummaries}
              feedbackLogs={feedbackLogs}
              sysConfig={sysConfig}
              onUpdateQuota={handleUpdateQuota}
              onToggleSystem={handleToggleSystem}
            />
          ) : view === 'explore' ? (
            <ExploreView />
          ) : (
            <TextChat 
              userProfile={profile} 
              sysConfig={sysConfig}
              isSystemRestricted={isSystemRestricted && profile.role !== 'admin'}
              systemReason={!sysConfig.isActive ? "Institutional Lock" : "Quota Exhausted"}
              onWordCount={handleWordCount} 
              onFeedback={handleGlobalFeedback}
            />
          )}
        </main>

        <nav className="h-16 glass flex items-center justify-around shrink-0 z-10">
           <button onClick={() => setView('chat')} className={`flex flex-col items-center gap-1 transition-all ${view === 'chat' ? 'text-nova-gold' : 'text-white/20'}`}>
             <i className="fas fa-comment-dots text-sm"></i>
             <span className="text-[7px] font-black uppercase tracking-widest">Chat</span>
           </button>
           
           <button onClick={() => setView('explore')} className={`flex flex-col items-center gap-1 transition-all ${view === 'explore' ? 'text-nova-gold' : 'text-white/20'}`}>
             <i className="fas fa-compass text-sm"></i>
             <span className="text-[7px] font-black uppercase tracking-widest">Explore</span>
           </button>

           {profile.role === 'admin' && (
             <button onClick={() => setView('admin')} className={`flex flex-col items-center gap-1 transition-all ${view === 'admin' ? 'text-nova-gold' : 'text-white/20'}`}>
               <i className="fas fa-shield-check text-sm"></i>
               <span className="text-[7px] font-black uppercase tracking-widest">Governance</span>
             </button>
           )}
        </nav>
      </div>
    </div>
  );
};

export default App;
