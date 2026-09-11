import type { PlayerBurgundy, HexTile, DuchySlot, BurgundyPhase, GoodsTile } from '../types';
import { areSlotsAdjacent } from '../data/boardLayout';
import { REGION_SIZE_SCORES, PHASE_COMPLETION_BONUS } from '../data/tiles';

/** 일꾼 토큰을 사용하여 주사위 눈금을 목표 눈금으로 맞출 수 있는지 계산 */
export function getRequiredWorkers(dieRoll: number, targetDie: number): number {
  if (dieRoll === targetDie) return 0;
  // 일반적인 차이
  const diffDirect = Math.abs(dieRoll - targetDie);
  // 1과 6이 순환하는 경우의 차이
  const diffWrap = 6 - diffDirect;
  return Math.min(diffDirect, diffWrap);
}

/** 특정 슬롯에 타일을 배치할 수 있는지 검사 */
export function canPlaceTileOnSlot(
  player: PlayerBurgundy,
  tile: HexTile,
  slot: DuchySlot,
  dieValue: number,
  availableWorkers: number
): { valid: boolean; requiredWorkers: number; reason?: string } {
  // 1. 이미 타일이 놓인 슬롯인지 확인
  if (slot.placedTile !== null) {
    return { valid: false, requiredWorkers: 0, reason: '이미 타일이 배치된 슬롯입니다.' };
  }

  // 2. 타일 카테고리와 슬롯 카테고리 일치 확인
  if (tile.category !== slot.category) {
    return { valid: false, requiredWorkers: 0, reason: `타일 색상(${tile.category})과 슬롯 색상(${slot.category})이 일치하지 않습니다.` };
  }

  // 3. 주사위 눈금 검증 및 필요한 일꾼 수 계산
  const neededWorkers = getRequiredWorkers(dieValue, slot.dieNumber);
  if (neededWorkers > availableWorkers) {
    return { valid: false, requiredWorkers: neededWorkers, reason: `주사위 눈금을 맞추기에 일꾼이 부족합니다 (필요: ${neededWorkers}개, 보유: ${availableWorkers}개).` };
  }

  // 4. 인접성 검사: 이미 배치된 기존 타일 중 최소 1개와 인접해야 함
  const hasAdjacentPlacedTile = player.duchy.some(other => 
    other.placedTile !== null && areSlotsAdjacent(slot, other)
  );

  if (!hasAdjacentPlacedTile) {
    return { valid: false, requiredWorkers: neededWorkers, reason: '기존에 배치된 타일과 인접한 슬롯에만 배치할 수 있습니다.' };
  }

  return { valid: true, requiredWorkers: neededWorkers };
}

/** 타일 배치 실행 및 즉발 효과 & 구역 완성 점수 처리 결과 */
export interface PlacementResult {
  updatedPlayer: PlayerBurgundy;
  vpGained: number;
  message: string;
  extraTurnGranted?: boolean;
}

export function executeTilePlacement(
  player: PlayerBurgundy,
  tile: HexTile,
  slotId: number,
  currentPhase: BurgundyPhase
): PlacementResult {
  const updatedDuchy = player.duchy.map(s => {
    if (s.id === slotId) {
      return { ...s, placedTile: tile };
    }
    return s;
  });

  const targetSlot = updatedDuchy.find(s => s.id === slotId)!;
  let vpGained = 0;
  let extraTurn = false;
  const messages: string[] = [`[${tile.name}] 영지 배치 완료`];

  let silverlings = player.silverlings;
  let workers = player.workers;
  let turnOrderPos = player.turnOrderPos;

  // 1. 타일별 즉발 효과
  if (tile.category === 'castle') {
    extraTurn = true;
    messages.push('🏰 성 건설 효과: 추가 무료 행동 1회 획득!');
  } else if (tile.category === 'ship') {
    turnOrderPos += 1;
    messages.push('🚢 선박 입항 효과: 턴 순서 1칸 전진!');
  } else if (tile.category === 'pasture' && tile.animalType && tile.animalCount) {
    // 같은 구역(regionId) 내 동일 동물 합산 점수
    const sameRegionAnimalSlots = updatedDuchy.filter(
      s => s.regionId === targetSlot.regionId && 
           s.placedTile?.category === 'pasture' && 
           s.placedTile.animalType === tile.animalType
    );
    let totalAnimalsInPasture = 0;
    sameRegionAnimalSlots.forEach(s => {
      totalAnimalsInPasture += s.placedTile?.animalCount || 0;
    });
    vpGained += totalAnimalsInPasture;
    messages.push(`🐑 목장 가축 합산: +${totalAnimalsInPasture} 승점 획득!`);
  } else if (tile.category === 'city' && tile.buildingType) {
    switch (tile.buildingType) {
      case 'bank':
        silverlings += 2;
        messages.push('🏦 은행 효과: 은화 +2개 획득');
        break;
      case 'boarding_house':
        workers += 4;
        messages.push('🏨 여관 효과: 일꾼 +4개 획득');
        break;
      case 'watchtower':
        vpGained += 4;
        messages.push('🗼 감시탑 효과: +4 승점 획득');
        break;
      default:
        break;
    }
  }

  // 2. 구역(Region) 완성 체크
  const regionSlots = updatedDuchy.filter(s => s.regionId === targetSlot.regionId);
  const isRegionFullyCompleted = regionSlots.every(s => s.placedTile !== null);

  if (isRegionFullyCompleted) {
    const regionSize = regionSlots.length;
    const sizeScore = REGION_SIZE_SCORES[regionSize] || regionSize * 2;
    const phaseBonus = PHASE_COMPLETION_BONUS[currentPhase] || 2;
    const completionTotal = sizeScore + phaseBonus;

    vpGained += completionTotal;
    messages.push(`🎉 [구역 완공!] ${regionSize}칸 구역 점수(${sizeScore}점) + ${currentPhase}페이즈 보너스(${phaseBonus}점) = +${completionTotal}점!`);
  }

  const updatedPlayer: PlayerBurgundy = {
    ...player,
    duchy: updatedDuchy,
    vp: player.vp + vpGained,
    silverlings,
    workers,
    turnOrderPos
  };

  return {
    updatedPlayer,
    vpGained,
    message: messages.join(' | '),
    extraTurnGranted: extraTurn
  };
}

/** 상품 판매 실행 */
export function executeGoodsSale(
  player: PlayerBurgundy,
  dieNumber: number
): { updatedPlayer: PlayerBurgundy; goodsSold: GoodsTile[]; vpGained: number; silverGained: number } {
  const matchingGoods = player.goods.filter(g => g.dieNumber === dieNumber);
  if (matchingGoods.length === 0) {
    return { updatedPlayer: player, goodsSold: [], vpGained: 0, silverGained: 0 };
  }

  const count = matchingGoods.length;
  // 상품 1묶음 판매 시: 은화 1개 + (개수 * 2~3 승점)
  const silverGained = 1;
  const vpGained = count * 3;

  const remainingGoods = player.goods.filter(g => g.dieNumber !== dieNumber);

  return {
    updatedPlayer: {
      ...player,
      goods: remainingGoods,
      silverlings: player.silverlings + silverGained,
      vp: player.vp + vpGained,
      soldGoodsCount: player.soldGoodsCount + count
    },
    goodsSold: matchingGoods,
    vpGained,
    silverGained
  };
}

/** 최종 점수 정산 (게임 종료 시) */
export function calculateFinalScore(player: PlayerBurgundy): { total: number; breakdown: Record<string, number> } {
  const baseVp = player.vp;
  const leftoverSilverVp = player.silverlings; // 은화 1개당 1점
  const leftoverWorkerVp = Math.floor(player.workers / 2); // 일꾼 2개당 1점
  const leftoverGoodsVp = player.goods.length; // 남은 상품 1개당 1점

  // 지식 타일 엔드게임 보너스
  let knowledgeBonus = 0;
  const knowledgeTiles = player.duchy.filter(s => s.placedTile?.category === 'monastery');
  knowledgeTiles.forEach(kt => {
    const kid = kt.placedTile?.knowledgeId;
    if (kid === 5) {
      // 건물당 1점
      const bldgCount = player.duchy.filter(s => s.placedTile?.category === 'city').length;
      knowledgeBonus += bldgCount;
    } else if (kid === 6) {
      // 완성된 구역당 2점
      const uniqueRegions = Array.from(new Set(player.duchy.map(s => s.regionId)));
      const completedCount = uniqueRegions.filter(rid => 
        player.duchy.filter(s => s.regionId === rid).every(s => s.placedTile !== null)
      ).length;
      knowledgeBonus += completedCount * 2;
    }
  });

  const total = baseVp + leftoverSilverVp + leftoverWorkerVp + leftoverGoodsVp + knowledgeBonus;

  return {
    total,
    breakdown: {
      inGameVp: baseVp,
      silver: leftoverSilverVp,
      workers: leftoverWorkerVp,
      goods: leftoverGoodsVp,
      knowledge: knowledgeBonus
    }
  };
}
