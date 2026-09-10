import type { 
  BuildingDef, 
  GoodType, 
  PlantationType, 
  PlayerState 
} from '../types';
import { BUILDINGS_CATALOG } from '../data/buildings';

export function calculateBuildingCost(building: BuildingDef, player: PlayerState, hasBuilderPrivilege: boolean): number {
  // 작동 중인 채석장 수 계산
  const activeQuarries = player.plantations.filter(p => p.type === 'quarry' && p.hasColonist).length;
  const discountFromQuarry = Math.min(activeQuarries, building.quarryDiscountMax);
  const privilegeDiscount = hasBuilderPrivilege ? 1 : 0;
  
  const totalCost = building.cost - discountFromQuarry - privilegeDiscount;
  return Math.max(0, totalCost);
}

export function hasBuilding(player: PlayerState, buildingId: string, mustBeActive = true): boolean {
  const b = player.buildings.find(item => item.buildingId === buildingId);
  if (!b) return false;
  if (!mustBeActive) return true;
  return b.colonists > 0;
}

export function calculateProduction(player: PlayerState): Record<GoodType, number> {
  const activePlantations = (type: GoodType) => 
    player.plantations.filter(p => p.type === type && p.hasColonist).length;

  // 옥수수는 생산 건물이 필요 없음
  const corn = activePlantations('corn');

  // 기타 작물은 생산 건물의 일꾼 수와 농장 수의 최솟값
  const getCapacity = (smallId: string, largeId: string) => {
    const small = player.buildings.find(b => b.buildingId === smallId)?.colonists || 0;
    const large = player.buildings.find(b => b.buildingId === largeId)?.colonists || 0;
    return small + large;
  };

  const indigo = Math.min(activePlantations('indigo'), getCapacity('small_indigo', 'large_indigo'));
  const sugar = Math.min(activePlantations('sugar'), getCapacity('small_sugar', 'large_sugar'));
  const tobacco = Math.min(activePlantations('tobacco'), getCapacity('tobacco_storage', ''));
  const coffee = Math.min(activePlantations('coffee'), getCapacity('coffee_roaster', ''));

  return { corn, indigo, sugar, tobacco, coffee };
}

export function calculateFinalScore(player: PlayerState): { total: number; breakdown: { vpChips: number; buildings: number; bonus: number } } {
  const vpChips = player.vpChips;
  
  let buildingVp = 0;
  player.buildings.forEach(pb => {
    const def = BUILDINGS_CATALOG.find(b => b.id === pb.buildingId);
    if (def) buildingVp += def.vp;
  });

  // 대형 건물 보너스 점수 (일꾼이 배치되어 활성화된 상태여야 함)
  let bonus = 0;

  // 1. Guild Hall: 소형 생산건물당 1점, 대형 생산건물당 2점
  if (hasBuilding(player, 'guild_hall')) {
    player.buildings.forEach(pb => {
      if (['small_indigo', 'small_sugar'].includes(pb.buildingId)) bonus += 1;
      if (['large_indigo', 'large_sugar', 'tobacco_storage', 'coffee_roaster'].includes(pb.buildingId)) bonus += 2;
    });
  }

  // 2. Residence: 9개 이하=4, 10개=5, 11개=6, 12개=7
  if (hasBuilding(player, 'residence')) {
    const count = player.plantations.length;
    if (count <= 9) bonus += 4;
    else if (count === 10) bonus += 5;
    else if (count === 11) bonus += 6;
    else if (count >= 12) bonus += 7;
  }

  // 3. Fortress: 일꾼 3명당 1점
  if (hasBuilding(player, 'fortress')) {
    const totalColonists = player.unassignedColonists + 
      player.plantations.filter(p => p.hasColonist).length + 
      player.buildings.reduce((sum, b) => sum + b.colonists, 0);
    bonus += Math.floor(totalColonists / 3);
  }

  // 4. Customs House: VP 칩 4개당 1점
  if (hasBuilding(player, 'customs_house')) {
    bonus += Math.floor(player.vpChips / 4);
  }

  // 5. City Hall: 보라색 건물당 1점 (대형 건물 제외한 violet 건물)
  if (hasBuilding(player, 'city_hall')) {
    player.buildings.forEach(pb => {
      const def = BUILDINGS_CATALOG.find(b => b.id === pb.buildingId);
      if (def && def.category === 'violet') bonus += 1;
    });
  }

  return {
    total: vpChips + buildingVp + bonus,
    breakdown: {
      vpChips,
      buildings: buildingVp,
      bonus
    }
  };
}

export function generateInitialPlantationDeck(): PlantationType[] {
  // 표준 덱 구성: 옥수수 10, 인디고 12, 설탕 11, 담배 9, 커피 8
  const deck: PlantationType[] = [
    ...Array(10).fill('corn'),
    ...Array(12).fill('indigo'),
    ...Array(11).fill('sugar'),
    ...Array(9).fill('tobacco'),
    ...Array(8).fill('coffee')
  ];
  // 셔플
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
