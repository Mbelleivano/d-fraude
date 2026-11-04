# SOCADEL Watch — carte de Douala (démo)

## Changements préparés
- La vue superviseur s'ouvre sur Douala (Littoral).
- La carte utilise OpenStreetMap avec React Leaflet.
- Les fiches des zones sont placées sous la carte.
- Chaque zone de démonstration a 50 clients fictifs.
- Si `public/data/douala-zones.geojson` existe, la carte charge ses polygones et tente d'associer les quartiers aux zones de démonstration par leur nom.
- Sans GeoJSON, la carte affiche des points de démonstration (et l'interface le signale). Ces points ne sont pas des limites géographiques réelles.

## 1. Installer les dépendances
À la racine du projet, dans le terminal :

```bash
npm install
```

Les dépendances Leaflet/React Leaflet ont été ajoutées à `package.json`. Cette commande met également à jour le fichier de verrouillage selon votre gestionnaire npm.

## 2. Ajouter les contours des quartiers
Créer le dossier `public/data`.

### Option A — Overture Maps Explorer
1. Ouvrir https://explore.overturemaps.org/
2. Rechercher Douala, Cameroon.
3. Dans les couches, activer Divisions / division areas et garder seulement les couches nécessaires.
4. Zoomer sur Douala et cliquer sur « Download Visible ».
5. Vérifier que le fichier téléchargé est un GeoJSON `FeatureCollection` contenant des géométries Polygon ou MultiPolygon et des noms de quartiers.
6. Copier le fichier dans `public/data/douala-zones.geojson`.

La disponibilité des limites de quartiers dépend de la couverture de la source. Le fichier peut contenir des limites administratives plus larges que les quartiers : vérifier le contenu avant de l'utiliser.

### Option B — outil en ligne de commande
Avec Python installé :

```bash
py -m pip install overturemaps
overturemaps download --bbox=9.60,3.95,9.90,4.15 -f geojson --type=division_area -o douala-zones.geojson
```

Puis examiner le GeoJSON et copier le fichier dans `public/data/douala-zones.geojson`. Le téléchargement peut contenir des divisions autres que les quartiers; il faut vérifier les propriétés et filtrer les features inutiles si nécessaire.

## 3. Lancer le projet

```bash
npm run dev
```

## Important
Les pertes, couleurs de risque et clients sont générés pour une démonstration. Les zones actuelles de `mockData.ts` sont des zones d'application fictives basées sur une liste de quartiers, et non une délimitation officielle de Douala. Les polygones géographiques ne sont associés à une zone d'application que lorsqu'un nom correspond. Les quartiers sans correspondance affichent un avertissement au clic; il faudra ensuite compléter une table de correspondance explicite.

Fond cartographique : © OpenStreetMap contributors. Les données Overture/OpenStreetMap doivent être utilisées conformément à leurs licences et attributions.

## Fiches de zones (mise à jour)

Les fiches sous la carte reprennent maintenant le style de la référence fournie : code de zone, icône éclair colorée selon le risque, nom de zone, nombre de clients et de suspects, puis pourcentage de pertes. Cliquer sur une fiche ouvre la liste des clients de la zone. Les valeurs de risque et les clients sont des données fictives de démonstration.
