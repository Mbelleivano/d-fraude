import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar } from 'recharts';
import type { Client } from '../../data/mockData';

interface ClientProfileProps {
  client: Client;
  onBack: () => void;
}

const verdictColors = { fraud: '#dc2626', no_fraud: '#16a34a', pending: '#2563eb' };
const verdictLabels = { fraud: 'Fraude confirmée', no_fraud: 'Pas de fraude', pending: 'En attente de vérification' };

export default function ClientProfile({ client, onBack }: ClientProfileProps) {
  const billDiff = client.calculatedBill - client.lastBill;
  const billDiffPct = ((billDiff / client.calculatedBill) * 100).toFixed(1);
  const verdict = client.agentVerdict ?? 'pending';
  const vColor = verdictColors[verdict];

  const chartData = client.billHistory.map(b => ({ month: b.month, kwh: b.kwh, amount: b.amount }));

  return (
    <div className="space-y-5">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Retour à la liste
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}>
              {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans' }}>{client.name}</h2>
                {client.riskFlag && (
                  <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg bg-red-50 text-red-600">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    </svg>
                    Suspect
                  </span>
                )}
              </div>
              <div className="text-sm text-slate-500">{client.address}</div>
              <div className="text-xs text-slate-400 mt-0.5">{client.phone} · {client.id} · {client.category}</div>
            </div>
          </div>
          <div className="text-right">
            <div
              className="text-sm font-semibold px-3 py-1.5 rounded-xl"
              style={{ background: vColor + '15', color: vColor }}
            >
              {verdictLabels[verdict]}
            </div>
            {client.agentNote && (
              <div className="text-xs text-slate-400 mt-1.5 max-w-xs">"{client.agentNote}"</div>
            )}
          </div>
        </div>
      </div>

      {/* Bill comparison — the key analysis */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="font-semibold text-slate-900 mb-4" style={{ fontFamily: 'DM Sans' }}>
          Comparaison des factures
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div className="p-4 rounded-xl bg-slate-50">
            <div className="text-xs text-slate-500 mb-1">Facture théorique</div>
            <div className="text-xs text-slate-400 mb-2">(basée sur historique médian)</div>
            <div className="text-2xl font-bold text-slate-900 font-mono" style={{ fontFamily: 'DM Sans' }}>
              {client.calculatedBill.toLocaleString()} <span className="text-sm font-normal text-slate-400">FCFA</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">{client.medianConsumption} kWh attendus</div>
          </div>

          <div className="p-4 rounded-xl" style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
            <div className="text-xs text-slate-500 mb-1">Dernière facture réelle</div>
            <div className="text-xs text-slate-400 mb-2">(juillet 2026)</div>
            <div className="text-2xl font-bold text-red-600 font-mono" style={{ fontFamily: 'DM Sans' }}>
              {client.lastBill.toLocaleString()} <span className="text-sm font-normal text-red-300">FCFA</span>
            </div>
            <div className="text-xs text-red-400 mt-1">{client.recentConsumption} kWh facturés</div>
          </div>

          <div className="p-4 rounded-xl" style={{ background: '#fef9c3', border: '1px solid #fde047' }}>
            <div className="text-xs text-slate-500 mb-1">Écart (manque à gagner)</div>
            <div className="text-xs text-slate-400 mb-2">Perte estimée</div>
            <div className="text-2xl font-bold text-amber-600 font-mono" style={{ fontFamily: 'DM Sans' }}>
              −{billDiff.toLocaleString()} <span className="text-sm font-normal text-amber-400">FCFA</span>
            </div>
            <div className="text-xs text-amber-500 mt-1">−{billDiffPct}% de moins que prévu</div>
          </div>
        </div>

        {/* Bill bar comparison */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Facture théorique</span>
            <span className="font-mono">{client.calculatedBill.toLocaleString()} FCFA</span>
          </div>
          <div className="h-6 rounded-lg bg-slate-100 relative overflow-hidden">
            <div className="h-full rounded-lg bg-blue-500" style={{ width: '100%' }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Facture réelle</span>
            <span className="font-mono text-red-600">{client.lastBill.toLocaleString()} FCFA</span>
          </div>
          <div className="h-6 rounded-lg bg-slate-100 relative overflow-hidden">
            <div
              className="h-full rounded-lg bg-red-400"
              style={{ width: `${(client.lastBill / client.calculatedBill) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Consumption history chart */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'DM Sans' }}>Historique de consommation</h3>
          <span className="text-xs text-slate-400">9 derniers mois</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="profileGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit=" kWh" />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px' }}
              formatter={(val: unknown) => [`${val} kWh`, 'Consommation']}
            />
            <ReferenceLine
              y={client.medianConsumption}
              stroke="#1d4ed8"
              strokeDasharray="5 5"
              label={{ value: `Médiane: ${client.medianConsumption} kWh`, fontSize: 9, fill: '#1d4ed8', position: 'insideTopRight' }}
            />
            <Area type="monotone" dataKey="kwh" stroke="#3b82f6" strokeWidth={2.5} fill="url(#profileGrad)"
              dot={(props: { cx?: number; cy?: number; index?: number }) => {
                const { cx = 0, cy = 0, index = 0 } = props;
                const isLow = chartData[index]?.kwh < client.medianConsumption * 0.6;
                return <circle key={`dot-${index}`} cx={cx} cy={cy} r={isLow ? 5 : 3} fill={isLow ? '#dc2626' : '#3b82f6'} stroke="white" strokeWidth={1.5} />;
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bill history table */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="font-semibold text-slate-900 mb-4" style={{ fontFamily: 'DM Sans' }}>Historique des factures</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-500">Mois</th>
                <th className="text-right py-2 pr-4 text-xs font-semibold text-slate-500">Consommation</th>
                <th className="text-right py-2 text-xs font-semibold text-slate-500">Montant facturé</th>
                <th className="text-right py-2 pl-4 text-xs font-semibold text-slate-500">Statut</th>
              </tr>
            </thead>
            <tbody>
              {client.billHistory.map((bill, i) => {
                const isAnomaly = bill.kwh < client.medianConsumption * 0.6;
                return (
                  <tr
                    key={i}
                    className="border-b border-slate-50 last:border-0"
                    style={{ background: isAnomaly ? '#fef2f2' : 'transparent' }}
                  >
                    <td className="py-2.5 pr-4 text-slate-700 font-medium">{bill.month} {bill.year}</td>
                    <td className="py-2.5 pr-4 text-right font-mono text-slate-700">{bill.kwh} kWh</td>
                    <td className="py-2.5 text-right font-mono font-semibold" style={{ color: isAnomaly ? '#dc2626' : '#1e293b' }}>
                      {bill.amount.toLocaleString()} FCFA
                    </td>
                    <td className="py-2.5 pl-4 text-right">
                      {isAnomaly ? (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-red-50 text-red-600">Anomalie</span>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">Normal</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
