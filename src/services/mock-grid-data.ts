/**
 * Mock GRID Data Service
 * 
 * Provides realistic mock data that mirrors GRID's Central Data and Live Data Feed APIs.
 * This allows full frontend development while waiting for API access to be resolved.
 */

// Mock Teams Data (modeled after GRID Central Data)
export const MOCK_TEAMS = [
  { id: "team-t1", name: "T1", shortName: "T1", region: "LCK", logoUrl: null },
  { id: "team-geng", name: "Gen.G Esports", shortName: "GEN", region: "LCK", logoUrl: null },
  { id: "team-hle", name: "Hanwha Life Esports", shortName: "HLE", region: "LCK", logoUrl: null },
  { id: "team-kt", name: "KT Rolster", shortName: "KT", region: "LCK", logoUrl: null },
  { id: "team-dk", name: "DWG KIA", shortName: "DK", region: "LCK", logoUrl: null },
  { id: "team-drx", name: "DRX", shortName: "DRX", region: "LCK", logoUrl: null },
  { id: "team-fnc", name: "Fnatic", shortName: "FNC", region: "LEC", logoUrl: null },
  { id: "team-g2", name: "G2 Esports", shortName: "G2", region: "LEC", logoUrl: null },
];

// Mock Players Data
export const MOCK_PLAYERS: Record<string, any[]> = {
  "team-t1": [
    { id: "p1", nickname: "Zeus", role: "Top", kda: 4.2, csPerMin: 8.5, visionScore: 42 },
    { id: "p2", nickname: "Oner", role: "Jungle", kda: 3.8, csPerMin: 5.2, visionScore: 68 },
    { id: "p3", nickname: "Faker", role: "Mid", kda: 5.1, csPerMin: 9.2, visionScore: 55 },
    { id: "p4", nickname: "Gumayusi", role: "ADC", kda: 4.8, csPerMin: 10.1, visionScore: 38 },
    { id: "p5", nickname: "Keria", role: "Support", kda: 3.2, csPerMin: 1.2, visionScore: 95 },
  ],
  "team-geng": [
    { id: "p6", nickname: "Kiin", role: "Top", kda: 3.9, csPerMin: 8.1, visionScore: 45 },
    { id: "p7", nickname: "Canyon", role: "Jungle", kda: 4.5, csPerMin: 5.8, visionScore: 72 },
    { id: "p8", nickname: "Chovy", role: "Mid", kda: 6.2, csPerMin: 10.5, visionScore: 48 },
    { id: "p9", nickname: "Peyz", role: "ADC", kda: 4.1, csPerMin: 9.8, visionScore: 35 },
    { id: "p10", nickname: "Lehends", role: "Support", kda: 2.8, csPerMin: 1.0, visionScore: 88 },
  ],
};

// Mock Tournament Data
export const MOCK_TOURNAMENTS = [
  { id: "t1", name: "LCK Spring 2026", startDate: "2026-01-15", endDate: "2026-04-10", region: "Korea" },
  { id: "t2", name: "LEC Winter 2026", startDate: "2026-01-10", endDate: "2026-03-15", region: "Europe" },
  { id: "t3", name: "MSI 2026", startDate: "2026-05-01", endDate: "2026-05-20", region: "International" },
];

// Mock Series/Match Data
export const MOCK_SERIES = [
  {
    id: "series-001",
    tournamentId: "t1",
    startTime: "2026-01-25T12:00:00Z",
    teams: ["team-t1", "team-geng"],
    format: "Bo3",
    status: "finished",
    score: { "team-t1": 2, "team-geng": 1 },
  },
  {
    id: "series-002",
    tournamentId: "t1",
    startTime: "2026-01-24T14:00:00Z",
    teams: ["team-hle", "team-dk"],
    format: "Bo3",
    status: "finished",
    score: { "team-hle": 2, "team-dk": 0 },
  },
  {
    id: "series-003",
    tournamentId: "t1",
    startTime: "2026-01-26T12:00:00Z",
    teams: ["team-t1", "team-kt"],
    format: "Bo3",
    status: "scheduled",
    score: null,
  },
];

// Mock Live Game State (simulates Series State API)
export function getMockLiveGameState(seriesId: string = "live-001") {
  const gameMinute = Math.floor((Date.now() / 1000 / 60) % 40); // Simulates game time
  const goldBase = 15000 + gameMinute * 500;
  
  return {
    seriesId,
    isLive: true,
    gameNumber: 1,
    gameTime: `${gameMinute}:${Math.floor(Math.random() * 59).toString().padStart(2, '0')}`,
    teams: [
      {
        id: "team-t1",
        name: "T1",
        side: "blue",
        kills: Math.floor(8 + Math.random() * 10),
        gold: goldBase + Math.floor(Math.random() * 3000),
        towers: Math.floor(Math.random() * 9),
        dragons: Math.floor(Math.random() * 4),
        barons: Math.floor(Math.random() * 2),
        heralds: Math.floor(Math.random() * 2),
        players: [
          { name: "Zeus", role: "Top", kills: 3, deaths: 1, assists: 4, cs: 180 + gameMinute * 8, gold: 9500 + gameMinute * 200 },
          { name: "Oner", role: "Jungle", kills: 2, deaths: 2, assists: 6, cs: 140 + gameMinute * 5, gold: 8200 + gameMinute * 180 },
          { name: "Faker", role: "Mid", kills: 4, deaths: 0, assists: 3, cs: 200 + gameMinute * 9, gold: 10500 + gameMinute * 220 },
          { name: "Gumayusi", role: "ADC", kills: 3, deaths: 1, assists: 2, cs: 210 + gameMinute * 10, gold: 10200 + gameMinute * 210 },
          { name: "Keria", role: "Support", kills: 0, deaths: 4, assists: 8, cs: 20 + gameMinute, gold: 6800 + gameMinute * 120 },
        ],
      },
      {
        id: "team-geng",
        name: "Gen.G",
        side: "red",
        kills: Math.floor(5 + Math.random() * 8),
        gold: goldBase - Math.floor(Math.random() * 2000),
        towers: Math.floor(Math.random() * 6),
        dragons: Math.floor(Math.random() * 3),
        barons: Math.floor(Math.random() * 1),
        heralds: Math.floor(Math.random() * 2),
        players: [
          { name: "Kiin", role: "Top", kills: 1, deaths: 3, assists: 2, cs: 170 + gameMinute * 7, gold: 8900 + gameMinute * 180 },
          { name: "Canyon", role: "Jungle", kills: 3, deaths: 2, assists: 3, cs: 150 + gameMinute * 5, gold: 9100 + gameMinute * 190 },
          { name: "Chovy", role: "Mid", kills: 2, deaths: 2, assists: 1, cs: 215 + gameMinute * 10, gold: 9800 + gameMinute * 200 },
          { name: "Peyz", role: "ADC", kills: 2, deaths: 3, assists: 2, cs: 200 + gameMinute * 9, gold: 9500 + gameMinute * 195 },
          { name: "Lehends", role: "Support", kills: 0, deaths: 2, assists: 4, cs: 30 + gameMinute, gold: 5500 + gameMinute * 100 },
        ],
      },
    ],
  };
}

// Mock Champion Draft Data
export const MOCK_CHAMPION_POOL = [
  { id: "c1", name: "Lee Sin", role: "Jungle", winRate: 52.3, pickRate: 18.5, banRate: 22.1 },
  { id: "c2", name: "Orianna", role: "Mid", winRate: 51.8, pickRate: 15.2, banRate: 8.3 },
  { id: "c3", name: "Jinx", role: "ADC", winRate: 50.5, pickRate: 20.1, banRate: 12.4 },
  { id: "c4", name: "Thresh", role: "Support", winRate: 49.8, pickRate: 22.8, banRate: 15.6 },
  { id: "c5", name: "Renekton", role: "Top", winRate: 48.2, pickRate: 12.5, banRate: 18.9 },
  { id: "c6", name: "Azir", role: "Mid", winRate: 47.5, pickRate: 8.3, banRate: 25.2 },
  { id: "c7", name: "K'Sante", role: "Top", winRate: 46.8, pickRate: 14.2, banRate: 35.5 },
  { id: "c8", name: "Kai'Sa", role: "ADC", winRate: 51.2, pickRate: 25.3, banRate: 10.8 },
  { id: "c9", name: "Vi", role: "Jungle", winRate: 52.8, pickRate: 10.5, banRate: 5.2 },
  { id: "c10", name: "Ahri", role: "Mid", winRate: 51.5, pickRate: 18.8, banRate: 6.5 },
  { id: "c11", name: "Zeri", role: "ADC", winRate: 48.5, pickRate: 8.2, banRate: 28.5 },
  { id: "c12", name: "Maokai", role: "Support", winRate: 53.2, pickRate: 16.5, banRate: 12.3 },
];

// Helper to get team by ID
export function getTeamById(teamId: string) {
  return MOCK_TEAMS.find(t => t.id === teamId);
}

// Helper to get players for a team
export function getPlayersByTeamId(teamId: string) {
  return MOCK_PLAYERS[teamId] || [];
}
