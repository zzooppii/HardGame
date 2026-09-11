// 세븐 원더스 듀얼 (7 Wonders Duel) & 판테온 확장 핵심 타입 시스템

export type DuelExpansionMode = 'base' | 'pantheon';

export type DuelAge = 1 | 2 | 3;

export type DuelResource = 
  | 'wood'    // 목재 🪵 (갈색)
  | 'clay'    // 점토 🧱 (갈색)
  | 'stone'   // 석재 🪨 (갈색)
  | 'glass'   // 유리 🧪 (회색)
  | 'papyrus';// 파피루스 📜 (회색)

export type DuelScienceSymbol = 
  | 'compass'   // 나침반 🧭
  | 'wheel'     // 바퀴 ⚙️
  | 'gear'      // 톱니바퀴 🔧
  | 'tablet'    // 서판 📜
  | 'mortar'    // 막자사발 🧪
  | 'quill'     // 깃펜 ✒️
  | 'law';      // 법전 (진보 토큰 전용) ⚖️

export type DuelCardColor = 
  | 'brown'   // 원자재 (목재, 점토, 석재)
  | 'gray'    // 공예품 (유리, 파피루스)
  | 'blue'    // 민간 건물 (순수 승점)
  | 'green'   // 과학 건물 (과학 기호 및 승점)
  | 'yellow'  // 상업 건물 (동전, 무역 할인, 자원)
  | 'red'     // 군사 건물 (방패)
  | 'purple'  // 길드 건물 (3시대 특수 승점)
  | 'temple'; // 판테온 신전 건물 (확장 전용)

export type ChainSymbol = 
  | 'mask' | 'pillar' | 'moon' | 'raindrop' | 'sun' | 'drop' 
  | 'temple_symbol' | 'pot' | 'horseshoe' | 'sword' | 'tower' | 'target'
  | 'helmet' | 'book' | 'gear_symbol' | 'harp';

export interface DuelCard {
  id: string;
  name: string;
  nameEn: string;
  age: DuelAge;
  color: DuelCardColor;
  cost: {
    coins?: number;
    resources?: Partial<Record<DuelResource, number>>;
    wood?: number;
    clay?: number;
    stone?: number;
    glass?: number;
    papyrus?: number;
  };
  chainSymbol?: ChainSymbol;         // 이 카드를 무료로 건설할 수 있는 이전 기호
  providesChainSymbol?: ChainSymbol; // 다음 시대 카드에 제공하는 연계 기호
  effects: {
    victoryPoints?: number;
    coins?: number;
    militaryShields?: number;
    scienceSymbol?: DuelScienceSymbol;
    resources?: Partial<Record<DuelResource, number>>;
    tradeDiscount?: Partial<Record<DuelResource, number>>; // 특정 자원 무역 고정 비용 (1원)
    guildType?: string; // 길드 카드 조건별 점수/동전 계산
  };
  description: string;
}

export interface WonderCard {
  id: string;
  name: string;
  nameEn: string;
  cost: Partial<Record<DuelResource, number>>;
  effects: {
    victoryPoints: number;
    coins?: number;
    militaryShields?: number;
    extraTurn?: boolean;        // 즉시 한 턴 더 진행
    destroyBrownCard?: boolean; // 상대방 갈색 카드 1장 파괴
    destroyGrayCard?: boolean;  // 상대방 회색 카드 1장 파괴
    takeDiscardedCard?: boolean;// 버려진 카드 중 1장 무료 건설
    takeProgressToken?: boolean;// 진보 토큰 1개 획득
    providesResources?: Partial<Record<DuelResource, number>>;
  };
  isConstructed: boolean;
  constructedBy?: string; // 'p-0' | 'p-1'
}

export interface ProgressToken {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  effects: {
    victoryPoints?: number;
    coins?: number;
    freeChainCoins?: number; // 연계 건설 시 4코인 획득 (도시 계획)
    militaryShields?: number;
    extraScienceLaw?: boolean; // 제7의 과학 기호(법전)로 인정
    cheaperTrade?: boolean;
    replayWonder?: boolean;
  };
}

// 판테온 확장 신 카드 (Pantheon God)
export type Mythology = 'greek' | 'roman' | 'egyptian' | 'mesopotamian' | 'phoenician';

export interface PantheonGodCard {
  id: string;
  mythology: Mythology;
  name: string;
  nameEn: string;
  description: string;
  effects: {
    victoryPoints?: number;
    coins?: number;
    militaryShields?: number;
    stealCard?: boolean;
    extraTurn?: boolean;
    freeWonder?: boolean;
    takeProgressToken?: boolean;
  };
  costInCoins: number; // 활성화에 필요한 기본 비용
}

// 피라미드 보드 노드
export interface PyramidNode {
  id: string;
  card: DuelCard;
  age: DuelAge;
  row: number;
  col: number;
  isOpen: boolean;        // 앞면 공개 여부
  isAvailable: boolean;   // 위에 덮인 카드가 없어서 지금 집을 수 있는지 여부
  coveredBy: string[];    // 이 카드를 덮고 있는 아래층 카드 ID 목록
  covers: string[];       // 이 카드가 덮고 있는 위층 카드 ID 목록
  isTaken: boolean;       // 이미 플레이어가 가져갔는지 여부
}

export interface PlayerDuel {
  id: string;
  name: string;
  color: string;
  isAI: boolean;
  coins: number;
  wonders: WonderCard[];
  constructedWonders: WonderCard[];
  cards: DuelCard[];
  scienceSymbols: DuelScienceSymbol[];
  progressTokens: ProgressToken[];
  tradeDiscounts: Partial<Record<DuelResource, number>>; // 자원별 고정 구매가 (보통 1원)
  militaryTokensTaken: number[]; // 군사 트랙 약탈 토큰
}

export interface DuelGameState {
  expansionMode: DuelExpansionMode;
  age: DuelAge;
  currentTurnPlayerIndex: number;
  players: PlayerDuel[];
  militaryPosition: number; // -9 (플레이어 1 수도 침공 패배) ~ 0 (중립) ~ +9 (플레이어 0 승리)
  militaryLootTokens: { position: number; penaltyCoins: number; isTaken: boolean }[];
  pyramid: PyramidNode[];
  availableProgressTokens: ProgressToken[];
  discardedCards: DuelCard[];
  wonderDraftPool: WonderCard[];
  isWonderDraftPhase: boolean;
  wonderDraftStep: number; // 0 ~ 7

  // 판테온 확장 전용 보드
  pantheonBoard?: {
    slots: { mythology: Mythology; godCard: PantheonGodCard | null; costOffset: number }[];
    offeringTokensRemaining: number;
  };

  logs: string[];
  isGameOver: boolean;
  victoryReason: 'military' | 'science' | 'civilian' | null;
  winnerPlayerId: string | null;
  aiDifficulty?: 'easy' | 'normal' | 'hard';
}
