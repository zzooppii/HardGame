// 테라포밍 마스 (Terraforming Mars) 핵심 타입 시스템

export type TMResource = 
  | 'megacredits' // 메가크레딧 (M€)
  | 'steel'        // 강철 (건물 카드 비용 결제 시 개당 2M€ 가치)
  | 'titanium'     // 티타늄 (우주 카드 비용 결제 시 개당 3M€ 가치)
  | 'plants'       // 식물 (8개 모아 녹지 타일로 전환)
  | 'energy'       // 에너지 (세대 종료 시 열로 자동 전환)
  | 'heat';        // 열 (8개 모아 온도 2°C 상승)

export type CardTag = 
  | 'building'    // 건물 🏗️
  | 'space'       // 우주 🚀
  | 'plant'       // 식물 🌱
  | 'microbe'     // 미생물 🦠
  | 'animal'      // 동물 🐾
  | 'earth'       // 지구 🌍
  | 'power'       // 전력 ⚡
  | 'science'     // 과학 🔬
  | 'event'       // 사건 ☄️
  | 'city';       // 도시 🏙️

export type HexTileType = 
  | 'empty'       // 빈 화성 표면
  | 'greenery'    // 녹지 타일 (산소 +1%, TR +1, 최종 1점)
  | 'city'        // 도시 타일 (인접한 녹지 1개당 최종 1점)
  | 'ocean'       // 해양 타일 (TR +1, 인접 타일 배치 시 2M€ 보너스)
  | 'restricted'; // 특수 제한 구역

export interface HexSlot {
  id: string;
  q: number; // axial coordinates
  r: number;
  tileType: HexTileType;
  ownerPlayerId: string | null;
  placedTileName?: string;
  bonus?: Partial<Record<TMResource, number>>; // 타일 배치 시 즉시 얻는 화성 지표면 보너스
  isOceanSlot?: boolean; // 해양 전용 슬롯 여부
}

export interface CorporationCard {
  id: string;
  name: string;
  nameEn: string;
  startingMegacredits: number;
  startingResources: Partial<Record<TMResource, number>>;
  startingProduction: Partial<Record<TMResource, number>>;
  flavorText: string;
  specialAbility: string;
}

export interface ProjectCard {
  id: string;
  name: string;
  nameEn: string;
  cost: number; // M€ 카드 구매 후 플레이 비용
  tags: CardTag[];
  requirements?: {
    minTemperature?: number;
    maxTemperature?: number;
    minOxygen?: number;
    maxOxygen?: number;
    minOceans?: number;
    maxOceans?: number;
  };
  effects: {
    trBonus?: number;
    tempSteps?: number;
    oxygenSteps?: number;
    oceanCount?: number;
    productionChange?: Partial<Record<TMResource, number>>;
    resourceChange?: Partial<Record<TMResource, number>>;
    placeTile?: HexTileType;
  };
  victoryPoints: number;
  description: string;
}

export interface PlayerTM {
  id: string;
  name: string;
  color: string;
  isAI: boolean;
  corporation: CorporationCard;
  tr: number; // 테라포밍 등급 (Terraform Rating, 기본 20)
  resources: Record<TMResource, number>;
  production: Record<TMResource, number>;
  hand: ProjectCard[];
  playedCards: ProjectCard[];
  hasPassedThisGen: boolean;
}

export interface TMGameState {
  generation: number; // 세대 (라운드)
  phase: 'action' | 'production' | 'game_over';
  currentTurnPlayerIndex: number;
  players: PlayerTM[];
  mapSlots: HexSlot[];
  temperature: number; // -30°C ~ +8°C (2도 단위 19단계)
  oxygen: number;      // 0% ~ 14% (1% 단위 14단계)
  oceansPlaced: number;// 0 ~ 9개
  cardMarket: ProjectCard[]; // 카드 연구 마켓
  logs: string[];
  isGameOver: boolean;
  aiDifficulty?: 'easy' | 'normal' | 'hard';
}
