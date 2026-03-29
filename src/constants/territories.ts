import { TerritoryDefinition, ContinentBonus, ContinentId } from '@/types';

// Simplified world map territories
export const TERRITORIES: TerritoryDefinition[] = [
  // ===== EUROPE (8 territories) =====
  { id: 'france', name: 'France', continent: 'europe', requiredPower: 100, bonus: { type: 'production_multiplier', targetTier: 'infantry', value: 0.05 }, position: { x: 0.47, y: 0.28 } },
  { id: 'germany', name: 'Allemagne', continent: 'europe', requiredPower: 150, bonus: { type: 'production_multiplier', targetTier: 'vehicles', value: 0.05 }, position: { x: 0.50, y: 0.25 } },
  { id: 'uk', name: 'Royaume-Uni', continent: 'europe', requiredPower: 200, bonus: { type: 'gold_per_sec', value: 50 }, position: { x: 0.45, y: 0.22 } },
  { id: 'spain', name: 'Espagne', continent: 'europe', requiredPower: 120, bonus: { type: 'tap_multiplier', value: 0.1 }, position: { x: 0.45, y: 0.33 } },
  { id: 'italy', name: 'Italie', continent: 'europe', requiredPower: 130, bonus: { type: 'gold_per_sec', value: 30 }, position: { x: 0.51, y: 0.32 } },
  { id: 'poland', name: 'Pologne', continent: 'europe', requiredPower: 180, bonus: { type: 'cost_reduction', value: 0.02 }, position: { x: 0.53, y: 0.24 } },
  { id: 'sweden', name: 'Suède', continent: 'europe', requiredPower: 250, bonus: { type: 'production_multiplier', targetTier: 'aviation', value: 0.03 }, position: { x: 0.52, y: 0.17 } },
  { id: 'russia_eu', name: 'Russie (EU)', continent: 'europe', requiredPower: 500, bonus: { type: 'production_multiplier', value: 0.08 }, position: { x: 0.60, y: 0.20 } },

  // ===== ASIA (10 territories) =====
  { id: 'china', name: 'Chine', continent: 'asia', requiredPower: 1_000, bonus: { type: 'production_multiplier', value: 0.10 }, position: { x: 0.75, y: 0.35 } },
  { id: 'japan', name: 'Japon', continent: 'asia', requiredPower: 800, bonus: { type: 'production_multiplier', targetTier: 'naval', value: 0.08 }, position: { x: 0.85, y: 0.32 } },
  { id: 'india', name: 'Inde', continent: 'asia', requiredPower: 700, bonus: { type: 'gold_per_sec', value: 500 }, position: { x: 0.70, y: 0.42 } },
  { id: 'korea', name: 'Corée', continent: 'asia', requiredPower: 600, bonus: { type: 'tap_multiplier', value: 0.15 }, position: { x: 0.82, y: 0.33 } },
  { id: 'vietnam', name: 'Vietnam', continent: 'asia', requiredPower: 400, bonus: { type: 'production_multiplier', targetTier: 'infantry', value: 0.07 }, position: { x: 0.78, y: 0.42 } },
  { id: 'thailand', name: 'Thaïlande', continent: 'asia', requiredPower: 350, bonus: { type: 'gold_per_sec', value: 200 }, position: { x: 0.76, y: 0.44 } },
  { id: 'russia_asia', name: 'Russie (Asie)', continent: 'asia', requiredPower: 2_000, bonus: { type: 'production_multiplier', value: 0.12 }, position: { x: 0.72, y: 0.18 } },
  { id: 'saudi', name: 'Arabie Saoudite', continent: 'asia', requiredPower: 900, bonus: { type: 'production_multiplier', targetTier: 'vehicles', value: 0.10 }, position: { x: 0.60, y: 0.40 } },
  { id: 'turkey', name: 'Turquie', continent: 'asia', requiredPower: 550, bonus: { type: 'cost_reduction', value: 0.04 }, position: { x: 0.57, y: 0.32 } },
  { id: 'iran', name: 'Iran', continent: 'asia', requiredPower: 750, bonus: { type: 'gold_per_sec', value: 400 }, position: { x: 0.62, y: 0.36 } },

  // ===== AFRICA (9 territories) =====
  { id: 'egypt', name: 'Égypte', continent: 'africa', requiredPower: 300, bonus: { type: 'gold_per_sec', value: 100 }, position: { x: 0.55, y: 0.40 } },
  { id: 'nigeria', name: 'Nigeria', continent: 'africa', requiredPower: 250, bonus: { type: 'production_multiplier', value: 0.04 }, position: { x: 0.48, y: 0.50 } },
  { id: 'south_africa', name: 'Afrique du Sud', continent: 'africa', requiredPower: 400, bonus: { type: 'gold_per_sec', value: 200 }, position: { x: 0.53, y: 0.65 } },
  { id: 'ethiopia', name: 'Éthiopie', continent: 'africa', requiredPower: 200, bonus: { type: 'production_multiplier', targetTier: 'infantry', value: 0.04 }, position: { x: 0.57, y: 0.48 } },
  { id: 'kenya', name: 'Kenya', continent: 'africa', requiredPower: 220, bonus: { type: 'tap_multiplier', value: 0.08 }, position: { x: 0.58, y: 0.52 } },
  { id: 'morocco', name: 'Maroc', continent: 'africa', requiredPower: 180, bonus: { type: 'cost_reduction', value: 0.03 }, position: { x: 0.43, y: 0.37 } },
  { id: 'congo', name: 'Congo', continent: 'africa', requiredPower: 280, bonus: { type: 'production_multiplier', value: 0.05 }, position: { x: 0.53, y: 0.53 } },
  { id: 'algeria', name: 'Algérie', continent: 'africa', requiredPower: 350, bonus: { type: 'gold_per_sec', value: 150 }, position: { x: 0.47, y: 0.38 } },
  { id: 'libya', name: 'Libye', continent: 'africa', requiredPower: 300, bonus: { type: 'production_multiplier', targetTier: 'vehicles', value: 0.04 }, position: { x: 0.52, y: 0.38 } },

  // ===== NORTH AMERICA (8 territories) =====
  { id: 'usa', name: 'États-Unis', continent: 'northAmerica', requiredPower: 5_000, bonus: { type: 'production_multiplier', value: 0.15 }, position: { x: 0.20, y: 0.32 } },
  { id: 'canada', name: 'Canada', continent: 'northAmerica', requiredPower: 3_000, bonus: { type: 'cost_reduction', value: 0.06 }, position: { x: 0.20, y: 0.20 } },
  { id: 'mexico', name: 'Mexique', continent: 'northAmerica', requiredPower: 1_500, bonus: { type: 'gold_per_sec', value: 1_000 }, position: { x: 0.15, y: 0.40 } },
  { id: 'cuba', name: 'Cuba', continent: 'northAmerica', requiredPower: 800, bonus: { type: 'tap_multiplier', value: 0.12 }, position: { x: 0.22, y: 0.42 } },
  { id: 'guatemala', name: 'Guatemala', continent: 'northAmerica', requiredPower: 600, bonus: { type: 'production_multiplier', targetTier: 'infantry', value: 0.06 }, position: { x: 0.16, y: 0.43 } },
  { id: 'honduras', name: 'Honduras', continent: 'northAmerica', requiredPower: 500, bonus: { type: 'gold_per_sec', value: 300 }, position: { x: 0.17, y: 0.44 } },
  { id: 'panama', name: 'Panama', continent: 'northAmerica', requiredPower: 700, bonus: { type: 'cost_reduction', value: 0.03 }, position: { x: 0.19, y: 0.46 } },
  { id: 'jamaica', name: 'Jamaïque', continent: 'northAmerica', requiredPower: 400, bonus: { type: 'tap_multiplier', value: 0.06 }, position: { x: 0.23, y: 0.43 } },

  // ===== SOUTH AMERICA (8 territories) =====
  { id: 'brazil', name: 'Brésil', continent: 'southAmerica', requiredPower: 2_000, bonus: { type: 'production_multiplier', value: 0.10 }, position: { x: 0.30, y: 0.55 } },
  { id: 'argentina', name: 'Argentine', continent: 'southAmerica', requiredPower: 1_500, bonus: { type: 'gold_per_sec', value: 800 }, position: { x: 0.27, y: 0.68 } },
  { id: 'colombia', name: 'Colombie', continent: 'southAmerica', requiredPower: 1_000, bonus: { type: 'production_multiplier', targetTier: 'vehicles', value: 0.07 }, position: { x: 0.24, y: 0.48 } },
  { id: 'chile', name: 'Chili', continent: 'southAmerica', requiredPower: 1_200, bonus: { type: 'cost_reduction', value: 0.05 }, position: { x: 0.25, y: 0.65 } },
  { id: 'peru', name: 'Pérou', continent: 'southAmerica', requiredPower: 900, bonus: { type: 'gold_per_sec', value: 500 }, position: { x: 0.23, y: 0.55 } },
  { id: 'venezuela', name: 'Venezuela', continent: 'southAmerica', requiredPower: 800, bonus: { type: 'tap_multiplier', value: 0.10 }, position: { x: 0.26, y: 0.47 } },
  { id: 'ecuador', name: 'Équateur', continent: 'southAmerica', requiredPower: 600, bonus: { type: 'production_multiplier', targetTier: 'infantry', value: 0.05 }, position: { x: 0.22, y: 0.51 } },
  { id: 'uruguay', name: 'Uruguay', continent: 'southAmerica', requiredPower: 700, bonus: { type: 'gold_per_sec', value: 400 }, position: { x: 0.29, y: 0.64 } },

  // ===== OCEANIA (7 territories) =====
  { id: 'australia', name: 'Australie', continent: 'oceania', requiredPower: 3_000, bonus: { type: 'production_multiplier', value: 0.12 }, position: { x: 0.83, y: 0.62 } },
  { id: 'new_zealand', name: 'Nouvelle-Zélande', continent: 'oceania', requiredPower: 1_500, bonus: { type: 'gold_per_sec', value: 700 }, position: { x: 0.92, y: 0.70 } },
  { id: 'indonesia', name: 'Indonésie', continent: 'oceania', requiredPower: 1_200, bonus: { type: 'production_multiplier', targetTier: 'naval', value: 0.08 }, position: { x: 0.80, y: 0.50 } },
  { id: 'philippines', name: 'Philippines', continent: 'oceania', requiredPower: 900, bonus: { type: 'tap_multiplier', value: 0.10 }, position: { x: 0.82, y: 0.43 } },
  { id: 'malaysia', name: 'Malaisie', continent: 'oceania', requiredPower: 800, bonus: { type: 'cost_reduction', value: 0.04 }, position: { x: 0.78, y: 0.48 } },
  { id: 'papua', name: 'Papouasie', continent: 'oceania', requiredPower: 600, bonus: { type: 'production_multiplier', value: 0.05 }, position: { x: 0.87, y: 0.52 } },
  { id: 'fiji', name: 'Fidji', continent: 'oceania', requiredPower: 400, bonus: { type: 'gold_per_sec', value: 300 }, position: { x: 0.95, y: 0.58 } },
];

export const CONTINENTS: ContinentBonus[] = [
  {
    id: 'europe',
    name: 'Europe',
    bonus: { type: 'production_multiplier', value: 0.25 },
    territories: TERRITORIES.filter((t) => t.continent === 'europe').map((t) => t.id),
  },
  {
    id: 'asia',
    name: 'Asie',
    bonus: { type: 'production_multiplier', value: 0.35 },
    territories: TERRITORIES.filter((t) => t.continent === 'asia').map((t) => t.id),
  },
  {
    id: 'africa',
    name: 'Afrique',
    bonus: { type: 'cost_reduction', value: 0.15 },
    territories: TERRITORIES.filter((t) => t.continent === 'africa').map((t) => t.id),
  },
  {
    id: 'northAmerica',
    name: 'Amérique du Nord',
    bonus: { type: 'production_multiplier', value: 0.30 },
    territories: TERRITORIES.filter((t) => t.continent === 'northAmerica').map((t) => t.id),
  },
  {
    id: 'southAmerica',
    name: 'Amérique du Sud',
    bonus: { type: 'gold_per_sec', value: 5_000 },
    territories: TERRITORIES.filter((t) => t.continent === 'southAmerica').map((t) => t.id),
  },
  {
    id: 'oceania',
    name: 'Océanie',
    bonus: { type: 'tap_multiplier', value: 0.50 },
    territories: TERRITORIES.filter((t) => t.continent === 'oceania').map((t) => t.id),
  },
];

export const TERRITORY_MAP = new Map(TERRITORIES.map((t) => [t.id, t]));
export const CONTINENT_MAP = new Map(CONTINENTS.map((c) => [c.id, c]));
