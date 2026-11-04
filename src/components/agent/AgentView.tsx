import { useState } from 'react';
import { clients } from '../../data/mockData';
import type { Client, FraudVerdict } from '../../data/mockData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface AgentViewProps {
  userName: string;
}

const verdictColors: Record<FraudVerdict, string> = {
  fraud: '#dc2626',
  no_fraud: '#16a34a',
  pending: '#64748b',
};
const verdictBg: Record<FraudVerdict, string> = {
  fraud: '#fef2f2',
  no_fraud: '#f0fdf4',
  pending: '#f8fafc',
};

export default function AgentView({ userName }: AgentViewProps) {
  const [clientStates, setClientStates] = useState<
    Record<string, { verdict: FraudVerdict; note: string }>
  >(
    Object.fromEntries(
      clients
        .filter(c => c.assignedAgent === userName)
        .map(c => [c.id, { verdict: c.agentVerdict ?? 'pending', note: c.agentNote ?? '' }])
    )
  );
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<FraudVerdict | 'all'>('all');

  const myClients = clients.filter(c => c.assignedAgent === userName);

  const filtered = filter === 'all' ? myClients : myClients.filter(c => (clientStates[c.id]?.verdict ?? 'pending') === filter);

  const done = myClients.filter(c => clientStates[c.id]?.verdict !== 'pending').length;
  const fraudCount = myClients.filter(c => clientStates[c.id]?.verdict === 'fraud').length;
  const okCount = myClients.filter(c => clientStates[c.id]?.verdict === 'no_fraud').length;

  const setVerdict = (clientId: string, verdict: FraudVerdict) => {
    setClientStates(prev => ({ ...prev, [clientId]: { ...prev[clientId], verdict } }));
  };

  const setNote = (clientId: string, note: string) => {
    setClientStates(prev => ({ ...prev, [clientId]: { ...prev[clientId], note } }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header summary */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans' }}>Ma liste de vérification</h2>
            <p className="text-sm text-slate-500 mt-0.5">Clients assignés par l'administrateur pour vérification terrain</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans' }}>{done}</span>
            <span className="text-slate-400 text-sm">/ {myClients.length} vérifiés</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 rounded-full bg-slate-100 overflow-hidden mb-3">
          <div
            className="h-full rounded-full"
            style={{ width: `${(done / myClients.length) * 100}%`, background: 'linear-gradient(90deg, #1d4ed8, #3b82f6)' }}
          />
        </div>
        <div className="flex items-center gap-5 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            {fraudCount} fraude{fraudCount !== 1 ? 's' : ''} confirmée{fraudCount !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            {okCount} client{okCount !== 1 ? 's' : ''} OK
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            {myClients.length - done} en attente
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {(['all', 'pending', 'fraud', 'no_fraud'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${
              filter === f ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'Tous' : f === 'pending' ? 'En attente' : f === 'fraud' ? 'Fraude confirmée' : 'Pas de fraude'}
            <span className="ml-1.5 opacity-60">
              {f === 'all' ? myClients.length : myClients.filter(c => (clientStates[c.id]?.verdict ?? 'pending') === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Client cards */}
      <div className="space-y-3">
        {filtered.map(client => {
          const state = clientStates[client.id] ?? { verdict: 'pending', note: '' };
          const isExpanded = expanded === client.id;
          const vColor = verdictColors[state.verdict];
          const vBg = verdictBg[state.verdict];
          const billDiff = client.calculatedBill - client.lastBill;

          return (
            <div
              key={client.id}
              className="bg-white rounded-2xl border overflow-hidden"
              style={{ borderColor: state.verdict !== 'pending' ? vColor + '40' : '#e2e8f0' }}
            >
              {/* Card header */}
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: client.riskFlag ? '#dc2626' : '#1d4ed8' }}
                  >
                    {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-bold text-slate-900">{client.name}</span>
                      {client.riskFlag && (
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-red-50 text-red-600 flex items-center gap-1">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                          </svg>
                          Suspect
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">{client.address}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{client.phone} · {client.id}</div>
                  </div>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : client.id)}
                    className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-1 flex-shrink-0"
                  >
                    {isExpanded ? 'Réduire' : 'Voir détails'}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points={isExpanded ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
                    </svg>
                  </button>
                </div>

                {/* Quick bill summary */}
                <div className="mt-3 p-3 rounded-xl bg-slate-50 flex items-center gap-4 flex-wrap">
                  <div>
                    <div className="text-xs text-slate-500">Facture attendue</div>
                    <div className="text-sm font-bold text-slate-900 font-mono">{client.calculatedBill.toLocaleString()} FCFA</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" className="flex-shrink-0">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                  <div>
                    <div className="text-xs text-slate-500">Facture réelle</div>
                    <div className="text-sm font-bold text-red-600 font-mono">{client.lastBill.toLocaleString()} FCFA</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-xs text-slate-500">Écart</div>
                    <div className="text-sm font-bold text-amber-600 font-mono">−{billDiff.toLocaleString()} FCFA</div>
                  </div>
                </div>
              </div>

              {/* Expanded: history chart */}
              {isExpanded && (
                <div className="px-5 pb-4">
                  <div className="border-t border-slate-50 pt-4 mb-4">
                    <div className="text-xs font-semibold text-slate-600 mb-3">Historique de consommation</div>
                    <ResponsiveContainer width="100%" height={140}>
                      <AreaChart data={client.billHistory.map(b => ({ month: b.month, kwh: b.kwh }))} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`grad-${client.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e2e8f0' }} formatter={(v: unknown) => [`${v} kWh`]} />
                        <ReferenceLine y={client.medianConsumption} stroke="#1d4ed8" strokeDasharray="4 4" />
                        <Area type="monotone" dataKey="kwh" stroke="#3b82f6" strokeWidth={2} fill={`url(#grad-${client.id})`} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Verdict section */}
              <div className="px-5 pb-5">
                <div className="text-xs font-semibold text-slate-600 mb-2">Votre verdict après vérification terrain :</div>
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {(['fraud', 'no_fraud', 'pending'] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => setVerdict(client.id, v)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all"
                      style={{
                        background: state.verdict === v ? verdictColors[v] + '15' : '#fff',
                        borderColor: state.verdict === v ? verdictColors[v] : '#e2e8f0',
                        color: state.verdict === v ? verdictColors[v] : '#64748b',
                      }}
                    >
                      {state.verdict === v && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      {v === 'fraud' ? '🚨 Fraude confirmée' : v === 'no_fraud' ? '✅ Pas de fraude' : '⏳ En attente'}
                    </button>
                  ))}
                </div>
                <textarea
                  value={state.note}
                  onChange={e => setNote(client.id, e.target.value)}
                  placeholder="Ajouter une note (observations sur le terrain, photos prises...)..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />

                {state.verdict !== 'pending' && (
                  <div
                    className="mt-2 flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl"
                    style={{ background: verdictColors[state.verdict] + '10', color: verdictColors[state.verdict] }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Verdict enregistré · Visible par le superviseur et l'administrateur
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
            <div className="text-3xl mb-3">✅</div>
            <div className="text-sm font-semibold text-slate-700">Aucun client dans ce filtre</div>
          </div>
        )}
      </div>
    </div>
  );
}
