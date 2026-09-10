export type GoodType = 'corn' | 'indigo' | 'sugar' | 'tobacco' | 'coffee';

export type RoleType = 
  | 'settler'
  | 'mayor'
  | 'builder'
  | 'craftsman'
  | 'trader'
  | 'captain'
  | 'prospector';

export type PlantationType = GoodType | 'quarry';

export interface PlantationTile {
  id: string;
  type: PlantationType;
  hasColonist: boolean;
}

export type BuildingCategory = 'production' | 'violet' | 'large';

export interface BuildingDef {
  id: string;
  name: string;
  koreanName: string;
  cost: number;
  quarryDiscountMax: number;
  vp: number;
  category: BuildingCategory;
  goodType?: GoodType;
  maxColonists: number;
  desc: string;
}

export interface PlayerBuilding {
  buildingId: string;
  colonists: number;
}

export interface PlayerState {
  id: string;
  name: string;
  isAI: boolean;
  color: string;
  doubloons: number;
  vpChips: number;
  plantations: PlantationTile[]; // 최대 12칸
  buildings: PlayerBuilding[];   // 최대 12칸
  goods: Record<GoodType, number>;
  unassignedColonists: number;
}

export interface CargoShip {
  capacity: number;
  goodType: GoodType | null;
  loaded: number;
}

export interface RoleCardState {
  role: RoleType;
  doubloons: number;
  selectedByPlayerId: string | null;
}

export type ActionPhase = 
  | 'idle'
  | 'select_role'
  | 'settler_action'
  | 'mayor_assign'
  | 'builder_action'
  | 'craftsman_bonus'
  | 'trader_action'
  | 'captain_action'
  | 'game_over';

export interface ActionLogEntry {
  id: string;
  round: number;
  text: string;
  type: 'info' | 'role' | 'reward' | 'trade' | 'ship';
  timestamp: string;
}

export interface PuertoRicoGameState {
  players: PlayerState[];
  governorIndex: number;
  currentTurnPlayerIndex: number;
  currentRole: RoleType | null;
  roleCards: RoleCardState[];
  round: number;
  
  // 공용 공급처
  plantationMarket: PlantationType[];
  plantationDrawPile: PlantationType[];
  quarrySupply: number;
  colonistShip: number;
  colonistSupply: number;
  vpSupply: number;
  goodsSupply: Record<GoodType, number>;
  
  // 시장 & 항구
  tradingHouse: GoodType[];
  cargoShips: CargoShip[];
  
  // 페이즈 상태
  currentPhase: ActionPhase;
  playersCompletedAction: string[]; // 현재 역할에서 행동 완료한 플레이어 ID들
  
  // 종료 조건 및 로그
  isGameOver: boolean;
  endReason: string | null;
  actionLogs: ActionLogEntry[];
}
