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
    globalState: { temperature: number; oxygen: number; oceansPlaced: number },
    difficulty: 'easy' | 'normal' | 'hard' = 'normal'
  ): TMAIDecision {
    // 🟢 Easy 모드: 35% 확률로 의도적으로 패스하여 초보자가 편하게 맵을 개척하고 테스트하도록 배려
    if (difficulty === 'easy' && Math.random() < 0.35) {
      return { action: 'pass' };
    }

    // 1. 식물 ➔ 녹지 전환 (에코라인 7개, 일반 8개)
    const plantReq = ai.corporation.id === 'corp_ecoline' ? 7 : 8;
    if (ai.resources.plants >= plantReq) {
      const emptySlots = mapSlots.filter(s => s.tileType === 'empty' && !s.isOceanSlot);
      if (emptySlots.length > 0) {
        // Hard 모드: 주변에 도시가 있는 최적의 슬롯 선택
        const chosenSlot = difficulty === 'hard'
          ? (emptySlots.find(s => mapSlots.some(other => other.tileType === 'city' && Math.abs(other.q - s.q) <= 1 && Math.abs(other.r - s.r) <= 1)) || emptySlots[0])
          : emptySlots[0];
        return { action: 'convert_plants', slotId: chosenSlot.id };
      }
    }

    // 2. 열 8개 ➔ 온도 상승 전환
    if (ai.resources.heat >= 8 && globalState.temperature < 8) {
      return { action: 'convert_heat' };
    }

    // 3. 프로젝트 카드 플레이: 사용 가능한 카드 중 우선순위 평가
    const playableCards: { card: any; score: number; targetSlotId?: string }[] = [];

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

        let score = card.victoryPoints * 2;
        if (card.effects.productionChange) score += 3;
        if (card.effects.tempSteps || card.effects.oxygenSteps || card.effects.oceanCount) score += 4;

        playableCards.push({ card, score, targetSlotId });
      }
    }

    if (playableCards.length > 0) {
      if (difficulty === 'hard') {
        // Hard: 최고 가치 카드 우선
        playableCards.sort((a, b) => b.score - a.score);
        return { action: 'play_card', cardId: playableCards[0].card.id, slotId: playableCards[0].targetSlotId };
      } else if (difficulty === 'normal') {
        return { action: 'play_card', cardId: playableCards[0].card.id, slotId: playableCards[0].targetSlotId };
      } else {
        // Easy: 50% 확률로만 카드 플레이
        if (Math.random() < 0.5) {
          return { action: 'play_card', cardId: playableCards[0].card.id, slotId: playableCards[0].targetSlotId };
        }
      }
    }

    // 4. 표준 프로젝트
    if (difficulty !== 'easy') {
      if (ai.resources.megacredits >= 25 && difficulty === 'hard') {
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
    }

    // 5. 할 수 있는 행동이 없으면 패스
    return { action: 'pass' };
  }
}
