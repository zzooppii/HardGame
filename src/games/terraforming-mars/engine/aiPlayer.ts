import type { PlayerTM, HexSlot } from '../types';
import { canPlayCard } from './gameLogic';

export type TMAIDecision = 
  | { action: 'convert_plants'; slotId: string }
  | { action: 'convert_heat' }
  | { action: 'play_card'; cardId: string; slotId?: string }
  | { action: 'standard_project'; projectType: 'greenery' | 'city' | 'asteroid' | 'ocean' | 'power'; slotId?: string }
  | { action: 'pass' };

export class TerraformingMarsAI {
  public static decideAction(
    ai: PlayerTM,
    mapSlots: HexSlot[],
    globalState: { temperature: number; oxygen: number; oceansPlaced: number }
  ): TMAIDecision {
    // 1. 식물 ➔ 녹지 전환 (에코라인 7개, 일반 8개)
    const plantReq = ai.corporation.id === 'corp_ecoline' ? 7 : 8;
    if (ai.resources.plants >= plantReq) {
      const emptySlot = mapSlots.find(s => s.tileType === 'empty' && !s.isOceanSlot);
      if (emptySlot) {
        return { action: 'convert_plants', slotId: emptySlot.id };
      }
    }

    // 2. 열 8개 ➔ 온도 상승 전환
    if (ai.resources.heat >= 8 && globalState.temperature < 8) {
      return { action: 'convert_heat' };
    }

    // 3. 사용 가능한 프로젝트 카드 플레이
    for (const card of ai.hand) {
      const check = canPlayCard(ai, card, globalState);
      if (check.canPlay) {
        let targetSlotId: string | undefined = undefined;
        if (card.effects.placeTile === 'greenery' || card.effects.placeTile === 'city') {
          const emptySlot = mapSlots.find(s => s.tileType === 'empty' && !s.isOceanSlot);
          targetSlotId = emptySlot?.id;
        } else if (card.effects.oceanCount) {
          const emptyOcean = mapSlots.find(s => s.tileType === 'empty' && s.isOceanSlot);
          targetSlotId = emptyOcean?.id;
        }

        return { action: 'play_card', cardId: card.id, slotId: targetSlotId };
      }
    }

    // 4. 표준 프로젝트 (자금이 풍부할 때)
    if (ai.resources.megacredits >= 25) {
      const emptySlot = mapSlots.find(s => s.tileType === 'empty' && !s.isOceanSlot);
      if (emptySlot) {
        return { action: 'standard_project', projectType: 'city', slotId: emptySlot.id };
      }
    } else if (ai.resources.megacredits >= 23 && globalState.oxygen < 14) {
      const emptySlot = mapSlots.find(s => s.tileType === 'empty' && !s.isOceanSlot);
      if (emptySlot) {
        return { action: 'standard_project', projectType: 'greenery', slotId: emptySlot.id };
      }
    } else if (ai.resources.megacredits >= 18 && globalState.oceansPlaced < 9) {
      const emptyOcean = mapSlots.find(s => s.tileType === 'empty' && s.isOceanSlot);
      if (emptyOcean) {
        return { action: 'standard_project', projectType: 'ocean', slotId: emptyOcean.id };
      }
    }

    // 5. 할 수 있는 행동이 없으면 패스
    return { action: 'pass' };
  }
}
