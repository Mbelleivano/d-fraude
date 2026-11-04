import { useEffect, useMemo, useState } from 'react';
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';
import type { Layer } from 'leaflet';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import 'leaflet/dist/leaflet.css';
import { clients, zones } from '../../data/mockData';
import type { Zone, ZoneStatus } from '../../data/mockData';

interface ZoneMapProps {
  onSelectZone: (zone: Zone) => void;
}

type BoundaryFeature = Feature<Geometry, Record<string, unknown>>;
type BoundaryCollection = FeatureCollection<Geometry, Record<string, unknown>>;

const DOUALA_CENTER: [number, number] = [4.0511, 9.7679];

const statusLabels: Record<ZoneStatus, string> = {
  danger: 'Zone rouge',
  watch: 'À surveiller',
  normal: 'Normal',
};

const statusStyles: Record<ZoneStatus, { fill: string; stroke: string; badge: string; dot: string }> = {
  danger: { fill: '#ef4444', stroke: '#b91c1c', badge: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
  watch: { fill: '#f59e0b', stroke: '#b45309', badge: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  normal: { fill: '#22c55e', stroke: '#15803d', badge: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
};

function normalizeName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function featureName(feature: BoundaryFeature): string {
  const properties = feature.properties ?? {};
  const candidates = [
    properties['name:fr'],
    properties.name,
    properties.name_en,
    properties.primary_name,
    properties.locality,
    typeof properties.names === 'object' && properties.names !== null
      ? (properties.names as Record<string, unknown>).primary
      : undefined,
  ];
  const name = candidates.find(value => typeof value === 'string' && value.trim());
  return typeof name === 'string' ? name : 'Quartier sans nom';
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 100);
    return () => window.clearTimeout(timer);
  }, [map]);
  return null;
}

export default function ZoneMap({ onSelectZone }: ZoneMapProps) {
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [boundaries, setBoundaries] = useState<BoundaryCollection | null>(null);
  const [boundaryMessage, setBoundaryMessage] = useState('');
  const [search, setSearch] = useState('');

  const doualaZones = zones.filter(zone => zone.regionId === 'littoral');
  const selectedZone = doualaZones.find(zone => zone.id === selectedZoneId) ?? null;

  useEffect(() => {
    let active = true;
    fetch('/data/douala-zones.geojson')
      .then(response => {
        if (!response.ok) throw new Error('Fichier GeoJSON absent');
        return response.json();
      })
      .then((data: BoundaryCollection) => {
        if (!active) return;
        if (data?.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
          throw new Error('Format GeoJSON invalide');
        }
        setBoundaries(data);
        setBoundaryMessage('');
      })
      .catch(() => {
        if (active) {
          setBoundaries(null);
          setBoundaryMessage(
            'Contours de quartiers non installés : les points colorés sont des positions de démonstration, pas les limites réelles des zones.'
          );
        }
      });
    return () => { active = false; };
  }, []);

  const zoneStats = useMemo(() => {
    const counts = new Map<string, number>();
    const suspects = new Map<string, number>();
    for (const zone of doualaZones) {
      counts.set(zone.id, 0);
      suspects.set(zone.id, 0);
    }
    for (const client of clients) {
      if (!counts.has(client.zoneId)) continue;
      counts.set(client.zoneId, (counts.get(client.zoneId) ?? 0) + 1);
      if (client.riskFlag) suspects.set(client.zoneId, (suspects.get(client.zoneId) ?? 0) + 1);
    }
    return { counts, suspects };
  }, [doualaZones]);

  const filteredZones = doualaZones.filter(zone =>
    `${zone.name} ${zone.neighborhoods.join(' ')}`.toLowerCase().includes(search.toLowerCase())
  );

  const getZoneForFeature = (feature: BoundaryFeature): Zone | undefined => {
    const name = normalizeName(featureName(feature));
    return doualaZones.find(zone =>
      normalizeName(zone.name.replace(/^Zone\s+/i, '')).includes(name) ||
      name.includes(normalizeName(zone.name.replace(/^Zone\s+/i, ''))) ||
      zone.neighborhoods.some(neighborhood => normalizeName(neighborhood) === name)
    );
  };

  const styleFeature = (feature?: BoundaryFeature) => {
    if (!feature) return { color: '#64748b', weight: 2, fillOpacity: 0.12 };
    const zone = getZoneForFeature(feature);
    const style = zone ? statusStyles[zone.status] : null;
    return {
      color: style?.stroke ?? '#64748b',
      weight: zone?.id === selectedZoneId ? 4 : 2,
      fillColor: style?.fill ?? '#94a3b8',
      fillOpacity: zone?.id === selectedZoneId ? 0.55 : 0.24,
    };
  };

  const handleFeature = (feature: BoundaryFeature, layer: Layer) => {
    const zone = getZoneForFeature(feature);
    layer.bindTooltip(featureName(feature), { sticky: true });
    layer.on('click', () => {
      if (zone) {
        setSelectedZoneId(zone.id);
        onSelectZone(zone);
      } else {
        setBoundaryMessage(
          `Le quartier « ${featureName(feature)} » est sur la carte, mais n'est pas encore associé à une zone de démonstration.`
        );
      }
    });
    if (zone) {
      const safeName = featureName(feature).replace(/[&<>\"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' }[character] ?? character));
      const safeZoneName = zone.name.replace(/[&<>\"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' }[character] ?? character));
      layer.bindPopup(
        `<strong>${safeName}</strong><br/>Zone de démonstration : ${safeZoneName}<br/>${zoneStats.counts.get(zone.id) ?? 0} clients`
      );
    }
  };

  return (
    <div className="space-y-5">
      <section className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
              Cartographie des risques électriques
            </div>
            <h2 className="text-xl font-bold text-slate-900">Douala, Cameroun</h2>
            <p className="text-sm text-slate-500 mt-1">
              {doualaZones.length} zones de démonstration · {doualaZones.length * 50} clients fictifs
            </p>
          </div>
          <label className="block md:w-72">
            <span className="block text-xs font-semibold text-slate-600 mb-1.5">Rechercher une zone ou un quartier</span>
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Ex. Akwa, Bonanjo…"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-100">
          {(['danger', 'watch', 'normal'] as const).map(status => (
            <div key={status} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-sm ${statusStyles[status].dot}`} />
              <span className="text-xs text-slate-600">{statusLabels[status]}</span>
            </div>
          ))}
        </div>
      </section>

      {boundaryMessage && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {boundaryMessage}
          {!boundaries && (
            <p className="mt-1">
              Pour afficher les vrais contours, ajoute le fichier
              {' '}<code>public/data/douala-zones.geojson</code>.
            </p>
          )}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-[34rem] w-full">
          <MapContainer
            center={DOUALA_CENTER}
            zoom={12}
            minZoom={10}
            maxZoom={18}
            scrollWheelZoom
            className="h-full w-full"
          >
            <MapResizer />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {boundaries && (
              <GeoJSON
                key="douala-boundaries"
                data={boundaries as never}
                style={feature => styleFeature(feature as BoundaryFeature)}
                onEachFeature={(feature, layer) => handleFeature(feature as BoundaryFeature, layer)}
              />
            )}
            {!boundaries && doualaZones.map((zone, index) => {
              const column = index % 15;
              const row = Math.floor(index / 15);
              const position: [number, number] = [
                4.005 + row * 0.012 + (column % 2) * 0.003,
                9.675 + column * 0.010,
              ];
              const style = statusStyles[zone.status];
              return (
                <CircleMarker
                  key={zone.id}
                  center={position}
                  radius={selectedZoneId === zone.id ? 10 : 7}
                  pathOptions={{ color: style.stroke, fillColor: style.fill, fillOpacity: 0.75, weight: 2 }}
                  eventHandlers={{ click: () => { setSelectedZoneId(zone.id); } }}
                >
                  <Popup>
                    <strong>{zone.name}</strong>
                    <br />{zoneStats.counts.get(zone.id) ?? 0} clients fictifs
                    <br />{zoneStats.suspects.get(zone.id) ?? 0} suspects simulés
                    <br />
                    <button
                      type="button"
                      onClick={() => onSelectZone(zone)}
                      className="mt-2 rounded bg-blue-700 px-3 py-1.5 text-white"
                    >
                      Voir les clients
                    </button>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
        <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
          Fond cartographique © OpenStreetMap. Les niveaux de risque et les clients sont simulés.
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Toutes les zones de Douala</h3>
            <p className="text-sm text-slate-500">Clique sur une fiche pour consulter les 50 clients fictifs de la zone.</p>
          </div>
          <span className="text-xs text-slate-500">{filteredZones.length} zone(s)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {filteredZones.map(zone => {
            const style = statusStyles[zone.status];
            const selected = selectedZoneId === zone.id;
            const clientCount = zoneStats.counts.get(zone.id) ?? 0;
            const suspectCount = zoneStats.suspects.get(zone.id) ?? 0;
            const zoneNumber = zone.id.match(/(\d+)$/)?.[1]?.padStart(3, '0') ?? '000';
            return (
              <button
                type="button"
                key={zone.id}
                onClick={() => { setSelectedZoneId(zone.id); onSelectZone(zone); }}
                aria-label={`Afficher les clients de la zone ${zone.name}`}
                className={`relative min-h-[176px] overflow-hidden rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                  selected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
                }`}
              >
                <span className={`absolute inset-y-0 left-0 w-1 ${style.dot}`} />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] font-medium tracking-[0.18em] text-slate-400">{`Z-${zoneNumber}`}</div>
                    <h4 className="mt-3 truncate text-base font-bold text-slate-950">{zone.name.replace(/^Zone\s+/i, '')}</h4>
                  </div>
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.badge}`} aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 2 4.5 13h6L10 22l9.5-12h-6L13 2Z" />
                    </svg>
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{clientCount} clients · {suspectCount} suspects</p>
                <div className="mt-7 flex items-end justify-between gap-2">
                  <span className="text-xs text-slate-500">Pertes</span>
                  <span className="text-2xl font-extrabold leading-none" style={{ color: style.stroke }}>{Math.round(zone.lossRate)}%</span>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                  {statusLabels[zone.status]}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
