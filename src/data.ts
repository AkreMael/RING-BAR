import { Salon, Drink } from './types';

export const SALONS: Salon[] = [
  {
    id: 1,
    name: 'Salon 1',
    location: "À l'entrée du bar",
    capacity: '4 à 6 personnes',
    description: 'Emplacement animé dès l\'accueil. Idéal pour être immédiatement plongé dans l\'ambiance de la soirée.',
    priceMin: 65000,
    color: '#3B82F6', // Blue
  },
  {
    id: 2,
    name: 'Salon 2',
    location: 'Proche de la cabine du DJ',
    capacity: '6 à 8 personnes',
    description: 'Idéal pour les amateurs de musique qui souhaitent être au plus près des vibes et des rythmes du DJ.',
    priceMin: 100000,
    color: '#8B5CF6', // Purple
  },
  {
    id: 3,
    name: 'Salon 3',
    location: 'Zone centrale',
    capacity: '6 à 8 personnes',
    description: 'Une vue d\'ensemble spectaculaire sur tout le bar, parfait pour ne rien rater des festivités.',
    priceMin: 100000,
    color: '#EC4899', // Pink
  },
  {
    id: 4,
    name: 'Salon 4 - VIP',
    location: 'En face du miroir',
    capacity: '8 à 10 personnes',
    description: 'Notre salon le plus prestigieux, en face du grand miroir illuminé, offrant un cadre feutré ultra-premium.',
    priceMin: 200000,
    color: '#F59E0B', // Amber/Gold
  },
  {
    id: 5,
    name: 'Salon 5',
    location: 'Près de la piste de danse',
    capacity: '4 à 6 personnes',
    description: 'Accès direct et privilégié à la piste de danse. Conçu pour ceux qui comptent danser toute la nuit !',
    priceMin: 80000,
    color: '#10B981', // Emerald
  },
  {
    id: 6,
    name: 'Salon 6',
    location: 'Zone feutrée',
    capacity: '4 à 6 personnes',
    description: 'Ambiance intime et chaleureuse, légèrement en retrait pour favoriser des moments d\'échange.',
    priceMin: 65000,
    color: '#6B7280', // Gray
  },
  {
    id: 7,
    name: 'Dernier salon',
    location: 'À côté du comptoir',
    capacity: '4 à 6 personnes',
    description: 'À proximité immédiate du comptoir principal pour un accès ultra-rapide aux barmans.',
    priceMin: 65000,
    color: '#EF4444', // Red
  },
];

export const DRINKS: Drink[] = [
  // Champagnes & Vin Mousseux
  {
    id: 'c1',
    name: 'Moët & Chandon Nectar Impérial Rosé',
    category: 'Champagne',
    price: 95000,
    description: 'Un assemblage audacieux, riche et fruité, le plus extravagant des nectars rosés de la Maison Moët & Chandon.',
    image: 'https://i.supaimg.com/0543a7e5-673b-44b9-9668-8152c5aea01b/f4ebc455-5581-4ab1-a029-328ba0ba3f08.jpg',
  },
  {
    id: 'c2',
    name: 'Moët & Chandon Nectar Impérial',
    category: 'Champagne',
    price: 90000,
    description: 'Un assemblage exotique, riche et demi-sec, parfait pour illuminer vos célébrations les plus élégantes.',
    image: 'https://i.supaimg.com/0543a7e5-673b-44b9-9668-8152c5aea01b/e9953eb3-fb43-452d-ad81-89a0c828f512.jpg',
  },
  {
    id: 'c3',
    name: 'Moët & Chandon Brut Impérial',
    category: 'Champagne',
    price: 80000,
    description: 'Le champagne emblématique et incontournable de la Maison Moët & Chandon, vibrant et généreux depuis 1869.',
    image: 'https://i.supaimg.com/0543a7e5-673b-44b9-9668-8152c5aea01b/b842446d-6e03-4f77-a66c-a55d1b4e2ee8.jpg',
  },
  {
    id: 'c4',
    name: 'J.P. CHENET Ice Edition',
    category: 'Champagne',
    price: 35000,
    description: 'Vin mousseux blanc demi-sec frais et fruité, spécialement conçu pour être dégusté sur glace.',
    image: 'https://i.supaimg.com/0543a7e5-673b-44b9-9668-8152c5aea01b/77f4a059-6acd-45b0-b02c-09f252b67fee.jpg',
  },
  {
    id: 'c5',
    name: 'Roche Mazet Syrah Brut-Rosé',
    category: 'Champagne',
    price: 30000,
    description: 'Pétillant rosé frais et fruité Pays d\'Oc, idéal à savourer bien frais avec quelques fruits rouges pour un apéritif parfait.',
    image: 'https://i.supaimg.com/0543a7e5-673b-44b9-9668-8152c5aea01b/40c0bed6-e272-4a6f-b5eb-efcb7ca30d89.jpg',
  },

  // Vin
  {
    id: 'v1',
    name: 'Casillero del Diablo Carmenere',
    category: 'Vin',
    price: 25000,
    description: 'Vin rouge chilien de cépage Carmenere de la maison Concha y Toro, millésime 2018 Reserva aux notes épicées et fruitées.',
    image: 'https://i.supaimg.com/0543a7e5-673b-44b9-9668-8152c5aea01b/bd82e2a6-73ce-4fbc-95aa-495b1e57f0e4.jpg',
  },

  // Whiskies
  {
    id: 'w1',
    name: 'Johnnie Walker Black Label',
    category: 'Whisky',
    price: 75000,
    description: 'Un chef-d\'œuvre d\'assemblage de whiskies vieillis au moins 12 ans, dévoilant des notes riches de fruits noirs, de vanille et de fumée.',
    image: 'https://i.supaimg.com/0543a7e5-673b-44b9-9668-8152c5aea01b/bca25e8d-f23d-4c34-b25e-c3dd49e8ada9.jpg',
  },
  {
    id: 'w2',
    name: 'Chivas Regal 12 Ans',
    category: 'Whisky',
    price: 65000,
    description: 'Un blend écossais prestigieux, rond et généreux, mariant subtilement les meilleurs whiskies de malt et de grain.',
    image: 'https://i.supaimg.com/0543a7e5-673b-44b9-9668-8152c5aea01b/aec67786-f118-4a09-96d7-3430a3ac4a57.jpg',
  },
  {
    id: 'w3',
    name: 'Jack Daniel\'s Tennessee Whiskey No. 7',
    category: 'Whisky',
    price: 50000,
    description: 'Le mythique whiskey filtré goutte à goutte sur du charbon de bois d\'érable pour une douceur boisée incomparable.',
    image: 'https://i.supaimg.com/0543a7e5-673b-44b9-9668-8152c5aea01b/b2683e81-0b1f-450f-8f05-1d53bbbfda33.jpg',
  },
  {
    id: 'w4',
    name: 'Johnnie Walker Red Label',
    category: 'Whisky',
    price: 45000,
    description: 'Le pionnier de la gamme, réputé mondialement pour son caractère vif, épicé et délicatement fumé.',
    image: 'https://i.supaimg.com/0543a7e5-673b-44b9-9668-8152c5aea01b/e192edc6-d0f9-4ae5-b822-b028876385b4.jpg',
  },
  {
    id: 'w5',
    name: 'Ballantine\'s Finest Blended Scotch',
    category: 'Whisky',
    price: 40000,
    description: 'Un blend écossais parfaitement équilibré, riche, doux et subtil, plébiscité à travers le monde.',
    image: 'https://i.supaimg.com/0543a7e5-673b-44b9-9668-8152c5aea01b/b22e7ed3-a6d8-4cb2-8e2a-557639ead220.jpg',
  },
  {
    id: 'w6',
    name: 'J&B Rare Blended Scotch',
    category: 'Whisky',
    price: 35000,
    description: 'Le célèbre whisky écossais né à Londres, assemblage subtil et très équilibré de 42 whiskies de malt et de grain.',
    image: 'https://i.supaimg.com/0543a7e5-673b-44b9-9668-8152c5aea01b/b8ed9975-04f4-4b1d-908b-920687971bf6.jpg',
  },
  {
    id: 'w7',
    name: '8 PM Grain Blended Whisky',
    category: 'Whisky',
    price: 25000,
    description: 'Whisky d\'assemblage de grains fins et maltés raffinés, favori des moments de dégustation conviviaux de premier choix.',
    image: 'https://i.supaimg.com/0543a7e5-673b-44b9-9668-8152c5aea01b/650d0d92-5b73-43b3-9b6f-6966d22b3e13.jpg',
  },

  // Cognacs
  {
    id: 'cg1',
    name: 'Martell Cordon Bleu Extra Old',
    category: 'Cognac',
    price: 150000,
    description: 'Le cognac d\'exception des fins connaisseurs, un assemblage unique d\'eaux-de-vie prestigieuses des Borderies.',
    image: 'https://i.supaimg.com/0543a7e5-673b-44b9-9668-8152c5aea01b/08ee5873-8b26-413c-98ca-b69223064527.jpg',
  },
  {
    id: 'cg2',
    name: 'Hennessy Very Special',
    category: 'Cognac',
    price: 60000,
    description: 'Un cognac légendaire aux arômes intenses et boisés de chêne et de noisette grillée, le plus célèbre au monde.',
    image: 'https://i.supaimg.com/0543a7e5-673b-44b9-9668-8152c5aea01b/39f2a4a0-4f37-475b-a6c6-bf9497c323eb.jpg',
  },

  // Liqueur & Vermouth
  {
    id: 'l1',
    name: 'Baileys The Original Irish Cream',
    category: 'Liqueur',
    price: 30000,
    description: 'L\'inimitable liqueur de crème irlandaise onctueuse aux notes subtiles de cacao et de vanille naturelle.',
    image: 'https://i.supaimg.com/0543a7e5-673b-44b9-9668-8152c5aea01b/a3dc129a-5ee4-48fd-b2d6-4024ef1e002a.jpg',
  },
  {
    id: 'l2',
    name: 'Martini Vermouth (Rosato / Bianco / Rosso)',
    category: 'Liqueur',
    price: 25000,
    description: 'Célèbre vermouth italien infusé aux herbes aromatiques, parfait pour vos apéritifs raffinés sur glace.',
    image: 'https://i.supaimg.com/0543a7e5-673b-44b9-9668-8152c5aea01b/8c6bea7b-b9cd-46e1-ac2a-5ae114d771cf.jpg',
  },
];
