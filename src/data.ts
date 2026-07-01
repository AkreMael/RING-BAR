import { Salon, Drink } from './types';

export const SALONS: Salon[] = [
  {
    id: 1,
    name: 'Salon 1',
    location: "À l'entrée du bar",
    capacity: '4 à 6 personnes',
    description: 'Emplacement animé dès l\'entrée du bar. Idéal pour être au cœur de l\'ambiance d\'accueil.',
    priceMin: 100,
    color: '#3B82F6', // Blue
  },
  {
    id: 2,
    name: 'Salon 2',
    location: 'Proche de la cabine du DJ',
    capacity: '6 à 8 personnes',
    description: 'Idéal pour les amateurs de musique qui veulent être au plus près des vibes du DJ.',
    priceMin: 150,
    color: '#8B5CF6', // Purple
  },
  {
    id: 3,
    name: 'Salon 3',
    location: 'Zone centrale',
    capacity: '6 à 8 personnes',
    description: 'Une vue d\'ensemble sur tout le bar, parfait pour ne rien rater de la soirée.',
    priceMin: 150,
    color: '#EC4899', // Pink
  },
  {
    id: 4,
    name: 'Salon 4 - VIP',
    location: 'En face du miroir',
    capacity: '8 à 10 personnes',
    description: 'Notre salon le plus prestigieux en face du grand miroir illuminé. Service ultra-premium.',
    priceMin: 300,
    color: '#F59E0B', // Amber/Gold
  },
  {
    id: 5,
    name: 'Salon 5',
    location: 'Près de la piste de danse',
    capacity: '4 à 6 personnes',
    description: 'Accès direct à la piste de danse. Pour ceux qui comptent danser toute la nuit !',
    priceMin: 120,
    color: '#10B981', // Emerald
  },
  {
    id: 6,
    name: 'Salon 6',
    location: 'Zone feutrée',
    capacity: '4 à 6 personnes',
    description: 'Ambiance plus intime, légèrement en retrait pour favoriser les discussions.',
    priceMin: 100,
    color: '#6B7280', // Gray
  },
  {
    id: 7,
    name: 'Dernier salon',
    location: 'À côté du comptoir',
    capacity: '4 à 6 personnes',
    description: 'À côté du comptoir principal, accès ultra-rapide aux barmans et au service de bar.',
    priceMin: 100,
    color: '#EF4444', // Red
  },
];

export const DRINKS: Drink[] = [
  // Champagnes
  {
    id: 'c1',
    name: 'Dom Pérignon Luminous',
    category: 'Champagne',
    price: 350,
    description: 'La cuvée de prestige par excellence, bouteille lumineuse pour briller toute la nuit.',
    image: 'https://images.unsplash.com/photo-1594460528456-a3dec7245072?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'c2',
    name: 'Ruinart Blanc de Blancs',
    category: 'Champagne',
    price: 180,
    description: 'L\'emblème du goût Ruinart. Une grande fraîcheur aromatique.',
    image: 'https://images.unsplash.com/photo-1592751416801-4433d7b90250?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'c3',
    name: 'Moët & Chandon Imperial Brut',
    category: 'Champagne',
    price: 120,
    description: 'Un champagne vibrant et généreux, le classique incontournable des célébrations.',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=400',
  },

  // Whiskies
  {
    id: 'w1',
    name: 'Chivas Regal 18 Ans',
    category: 'Whisky',
    price: 160,
    description: 'Un blend d\'exception riche et multi-facettes aux arômes de fruits secs et de chocolat.',
    image: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'w2',
    name: 'Jack Daniel\'s Single Barrel',
    category: 'Whisky',
    price: 110,
    description: 'Sélectionné fût par fût par notre maître distillateur pour un goût unique et robuste.',
    image: 'https://images.unsplash.com/photo-1508253730747-e836c57f7830?auto=format&fit=crop&q=80&w=400',
  },

  // Cognacs
  {
    id: 'cg1',
    name: 'Hennessy VSOP Privilège',
    category: 'Cognac',
    price: 140,
    description: 'Un cognac d\'une harmonie parfaite, expression d\'un savoir-faire séculaire.',
    image: 'https://images.unsplash.com/photo-1569529465841-dfedd87500f3?auto=format&fit=crop&q=80&w=400',
  },

  // Cocktails
  {
    id: 'ck1',
    name: 'Ring Punch (Signature)',
    category: 'Cocktail',
    price: 15,
    description: 'Rhum premium, jus de fruits de la passion, citron vert, sirop de vanille maison et touche secrète.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'ck2',
    name: 'Golden Gloves (Signature)',
    category: 'Cocktail',
    price: 16,
    description: 'Bourbon haut de gamme, miel de fleurs, bière de gingembre fraîche et menthe froissée.',
    image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'ck3',
    name: 'Classic Mojito Royal',
    category: 'Cocktail',
    price: 14,
    description: 'Rhum blanc, menthe fraîche, citron vert, sucre de canne, surmonté de champagne brut.',
    image: 'https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&q=80&w=400',
  },

  // Softs
  {
    id: 's1',
    name: 'Red Bull Energy Drink',
    category: 'Soft',
    price: 8,
    description: 'Boisson énergisante pour rester actif jusqu\'au bout de la nuit.',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 's2',
    name: 'Coca-Cola Zéro / Original',
    category: 'Soft',
    price: 6,
    description: 'Servi bien frais avec une tranche de citron et des glaçons.',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 's3',
    name: 'Jus de Fruits Pressés',
    category: 'Soft',
    price: 6,
    description: 'Ananas, Orange ou Cranberry de qualité supérieure.',
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=400',
  },
];
