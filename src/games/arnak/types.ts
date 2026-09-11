// 아르낙의 잊혀진 유적 (Lost Ruins of Arnak) 핵심 타입 시스템

export type ArnakResource = 
  | 'coins'       // 코인 🪙 (아이템 구매, 탐험 보조)
  | 'compasses'   // 나침반 🧭 (유적 발굴, 고대 유물 구매)
  | 'tablets'     // 석판 📜 (사원 연구 조사)
  | 'arrowheads'  // 화살촉 🏹 (수호자 제압, 상급 연구)
  | 'rubies';     // 보석 💎 (사원 최상층 및 고급 제압)

export type TravelIcon = 'boots' | 'boat' | 'car' | 'plane';

export interface Archaeologist {
  id: string;
  isPlaced: boolean;
  placedSiteId: string | null;
}

export type CardType = 'starter' | 'fear' | 'item' | 'artifact';

export interface ArnakCard {
  id: string;
  name: string;
  nameEn: string;
  type: CardType;
  costCoins?: number;
  costCompasses?: number;
  travelIcon: TravelIcon;
  victoryPoints: number;
  description: string;
  effect: {
    gainResources?: Partial<Record<ArnakResource, number>>;
    drawCards?: number;
    freeTravelPlane?: boolean;
    researchDiscount?: boolean;
  };
}

export interface ArnakGuardian {
  id: string;
  name: string;
  nameEn: string;
  siteId?: string;
  defeatCost: Partial<Record<ArnakResource, number>>;
  victoryPoints: number; // 기본 5점
  boonDescription: string;
  isDefeated: boolean;
  icon: string;
}

export interface DigSite {
  id: string;
  name: string;
  level: 0 | 1 | 2; // 0: 기본 캠프(5곳), 1: 1티어 유적, 2: 2티어 심층 유적
  travelReq: TravelIcon[];
  compassCostToDiscover: number; // 0티어=0, 1티어=3, 2티어=6
  rewards: Partial<Record<ArnakResource, number>> & { drawCard?: number };
  guardian?: ArnakGuardian | null;
  isDiscovered: boolean;
  occupiedByPlayerId: string | null;
  siteSlotIcon: string;
}

export interface ResearchStep {
  step: number;
  name: string;
  glassCost: Partial<Record<ArnakResource, number>>;
  bookCost: Partial<Record<ArnakResource, number>>;
  glassPoints: number;
  bookPoints: number;
  bonusDesc: string;
  rewardResource?: Partial<Record<ArnakResource, number>>;
}

export interface PlayerArnak {
  id: string;
  name: string;
  color: string;
  isAI: boolean;
  resources: Record<ArnakResource, number>;
  archaeologists: Archaeologist[];
  deck: ArnakCard[];
  hand: ArnakCard[];
  playArea: ArnakCard[];
  discard: ArnakCard[];
  defeatedGuardians: ArnakGuardian[];
  glassStep: number; // 돋보기 조사 위치 (0~5)
  bookStep: number;  // 연구 수첩 위치 (0~5, 항상 glassStep 이하)
  templeTilesClaimed: number[]; // 잃어버린 사원 타일 승점들
  fearCardsCount: number; // 감점 페널티 (-1점씩)
  hasPassedTurnThisRound: boolean;
}

export interface ArnakGameState {
  round: number; // 총 5라운드
  phase: 'action' | 'round_end' | 'game_over';
  currentTurnPlayerIndex: number;
  players: PlayerArnak[];
  digSites: DigSite[];
  itemMarket: ArnakCard[];
  artifactMarket: ArnakCard[];
  itemDeck: ArnakCard[];
  artifactDeck: ArnakCard[];
  availableGuardians: ArnakGuardian[];
  logs: string[];
  isGameOver: boolean;
}
