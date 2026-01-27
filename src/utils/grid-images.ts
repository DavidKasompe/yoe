// GRID Image Helper Utilities
// Provides functions to construct image URLs for teams, players, and champions

/**
 * Get team logo URL from LoL Esports CDN
 */
export const getTeamLogo = (teamName: string): string => {
  // Map common team names to their official slugs
  const teamSlugMap: Record<string, string> = {
    'T1': 't1',
    'Gen.G': 'gen-g',
    'Gen.G Esports': 'gen-g',
    'DRX': 'drx',
    'KT Rolster': 'kt-rolster',
    'Dplus KIA': 'dplus-kia',
    'Team Liquid': 'tl',
    'Cloud9': 'c9',
    'G2 Esports': 'g2-esports',
    'Fnatic': 'fnatic',
    'MAD Lions': 'mad-lions',
    'SK Gaming': 'sk-gaming',
    'Rogue': 'rogue',
    'JD Gaming': 'jd-gaming',
    'EDward Gaming': 'edg',
    'Royal Never Give Up': 'rng',
    'Top Esports': 'tes',
    'FunPlus Phoenix': 'fpx',
    'Bilibili Gaming': 'bilibili-gaming',
    'LNG Esports': 'lng-esports',
  };

  const slug = teamSlugMap[teamName] || teamName.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '');
  return `https://am-a.akamaihd.net/image?resize=75:&f=http://static.lolesports.com/teams/${slug}.png`;
};

/**
 * Get player photo URL from LoL Esports CDN
 */
export const getPlayerPhoto = (playerName: string): string => {
  const slug = playerName.toLowerCase();
  return `https://am-a.akamaihd.net/image?resize=75:&f=http://static.lolesports.com/players/${slug}.png`;
};

/**
 * Get champion icon from Riot Data Dragon
 */
export const getChampionIcon = (championName: string): string => {
  return `https://ddragon.leagueoflegends.com/cdn/14.2.1/img/champion/${championName}.png`;
};

/**
 * Get team initials for fallback avatar
 */
export const getTeamInitials = (teamName: string): string => {
  const cleaned = teamName.replace(/\./g, '').trim();
  const words = cleaned.split(/\s+/);
  
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  
  return cleaned.substring(0, 2).toUpperCase();
};

/**
 * Get player initials for fallback avatar
 */
export const getPlayerInitials = (playerName: string): string => {
  return playerName.substring(0, 2).toUpperCase();
};
