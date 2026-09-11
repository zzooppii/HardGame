import type { PlayerDuel, PyramidNode, PantheonGodCard } from '../types';
import { calculateCardCost, calculateWonderCost } from './gameLogic';

export type DuelAIDecision = 
  | { action: 'build_card'; nodeId: string }
  | { action: 'build_wonder'; nodeId: string; wonderId: string }
  | { action: 'discard_card'; nodeId: string }
  | { action: 'activate_god'; godId: string };

export class DuelAIPlayer {
  public static decideAction(
    ai: PlayerDuel,
    opponent: PlayerDuel,
    availableNodes: PyramidNode[],
    militaryPosition: number,
    isAIPlayer0: boolean,
    pantheonGods?: PantheonGodCard[],
    difficulty: 'easy' | 'normal' | 'hard' = 'normal'
  ): DuelAIDecision {
    if (availableNodes.length === 0) {
      throw new Error('선택 가능한 피라미드 노드가 없습니다.');
    }

    const aiMilitaryAdvantage = isAIPlayer0 ? militaryPosition : -militaryPosition;

    // 🟢 Easy 모드: 30% 확률로 아무 카드나 버리고 코인 수급하여 사용자에게 승리 기회 제공
    if (difficulty === 'easy' && Math.random() < 0.3) {
      return { action: 'discard_card', nodeId: availableNodes[0].id };
    }

    // 1. 군사 위기 방어 (상대방이 군사 우세로 밀고 들어올 때)
    if (aiMilitaryAdvantage <= -5) {
      const redNode = availableNodes.find(n => n.card.color === 'red');
      if (redNode) {
        const cost = calculateCardCost(ai, redNode.card, opponent);
        if (cost.canAfford) {
          return { action: 'build_card', nodeId: redNode.id };
        }
      }
    }

    // 2. 과학 기호 수집 (새로운 기호가 있으면 최우선 수집)
    const newScienceNode = availableNodes.find(n => 
      n.card.color === 'green' && 
      n.card.effects.scienceSymbol && 
      !ai.scienceSymbols.includes(n.card.effects.scienceSymbol)
    );
    if (newScienceNode) {
      const cost = calculateCardCost(ai, newScienceNode.card, opponent);
      if (cost.canAfford) {
        return { action: 'build_card', nodeId: newScienceNode.id };
      }
    }

    // 3. 불가사의 건설 (추가 턴이나 군사/파괴 능력이 있는 불가사의 우선)
    const unbuiltWonders = ai.wonders.filter(w => !w.isConstructed);
    if (unbuiltWonders.length > 0) {
      // Hard 모드에서는 추가 턴이 있는 불가사의 적극 건설
      const targetWonder = difficulty === 'hard'
        ? (unbuiltWonders.find(w => w.effects.extraTurn) || unbuiltWonders[0])
        : unbuiltWonders[0];

      const wCost = calculateWonderCost(ai, targetWonder, opponent);
      if (wCost.canAfford) {
        // 상대방에게 유리한 카드를 원더 건설용 카드로 희생
        const sacrificeNode = availableNodes.find(n => n.card.color === 'blue' || n.card.color === 'red') || availableNodes[0];
        return {
          action: 'build_wonder',
          nodeId: sacrificeNode.id,
          wonderId: targetWonder.id
        };
      }
    }

    // 4. 일반 건물 건설 (비용 감당 가능한 카드 중 승점/자원 우선순위 평가)
    const candidateNodes: { node: PyramidNode; weight: number }[] = [];
    for (const node of availableNodes) {
      const cost = calculateCardCost(ai, node.card, opponent);
      if (cost.canAfford) {
        let weight = (node.card.effects.victoryPoints || 0) * 2;
        if (node.card.color === 'red') weight += 4;
        if (node.card.color === 'green') weight += 3;
        if (node.card.color === 'brown' || node.card.color === 'gray') weight += 2;
        if (cost.isFreeByChain) weight += 5; // 무료 연계 우대

        candidateNodes.push({ node, weight });
      }
    }

    if (candidateNodes.length > 0) {
      candidateNodes.sort((a, b) => b.weight - a.weight);
      return { action: 'build_card', nodeId: candidateNodes[0].node.id };
    }

    // 5. 판테온 확장: 신 활성화 가능 여부 (코인이 충분할 때)
    if (pantheonGods && pantheonGods.length > 0 && ai.coins >= 4 && difficulty !== 'easy') {
      const affordableGod = pantheonGods.find(g => ai.coins >= g.costInCoins);
      if (affordableGod) {
        return { action: 'activate_god', godId: affordableGod.id };
      }
    }

    // 6. 감당할 수 없으면 상대방에게 가장 위협적인 카드를 버려 코인 획득
    return { action: 'discard_card', nodeId: availableNodes[0].id };
  }
}
