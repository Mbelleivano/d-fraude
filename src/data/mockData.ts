export type ZoneStatus = 'normal' | 'watch' | 'danger';
export type InspectionResult = 'confirmed_fraud' | 'false_alert' | 'other_cause' | 'pending';
export type UserRole = 'agent' | 'supervisor' | 'admin';
export type FraudVerdict = 'fraud' | 'no_fraud' | 'pending';

export interface Region {
  id: string;
  name: string;
  capital: string;
  mapPath: string;
  centerX: number;
  centerY: number;
}

export interface Zone {
  id: string;
  regionId: string;
  name: string;
  city: string;
  status: ZoneStatus;
  lossRate: number;
  transformerCount: number;
  clientCount: number;
  mapX: number;
  mapY: number;
  mapPolygon: string;
  neighborhoods: string[];
  color: string;
}

export interface Bill {
  month: string;
  year: number;
  amount: number;
  kwh: number;
}

export interface Client {
  id: string;
  name: string;
  address: string;
  phone: string;
  zoneId: string;
  category: string;
  transformerId: string;
  riskScore: number;
  riskFlag: boolean;
  recentConsumption: number;
  medianConsumption: number;
  dropPercent: number;
  calculatedBill: number;
  lastBill: number;
  billHistory: Bill[];
  assignedAgent?: string;
  agentVerdict?: FraudVerdict;
  agentNote?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole;
  action: string;
  target: string;
  detail: string;
}

// Découpage géographique simplifié mais fidèle à la silhouette et aux dix régions du Cameroun.
export const regions: Region[] = [
  { id: 'extreme-nord', name: 'Extrême-Nord', capital: 'Maroua', mapPath: 'M260 20 L335 35 L365 105 L340 150 L275 140 L240 85 Z', centerX: 302, centerY: 85 },
  { id: 'nord', name: 'Nord', capital: 'Garoua', mapPath: 'M275 140 L340 150 L360 240 L330 300 L255 290 L240 210 Z', centerX: 302, centerY: 220 },
  { id: 'adamaoua', name: 'Adamaoua', capital: 'Ngaoundéré', mapPath: 'M255 290 L330 300 L400 340 L350 390 L245 380 L190 340 Z', centerX: 300, centerY: 340 },
  { id: 'est', name: 'Est', capital: 'Bertoua', mapPath: 'M400 340 L440 380 L425 540 L350 590 L330 500 L350 390 Z', centerX: 388, centerY: 455 },
  { id: 'centre', name: 'Centre', capital: 'Yaoundé', mapPath: 'M245 380 L350 390 L330 500 L245 510 L200 445 Z', centerX: 281, centerY: 445 },
  { id: 'sud', name: 'Sud', capital: 'Ebolowa', mapPath: 'M245 510 L330 500 L350 590 L280 650 L185 625 L180 555 Z', centerX: 263, centerY: 570 },
  { id: 'littoral', name: 'Littoral', capital: 'Douala', mapPath: 'M200 445 L245 510 L180 555 L145 505 L155 450 Z', centerX: 188, centerY: 495 },
  { id: 'ouest', name: 'Ouest', capital: 'Bafoussam', mapPath: 'M190 340 L245 380 L200 445 L155 450 L145 400 Z', centerX: 190, centerY: 400 },
  { id: 'nord-ouest', name: 'Nord-Ouest', capital: 'Bamenda', mapPath: 'M190 340 L145 400 L110 360 L130 300 Z', centerX: 145, centerY: 350 },
  { id: 'sud-ouest', name: 'Sud-Ouest', capital: 'Buéa', mapPath: 'M145 400 L155 450 L145 505 L100 480 L105 400 L110 360 Z', centerX: 125, centerY: 435 },
];

type CityZoneSpec = [string, ZoneStatus, string[]];

const cityZoneSets: Array<{ regionId: string; city: string; zones: CityZoneSpec[] }> = [
  { regionId: 'centre', city: 'Yaoundé', zones: [
    ['Nlongkak', 'danger', ['Bastos', 'Etoudi', 'Djoungolo', 'Centre-ville']],
    ['Tsinga', 'normal', ['Tsinga', 'Cité Verte', 'Madagascar', 'Mokolo']],
    ['Nkolbisson', 'watch', ['Nkolbisson', 'Oyom-Abang', 'Etetak', 'Minkoameyos']],
    ['Efoulan', 'danger', ['Efoulan', 'Ngoa-Ekélé', 'Melen', 'Obili']],
    ['Kondengui', 'watch', ['Kondengui', 'Ekounou', 'Mvan', 'Mimboman']],
    ['Essos', 'danger', ['Essos', 'Ngousso', 'Mvog-Ada', 'Nkolmesseng']],
    ['Biyem-Assi', 'normal', ['Biyem-Assi', 'Etoug-Ebe', 'Mendong', 'Simbock']],
  ]},
  { regionId: 'littoral', city: 'Douala', zones: [
    ['Akwa', 'danger', ['Akwa I', 'Akwa II', 'Bali', 'Bonadibong']],
    ['Bonanjo', 'normal', ['Bonanjo', 'Bonapriso', 'Joss', 'Youpwé']],
    ['Deido', 'watch', ['Deido', 'Bonatéki', 'Bonamouti', 'Bessengué']],
    ['New Bell', 'danger', ['New Bell', 'Nkololoun', 'Ngangue', 'Nkoulouloun']],
    ['Bonamoussadi', 'watch', ['Bonamoussadi', 'Kotto', 'Denver', 'Santa Barbara']],
    ['Bépanda', 'danger', ['Bépanda', 'Omnisports', 'Ndogbong', 'Cité SIC']],
    ['Makepe', 'normal', ['Makepe', 'Logpom', 'Logbessou', 'PK 12']],
  ]},
  { regionId: 'extreme-nord', city: 'Maroua', zones: [
    ['Domayo', 'danger', ['Domayo', 'Pitoaré', 'Baoliwol', 'Dougoï']],
    ['Doualaré', 'normal', ['Doualaré', 'Zokok', 'Kakataré', 'Djarengol']],
    ['Hardé', 'watch', ['Hardé', 'Kodek', 'Founangué', 'Palar']],
    ['Kongola', 'danger', ['Kongola', 'Meskine', 'Salak', 'Doursoungo']],
    ['Koutbao', 'watch', ['Koutbao', 'Ouro-Tchédé', 'Diguirwo', 'Mazangai']],
    ['Pont Vert', 'danger', ['Pont Vert', 'Lopéré', 'Frolinat', 'Djarma']],
    ['Missinguiléo', 'normal', ['Missinguiléo', 'Mayel-Ibbé', 'Douggoï', 'Kaliao']],
  ]},
  { regionId: 'nord', city: 'Garoua', zones: [
    ['Roumdé Adjia', 'danger', ['Roumdé Adjia', 'Poumpoumré', 'Foulbéré', 'Nassarao']],
    ['Laindé', 'normal', ['Laindé', 'Kolléré', 'Yelwa', 'Marouaré']],
    ['Djamboutou', 'watch', ['Djamboutou', 'Bibémiré', 'Bocklé', 'Djidoma']],
    ['Plateau', 'danger', ['Plateau', 'Centre-ville', 'Lido', 'Kanadi']],
    ['Takasko', 'watch', ['Takasko', 'Souari', 'Hosséré', 'Badjengo']],
    ['Bamiléké', 'danger', ['Bamiléké', 'Mairie', 'Camp Chinois', 'Lopéré']],
    ['Demsa', 'normal', ['Demsa', 'Pitoa', 'Ngong', 'Lagdo']],
  ]},
  { regionId: 'adamaoua', city: 'Ngaoundéré', zones: [
    ['Bamyanga', 'danger', ['Bamyanga', 'Joli-Soir', 'Mbideng', 'Gadamabanga']],
    ['Baladji', 'normal', ['Baladji', 'Burkina', 'Sabongari', 'Mardock']],
    ['Dang', 'watch', ['Dang', 'Université', 'Bini', 'Malang']],
    ['Mbam-Mboum', 'danger', ['Mbam-Mboum', 'Onaref', 'Norvégien', 'Gada-Mabanga']],
    ['Haoussa', 'watch', ['Haoussa', 'Centre commercial', 'Gare', 'Camp Foulbé']],
    ['Mabanga', 'danger', ['Mabanga', 'Beka', 'Ndelbé', 'Djarendi']],
    ['Tongo', 'normal', ['Tongo', 'Belel', 'Mbé', 'Ngan-Ha']],
  ]},
  { regionId: 'est', city: 'Bertoua', zones: [
    ['Tigaza', 'danger', ['Tigaza', 'Nkolbikon', 'Mokolo', 'Bodomo']],
    ['Enia', 'normal', ['Enia', 'Ekombitié', 'Bonis', 'Mokolo II']],
    ['Ndemnam', 'watch', ['Ndemnam', 'Yadémé', 'Mokolo IV', 'Tindamba']],
    ['Kano', 'danger', ['Kano', 'Ngaïkada', 'Mandjou', 'Koumé']],
    ['Radio', 'watch', ['Quartier Radio', 'Mokolo I', 'Haoussa', 'Camp SIC']],
    ['Nkolbikon', 'danger', ['Nkolbikon I', 'Nkolbikon II', 'Nkolbikon III', 'Gbaya']],
    ['Bonis', 'normal', ['Bonis', 'Kpawara', 'Dimako', 'Belabo']],
  ]},
  { regionId: 'sud', city: 'Ebolowa', zones: [
    ['Nko’ovos', 'danger', ['Nko’ovos', 'Angalé', 'Mekalat', 'New Bell']],
    ['Mekalat', 'normal', ['Mekalat', 'Bilone', 'Ebolowa-Si', 'Bilon']],
    ['Mvog-Betsi', 'watch', ['Mvog-Betsi', 'Ngalan', 'Nkoemvone', 'Mvam-Yetom']],
    ['Saint-Cloud', 'danger', ['Saint-Cloud', 'Elat', 'Nkoétyé', 'Essingang']],
    ['Ange-Raphaël', 'watch', ['Ange-Raphaël', 'Mongo-Nam', 'Nko’Essé', 'Azem']],
    ['Ngalane', 'danger', ['Ngalane', 'Nkoemvon', 'Minkok', 'Mebout']],
    ['Nkoemvone', 'normal', ['Nkoemvone', 'Mengong', 'Biwong', 'Mvangan']],
  ]},
  { regionId: 'ouest', city: 'Bafoussam', zones: [
    ['Banengo', 'danger', ['Banengo', 'Djeleng', 'Kamkop', 'Tougang']],
    ['Tamja', 'normal', ['Tamja', 'Tyo', 'Kena', 'Koptchou']],
    ['Djemoun', 'watch', ['Djemoun', 'Famla', 'Tchitchap', 'Ngouache']],
    ['Kouogouo', 'danger', ['Kouogouo', 'Ndiengdam', 'Mairie', 'Marché A']],
    ['Évêché', 'watch', ['Évêché', 'Kamdjou', 'Ndiangdam', 'Haoussa']],
    ['Tocket', 'danger', ['Tocket', 'Bamendzi', 'Métèo', 'Famleng']],
    ['Baleng', 'normal', ['Baleng', 'Bapi', 'Bandjoun', 'Bamougoum']],
  ]},
  { regionId: 'nord-ouest', city: 'Bamenda', zones: [
    ['Nkwen', 'danger', ['Nkwen', 'Mile 3', 'Mile 4', 'Foncha Street']],
    ['Mankon', 'normal', ['Mankon', 'Mile 2', 'Azire', 'Old Town']],
    ['Bamendakwe', 'watch', ['Bamendakwe', 'Up Station', 'Government Station', 'Mendankwe']],
    ['Commercial Avenue', 'danger', ['Commercial Avenue', 'City Chemist', 'Food Market', 'Hospital Roundabout']],
    ['Ntamulung', 'watch', ['Ntamulung', 'Mulang', 'Cow Street', 'Meta Quarter']],
    ['Bayelle', 'danger', ['Bayelle', 'Mile 6', 'Ntarinkon', 'Alabukam']],
    ['Bambili', 'normal', ['Bambili', 'Babanki', 'Bafut', 'Bali']],
  ]},
  { regionId: 'sud-ouest', city: 'Buéa', zones: [
    ['Molyko', 'danger', ['Molyko', 'Bonduma', 'Mile 17', 'Muea']],
    ['Bokwaongo', 'normal', ['Bokwaongo', 'Bokova', 'Bova', 'Bonakanda']],
    ['Great Soppo', 'watch', ['Great Soppo', 'Small Soppo', 'Wotutu', 'Likoko']],
    ['Clerks Quarters', 'danger', ['Clerks Quarters', 'Federal Quarters', 'GRA', 'Bongo Square']],
    ['Sandpit', 'watch', ['Sandpit', 'Mile 16', 'Bolifamba', 'Dibanda']],
    ['Muea', 'danger', ['Muea', 'Bomaka', 'Bwitingi', 'Mile 18']],
    ['Tole', 'normal', ['Tole', 'Sasse', 'Wokaka', 'Upper Farms']],
  ]},
];

const statusColor: Record<ZoneStatus, string> = {
  danger: '#dc2626',
  watch: '#d97706',
  normal: '#16a34a',
};

export const zones: Zone[] = cityZoneSets.flatMap(citySet =>
  Array.from({ length: citySet.regionId === 'littoral' ? 200 : 150 }, (_, zoneIndex) => {
    const sourceZone = citySet.zones[zoneIndex % citySet.zones.length];
    const [baseName, baseStatus, neighborhoods] = sourceZone;
    // Les 200 zones de Douala sont des secteurs de démonstration, pas des limites cadastrales réelles.
    const name = citySet.regionId === 'littoral'
      ? `${baseName} — Secteur ${String(zoneIndex + 1).padStart(3, '0')}`
      : `Zone ${baseName} ${String(zoneIndex + 1).padStart(3, '0')}`;
    const status: ZoneStatus = citySet.regionId === 'littoral'
      ? (zoneIndex % 10 === 0 || zoneIndex % 10 === 3 ? 'danger' : zoneIndex % 10 === 1 || zoneIndex % 10 === 4 || zoneIndex % 10 === 7 ? 'watch' : 'normal')
      : baseStatus;
    const column = zoneIndex % 15;
    const row = Math.floor(zoneIndex / 15);
    const left = 30 + column * 49;
    const top = 30 + row * 54;
    const right = left + 47;
    const bottom = top + 52;

    return {
      id: `zone-${citySet.regionId}-${zoneIndex + 1}`,
      regionId: citySet.regionId,
      name,
      city: citySet.city,
      status,
      lossRate: status === 'danger' ? 31 + (zoneIndex % 9) * 1.2 : status === 'watch' ? 18 + (zoneIndex % 8) : 7 + (zoneIndex % 6),
      transformerCount: 1 + (zoneIndex % 4),
      clientCount: 50,
      mapX: left + 23.5,
      mapY: top + 26,
      mapPolygon: `${left},${top} ${right},${top} ${right},${bottom} ${left},${bottom}`,
      neighborhoods,
      color: statusColor[status],
    };
  }),
);

const firstNames = ['Alain', 'Brigitte', 'Christian', 'Diane', 'Emmanuel', 'Françoise', 'Gérard', 'Hélène', 'Ismaël', 'Josiane', 'Kevin', 'Larissa', 'Michel', 'Nadine', 'Olivier', 'Prisca', 'Roland', 'Solange', 'Thierry', 'Vanessa'];
const lastNames = ['Abanda', 'Biloa', 'Djoumessi', 'Etoa', 'Fomba', 'Kamga', 'Mballa', 'Nana', 'Ngono', 'Nkoulou', 'Tchana', 'Yinda'];
const agents = ['Oumar Faye', 'Awa Gueye', 'Seydou Traoré'];
const months = ['Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'];

export const clients: Client[] = zones.flatMap((zone, zoneIndex) =>
  Array.from({ length: 50 }, (_, clientIndex) => {
    const serial = zoneIndex * 50 + clientIndex + 1;
    const riskFlag = zone.status === 'danger' ? clientIndex < 7 : zone.status === 'watch' ? clientIndex < 3 : false;
    const medianConsumption = 145 + ((serial * 19) % 380);
    const dropPercent = riskFlag ? 48 + ((serial * 7) % 40) : 3 + (serial % 12);
    const recentConsumption = Math.round(medianConsumption * (1 - dropPercent / 100));
    const calculatedBill = medianConsumption * 285;
    const lastBill = recentConsumption * 285;
    const assignedAgent = riskFlag && clientIndex === 0 ? agents[zoneIndex % agents.length] : undefined;
    const verdict: FraudVerdict = serial % 11 === 0 ? 'fraud' : serial % 13 === 0 ? 'no_fraud' : 'pending';

    return {
      id: `CM-${String(serial).padStart(5, '0')}`,
      name: `${firstNames[clientIndex % firstNames.length]} ${lastNames[(zoneIndex + clientIndex) % lastNames.length]}`,
      address: `${12 + clientIndex}, ${zone.neighborhoods[clientIndex % zone.neighborhoods.length]}, ${zone.city}`,
      phone: `+237 6 ${String(50 + (serial % 49)).padStart(2, '0')} ${String(10 + (serial * 3) % 89).padStart(2, '0')} ${String(10 + (serial * 7) % 89).padStart(2, '0')}`,
      zoneId: zone.id,
      category: clientIndex % 5 === 0 ? 'Commerce' : 'Résidentiel',
      transformerId: `TR-${String(zoneIndex + 1).padStart(3, '0')}`,
      riskScore: riskFlag ? 62 + ((serial * 5) % 37) : 8 + (serial % 30),
      riskFlag,
      recentConsumption,
      medianConsumption,
      dropPercent,
      calculatedBill,
      lastBill,
      assignedAgent,
      agentVerdict: riskFlag ? verdict : undefined,
      agentNote: verdict === 'fraud' ? 'Anomalie de branchement constatée sur le compteur.' : undefined,
      billHistory: months.map((month, monthIndex) => {
        const isRecent = monthIndex >= 7;
        const kwh = isRecent ? recentConsumption + (8 - monthIndex) * 12 : medianConsumption + ((monthIndex % 3) - 1) * 9;
        return { month, year: monthIndex < 2 ? 2025 : 2026, amount: kwh * 285, kwh };
      }),
    };
  }),
);

export const activityLogs: ActivityLog[] = [
  { id: 'ACT-001', timestamp: '2026-09-29T08:42:00', actor: 'Moussa Sarr', actorRole: 'supervisor', action: 'Zone consultée', target: 'Zone Mokolo, Yaoundé', detail: 'Visualisation de la carte et des clients suspects.' },
  { id: 'ACT-002', timestamp: '2026-09-29T08:55:00', actor: 'Adja Sall', actorRole: 'admin', action: 'Client assigné', target: 'CM-00004 → Oumar Faye', detail: 'Assignation pour vérification terrain.' },
  { id: 'ACT-003', timestamp: '2026-09-29T09:10:00', actor: 'Oumar Faye', actorRole: 'agent', action: 'Verdict rendu', target: 'CM-00011', detail: 'Fraude confirmée. Compteur bypassé.' },
  { id: 'ACT-004', timestamp: '2026-09-28T14:30:00', actor: 'Moussa Sarr', actorRole: 'supervisor', action: 'Profil client consulté', target: 'CM-00149', detail: 'Comparaison des factures et de l’historique.' },
  { id: 'ACT-005', timestamp: '2026-09-28T11:00:00', actor: 'Adja Sall', actorRole: 'admin', action: 'Client assigné', target: 'CM-00201 → Awa Gueye', detail: 'Assignation pour vérification terrain.' },
];

export const kpis = {
  totalTransformers: zones.reduce((sum, zone) => sum + zone.transformerCount, 0),
  dangerZones: zones.filter(zone => zone.status === 'danger').length,
  watchZones: zones.filter(zone => zone.status === 'watch').length,
  totalClients: clients.length,
  highRiskClients: clients.filter(client => client.riskFlag).length,
  inspectionsThisMonth: clients.filter(client => client.agentVerdict && client.agentVerdict !== 'pending').length,
  fraudConfirmed: clients.filter(client => client.agentVerdict === 'fraud').length,
  verdictPending: clients.filter(client => client.riskFlag && client.agentVerdict === 'pending').length,
};
