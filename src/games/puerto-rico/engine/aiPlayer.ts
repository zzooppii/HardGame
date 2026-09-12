import type { 
  AIDifficulty,
  GoodType, 
  PlantationType, 
  PlayerState, 
  PuertoRicoGameState, 
  RoleType 
} from '../types';
import { BUILDINGS_CATALOG, GOODS_DATA } from '../data/buildings';
import { calculateBuildingCost, calculateProduction, hasBuilding } from './gameLogic';

export class PuertoRicoAI {
  /**
   * AI가 역할을 선택합니다. 난이도(easy, normal, hard)에 따라 지능이 달라집니다.
   */
  static selectRole(
    state: PuertoRicoGameState, 
    aiPlayer: PlayerState, 
    difficulty: AIDifficulty = 'normal'
  ): RoleType {
    const availableRoles = state.roleCards
      .filter(rc => rc.selectedByPlayerId === null)
      .map(rc => rc.role);

    if (availableRoles.length === 0) return 'settler';

    // 초보 난이도: 40% 확률로 단순 선호나 무작위 선택(초보적 실수)
    if (difficulty === 'easy') {
      if (Math.random() < 0.4) {
        const randomRole = availableRoles[Math.floor(Math.random() * availableRoles.length)];
        return randomRole;
      }
    }

    // 1. 각 역할별 점수 평가
    let bestRole = availableRoles[0];
    let maxScore = -999;

    const myProd = calculateProduction(aiPlayer);
    const totalGoods = Object.values(aiPlayer.goods).reduce((a, b) => a + b, 0);

    for (const role of availableRoles) {
      const card = state.roleCards.find(rc => rc.role === role);
      const bonusDoubloons = card ? card.doubloons : 0;
      let score = bonusDoubloons * 2.5; // 쌓인 돈은 큰 가중치

      switch (role) {
        case 'trader': {
          const sellableGoods = (['coffee', 'tobacco', 'sugar', 'indigo', 'corn'] as GoodType[]).filter(g => {
            if (aiPlayer.goods[g] <= 0) return false;
            const officeActive = hasBuilding(aiPlayer, 'office');
            if (!officeActive && state.tradingHouse.includes(g)) return false;
            return state.tradingHouse.length < 4;
          });
          if (sellableGoods.length > 0) {
            const bestGood = sellableGoods[0];
            score += GOODS_DATA[bestGood].basePrice * 2 + 5;
          }
          break;
        }

        case 'captain': {
          if (totalGoods > 0) {
            score += totalGoods * 2 + 3;
          }
          break;
        }

        case 'craftsman': {
          const wouldProduce = Object.values(myProd).reduce((a, b) => a + b, 0);
          score += wouldProduce * 3;
          break;
        }

        case 'builder': {
          const affordableBuildings = BUILDINGS_CATALOG.filter(b => {
            if (aiPlayer.buildings.some(pb => pb.buildingId === b.id)) return false;
            const cost = calculateBuildingCost(b, aiPlayer, true);
            return cost <= aiPlayer.doubloons;
          });
          if (affordableBuildings.length > 0) {
            score += 4 + Math.max(...affordableBuildings.map(b => b.vp));
          }
          break;
        }

        case 'mayor': {
          const emptySlots = this.countEmptySlots(aiPlayer);
          if (emptySlots >= 2) {
            score += emptySlots * 2;
          }
          break;
        }

        case 'settler': {
          if (aiPlayer.plantations.length < 12) {
            score += 3;
            if (state.quarrySupply > 0) score += 2;
          }
          break;
        }

        case 'prospector': {
          score += 3;
          break;
        }
      }

      // 초보/중급 난이도 노이즈 주입
      if (difficulty === 'easy') {
        score += (Math.random() - 0.5) * 14;
      } else if (difficulty === 'normal') {
        score += (Math.random() - 0.5) * 4;
      }

      if (score > maxScore) {
        maxScore = score;
        bestRole = role;
      }
    }

    return bestRole;
  }

  /**
   * 개척자: 농장 또는 채석장 선택
   */
  static choosePlantation(
    state: PuertoRicoGameState, 
    aiPlayer: PlayerState, 
    canTakeQuarry: boolean,
    difficulty: AIDifficulty = 'normal'
  ): PlantationType | null {
    if (aiPlayer.plantations.length >= 12) return null;

    // 초보 난이도: 채석장의 중요성을 모르고 75% 확률로 눈앞의 아무 농장이나 가져감
    if (difficulty === 'easy') {
      if (canTakeQuarry && state.quarrySupply > 0 && Math.random() < 0.25) {
        return 'quarry';
      }
      if (state.plantationMarket.length > 0) {
        const randomIdx = Math.floor(Math.random() * state.plantationMarket.length);
        return state.plantationMarket[randomIdx];
      }
    }

    // 보통/어려움 난이도: 채석장 우선
    const currentQuarries = aiPlayer.plantations.filter(p => p.type === 'quarry').length;
    const maxQuarries = difficulty === 'hard' ? 3 : 2;
    if (canTakeQuarry && state.quarrySupply > 0 && currentQuarries < maxQuarries) {
      return 'quarry';
    }

    // 오픈된 농장 중 우선순위 (커피 > 담배 > 옥수수 > 설탕 > 인디고)
    const priority: PlantationType[] = ['coffee', 'tobacco', 'corn', 'sugar', 'indigo'];
    for (const pType of priority) {
      if (state.plantationMarket.includes(pType)) {
        return pType;
      }
    }

    return state.plantationMarket[0] || null;
  }

  /**
   * 건축가: 건설할 건물 선택
   */
  static chooseBuilding(
    _state: PuertoRicoGameState, 
    aiPlayer: PlayerState, 
    hasPrivilege: boolean,
    difficulty: AIDifficulty = 'normal'
  ): string | null {
    if (aiPlayer.buildings.length >= 12) return null;

    // 초보 난이도: 25% 확률로 돈이 있어도 패스
    if (difficulty === 'easy' && Math.random() < 0.25) {
      return null;
    }

    const affordable = BUILDINGS_CATALOG.filter(b => {
      if (aiPlayer.buildings.some(pb => pb.buildingId === b.id)) return false;
      const cost = calculateBuildingCost(b, aiPlayer, hasPrivilege);
      return cost <= aiPlayer.doubloons;
    });

    if (affordable.length === 0) return null;

    // 초보 난이도: 생산 시설 매칭을 생각 못하고 가장 저렴한 1~2원짜리 건물을 충동 구매
    if (difficulty === 'easy') {
      affordable.sort((a, b) => a.cost - b.cost);
      return affordable[0].id;
    }

    const plantTypes = aiPlayer.plantations.map(p => p.type);

    affordable.sort((a, b) => {
      let scoreA = a.vp;
      let scoreB = b.vp;

      // 자신이 가진 농장에 대응하는 공장 가산점
      if (a.goodType && plantTypes.includes(a.goodType)) scoreA += 4;
      if (b.goodType && plantTypes.includes(b.goodType)) scoreB += 4;

      // 보라색 핵심 건물 가산점
      if (['small_market', 'office', 'harbor', 'factory'].includes(a.id)) scoreA += 3;
      if (['small_market', 'office', 'harbor', 'factory'].includes(b.id)) scoreB += 3;

      // 대형 승점 건물 가산점
      if (difficulty === 'hard') {
        if (a.category === 'large') scoreA += 6;
        if (b.category === 'large') scoreB += 6;
      }

      return scoreB - scoreA;
    });

    return affordable[0].id;
  }

  /**
   * 상인: 판매할 상품 선택
   */
  static chooseGoodToTrade(
    state: PuertoRicoGameState, 
    aiPlayer: PlayerState,
    difficulty: AIDifficulty = 'normal'
  ): GoodType | null {
    if (state.tradingHouse.length >= 4) return null;
    const officeActive = hasBuilding(aiPlayer, 'office');

    // 초보 난이도: 가장 싼 옥수수나 인디고를 먼저 팔아버리는 실수!
    if (difficulty === 'easy') {
      const cheapOrder: GoodType[] = ['corn', 'indigo', 'sugar', 'tobacco', 'coffee'];
      for (const g of cheapOrder) {
        if (aiPlayer.goods[g] > 0) {
          if (officeActive || !state.tradingHouse.includes(g)) {
            return g;
          }
        }
      }
      return null;
    }

    // 보통/어려움: 비싼 상품 순으로 정렬
    const goodsInOrder: GoodType[] = ['coffee', 'tobacco', 'sugar', 'indigo', 'corn'];
    for (const g of goodsInOrder) {
      if (aiPlayer.goods[g] > 0) {
        if (officeActive || !state.tradingHouse.includes(g)) {
          return g;
        }
      }
    }
    return null;
  }

  /**
   * 선장: 선적할 상품 및 배 선택
   */
  static chooseShippingAction(
    state: PuertoRicoGameState, 
    aiPlayer: PlayerState,
    difficulty: AIDifficulty = 'normal'
  ): { shipIndex: number; goodType: GoodType } | null {
    const goodsOrder: GoodType[] = difficulty === 'easy'
      ? ['corn', 'indigo', 'sugar', 'tobacco', 'coffee'] // 초보는 저가 작물부터 비효율적으로 선적
      : ['coffee', 'tobacco', 'sugar', 'indigo', 'corn'];

    for (const good of goodsOrder) {
      if (aiPlayer.goods[good] <= 0) continue;

      for (let i = 0; i < state.cargoShips.length; i++) {
        const ship = state.cargoShips[i];
        const canShipToThis = 
          (ship.goodType === good && ship.loaded < ship.capacity) ||
          (ship.goodType === null && !state.cargoShips.some(s => s.goodType === good));

        if (canShipToThis) {
          return { shipIndex: i, goodType: good };
        }
      }
    }

    return null;
  }

  /**
   * 시장: 일꾼 최적 자동 배치 (난이도에 따라 실수 발생)
   */
  static autoAssignColonists(
    player: PlayerState,
    difficulty: AIDifficulty = 'normal'
  ): {
    plantations: { id: string; hasColonist: boolean }[];
    buildings: { buildingId: string; colonists: number }[];
    unassigned: number;
  } {
    let pool = player.unassignedColonists + 
      player.plantations.filter(p => p.hasColonist).length + 
      player.buildings.reduce((sum, b) => sum + b.colonists, 0);

    const newPlantations = player.plantations.map(p => ({ id: p.id, hasColonist: false }));
    const newBuildings = player.buildings.map(b => ({ buildingId: b.buildingId, colonists: 0 }));

    // 초보 난이도: 1:1 완벽 페어링을 못하고 농장에만 일꾼을 채우고 공장을 비워두는 실수
    if (difficulty === 'easy') {
      for (let i = 0; i < player.plantations.length; i++) {
        if (pool > 0) {
          newPlantations[i].hasColonist = true;
          pool--;
        }
      }
      for (const b of newBuildings) {
        if (pool > 0) {
          b.colonists = 1;
          pool--;
        }
      }
      return {
        plantations: newPlantations,
        buildings: newBuildings,
        unassigned: pool
      };
    }

    // 1. 옥수수 농장에 우선 배치 (공장 필요없이 즉시 생산 가능)
    for (let i = 0; i < player.plantations.length; i++) {
      if (pool > 0 && player.plantations[i].type === 'corn') {
        newPlantations[i].hasColonist = true;
        pool--;
      }
    }

    // 2. 채석장에 배치 (건축 할인)
    for (let i = 0; i < player.plantations.length; i++) {
      if (pool > 0 && player.plantations[i].type === 'quarry') {
        newPlantations[i].hasColonist = true;
        pool--;
      }
    }

    // 3. 생산 건물 및 해당 농장 쌍으로 배치
    for (const b of newBuildings) {
      const def = BUILDINGS_CATALOG.find(x => x.id === b.buildingId);
      if (def && def.goodType) {
        const matchingPlants = player.plantations
          .map((p, idx) => ({ ...p, originalIdx: idx }))
          .filter(p => p.type === def.goodType && !newPlantations[p.originalIdx].hasColonist);

        const assignAmount = Math.min(pool, def.maxColonists, matchingPlants.length);
        b.colonists = assignAmount;
        pool -= assignAmount;

        for (let k = 0; k < assignAmount; k++) {
          newPlantations[matchingPlants[k].originalIdx].hasColonist = true;
        }
      }
    }

    // 4. 보라색 특수 건물 및 대형 건물에 배치
    for (const b of newBuildings) {
      if (pool > 0 && b.colonists === 0) {
        b.colonists = 1;
        pool--;
      }
    }

    // 5. 남은 일꾼이 있으면 나머지 농장에 채우기
    for (let i = 0; i < newPlantations.length; i++) {
      if (pool > 0 && !newPlantations[i].hasColonist) {
        newPlantations[i].hasColonist = true;
        pool--;
      }
    }

    return {
      plantations: newPlantations,
      buildings: newBuildings,
      unassigned: pool
    };
  }

  private static countEmptySlots(player: PlayerState): number {
    const emptyPlants = player.plantations.filter(p => !p.hasColonist).length;
    const emptyBuildings = player.buildings.reduce((sum, pb) => {
      const def = BUILDINGS_CATALOG.find(b => b.id === pb.buildingId);
      return sum + ((def?.maxColonists || 1) - pb.colonists);
    }, 0);
    return emptyPlants + emptyBuildings;
  }
}
