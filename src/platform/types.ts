export type GameStatus = 'available' | 'in_development';

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
