
import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import TextChat from './components/TextChat';
import AdminDashboard from './components/AdminDashboard';
import OnboardingOverlay from './components/modals/OnboardingOverlay';
import { UserProfile, AppMode, SecuritySettings } from './types';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nova_user_profile');
    return saved ? JSON.parse(saved) : { 
      name: '', email: '', type: null, role: 'user', credits: 3000, 
      subscriptionStatus: 'active', plan: 'Nova Discovery', hasClaimedFree: true, isAuthenticated: false 
    };
  });

  // Onboarding step management
  const [onboardingStep, setOnboardingStep] = useState<number>(() => {
    if (!profile.isAuthenticated) return 0;
    return (profile.name && profile.type) ? 3 : 0;
  });

  const [view, setView] = useState<'chat' | 'admin'>('chat');
  const [appMode, setAppMode] = useState<AppMode>('test');
  
  const [security, setSecurity] = useState<SecuritySettings>({
    authCode: 'nova_sys_default', 
    isMfaEnabled: false, 
    accessPin: '0000', 
    lastRotation: Date.now()
  });

  useEffect(() => {
    localStorage.setItem('nova_user_profile', JSON.stringify(profile));
    // If user is authenticated but hasn't finished onboarding, ensure step is correct
    if (profile.isAuthenticated && !profile.name && onboardingStep === 3) {
      setOnboardingStep(0);
    }
  }, [profile, onboardingStep]);

  const handleLogin = (email: string) => {
    setProfile(prev => ({ ...prev, email, isAuthenticated: true }));
    setOnboardingStep(0);
  };

  const handleDeduct = (count: number) => {
    if (appMode === 'paid') {
      setProfile(prev => ({ ...prev, credits: Math.max(0, prev.credits - count) }));
    }
  };

  if (!profile.isAuthenticated) return <Auth onLogin={handleLogin} />;

  return (
    <div className="h-screen w-screen bg-nova-navy flex justify-center overflow-hidden">
      <div className="w-full max-w-md bg-nova-navy relative shadow-2xl overflow-hidden border-x border-white/5 flex flex-col">
        
        {/* Ambient background effect */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border border-nova-gold/5 rounded-full animate-orb-pulse opacity-10"></div>
        </div>

        {onboardingStep < 3 && (
          <OnboardingOverlay 
            step={onboardingStep} setStep={setOnboardingStep}
            profile={profile} setProfile={setProfile}
          />
        )}

        {/* Mobile Header */}
        <header className="z-10 px-6 py-5 flex justify-between items-center glass border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-nova-gold text-nova-navy rounded-xl flex items-center justify-center font-black text-lg shadow-lg shadow-nova-gold/20">N</div>
            <div className="flex flex-col">
              <span className="text-sm font-black uppercase tracking-widest text-white">Nova AI</span>
              <span className="text-[9px] font-bold text-nova-gold/60 uppercase">Institutional Support</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {(profile.email === 'admin@novacrest.com' || profile.role === 'admin') && (
               <button 
                 onClick={() => setView(view === 'chat' ? 'admin' : 'chat')}
                 className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-nova-gold text-xs border border-white/10"
               >
                 <i className={`fas ${view === 'chat' ? 'fa-user-shield' : 'fa-comment'}`}></i>
               </button>
             )}
             <div className="flex flex-col items-end">
               <span className="text-[10px] font-black text-nova-gold uppercase tracking-tighter">{profile.credits} Credits</span>
               <div className="w-14 h-1 bg-white/10 rounded-full overflow-hidden mt-0.5">
                  <div className="h-full bg-nova-gold" style={{ width: `${Math.min(100, (profile.credits/3000)*100)}%` }}></div>
               </div>
             </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 relative overflow-hidden z-10">
          {view === 'chat' ? (
            <TextChat 
              userProfile={profile} 
              appMode={appMode} 
              onDeduct={handleDeduct} 
              speechEnabled={false} 
            />
          ) : (
            <div className="h-full overflow-y-auto custom-scrollbar">
              <AdminDashboard 
                onBack={() => setView('chat')} 
                chats={[]} feedback={[]} users={[]} auditLogs={[]} appMode={appMode}
                security={security}
                onUpdateSecurity={setSecurity} 
                onUpdateUsers={() => {}} 
                onToggleMode={() => setAppMode(appMode === 'test' ? 'paid' : 'test')} 
                recordAudit={() => {}}
              />
            </div>
          )}
        </main>

        {/* Navigation Tabs */}
        {view === 'chat' && (
          <nav className="h-20 glass border-t border-white/10 flex items-center justify-around px-8 shrink-0 z-10 pb-4">
             <button className="flex flex-col items-center gap-1.5 text-nova-gold transition-all">
               <i className="fas fa-message text-lg"></i>
               <span className="text-[8px] font-black uppercase tracking-widest">Assistant</span>
             </button>
             <button onClick={() => alert('Campus resources loading...')} className="flex flex-col items-center gap-1.5 text-white/30 hover:text-white/60 transition-all">
               <i className="fas fa-graduation-cap text-lg"></i>
               <span className="text-[8px] font-black uppercase tracking-widest">Academics</span>
             </button>
             <button onClick={() => alert('Institutional gallery loading...')} className="flex flex-col items-center gap-1.5 text-white/30 hover:text-white/60 transition-all">
               <i className="fas fa-compass text-lg"></i>
               <span className="text-[8px] font-black uppercase tracking-widest">Explore</span>
             </button>
          </nav>
        )}
      </div>
    </div>
  );
};

export default App;
