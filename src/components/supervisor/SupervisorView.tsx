import { useState } from 'react';
import { zones, clients, kpis } from '../../data/mockData';
import type { Zone, Client } from '../../data/mockData';
import ZoneMap from './ZoneMap';
import ClientProfile from './ClientProfile';

type View = 'map' | 'clients' | 'profile';

const statusColors = { normal: '#16a34a', watch: '#d97706', danger: '#dc2626' };
const statusLabels = { normal: 'Normal', watch: 'À surveiller', danger: 'Zone rouge' };

const verdictColors = { fraud: '#dc2626', no_fraud: '#16a34a', pending: '#64748b' };
const verdictLabels = { fraud: 'Fraude', no_fraud: 'OK', pending: 'En attente' };

export default function SupervisorView() {
  const [view, setView] = useState<View>('map');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const zoneClients = selectedZone
    ? clients.filter(c => c.zoneId === selectedZone.id)
    : [];

  const handleSelectZone = (zone: Zone) => {
    setSelectedZone(zone);
    setView('clients');
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setView('profile');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Zones rouges', value: kpis.dangerZones, color: '#dc2626', icon: '🔴' },
          { label: 'À surveiller', value: kpis.watchZones, color: '#d97706', icon: '🟡' },
          { label: 'Clients suspects', value: kpis.highRiskClients, color: '#7c3aed', icon: '⚠️' },
          { label: 'Fraudes confirmées', value: kpis.fraudConfirmed, color: '#1d4ed8', icon: '✓' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: k.color + '15' }}>
              {k.icon}
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ fontFamily: 'DM Sans', color: k.color }}>{k.value}</div>
              <div className="text-xs text-slate-500">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Breadcrumb nav */}
      {view !== 'map' && (
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => setView('map')} className="text-blue-600 hover:underline font-medium">Carte</button>
          {selectedZone && (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
              <button
                onClick={() => setView('clients')}
                className={`${view === 'clients' ? 'text-slate-900 font-semibold' : 'text-blue-600 hover:underline'}`}
              >
                {selectedZone.name}
              </button>
            </>
          )}
          {view === 'profile' && selectedClient && (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
              <span className="text-slate-900 font-semibold">{selectedClient.name}</span>
            </>
          )}
        </div>
      )}

      {/* Map view */}
      {view === 'map' && (
        <ZoneMap onSelectZone={handleSelectZone} />
      )}

      {/* Zone clients list */}
      {view === 'clients' && selectedZone && (
        <div className="space-y-4">
          {/* Zone header */}
          <div
            className="rounded-2xl p-5 flex items-start justify-between gap-4"
            style={{
              background: statusColors[selectedZone.status] + '10',
              border: `1px solid ${statusColors[selectedZone.status]}30`
            }}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-xl text-white"
                  style={{ background: statusColors[selectedZone.status] }}
                >
                  {statusLabels[selectedZone.status]}
                </span>
                <span className="text-xs text-slate-500">{selectedZone.transformerCount} transformateurs</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans' }}>{selectedZone.name}</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {selectedZone.clientCount} clients raccordés ·{' '}
                <span style={{ color: statusColors[selectedZone.status] }} className="font-semibold">
                  {selectedZone.lossRate.toFixed(1)}% de pertes non techniques
                </span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold" style={{ fontFamily: 'DM Sans', color: statusColors[selectedZone.status] }}>
                {zoneClients.filter(c => c.riskFlag).length}
              </div>
              <div className="text-xs text-slate-500">clients suspects</div>
            </div>
          </div>

          {/* Client list */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700" style={{ fontFamily: 'DM Sans' }}>
                Clients de la zone ({zoneClients.length})
              </span>
              <span className="text-xs text-slate-400">
                {zoneClients.filter(c => c.riskFlag).length} suspects · cliquez pour le profil complet
              </span>
            </div>
            <div className="divide-y divide-slate-50">
              {zoneClients.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">Aucun client dans cette zone (données simulées)</div>
              ) : (
                zoneClients.map(client => {
                  const verdict = client.agentVerdict ?? 'pending';
                  return (
                    <button
                      key={client.id}
                      onClick={() => handleSelectClient(client)}
                      className="w-full text-left px-5 py-4 hover:bg-slate-50 flex items-center gap-4"
                    >
                      {/* Avatar */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: client.riskFlag ? '#dc2626' : '#1d4ed8' }}
                      >
                        {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-slate-900">{client.name}</span>
                          {client.riskFlag && (
                            <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg bg-red-50 text-red-600">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                              </svg>
                              Suspect
                            </span>
                          )}
                          <span className="text-xs text-slate-400 font-mono">{client.id}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{client.address} · {client.category}</div>
                        {client.riskFlag && (
                          <div className="text-xs text-red-500 mt-1">
                            Baisse de {client.dropPercent.toFixed(0)}% · Facture: {client.lastBill.toLocaleString()} FCFA (attendu {client.calculatedBill.toLocaleString()} FCFA)
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        {client.riskFlag && (
                          <div className="text-right">
                            <div className="text-xs font-bold" style={{ color: '#dc2626' }}>Score {client.riskScore}</div>
                            <div className="text-xs text-slate-400">risque</div>
                          </div>
                        )}
                        <span
                          className="text-xs font-semibold px-2 py-1 rounded-lg"
                          style={{ background: verdictColors[verdict] + '15', color: verdictColors[verdict] }}
                        >
                          {verdictLabels[verdict]}
                        </span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Client profile */}
      {view === 'profile' && selectedClient && (
        <ClientProfile
          client={selectedClient}
          onBack={() => setView('clients')}
        />
      )}
    </div>
  );
}
