import { useState } from 'react';
import { clients, activityLogs, zones, kpis, regions } from '../../data/mockData';

type ManagedRole = 'agent' | 'supervisor';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: ManagedRole;
  regionId: string;
  active: boolean;
  password: string;
}

const initialUsers: ManagedUser[] = [
  { id: 'USR-001', name: 'Oumar Faye', email: 'oumar.faye@fraudwatch.cm', role: 'agent', regionId: 'centre', active: true, password: 'agent123' },
  { id: 'USR-002', name: 'Awa Gueye', email: 'awa.gueye@fraudwatch.cm', role: 'agent', regionId: 'littoral', active: true, password: 'agent123' },
  { id: 'USR-003', name: 'Seydou Traoré', email: 'seydou.traore@fraudwatch.cm', role: 'agent', regionId: 'ouest', active: true, password: 'agent123' },
  { id: 'USR-004', name: 'Moussa Sarr', email: 'moussa.sarr@fraudwatch.cm', role: 'supervisor', regionId: 'centre', active: true, password: 'admin123' },
];

const loadManagedUsers = () => {
  const savedUsers = window.localStorage.getItem('fraudwatch-users');
  return savedUsers ? JSON.parse(savedUsers) as ManagedUser[] : initialUsers;
};

const verdictColors = { fraud: '#dc2626', no_fraud: '#16a34a', pending: '#64748b' };
const verdictLabels = { fraud: 'Fraude', no_fraud: 'OK', pending: 'En attente' };

const roleColors = { supervisor: '#1d4ed8', agent: '#059669', admin: '#7c3aed' };
const roleIcons = { supervisor: '👁', agent: '🧑‍🔧', admin: '⚙️' };

const actionIcons: Record<string, string> = {
  'Zone consultée': '🗺',
  'Client assigné': '📋',
  'Verdict rendu': '✅',
  'Profil client consulté': '👤',
  'Paramètre modifié': '⚙️',
};

export default function AdminView() {
  const [clientAssignments, setClientAssignments] = useState<Record<string, string>>(
    Object.fromEntries(clients.map(c => [c.id, c.assignedAgent ?? '']))
  );
  const [tab, setTab] = useState<'overview' | 'assignments' | 'users' | 'activity'>('overview');
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>(loadManagedUsers);
  const [accountForm, setAccountForm] = useState({
    name: '',
    email: '',
    role: 'agent' as ManagedRole,
    regionId: 'centre',
    password: '',
  });
  const [accountMessage, setAccountMessage] = useState('');
  const fieldAgents = managedUsers.filter(user => user.role === 'agent' && user.active);

  const totalFraud = clients.filter(c => c.agentVerdict === 'fraud').length;
  const totalPending = clients.filter(c => (c.agentVerdict ?? 'pending') === 'pending' && c.riskFlag).length;
  const totalNoFraud = clients.filter(c => c.agentVerdict === 'no_fraud').length;

  const assign = (clientId: string, agent: string) => {
    setClientAssignments(prev => ({ ...prev, [clientId]: agent }));
  };

  const createAccount = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = accountForm.email.trim().toLowerCase();
    if (managedUsers.some(user => user.email.toLowerCase() === normalizedEmail)) {
      setAccountMessage('Un compte utilise déjà cette adresse email.');
      return;
    }

    setManagedUsers(current => {
      const updatedUsers = [...current, {
        id: `USR-${String(current.length + 1).padStart(3, '0')}`,
        name: accountForm.name.trim(),
        email: normalizedEmail,
        role: accountForm.role,
        regionId: accountForm.regionId,
        active: true,
        password: accountForm.password,
      }];
      window.localStorage.setItem('fraudwatch-users', JSON.stringify(updatedUsers));
      return updatedUsers;
    });
    setAccountMessage(`Compte ${accountForm.role === 'agent' ? 'agent de terrain' : 'superviseur'} créé avec succès.`);
    setAccountForm(current => ({ ...current, name: '', email: '', password: '' }));
  };

  const toggleAccount = (userId: string) => {
    setManagedUsers(current => {
      const updatedUsers = current.map(user => user.id === userId ? { ...user, active: !user.active } : user);
      window.localStorage.setItem('fraudwatch-users', JSON.stringify(updatedUsers));
      return updatedUsers;
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* KPI overview row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Zones rouges', value: kpis.dangerZones, color: '#dc2626' },
          { label: 'Clients suspects', value: kpis.highRiskClients, color: '#d97706' },
          { label: 'Fraudes confirmées', value: totalFraud, color: '#dc2626' },
          { label: 'Verdicts en attente', value: totalPending, color: '#64748b' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="text-3xl font-bold mb-1" style={{ fontFamily: 'DM Sans', color: k.color }}>{k.value}</div>
            <div className="text-xs text-slate-500">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tab nav */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
        {(['overview', 'assignments', 'users', 'activity'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'overview' ? 'Vue d\'ensemble' : t === 'assignments' ? 'Assignations' : t === 'users' ? 'Comptes utilisateurs' : 'Journal d\'activité'}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Zones status */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-900 mb-4" style={{ fontFamily: 'DM Sans' }}>État des zones</h3>
            <div className="space-y-3">
              {zones.map(zone => {
                const color = zone.status === 'danger' ? '#dc2626' : zone.status === 'watch' ? '#d97706' : '#16a34a';
                const label = zone.status === 'danger' ? 'Zone rouge' : zone.status === 'watch' ? 'À surveiller' : 'Normal';
                const zoneClients = clients.filter(c => c.zoneId === zone.id);
                const suspectCount = zoneClients.filter(c => c.riskFlag).length;
                return (
                  <div key={zone.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900">{zone.name}</div>
                      <div className="text-xs text-slate-400">{zone.clientCount} clients · {zone.transformerCount} transformateurs</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold" style={{ color }}>{zone.lossRate.toFixed(1)}%</div>
                      <div className="text-xs text-slate-400">{suspectCount} suspects</div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-lg flex-shrink-0" style={{ background: color + '15', color }}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agents performance */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-900 mb-4" style={{ fontFamily: 'DM Sans' }}>Performance des agents</h3>
            <div className="space-y-4">
              {fieldAgents.map(agent => {
                const assigned = clients.filter(c => c.assignedAgent === agent.name);
                const done = assigned.filter(c => c.agentVerdict && c.agentVerdict !== 'pending').length;
                const fraud = assigned.filter(c => c.agentVerdict === 'fraud').length;
                return (
                  <div key={agent.id} className="p-4 rounded-xl bg-slate-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center text-white text-xs font-bold">
                          {agent.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{agent.name}</div>
                          <div className="text-xs text-slate-400">Agent de terrain</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">{done}/{assigned.length}</div>
                        <div className="text-xs text-slate-400">complétés</div>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: assigned.length ? `${(done / assigned.length) * 100}%` : '0%' }}
                      />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="text-red-600 font-semibold">{fraud} fraude{fraud !== 1 ? 's' : ''}</span>
                      <span>{assigned.length - done} en attente</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* All clients verdicts */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-900 mb-4" style={{ fontFamily: 'DM Sans' }}>
              Tous les clients suspects — récapitulatif
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-500">Client</th>
                    <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-500">Zone</th>
                    <th className="text-right py-2 pr-4 text-xs font-semibold text-slate-500">Facture attendue</th>
                    <th className="text-right py-2 pr-4 text-xs font-semibold text-slate-500">Facture réelle</th>
                    <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-500">Agent</th>
                    <th className="text-left py-2 text-xs font-semibold text-slate-500">Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.filter(c => c.riskFlag).map(client => {
                    const verdict = client.agentVerdict ?? 'pending';
                    return (
                      <tr key={client.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                        <td className="py-3 pr-4">
                          <div className="font-semibold text-slate-900">{client.name}</div>
                          <div className="text-xs text-slate-400 font-mono">{client.id}</div>
                        </td>
                        <td className="py-3 pr-4 text-xs text-slate-600">{zones.find(z => z.id === client.zoneId)?.name}</td>
                        <td className="py-3 pr-4 text-right font-mono text-xs text-slate-700">{client.calculatedBill.toLocaleString()}</td>
                        <td className="py-3 pr-4 text-right font-mono text-xs text-red-600 font-semibold">{client.lastBill.toLocaleString()}</td>
                        <td className="py-3 pr-4 text-xs text-slate-600">{client.assignedAgent ?? '—'}</td>
                        <td className="py-3">
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                            style={{ background: verdictColors[verdict] + '15', color: verdictColors[verdict] }}
                          >
                            {verdictLabels[verdict]}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Assignments tab */}
      {tab === 'assignments' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-700 flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Assignez chaque client suspect à un agent de terrain. L'agent verra ce client dans sa liste de vérification.
          </div>
          <div className="grid grid-cols-1 gap-3">
            {clients.filter(c => c.riskFlag).map(client => {
              const currentAgent = clientAssignments[client.id] ?? '';
              const verdict = client.agentVerdict ?? 'pending';
              return (
                <div key={client.id} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-5 flex-wrap">
                  <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{client.name}</span>
                      <span className="text-xs text-slate-400 font-mono">{client.id}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {zones.find(z => z.id === client.zoneId)?.name} · Score {client.riskScore} · Baisse −{client.dropPercent.toFixed(0)}%
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                      style={{ background: verdictColors[verdict] + '15', color: verdictColors[verdict] }}
                    >
                      {verdictLabels[verdict]}
                    </span>
                    <select
                      value={currentAgent}
                      onChange={e => assign(client.id, e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">— Non assigné —</option>
                      {fieldAgents.map(agent => <option key={agent.id} value={agent.name}>{agent.name}</option>)}
                    </select>
                    {currentAgent && (
                      <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Assigné
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* User accounts tab */}
      {tab === 'users' && (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_24rem] gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'DM Sans' }}>Comptes de la plateforme</h3>
                <p className="text-xs text-slate-500 mt-1">Agents de terrain et superviseurs autorisés à accéder à FraudWatch.</p>
              </div>
              <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">{managedUsers.length} comptes</span>
            </div>
            <div className="divide-y divide-slate-100">
              {managedUsers.map(user => {
                const region = regions.find(item => item.id === user.regionId);
                return (
                  <div key={user.id} className="p-5 flex items-center gap-4 flex-wrap">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white text-xs font-bold ${user.role === 'agent' ? 'bg-emerald-600' : 'bg-blue-700'}`}>
                      {user.name.split(' ').map(part => part[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-48">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">{user.name}</span>
                        <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${user.role === 'agent' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                          {user.role === 'agent' ? 'Agent de terrain' : 'Superviseur'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{user.email}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{region?.name} · {region?.capital} · {user.id}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1.5 text-xs font-semibold ${user.active ? 'text-emerald-700' : 'text-slate-400'}`}>
                        <span className={`w-2 h-2 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        {user.active ? 'Actif' : 'Désactivé'}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleAccount(user.id)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        {user.active ? 'Désactiver' : 'Réactiver'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={createAccount} className="bg-white rounded-2xl border border-slate-100 p-5 h-fit shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'DM Sans' }}>Créer un compte</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">Définissez le rôle et la région d’affectation du nouvel utilisateur.</p>

            <div className="space-y-4">
              <label className="block">
                <span className="block text-xs font-semibold text-slate-600 mb-1.5">Nom complet</span>
                <input
                  required
                  value={accountForm.name}
                  onChange={event => setAccountForm(current => ({ ...current, name: event.target.value }))}
                  placeholder="Ex. Jean Mbarga"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-semibold text-slate-600 mb-1.5">Email professionnel</span>
                <input
                  required
                  type="email"
                  value={accountForm.email}
                  onChange={event => setAccountForm(current => ({ ...current, email: event.target.value }))}
                  placeholder="nom@fraudwatch.cm"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-semibold text-slate-600 mb-1.5">Mot de passe temporaire</span>
                <input
                  required
                  type="password"
                  minLength={8}
                  value={accountForm.password}
                  onChange={event => setAccountForm(current => ({ ...current, password: event.target.value }))}
                  placeholder="8 caractères minimum"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-semibold text-slate-600 mb-1.5">Type de compte</span>
                <select
                  value={accountForm.role}
                  onChange={event => setAccountForm(current => ({ ...current, role: event.target.value as ManagedRole }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="agent">Agent de terrain</option>
                  <option value="supervisor">Superviseur</option>
                </select>
              </label>
              <label className="block">
                <span className="block text-xs font-semibold text-slate-600 mb-1.5">Région d’affectation</span>
                <select
                  value={accountForm.regionId}
                  onChange={event => setAccountForm(current => ({ ...current, regionId: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {regions.map(region => <option key={region.id} value={region.id}>{region.name} — {region.capital}</option>)}
                </select>
              </label>
            </div>

            {accountMessage && (
              <div className={`mt-4 rounded-xl px-3 py-2.5 text-xs font-medium ${accountMessage.includes('succès') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {accountMessage}
              </div>
            )}

            <button
              type="submit"
              className="mt-5 w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Créer le compte
            </button>
          </form>
        </div>
      )}

      {/* Activity tab */}
      {tab === 'activity' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400 mb-2">
            Toutes les actions des superviseurs, agents et administrateurs — en temps réel
          </div>
          {activityLogs.map(log => {
            const roleColor = roleColors[log.actorRole];
            const icon = actionIcons[log.action] ?? '•';
            return (
              <div key={log.id} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start gap-4">
                <div className="text-xl flex-shrink-0">{icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-bold text-slate-900">{log.action}</span>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                      style={{ background: roleColor + '15', color: roleColor }}
                    >
                      {roleIcons[log.actorRole]} {log.actor}
                    </span>
                  </div>
                  <div className="text-sm text-slate-700 font-medium">{log.target}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{log.detail}</div>
                </div>
                <div className="text-xs text-slate-400 flex-shrink-0 text-right">
                  <div>{new Date(log.timestamp).toLocaleDateString('fr-FR')}</div>
                  <div>{new Date(log.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
