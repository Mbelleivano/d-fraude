import { useState } from 'react';
import type { UserRole } from '../data/mockData';

export type Page = 'main' | 'activity';

interface LayoutProps {
  userName: string;
  userRole: UserRole;
  onLogout: () => void;
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const roleLabels: Record<UserRole, string> = {
  supervisor: 'Superviseur',
  agent: 'Agent de terrain',
  admin: 'Administrateur',
};

const roleColors: Record<UserRole, string> = {
  supervisor: '#1d4ed8',
  agent: '#059669',
  admin: '#7c3aed',
};

const roleBadge: Record<UserRole, string> = {
  supervisor: 'bg-blue-50 text-blue-700',
  agent: 'bg-green-50 text-green-700',
  admin: 'bg-violet-50 text-violet-700',
};

export default function Layout({ userName, userRole, onLogout, children, title, subtitle }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-slate-900 text-sm leading-none" style={{ fontFamily: 'DM Sans' }}>FraudWatch</div>
              <div className="text-xs text-slate-400 mt-0.5">Détection de fraude électrique</div>
            </div>
          </div>

          {/* Page title */}
          <div className="flex-1 text-center hidden md:block">
            <div className="text-sm font-semibold text-slate-900">{title}</div>
            {subtitle && <div className="text-xs text-slate-400">{subtitle}</div>}
          </div>

          {/* User + logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-900">{userName}</span>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${roleBadge[userRole]}`}>{roleLabels[userRole]}</span>
            </div>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: roleColors[userRole] }}
            >
              {initials}
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100"
              title="Déconnexion"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-5 py-6 max-w-none w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white px-5 py-3 text-center text-xs text-slate-400">
        FraudWatch v1.0 · 29 septembre 2026 · Dernière mise à jour: 06h00
      </footer>
    </div>
  );
}
