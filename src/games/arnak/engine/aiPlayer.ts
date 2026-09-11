import type { PlayerArnak, DigSite, ArnakCard } from '../types';
import { canAdvanceResearch, canDefeatGuardian } from './gameLogic';

export type AIDecision = 
  | { action: 'research'; tokenType: 'glass' | 'book' }
  | { action: 'place_worker'; siteId: string }
  | { action: 'play_card'; cardId: string }
  | { action: 'buy_card'; cardId: string; cardType: 'item' | 'artifact' }
  | { action: 'defeat_guardian'; siteId: string }
  | { action: 'pass' };

export class ArnakAI {
  public static decideAction(
    ai: PlayerArnak,
    sites: DigSite[],
    itemMarket: ArnakCard[],
    artifactMarket: ArnakCard[]
  ): AIDecision {
    // 1. 연구 트랙 전진 시도 (돋보기 우선, 그다음 수첩)
    const canGlass = canAdvanceResearch(ai, 'glass');
    if (canGlass.canAdvance) {
      return { action: 'research', tokenType: 'glass' };
    }

    const canBook = canAdvanceResearch(ai, 'book');
    if (canBook.canAdvance) {
      return { action: 'research', tokenType: 'book' };
    }

    // 2. 자신이 위치한 유적지의 수호자 제압 시도 (공포 회피)
    for (const arc of ai.archaeologists) {
      if (arc.placedSiteId) {
        const mySite = sites.find(s => s.id === arc.placedSiteId);
        if (mySite && mySite.guardian && !mySite.guardian.isDefeated) {
          if (canDefeatGuardian(ai, mySite.guardian)) {
            return { action: 'defeat_guardian', siteId: mySite.id };
          }
        }
      }
    }

    // 3. 미배치 고고학자 일꾼이 있는 경우 발굴지 탐험
    const availableWorker = ai.archaeologists.find(a => !a.isPlaced);
    if (availableWorker) {
      // 3-1. 미발굴 1티어 유적지 (나침반 3개 이상 보유 시)
      if (ai.resources.compasses >= 3) {
        const undiscovered1 = sites.find(s => !s.isDiscovered && s.level === 1 && s.occupiedByPlayerId === null);
        if (undiscovered1) {
          return { action: 'place_worker', siteId: undiscovered1.id };
        }
      }

      // 3-2. 이미 발굴된 유적지나 기본 캠프지 중 비어있는 곳 탐색
      const emptySites = sites.filter(s => s.isDiscovered && s.occupiedByPlayerId === null);
      if (emptySites.length > 0) {
        // 자원 가치 우선순위: 나침반 > 석판 > 코인 > 화살촉
        const targetSite = emptySites.sort((a, b) => {
          const scoreA = (a.rewards.rubies || 0) * 4 + (a.rewards.compasses || 0) * 2 + (a.rewards.tablets || 0) * 2;
          const scoreB = (b.rewards.rubies || 0) * 4 + (b.rewards.compasses || 0) * 2 + (b.rewards.tablets || 0) * 2;
          return scoreB - scoreA;
        })[0];

        return { action: 'place_worker', siteId: targetSite.id };
      }
    }

    // 4. 고대 유물 또는 아이템 카드 구매
    const buyableArtifact = artifactMarket.find(c => (c.costCompasses || 0) <= ai.resources.compasses);
    if (buyableArtifact) {
      return { action: 'buy_card', cardId: buyableArtifact.id, cardType: 'artifact' };
    }

    const buyableItem = itemMarket.find(c => (c.costCoins || 0) <= ai.resources.coins);
    if (buyableItem) {
      return { action: 'buy_card', cardId: buyableItem.id, cardType: 'item' };
    }

    // 5. 핸드의 즉발 자원 카드 사용
    const playableCard = ai.hand.find(c => c.type !== 'fear' && c.effect.gainResources);
    if (playableCard) {
      return { action: 'play_card', cardId: playableCard.id };
    }

    // 6. 더 이상 할 수 있는 주 행동이 없으면 패스
    return { action: 'pass' };
  }
}
