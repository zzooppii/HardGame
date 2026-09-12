import type { PlayerBurgundy, HexTile, BurgundyPhase } from '../types';
import { canPlaceTileOnSlot } from './gameLogic';

export interface AIActionDecision {
  type: 'place_tile' | 'take_tile' | 'sell_goods' | 'take_workers';
  dieIndex: 0 | 1;
  dieValue: number;
  tileIndexInKeySlots?: number;
  targetSlotId?: number;
  depotNumber?: number;
  workersToUse?: number;
  description: string;
}

export class BurgundyAI {
  /** AI의 이번 턴 최고 최적 액션 1개 결정 */
  public static decideAction(
    player: PlayerBurgundy,
    centralDepots: Record<number, HexTile[]>,
    _currentPhase: BurgundyPhase,
    difficulty: 'easy' | 'normal' | 'hard' = 'normal'
  ): AIActionDecision | null {
    const availableDiceIndices: (0 | 1)[] = [];
    if (!player.usedDice[0]) availableDiceIndices.push(0);
    if (!player.usedDice[1]) availableDiceIndices.push(1);

    if (availableDiceIndices.length === 0) return null;

    // 첫 번째 가용 주사위 기준 판단
    const dieIndex = availableDiceIndices[0];
    const dieValue = player.dice[dieIndex];

    // 🟢 Easy(초보자) 모드: 35% 확률로 여유롭게 일꾼 획득 또는 상품 판매를 하여 초보자가 타일을 선점할 수 있도록 배려
    if (difficulty === 'easy' && Math.random() < 0.35) {
      const matchingGoods = player.goods.filter(g => g.dieNumber === dieValue);
      if (matchingGoods.length > 0) {
        return {
          type: 'sell_goods',
          dieIndex,
          dieValue,
          workersToUse: 0,
          description: `${player.name}님이 주사위 [${dieValue}]을 사용하여 ${matchingGoods[0].name} 상품을 판매합니다.`
        };
      }
      return {
        type: 'take_workers',
        dieIndex,
        dieValue,
        workersToUse: 0,
        description: `${player.name}님이 주사위 [${dieValue}]을 사용하여 일꾼 토큰 2개를 영입합니다.`
      };
    }

    // 1. 보관소 타일을 영지에 배치할 수 있는가?
    for (let kIdx = 0; kIdx < player.keySlots.length; kIdx++) {
      const tile = player.keySlots[kIdx];
      if (!tile) continue;

      for (const slot of player.duchy) {
        const check = canPlaceTileOnSlot(player, tile, slot, dieValue, player.workers);
        if (check.valid) {
          return {
            type: 'place_tile',
            dieIndex,
            dieValue,
            tileIndexInKeySlots: kIdx,
            targetSlotId: slot.id,
            workersToUse: check.requiredWorkers,
            description: `${player.name}님이 주사위 [${dieValue}]${check.requiredWorkers > 0 ? ` (+일꾼 ${check.requiredWorkers}개)` : ''}을 사용하여 [${tile.name}]을(를) 영지에 배치합니다.`
          };
        }
      }
    }

    // 2. 보관소에 빈칸이 있고 중앙 디포(해당 주사위 번호)에 타일이 있는가?
    const hasEmptyKeySlot = player.keySlots.some(s => s === null);
    if (hasEmptyKeySlot) {
      const depotTiles = centralDepots[dieValue] || [];
      if (depotTiles.length > 0) {
        const chosenTile = depotTiles[0];
        return {
          type: 'take_tile',
          dieIndex,
          dieValue,
          depotNumber: dieValue,
          workersToUse: 0,
          description: `${player.name}님이 주사위 [${dieValue}]을 사용하여 ${dieValue}번 디포에서 [${chosenTile.name}] 타일을 가져옵니다.`
        };
      }
    }

    // 3. 상품 판매 가능 여부
    const matchingGoods = player.goods.filter(g => g.dieNumber === dieValue);
    if (matchingGoods.length > 0) {
      return {
        type: 'sell_goods',
        dieIndex,
        dieValue,
        workersToUse: 0,
        description: `${player.name}님이 주사위 [${dieValue}]을 사용하여 ${matchingGoods[0].name} 상품을 판매합니다.`
      };
    }

    // 4. 기본 액션: 일꾼 2개 영입
    return {
      type: 'take_workers',
      dieIndex,
      dieValue,
      workersToUse: 0,
      description: `${player.name}님이 주사위 [${dieValue}]을 사용하여 일꾼 토큰 2개를 영입합니다.`
    };
  }
}
