import type { PlayerDuel, PyramidNode } from '../types';
import { calculateCardCost, calculateWonderCost, calculateDiscardGain } from './gameLogic';

export interface DuelActionHint {
  type: 'build' | 'wonder' | 'discard' | 'pantheon';
  title: string;
  reason: string;
  detail: string;
  targetNodeId?: string;
  targetWonderId?: string;
  badgeColor: string;
}

export class DuelHintAdvisor {
  public static getRecommendedAction(
    player: PlayerDuel,
    opponent: PlayerDuel,
    availableNodes: PyramidNode[],
    militaryPosition: number,
    isPlayer0: boolean
  ): DuelActionHint {
    const myMilitaryAdvantage = isPlayer0 ? militaryPosition : -militaryPosition;

    // 1. 군사 패배 위기 경고 (상대방이 내 쪽으로 6칸 이상 전진)
    if (myMilitaryAdvantage <= -6) {
      const redNode = availableNodes.find(n => n.card.color === 'red');
      if (redNode) {
        const cost = calculateCardCost(player, redNode.card, opponent);
        if (cost.canAfford) {
          return {
            type: 'build',
            title: `⚔️ 군사 방어: "${redNode.card.name}" 건설`,
            reason: `상대방이 내 수도 쪽으로 ${Math.abs(myMilitaryAdvantage)}칸 전진했습니다! 9칸에 도달하면 즉시 패배하므로 빨간색 군사 카드를 가져와 전선을 밀어내세요.`,
            detail: `피라미드에서 "${redNode.card.name}" 카드를 클릭하고 [건설]을 선택하세요.`,
            targetNodeId: redNode.id,
            badgeColor: '#ef4444'
          };
        }
      }
    }

    // 2. 과학 기호 완성 기회 (내가 5종 모은 상태에서 6번째 기호가 피라미드에 노출된 경우)
    const myScienceCount = new Set(player.scienceSymbols).size;
    if (myScienceCount >= 4) {
      const scienceNode = availableNodes.find(n => 
        n.card.color === 'green' && 
        n.card.effects.scienceSymbol && 
        !player.scienceSymbols.includes(n.card.effects.scienceSymbol)
      );
      if (scienceNode) {
        const cost = calculateCardCost(player, scienceNode.card, opponent);
        if (cost.canAfford) {
          return {
            type: 'build',
            title: `🔬 과학 승리 기회: "${scienceNode.card.name}" 건설`,
            reason: `새로운 과학 기호(${scienceNode.card.effects.scienceSymbol})를 획득할 수 있습니다. 6종을 모으면 즉시 과학 승리를 거둡니다!`,
            detail: `피라미드에서 "${scienceNode.card.name}" 카드를 클릭하고 [건설]을 선택하세요.`,
            targetNodeId: scienceNode.id,
            badgeColor: '#22c55e'
          };
        }
      }
    }

    // 3. 무료 연계 건설(Chain)이 가능한 유용한 카드 탐색
    for (const node of availableNodes) {
      const cost = calculateCardCost(player, node.card, opponent);
      if (cost.isFreeByChain) {
        return {
          type: 'build',
          title: `🔗 연계 무료 건설: "${node.card.name}"`,
          reason: `이전에 건설한 건물의 기호 효과로 자원이나 코인 비용 없이 0원에 즉시 건설할 수 있는 절호의 기회입니다!`,
          detail: `피라미드에서 "${node.card.name}" 카드를 클릭하고 무료로 건설하세요.`,
          targetNodeId: node.id,
          badgeColor: '#38bdf8'
        };
      }
    }

    // 4. 건설 가능한 강력한 불가사의가 있는지 탐색
    const unbuiltWonders = player.wonders.filter(w => !w.isConstructed);
    for (const wonder of unbuiltWonders) {
      const wCost = calculateWonderCost(player, wonder, opponent);
      if (wCost.canAfford && availableNodes.length > 0) {
        const cheapNode = availableNodes[0];
        return {
          type: 'wonder',
          title: `🏛️ 불가사의 건설: "${wonder.name}"`,
          reason: `현재 자원과 코인(${wCost.totalCoinCost}원 필요)으로 불가사의를 완성할 수 있습니다! (${wonder.effects.victoryPoints}점 및 특수 권능 획득)`,
          detail: `피라미드의 아무 카드나 선택한 뒤 [불가사의 건설]을 누르고 "${wonder.name}"을 지정하세요.`,
          targetWonderId: wonder.id,
          targetNodeId: cheapNode.id,
          badgeColor: '#f59e0b'
        };
      }
    }

    // 5. 일반 건설 가능 카드 중 높은 승점/자원 카드 추천
    const affordableNodes = availableNodes.filter(n => calculateCardCost(player, n.card, opponent).canAfford);
    if (affordableNodes.length > 0) {
      // 파란색(승점) 또는 자원(갈색/회색) 우선
      affordableNodes.sort((a, b) => (b.card.effects.victoryPoints || 0) - (a.card.effects.victoryPoints || 0));
      const topNode = affordableNodes[0];
      return {
        type: 'build',
        title: `🏛️ 건물 건설: "${topNode.card.name}"`,
        reason: `현재 보유한 자원과 코인으로 무난하게 건설하여 문명을 발전시킬 수 있습니다. (${topNode.card.description})`,
        detail: `피라미드에서 "${topNode.card.name}" 카드를 클릭하고 [건설]을 선택하세요.`,
        targetNodeId: topNode.id,
        badgeColor: '#a855f7'
      };
    }

    // 6. 코인이 부족하거나 지불할 수 없는 경우: 카드 버리고 동전 획득
    const discardGain = calculateDiscardGain(player);
    const anyNode = availableNodes[0];
    return {
      type: 'discard',
      title: `🪙 카드 버리고 코인 획득 (+${discardGain}원)`,
      reason: `현재 건설 비용이 부족하므로 필요 없는 카드를 버리고 국고에 ${discardGain} 코인을 보충하여 다음 턴을 준비하세요.`,
      detail: `피라미드에서 카드를 클릭한 뒤 [버리고 코인 획득]을 선택하세요.`,
      targetNodeId: anyNode?.id,
      badgeColor: '#eab308'
    };
  }
}
