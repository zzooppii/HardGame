/**
 * 버건디의 성 (The Castles of Burgundy) 핵심 타입 정의
 */

export type TileCategory = 
  | 'castle'     // 성 (다크 그린)
  | 'city'       // 도시 건물 (베이지)
  | 'pasture'    // 목장/가축 (연두)
  | 'ship'       // 선박 (파랑)
  | 'mine'       // 광산 (회색)
  | 'monastery'; // 지식/수도원 (노랑)

export type BuildingType =
  | 'warehouse'       // 창고: 상품 1종류 매각
  | 'bank'            // 은행: 은화 2개 즉시 획득
  | 'church'          // 교회: 중앙 디포에서 성/광산/수도원 중 1개 무료 획득
  | 'boarding_house'  // 여관: 일꾼 4개 즉시 획득
  | 'market'          // 시장: 중앙 디포에서 가축/선박 중 1개 무료 획득
  | 'watchtower'      // 감시탑: 즉시 4 승점(VP) 획득
  | 'carpenter'       // 목공소: 중앙 디포에서 건물 1개 무료 획득
  | 'city_hall';      // 시청: 내 보관소의 타일 1개 즉시 영지에 무료 배치

export type AnimalType = 'sheep' | 'cow' | 'pig' | 'chicken';

export interface HexTile {
  id: string;
  category: TileCategory;
  type: string;
  name: string;
  icon: string;
  desc: string;
  color: string;
  animalType?: AnimalType;
  animalCount?: number;
  buildingType?: BuildingType;
  knowledgeId?: number;
}

export interface GoodsTile {
  id: string;
  dieNumber: number; // 1 ~ 6
  name: string;
  color: string;
}

export interface DuchySlot {
  id: number;          // 0 ~ 36 (총 37칸)
  q: number;           // 육각 그리드 축좌표 q
  r: number;           // 육각 그리드 축좌표 r
  category: TileCategory;
  dieNumber: number;   // 1 ~ 6
  regionId: number;    // 연결된 같은 색상 구역 번호
  placedTile: HexTile | null;
}

export interface PlayerBurgundy {
  id: string;
  name: string;
  color: string;
  isAI: boolean;
  vp: number;
  silverlings: number; // 은화
  workers: number;     // 일꾼 토큰
  keySlots: (HexTile | null)[]; // 개인 타일 보관소 (최대 3개)
  goods: GoodsTile[];           // 보유 상품 (최대 3슬롯)
  soldGoodsCount: number;       // 판매한 상품 수
  duchy: DuchySlot[];           // 개인 영지 보드 (37칸 육각 맵)
  dice: [number, number];       // 이번 라운드 굴린 주사위 2개
  usedDice: [boolean, boolean]; // 주사위 사용 여부
  hasRolledDice: boolean;       // 주사위를 직접 굴렸는지 여부
  turnOrderPos: number;         // 턴 순서 트랙 위치 (선박 배치 시 전진)
}

export type BurgundyPhase = 'A' | 'B' | 'C' | 'D' | 'E';

export interface RegionInfo {
  regionId: number;
  category: TileCategory;
  slotIds: number[];
  isCompleted: boolean;
}
