// Service to fetch champion data from Riot's Data Dragon API

const DATA_DRAGON_VERSION = '14.2.1';
const DATA_DRAGON_BASE = `https://ddragon.leagueoflegends.com/cdn/${DATA_DRAGON_VERSION}`;

export interface Champion {
  id: string;
  name: string;
  title: string;
  tags: string[]; // Fighter, Mage, Assassin, Tank, Support, Marksman
  image: string;
}

// Get all champions from Data Dragon
export async function getChampions(): Promise<Champion[]> {
  try {
    const res = await fetch(`${DATA_DRAGON_BASE}/data/en_US/champion.json`, {
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    
    if (!res.ok) {
      console.warn('Failed to fetch from Data Dragon, using fallback');
      return getFallbackChampions();
    }
    
    const data = await res.json();
    const champions: Champion[] = Object.values(data.data).map((champ: any) => ({
      id: champ.id,
      name: champ.name,
      title: champ.title,
      tags: champ.tags,
      image: `${DATA_DRAGON_BASE}/img/champion/${champ.image.full}`,
    }));
    
    return champions.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching champions:', error);
    return getFallbackChampions();
  }
}

// Get champion image URL
export function getChampionImage(championId: string): string {
  return `${DATA_DRAGON_BASE}/img/champion/${championId}.png`;
}

// Get champion splash art
export function getChampionSplash(championId: string, skinNum: number = 0): string {
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_${skinNum}.jpg`;
}

// Fallback champions if API fails
function getFallbackChampions(): Champion[] {
  const champions = [
    { id: 'Aatrox', name: 'Aatrox', title: 'the Darkin Blade', tags: ['Fighter', 'Tank'] },
    { id: 'Ahri', name: 'Ahri', title: 'the Nine-Tailed Fox', tags: ['Mage', 'Assassin'] },
    { id: 'Akali', name: 'Akali', title: 'the Rogue Assassin', tags: ['Assassin'] },
    { id: 'Azir', name: 'Azir', title: 'the Emperor of the Sands', tags: ['Mage', 'Marksman'] },
    { id: 'Caitlyn', name: 'Caitlyn', title: 'the Sheriff of Piltover', tags: ['Marksman'] },
    { id: 'Darius', name: 'Darius', title: 'the Hand of Noxus', tags: ['Fighter', 'Tank'] },
    { id: 'Ezreal', name: 'Ezreal', title: 'the Prodigal Explorer', tags: ['Marksman', 'Mage'] },
    { id: 'Fiora', name: 'Fiora', title: 'the Grand Duelist', tags: ['Fighter', 'Assassin'] },
    { id: 'Gnar', name: 'Gnar', title: 'the Missing Link', tags: ['Fighter', 'Tank'] },
    { id: 'Graves', name: 'Graves', title: 'the Outlaw', tags: ['Marksman'] },
    { id: 'Irelia', name: 'Irelia', title: 'the Blade Dancer', tags: ['Fighter', 'Assassin'] },
    { id: 'Jayce', name: 'Jayce', title: 'the Defender of Tomorrow', tags: ['Fighter', 'Marksman'] },
    { id: 'Jinx', name: 'Jinx', title: 'the Loose Cannon', tags: ['Marksman'] },
    { id: 'Kaisa', name: "Kai'Sa", title: 'Daughter of the Void', tags: ['Marksman'] },
    { id: 'KSante', name: "K'Sante", title: 'the Pride of Nazumah', tags: ['Fighter', 'Tank'] },
    { id: 'LeeSin', name: 'Lee Sin', title: 'the Blind Monk', tags: ['Fighter', 'Assassin'] },
    { id: 'Leona', name: 'Leona', title: 'the Radiant Dawn', tags: ['Tank', 'Support'] },
    { id: 'Lulu', name: 'Lulu', title: 'the Fae Sorceress', tags: ['Support', 'Mage'] },
    { id: 'Maokai', name: 'Maokai', title: 'the Twisted Treant', tags: ['Tank', 'Mage'] },
    { id: 'Nautilus', name: 'Nautilus', title: 'the Titan of the Depths', tags: ['Tank', 'Support'] },
    { id: 'Orianna', name: 'Orianna', title: 'the Lady of Clockwork', tags: ['Mage', 'Support'] },
    { id: 'Rakan', name: 'Rakan', title: 'the Charmer', tags: ['Support'] },
    { id: 'RekSai', name: "Rek'Sai", title: 'the Void Burrower', tags: ['Fighter'] },
    { id: 'Renekton', name: 'Renekton', title: 'the Butcher of the Sands', tags: ['Fighter', 'Tank'] },
    { id: 'Sejuani', name: 'Sejuani', title: 'Fury of the North', tags: ['Tank', 'Fighter'] },
    { id: 'Sylas', name: 'Sylas', title: 'the Unshackled', tags: ['Mage', 'Assassin'] },
    { id: 'Thresh', name: 'Thresh', title: 'the Chain Warden', tags: ['Support', 'Fighter'] },
    { id: 'Viego', name: 'Viego', title: 'the Ruined King', tags: ['Assassin', 'Fighter'] },
    { id: 'Vi', name: 'Vi', title: 'the Piltover Enforcer', tags: ['Fighter', 'Assassin'] },
    { id: 'Xayah', name: 'Xayah', title: 'the Rebel', tags: ['Marksman'] },
    { id: 'Zeri', name: 'Zeri', title: 'the Spark of Zaun', tags: ['Marksman'] },
    { id: 'Zoe', name: 'Zoe', title: 'the Aspect of Twilight', tags: ['Mage', 'Support'] },
  ];
  
  return champions.map(c => ({
    ...c,
    image: getChampionImage(c.id),
  }));
}

// Role to champion tag mapping for draft recommendations
export const ROLE_TAGS: Record<string, string[]> = {
  'Top': ['Fighter', 'Tank'],
  'Jungle': ['Fighter', 'Assassin', 'Tank'],
  'Mid': ['Mage', 'Assassin'],
  'ADC': ['Marksman'],
  'Support': ['Support', 'Tank'],
};

// Get champions suitable for a role
export function getChampionsForRole(champions: Champion[], role: string): Champion[] {
  const tags = ROLE_TAGS[role] || [];
  return champions.filter(c => c.tags.some(tag => tags.includes(tag)));
}
