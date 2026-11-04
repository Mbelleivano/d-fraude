import { useState } from 'react';
import type { UserRole } from '../data/mockData';

interface LoginPageProps {
  onLogin: (role: UserRole, name: string) => void;
}

interface StoredAccount {
  name: string;
  email: string;
  password: string;
  role: 'agent' | 'supervisor';
  active: boolean;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const accounts = [
    { email: 'superviseur@senelec.sn', password: 'admin123', role: 'supervisor' as UserRole, name: 'Moussa Sarr' },
    { email: 'agent@senelec.sn', password: 'agent123', role: 'agent' as UserRole, name: 'Oumar Faye' },
    { email: 'admin@senelec.sn', password: 'admin123', role: 'admin' as UserRole, name: 'Adja Sall' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const account = accounts.find(a => a.email === email && a.password === password);
      const storedAccounts = JSON.parse(window.localStorage.getItem('fraudwatch-users') ?? '[]') as StoredAccount[];
      const createdAccount = storedAccounts.find(
        item => item.active && item.email.toLowerCase() === email.toLowerCase() && item.password === password,
      );
      if (account) {
        onLogin(account.role, account.name);
      } else if (createdAccount) {
        onLogin(createdAccount.role, createdAccount.name);
      } else {
        setError('Identifiants incorrects. Vérifiez votre email et mot de passe.');
      }
      setLoading(false);
    }, 800);
  };

  const quickLogin = (role: UserRole) => {
    const account = accounts.find(a => a.role === role)!;
    setEmail(account.email);
    setPassword(account.password);
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 50%, #1e3a8a 100%)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <span className="text-xl font-bold" style={{ fontFamily: 'DM Sans' }}>FraudWatch</span>
        </div>

        <div>
          <h1 className="text-5xl font-bold leading-tight mb-6" style={{ fontFamily: 'DM Sans' }}>
            Détection de fraude<br />électrique en temps réel
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed max-w-md">
            Plateforme intelligente de surveillance du réseau de distribution. Identifiez les zones à risque et les clients suspects grâce à l'analyse combinée du bilan énergétique et de l'historique de consommation.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {[
            { label: 'Régions couvertes', value: '10' },
            { label: 'Zones surveillées', value: '1 500' },
            { label: 'Clients analysés', value: '45 000' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-blue-200 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-10">
            <div className="flex items-center gap-3 mb-8 lg:hidden">
              <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-blue-900" style={{ fontFamily: 'DM Sans' }}>FraudWatch</span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'DM Sans' }}>Connexion</h2>
            <p className="text-slate-500 text-sm mb-8">Accédez à votre espace de surveillance</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email professionnel</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="vous@senelec.sn"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ background: '#f8fafc' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ background: '#f8fafc' }}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-70"
                style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center mb-4">Accès rapide (démonstration)</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { role: 'supervisor' as UserRole, label: 'Superviseur', color: '#1d4ed8' },
                  { role: 'agent' as UserRole, label: 'Agent', color: '#059669' },
                  { role: 'admin' as UserRole, label: 'Admin', color: '#7c3aed' },
                ].map(({ role, label, color }) => (
                  <button
                    key={role}
                    onClick={() => quickLogin(role)}
                    className="text-xs py-2 px-3 rounded-lg border font-medium hover:shadow-sm"
                    style={{ borderColor: color + '40', color, background: color + '08' }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
