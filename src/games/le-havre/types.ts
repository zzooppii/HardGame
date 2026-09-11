/**
 * 르아브르 (Le Havre) 핵심 타입 정의
 */

// 8대 기본 원자재와 대응하는 8대 가공품
export type RawGood = 'fish' | 'wood' | 'clay' | 'iron' | 'grain' | 'cattle' | 'hide' | 'coal';
export type ProcessedGood = 'smoked_fish' | 'charcoal' | 'brick' | 'steel' | 'bread' | 'meat' | 'leather' | 'coke';
export type ResourceType = RawGood | ProcessedGood;

export interface GoodDefinition {
  id: ResourceType;
  name: string;
  isProcessed: boolean;
  counterpartId: ResourceType;
  foodValue: number; // 밥으로 사용할 때의 가치 (0이면 불가)
  fuelValue: number; // 연료로 사용할 때의 가치 (0이면 불가)
  sellValue: number; // 프랑 판매 가치
  icon: string;
  color: string;
}

export type DockType = 'franc' | 'fish' | 'wood' | 'clay' | 'iron' | 'grain' | 'cattle';

export interface DockState {
  id: DockType;
  name: string;
  resource: ResourceType | 'franc';
  count: number;
  icon: string;
  color: string;
}

export interface SupplyTile {
  id: number;
  goods: [DockType, DockType]; // 이 타일이 활성화될 때 공급되는 2종류
}

export type BuildingCategory = 'craft' | 'industry' | 'public' | 'economy' | 'shipping';

export interface BuildingCard {
  id: string;
  name: string;
  nameEn: string;
  category: BuildingCategory;
  buildCost: Partial<Record<ResourceType, number>>;
  buyCostFranc: number;
  value: number; // 최종 자산 승점 가치
  entryCost: { food: number; franc: number }; // 입장료 (소유주에게 지급)
  ownerId: string | 'town'; // 'town'은 공공 건물
  workerOnBuilding: string | null; // 현재 이 건물을 사용 중인 플레이어 ID (1명만 들어갈 수 있음)
  actionType: 
    | 'bake_bread'        // 제빵소 (곡물 -> 빵)
    | 'smoke_fish'        // 훈제장 (어획 -> 훈제어)
    | 'burn_charcoal'     // 제탄소 (목재 -> 숯)
    | 'bake_brick'        // 벽돌 가마 (점토 -> 벽돌)
    | 'forge_steel'       // 제철소 (철 -> 강철)
    | 'butcher'           // 도축장 (가축 -> 고기 & 가죽)
    | 'tannery'           // 무두질공장 (가죽 -> 고급가죽/프랑)
    | 'coke_oven'         // 코크스 오븐 (석탄 -> 코크스)
    | 'build_firm'        // 시공사 (건물 1개 짓기)
    | 'construction'      // 대형 건설사 (건물 최대 2개 짓기)
    | 'wharf'             // 부두 (선박 건조)
    | 'black_market'      // 암시장 (자원 획득)
    | 'bank'              // 은행 (프랑 대량 획득)
    | 'market'            // 시장 (원자재 골고루 획득)
    | 'shipping_line';    // 해운사 (선적 무역으로 프랑 환전)
  description: string;
}

export type ShipType = 'wood' | 'iron' | 'steel' | 'luxury';

export interface ShipCard {
  id: string;
  name: string;
  type: ShipType;
  buildCost: Partial<Record<ResourceType, number>>;
  costEnergy: number; // 건조 시 필요한 추가 에너지(연료)
  buyCostFranc: number;
  value: number; // 최종 가치
  foodProvided: number; // 매 라운드 식량 절감량
  ownerId: string | null;
}

export interface PlayerLeHavre {
  id: string;
  name: string;
  color: string;
  isAI: boolean;
  francs: number;
  loans: number; // 대출 증서 장수 (1장당 4프랑 빚, 라운드당 이자 1프랑, 미상환 시 -7점)
  inventory: Record<ResourceType, number>;
  buildingsOwned: string[]; // 보유한 건물 ID 목록
  shipsOwned: string[]; // 보유한 선박 ID 목록
  workerPosition: string | null; // 현재 일꾼이 들어가 있는 건물 ID
}

export interface RoundInfo {
  roundNumber: number;
  foodRequired: number; // 라운드 종료 시 플레이어당 요구 식량
  harvestGrain: boolean; // 곡물 수확 발생 여부
  breedCattle: boolean; // 가축 번식 발생 여부
  newBuildingsReleased: string[]; // 이번 라운드에 시장에 새로 등장하는 건물 ID
  newShipReleased: ShipType | null; // 이번 라운드에 건조소에 풀리는 선박
}

export type GamePhase = 'turn_action' | 'feeding_harvest' | 'game_over';

export interface LeHavreGameState {
  round: number; // 1 ~ 7
  turnInRound: number; // 0 ~ 6 (7보급선 단계)
  currentSupplyTileIndex: number; // 0 ~ 6
  currentTurnPlayerIndex: number;
  players: PlayerLeHavre[];
  docks: DockState[];
  buildings: BuildingCard[];
  ships: ShipCard[];
  phase: GamePhase;
  logs: string[];
  isGameOver: boolean;
}
