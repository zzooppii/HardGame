/**
 * 카베르나: 동굴 농부들 (Caverna: The Cave Farmers) 핵심 타입 정의
 */

// 1. 기본 자원 및 농작물
export type CavernaResource = 
  | 'wood'      // 나무
  | 'stone'     // 돌
  | 'ore'       // 광석
  | 'ruby'      // 루비 (조커 자원)
  | 'grain'     // 곡물
  | 'pumpkin'   // 호박
  | 'food'      // 식량
  | 'gold';     // 금화 (VP)

// 2. 가축 4종
export type LivestockType = 
  | 'sheep'     // 양
  | 'boar'      // 멧돼지
  | 'cattle'    // 소
  | 'donkey';   // 당나귀

// 3. 드워프 일꾼
export interface DwarfWorker {
  id: string;
  name: string;
  weaponLevel: number; // 0이면 비무장, 1~14 무기 레벨
  hasActedThisRound: boolean;
  placedActionId: string | null;
}

// 4. 개인 보드 타일/공간 타입
// 좌측: 동굴 보드 (4x3 = 12칸)
// 우측: 숲/농경 보드 (4x3 = 12칸)
export type CaveSlotType = 
  | 'solid_rock'      // 미발굴 단단한 암석
  | 'cavern_empty'    // 발굴 완료된 빈 동굴 공간
  | 'dwelling'        // 주거 공간 (드워프 수용)
  | 'furnishing'      // 특수 가구/방 타일
  | 'ore_mine'        // 광석 광산
  | 'ruby_mine';      // 루비 광산

export type FieldSlotType = 
  | 'deep_forest'     // 개간 안 된 깊은 숲
  | 'cleared_meadow'  // 벌목된 빈 초원
  | 'field_empty'     // 일군 빈 밭
  | 'field_grain'     // 곡물이 파종된 밭 (남은 수량)
  | 'field_pumpkin'   // 호박이 파종된 밭 (남은 수량)
  | 'pasture'         // 울타리 친 목초지
  | 'stable';         // 외양간

export interface BoardSlot {
  row: number;
  col: number;
  type: CaveSlotType | FieldSlotType;
  tileId?: string;       // 배치된 방/타일 ID
  cropCount?: number;    // 밭에 심긴 작물 수
  livestock?: Partial<Record<LivestockType, number>>; // 목초지/외양간에 있는 가축
  stableBuilt?: boolean; // 외양간 설치 여부
}

// 5. 방/가구 타일 (Furnishing Tile)
export interface FurnishingTile {
  id: string;
  name: string;
  nameEn: string;
  category: 'dwelling' | 'craft' | 'score' | 'production';
  cost: Partial<Record<CavernaResource, number>>;
  vp: number;
  description: string;
  immediateBonus?: Partial<Record<CavernaResource, number>>;
  dwellingCapacity?: number; // 드워프 수용 인원
}

// 6. 중앙 행동 칸 (Action Space)
export interface ActionSpace {
  id: string;
  name: string;
  roundAppeared: number; // 0이면 시작부터 사용 가능, 1~8은 해당 라운드에 등장
  accumulatesResource?: {
    resource: CavernaResource | LivestockType;
    amountPerRound: number;
  };
  accumulatedCount: number;
  occupiedByPlayerId: string | null;
  description: string;
  actionType: 
    | 'logging'             // 벌목 (나무 누적)
    | 'quarry'              // 채석장 (돌 누적)
    | 'ore_mining'          // 광석 채굴 (광석 누적)
    | 'ruby_mining'         // 루비 채굴 (루비 누적)
    | 'slash_and_burn'      // 화전 (밭 1개 개간)
    | 'sow_crops'           // 파종 (곡물/호박 파종)
    | 'excavation'          // 동굴 발굴 (암석 -> 빈 동굴 2칸)
    | 'furnish_cavern'      // 방 타일 건설
    | 'blacksmith'          // 대장간 (무기 제작/강화 및 원정)
    | 'expedition'          // 원정 (무기 레벨에 따른 전리품 선택)
    | 'fencing'             // 울타리 치기
    | 'sheep_farming'       // 양 목축 (양 수확)
    | 'cattle_farming'      // 소/멧돼지 수확
    | 'housework';          // 가사 (식량 & 방 건설)
}

// 7. 플레이어 상태
export interface PlayerCaverna {
  id: string;
  name: string;
  color: string;
  isAI: boolean;
  resources: Record<CavernaResource, number>;
  livestock: Record<LivestockType, number>;
  dwarfs: DwarfWorker[];
  caveBoard: BoardSlot[][];   // 4 x 3 동굴 그리드
  fieldBoard: BoardSlot[][];  // 4 x 3 농경/숲 그리드
  builtFurnishings: string[]; // 건설한 방 타일 ID 목록
}

// 8. 게임 전역 상태
export interface CavernaGameState {
  round: number; // 1 ~ 8 (빠른 전략 8라운드)
  phase: 'action' | 'harvest' | 'game_over';
  currentTurnPlayerIndex: number;
  currentDwarfIndex: number;
  players: PlayerCaverna[];
  actionSpaces: ActionSpace[];
  availableFurnishings: FurnishingTile[];
  logs: string[];
  isGameOver: boolean;
}
