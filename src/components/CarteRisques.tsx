
import { MapContainer, TileLayer, Circle, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./CarteRisques.css";

type Zone = {
  id: number;
  nom: string;
  latitude: number;
  longitude: number;
  niveau: "normal" | "surveillance" | "prioritaire";
  description: string;
};

const zonesDemo: Zone[] = [
  {
    id: 1,
    nom: "Zone de démonstration A",
    latitude: 4.0511,
    longitude: 9.7679,
    niveau: "normal",
    description: "Exemple provisoire — risque non évalué."
  },
  {
    id: 2,
    nom: "Zone de démonstration B",
    latitude: 4.0605,
    longitude: 9.7500,
    niveau: "surveillance",
    description: "Exemple provisoire — vérification nécessaire."
  },
  {
    id: 3,
    nom: "Zone de démonstration C",
    latitude: 4.0350,
    longitude: 9.7900,
    niveau: "prioritaire",
    description: "Exemple provisoire — contrôle prioritaire."
  }
];

const couleurs = {
  normal: "#22c55e",
  surveillance: "#f59e0b",
  prioritaire: "#ef4444"
};

export default function CarteRisques() {
  return (
    <section className="carte-risques">
      <div className="carte-entete">
        <div>
          <h2>Zones à risque</h2>
          <p>Douala, Cameroun</p>
        </div>
        <span className="carte-demo">Données de démonstration</span>
      </div>

      <MapContainer
        center={[4.0511, 9.7679]}
        zoom={12}
        scrollWheelZoom
        className="carte-interactive"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {zonesDemo.map((zone) => (
          <Circle
            key={zone.id}
            center={[zone.latitude, zone.longitude]}
            radius={500}
            pathOptions={{
              color: couleurs[zone.niveau],
              fillColor: couleurs[zone.niveau],
              fillOpacity: 0.30,
              weight: 2
            }}
          >
            <Popup>
              <strong>{zone.nom}</strong>
              <br />
              Niveau : {zone.niveau}
              <br />
              {zone.description}
            </Popup>
          </Circle>
        ))}
      </MapContainer>

      <div className="carte-legende">
        <span><i className="point vert" /> Normal</span>
        <span><i className="point orange" /> À surveiller</span>
        <span><i className="point rouge" /> Prioritaire</span>
      </div>

      <p className="carte-note">
        Les cercles sont fictifs et servent uniquement à tester
        l'affichage. Ils ne représentent pas les limites réelles
        des quartiers ni des risques confirmés.
      </p>
    </section>
  );
}
