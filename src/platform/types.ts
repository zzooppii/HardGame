export type GameStatus = 'available' | 'in_development';
export type AIDifficulty = 'easy' | 'normal' | 'hard';

export interface BoardGameMeta {
  id: string;
  title: string;
  originalTitle: string;
  designer: string;
  year: number;
  players: string;
  playTime: string;
  weight: number; // 난이도 (BGG 1~5)
  category: string[];
  description: string;
  flavorText: string;
  status: GameStatus;
  accentColor: string;
  bannerImage: string;
}

export interface GameResultRecord {
  id: string;
  gameId: string;
  gameTitle: string;
  playedAt: string; // ISO string
  isWin: boolean;
  rank: number; // 1위, 2위...
  myScore: number;
  totalPlayers: number;
  maxScore: number;
  extraMeta?: Record<string, any>;
}

export interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number; // 0 ~ 100 (%)
  highScore: number;
  averageScore: number;
}

export type AchievementCategory = 
  | 'common' 
  | 'puerto-rico' 
  | 'burgundy' 
  | 'le-havre' 
  | 'caverna' 
  | 'arnak' 
  | 'terraforming-mars';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: string; // 이모지 또는 아이콘명
  conditionDesc: string;
  unlockedAt: string | null; // ISO string if unlocked, null if locked
}
