import React, { useState, useEffect } from 'react';

interface AuthProps {
  onLogin: (email: string, role: 'admin' | 'user') => void;
  prefillMode?: 'standard' | 'governance';
}

const Auth: React.FC<AuthProps> = ({ onLogin, prefillMode = 'standard' }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [portalMode, setPortalMode] = useState<'standard' | 'governance'>(prefillMode);

  // Synchronize internal state if prefillMode changes
  useEffect(() => {
    setPortalMode(prefillMode);
  }, [prefillMode]);

  const validateAndLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (portalMode === 'governance') {
      if (email === 'admin@novacrest.com') {
        setIsLoading(true);
        setTimeout(() => { onLogin(email, 'admin'); setIsLoading(false); }, 1000);
        return;
      } else {
        setError('UNAUTHORIZED: ID NOT IN GOVERNANCE RECORDS.');
        return;
      }
    }

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      setError('RESTRICTION: VERIFIED GMAIL ACCOUNTS ONLY.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      onLogin(email, 'user');
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-nova-navy flex items-center justify-center p-6 overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-nova-gold/5 blur-[150px] rounded-full animate-orb-pulse"></div>
      
      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-700">
        <div className={`glass p-12 py-16 rounded-[64px] shadow-3xl space-y-10 text-center transition-all duration-500 ${portalMode === 'governance' ? 'ring-1 ring-nova-gold/30' : ''}`}>
          <div className="space-y-5">
            <div className={`w-24 h-24 rounded-[36px] flex items-center justify-center font-black text-5xl mx-auto shadow-2xl transition-all duration-700 ${portalMode === 'governance' ? 'bg-white text-nova-navy rotate-0' : 'bg-nova-gold text-nova-navy rotate-6'}`}>N</div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                {portalMode === 'governance' ? 'Governance' : 'Nova Portal'}
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-nova-gold opacity-60">
                {portalMode === 'governance' ? 'Strategic Override Active' : 'Institutional Discovery'}
              </p>
            </div>
          </div>

          <form onSubmit={validateAndLogin} className="space-y-6">
            <div className="space-y-2 text-left px-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Credential Key</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                placeholder={portalMode === 'governance' ? "Enter Global Admin ID" : "Verify with @gmail.com"}
                className={`w-full bg-white/5 rounded-[28px] px-10 py-6 text-center text-sm focus:outline-none focus:ring-2 focus:ring-nova-gold/40 transition-all placeholder:opacity-20 font-bold`}
              />
            </div>

            {error && (
              <p className="text-[10px] text-red-400 font-black uppercase tracking-wider animate-in slide-in-from-top-2 py-3 bg-red-400/10 rounded-2xl px-4">
                {error}
              </p>
            )}

            <button 
              type="submit"
              disabled={isLoading || !email}
              className={`w-full py-6 rounded-[32px] font-black text-[11px] uppercase tracking-[0.4em] transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center gap-3 shadow-2xl ${portalMode === 'governance' ? 'bg-white text-nova-navy' : 'bg-nova-gold text-nova-navy shadow-nova-gold/10'}`}
            >
              {isLoading ? (
                <i className="fas fa-satellite-dish fa-spin"></i>
              ) : (
                <>
                  <i className={`fas ${portalMode === 'governance' ? 'fa-fingerprint' : 'fa-shield-halved'}`}></i>
                  {portalMode === 'governance' ? 'Authorize Governance' : 'Access Portal'}
                </>
              )}
            </button>
          </form>

          <div className="pt-2">
            <button 
              onClick={() => { setPortalMode(portalMode === 'standard' ? 'governance' : 'standard'); setError(''); }}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-nova-gold transition-all py-2"
            >
              {portalMode === 'governance' ? 'Return to Institutional Site' : 'Switch to Governance Mode'}
            </button>
          </div>

          <div className="pt-8">
            <p className="text-[9px] text-white/10 leading-relaxed uppercase tracking-[0.3em] font-black">
              Verified by Nova Crest Digital Board <br/> 2024 Institutional Access Active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;