import React, { useState } from 'react';
import { UserProfile } from '../../types';

interface OnboardingOverlayProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
}

const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ profile, setProfile }) => {
  const [step, setStep] = useState(0);
  const [localName, setLocalName] = useState(profile.name);
  const [localType, setLocalType] = useState<'parent' | 'student' | null>(profile.type);
  
  const handleSelectRole = (type: 'parent' | 'student') => {
    setLocalType(type);
    setStep(2);
  };

  const handleFinish = () => {
    if (localName.trim() && localType) {
      setProfile({ 
        ...profile, 
        name: localName.trim(), 
        type: localType, 
        isOnboarded: true 
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-nova-navy px-8 max-w-md mx-auto">
      <div className="absolute inset-0 bg-nova-gold/5 blur-[100px] rounded-full opacity-30"></div>
      
      <div className="w-full space-y-12 relative animate-in fade-in zoom-in duration-500">
        {/* Progress Bar */}
        <div className="absolute -top-16 left-0 w-full flex gap-2 px-1">
           {[0, 1, 2].map((i) => (
             <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${step >= i ? 'bg-nova-gold' : 'bg-white/10'}`}></div>
           ))}
        </div>

        {step === 0 && (
          <div className="text-center space-y-10">
            <div className="w-24 h-24 bg-nova-gold text-nova-navy rounded-[32px] flex items-center justify-center font-black text-5xl mx-auto shadow-2xl rotate-3">N</div>
            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tight text-white leading-tight">Inspiring Excellence</h1>
              <p className="text-white/40 text-sm leading-relaxed max-w-[260px] mx-auto">
                Official Virtual Assistant for Nova Crest School institutional discovery.
              </p>
            </div>
            <button 
              onClick={() => setStep(1)}
              className="w-full bg-nova-gold text-nova-navy py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-nova-gold/10"
            >
              Start Personalization
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-10 animate-in slide-in-from-right-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black tracking-tight text-white">Select Role</h2>
              <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">Institutional Affiliation</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => handleSelectRole('parent')} 
                className="glass p-8 rounded-[32px] flex items-center gap-6 hover:bg-white/5 transition-all border-none group active:scale-95"
              >
                <div className="w-14 h-14 rounded-2xl bg-nova-gold/10 flex items-center justify-center text-nova-gold group-hover:scale-105 transition-transform">
                  <i className="fas fa-user-tie text-2xl"></i>
                </div>
                <div className="text-left">
                  <span className="text-sm font-black uppercase tracking-widest block text-white">Parent / Guardian</span>
                  <span className="text-[10px] text-white/30 uppercase tracking-tighter">Academic Oversight</span>
                </div>
                <i className="fas fa-chevron-right ml-auto text-nova-gold/20"></i>
              </button>
              
              <button 
                onClick={() => handleSelectRole('student')} 
                className="glass p-8 rounded-[32px] flex items-center gap-6 hover:bg-white/5 transition-all border-none group active:scale-95"
              >
                <div className="w-14 h-14 rounded-2xl bg-nova-gold/10 flex items-center justify-center text-nova-gold group-hover:scale-105 transition-transform">
                  <i className="fas fa-user-graduate text-2xl"></i>
                </div>
                <div className="text-left">
                  <span className="text-sm font-black uppercase tracking-widest block text-white">Prospective Student</span>
                  <span className="text-[10px] text-white/30 uppercase tracking-tighter">Educational Discovery</span>
                </div>
                <i className="fas fa-chevron-right ml-auto text-nova-gold/20"></i>
              </button>
            </div>
            <button onClick={() => setStep(0)} className="w-full text-[9px] font-black uppercase tracking-[0.3em] opacity-20 py-2">Back to start</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10 animate-in slide-in-from-right-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black tracking-tight text-white">Identity Check</h2>
              <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">Full Name Required</p>
            </div>
            <div className="space-y-6">
              <input 
                type="text" 
                placeholder="Ex: David Okoro" 
                autoFocus
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-6 text-xl text-center focus:border-nova-gold/40 transition-all placeholder:opacity-20 text-nova-gold font-bold"
                value={localName} 
                onChange={(e) => setLocalName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && localName.trim() && handleFinish()}
              />
              <button 
                onClick={handleFinish} 
                disabled={!localName.trim()} 
                className="w-full bg-nova-gold text-nova-navy py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:brightness-110 active:scale-95 shadow-xl shadow-nova-gold/10 disabled:opacity-20 transition-all"
              >
                Enter Institutional Portal
              </button>
            </div>
            <button onClick={() => setStep(1)} className="w-full text-[9px] font-black uppercase tracking-[0.3em] opacity-20 py-2">Change Role</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingOverlay;