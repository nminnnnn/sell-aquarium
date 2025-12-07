export const STORE_DETAILS = {
  name: 'Charan Aquarium',
  address: 'VKU',
  phone: '0775777287',
  social: {
    youtube: '#',
    instagram: '#',
    facebook: '#'
  }
};

export const CATEGORIES = [
  'Freshwater', 
  'Marine',
  'Exotic',
  'Tanks', 
  'Food', 
  'Accessories'
];

// Seed data for initial load with realistic Indian market prices & varieties
export const INITIAL_PRODUCTS = [
  {
    id: '101',
    name: 'Super Red Arowana',
    scientificName: 'Scleropages formosus',
    category: 'Exotic',
    price: 45000,
    offerPrice: 38000,
    stock: 2,
    origin: 'Indonesia (Certificate Included)',
    description: 'Premium quality Super Red Arowana, 6 inches. Chip certified. The ultimate status symbol for your tank.',
    image: 'https://images.unsplash.com/photo-1629802497643-4dc392473456?q=80&w=800&auto=format&fit=crop',
    isNew: true
  },
  {
    id: '102',
    name: 'Ocellaris Clownfish (Pair)',
    scientificName: 'Amphiprion ocellaris',
    category: 'Marine',
    price: 1800,
    offerPrice: 1500,
    stock: 12,
    origin: 'Captive Bred',
    description: 'Hardy and vibrant Nemo clownfish pair. Perfect for beginner saltwater setups.',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '103',
    name: 'Flowerhorn Magma',
    scientificName: 'Hua Luo Han',
    category: 'Exotic',
    price: 8500,
    offerPrice: 6200,
    stock: 5,
    origin: 'Thailand Import',
    description: 'High quality Flowerhorn with massive kok (head hump) and vibrant pearl markings.',
    image: 'https://images.unsplash.com/photo-1534575180408-f7e7da6b51c4?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '104',
    name: 'Discus Turquoise Blue',
    scientificName: 'Symphysodon',
    category: 'Exotic',
    price: 2500,
    stock: 15,
    origin: 'Malaysia',
    description: '3-inch size. Stunning electric blue patterns. Requires soft, warm water.',
    image: 'https://images.unsplash.com/photo-1525697426162-4b2a8a815777?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '105',
    name: 'Neon Tetra School (10 Pcs)',
    scientificName: 'Paracheirodon innesi',
    category: 'Freshwater',
    price: 600,
    offerPrice: 450,
    stock: 50,
    origin: 'Local Breed',
    description: 'Classic peaceful community fish. Adds a neon glow to planted tanks.',
    image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '106',
    name: 'Blue Tang (Dory)',
    scientificName: 'Paracanthurus hepatus',
    category: 'Marine',
    price: 3500,
    offerPrice: 3200,
    stock: 6,
    origin: 'Indo-Pacific',
    description: 'Vibrant blue surgeonfish. Requires a tank of at least 4 feet.',
    image: 'https://images.unsplash.com/photo-1585848888062-a50d4f3b8909?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '107',
    name: 'Opti-Clear Nature Tank',
    category: 'Tanks',
    price: 4500,
    offerPrice: 3999,
    stock: 8,
    origin: 'India',
    description: '60x30x30cm Crystal Clear Glass (Extra Clear). Invisible silicone seams.',
    image: 'https://images.unsplash.com/photo-1517316744-88aa34208226?q=80&w=800&auto=format&fit=crop',
    isNew: true
  },
  {
    id: '108',
    name: 'Hikari Gold Pellets (250g)',
    category: 'Food',
    price: 850,
    stock: 30,
    origin: 'Japan',
    description: 'Daily diet for Cichlids and larger tropical fish to enhance color.',
    image: 'https://images.unsplash.com/photo-1627916606992-7f2e143b81eb?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '109',
    name: 'Full Spectrum LED Light',
    category: 'Accessories',
    price: 2200,
    offerPrice: 1800,
    stock: 20,
    origin: 'China',
    description: 'WRGB Light suitable for high-tech planted tanks. App controllable.',
    image: 'https://images.unsplash.com/photo-1629802498263-2284dc862083?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '110',
    name: 'Betta Halfmoon',
    scientificName: 'Betta splendens',
    category: 'Freshwater',
    price: 450,
    stock: 25,
    origin: 'Thailand',
    description: 'Show quality Halfmoon Betta with 180-degree tail spread.',
    image: 'https://images.unsplash.com/photo-1520188746-88096f9277d6?q=80&w=800&auto=format&fit=crop'
  }
];