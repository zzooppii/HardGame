import type { 
  PlayerLeHavre, 
  DockState, 
  BuildingCard, 
  ShipCard, 
  ResourceType, 
  RoundInfo,
  DockType
} from '../types';
import { GOODS_DEFINITIONS } from '../data/goods';
import { SUPPLY_TILES } from '../data/rounds';

/** 보급선 1칸 전진 및 도크 상품 적재 */
export function advanceSupplyShip(
  docks: DockState[], 
  currentTileIndex: number
): { updatedDocks: DockState[]; nextTileIndex: number; supplied: [DockType, DockType] } {
  const tile = SUPPLY_TILES[currentTileIndex];
  const updatedDocks = docks.map(d => {
    let add = 0;
    if (d.id === tile.goods[0]) add++;
    if (d.id === tile.goods[1]) add++;
    return {
      ...d,
      count: d.count + add
    };
  });

  const nextTileIndex = (currentTileIndex + 1) % SUPPLY_TILES.length;
  return {
    updatedDocks,
    nextTileIndex,
    supplied: tile.goods
  };
}

/** 도크 상품 전량 획득 */
export function executeTakeDock(
  player: PlayerLeHavre, 
  dock: DockState
): { updatedPlayer: PlayerLeHavre; gainedAmount: number; resourceName: string } {
  const amount = dock.count;
  if (amount <= 0) {
    return { updatedPlayer: player, gainedAmount: 0, resourceName: dock.name };
  }

  let updatedPlayer: PlayerLeHavre;
  if (dock.resource === 'franc') {
    updatedPlayer = {
      ...player,
      francs: player.francs + amount
    };
  } else {
    const resId = dock.resource as ResourceType;
    updatedPlayer = {
      ...player,
      inventory: {
        ...player.inventory,
        [resId]: (player.inventory[resId] || 0) + amount
      }
    };
  }

  return {
    updatedPlayer,
    gainedAmount: amount,
    resourceName: dock.name
  };
}

/** 플레이어의 보유 식량 가치 총합 계산 (훈제어=2, 어획=1, 빵=2, 고기=3, 프랑=1) */
export function calculateAvailableFood(player: PlayerLeHavre): number {
  let total = player.francs; // 1프랑 = 1식량
  for (const [res, count] of Object.entries(player.inventory)) {
    const def = GOODS_DEFINITIONS[res as ResourceType];
    if (def && def.foodValue > 0) {
      total += count * def.foodValue;
    }
  }
  return total;
}

/** 플레이어의 보유 연료 가치 총합 계산 (목재=1, 숯=3, 석탄=3, 코크스=5) */
export function calculateAvailableFuel(player: PlayerLeHavre): number {
  let total = 0;
  for (const [res, count] of Object.entries(player.inventory)) {
    const def = GOODS_DEFINITIONS[res as ResourceType];
    if (def && def.fuelValue > 0) {
      total += count * def.fuelValue;
    }
  }
  return total;
}

/** 플레이어가 보유한 선박들의 식량 절감량 총합 */
export function calculateShipFoodProtection(player: PlayerLeHavre, ships: ShipCard[]): number {
  return ships
    .filter(s => s.ownerId === player.id)
    .reduce((sum, s) => sum + s.foodProvided, 0);
}

/** 건물 입장 가능 여부 및 입장료 지불 체크 */
export function canEnterBuilding(
  player: PlayerLeHavre, 
  building: BuildingCard
): { canEnter: boolean; reason?: string; foodCost: number; francCost: number } {
  if (building.workerOnBuilding !== null) {
    return { canEnter: false, reason: '다른 일꾼이 이미 이 건물을 이용 중입니다.', foodCost: 0, francCost: 0 };
  }

  // 타운 소유 건물이거나 본인 건물이면 입장료 무료
  if (building.ownerId === 'town' || building.ownerId === player.id) {
    return { canEnter: true, foodCost: 0, francCost: 0 };
  }

  // 상대방 건물인 경우 입장료 요구
  const reqFood = building.entryCost.food;
  const reqFranc = building.entryCost.franc;
  const availFood = calculateAvailableFood(player);

  if (player.francs < reqFranc || availFood < (reqFood + reqFranc)) {
    return { canEnter: false, reason: `입장료(음식 ${reqFood}개, ${reqFranc}프랑)가 부족합니다.`, foodCost: reqFood, francCost: reqFranc };
  }

  return { canEnter: true, foodCost: reqFood, francCost: reqFranc };
}

/** 라운드 종료 수확 및 밥 먹이기 정산 */
export function processRoundEnd(
  players: PlayerLeHavre[], 
  roundInfo: RoundInfo, 
  ships: ShipCard[]
): { updatedPlayers: PlayerLeHavre[]; roundLogs: string[] } {
  const roundLogs: string[] = [];

  const updatedPlayers = players.map(p => {
    let updated = { ...p };
    const pLogs: string[] = [];

    // 1. 수확 및 번식
    if (roundInfo.harvestGrain && (updated.inventory.grain || 0) >= 1) {
      updated.inventory = {
        ...updated.inventory,
        grain: (updated.inventory.grain || 0) + 1
      };
      pLogs.push(`${p.name}: 곡물 수확 (+1 곡물)`);
    }

    if (roundInfo.breedCattle && (updated.inventory.cattle || 0) >= 2) {
      updated.inventory = {
        ...updated.inventory,
        cattle: (updated.inventory.cattle || 0) + 1
      };
      pLogs.push(`${p.name}: 가축 번식 (+1 가축)`);
    }

    // 2. 밥 먹이기 (Feeding)
    const baseReq = roundInfo.foodRequired;
    const shipShield = calculateShipFoodProtection(updated, ships);
    const netFoodNeeded = Math.max(0, baseReq - shipShield);

    if (netFoodNeeded === 0) {
      pLogs.push(`${p.name}: 선박 보호 덕분에 식량 소모 0`);
    } else {
      let needed = netFoodNeeded;
      const newInv = { ...updated.inventory };

      // 가공된 고단백 식품부터 우선 소모: 훈제어(2) -> 빵(2) -> 고기(3) -> 어획(1) -> 프랑(1)
      const foodPriority: ResourceType[] = ['smoked_fish', 'bread', 'meat', 'fish'];
      for (const res of foodPriority) {
        if (needed <= 0) break;
        const val = GOODS_DEFINITIONS[res].foodValue;
        const count = newInv[res] || 0;
        if (count > 0 && val > 0) {
          const used = Math.min(count, Math.ceil(needed / val));
          newInv[res] -= used;
          needed -= used * val;
        }
      }

      updated.inventory = newInv;

      // 그래도 부족하면 프랑 차감
      if (needed > 0) {
        const francToUse = Math.min(updated.francs, needed);
        updated.francs -= francToUse;
        needed -= francToUse;
      }

      // 그래도 부족하면 긴급 대출(Loan) 발행
      if (needed > 0) {
        const loansCount = Math.ceil(needed / 4); // 1대출당 4프랑
        updated.loans += loansCount;
        const cashFromLoan = loansCount * 4;
        const leftoverCash = cashFromLoan - needed;
        updated.francs += leftoverCash;
        pLogs.push(`⚠️ ${p.name}: 식량 부족으로 긴급 대출 ${loansCount}건 발행 (부채 증가)`);
      } else {
        pLogs.push(`${p.name}: 노동자 식량 ${netFoodNeeded} 공급 완료`);
      }
    }

    // 3. 보유 대출 이자 지불 (대출 1건당 1프랑)
    if (updated.loans > 0) {
      const interest = updated.loans;
      if (updated.francs >= interest) {
        updated.francs -= interest;
        pLogs.push(`${p.name}: 대출 이자 ${interest}프랑 납부`);
      } else {
        // 이자 낼 돈도 없으면 대출 1건 추가
        updated.loans += 1;
        updated.francs += (4 - interest);
        pLogs.push(`⚠️ ${p.name}: 이자 연체로 대출 1건 추가 발생`);
      }
    }

    roundLogs.push(...pLogs);
    return updated;
  });

  return { updatedPlayers, roundLogs };
}

/** 최종 점수(순자산) 산출 */
export function calculateFinalScoreLeHavre(
  player: PlayerLeHavre, 
  buildings: BuildingCard[], 
  ships: ShipCard[]
): { 
  total: number; 
  breakdown: { 
    cash: number; 
    buildingValue: number; 
    shipValue: number; 
    loanPenalty: number; 
  } 
} {
  const cash = player.francs;

  // 소유한 건물 가치
  const ownedBuildings = buildings.filter(b => b.ownerId === player.id);
  const buildingValue = ownedBuildings.reduce((sum, b) => sum + b.value, 0);

  // 소유한 선박 가치
  const ownedShips = ships.filter(s => s.ownerId === player.id);
  const shipValue = ownedShips.reduce((sum, s) => sum + s.value, 0);

  // 미상환 대출 감점 (1건당 -7점)
  const loanPenalty = player.loans * 7;

  const total = cash + buildingValue + shipValue - loanPenalty;

  return {
    total,
    breakdown: {
      cash,
      buildingValue,
      shipValue,
      loanPenalty
    }
  };
}
