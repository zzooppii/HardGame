import type { PlayerTM, HexSlot, ProjectCard } from '../types';
import { canPlayCard } from './gameLogic';

export interface ActionHint {
  actionType: 'greenery' | 'heat' | 'card' | 'standard' | 'pass';
  title: string;
  reason: string;
  detail: string;
  badgeColor: string;
}

export class TMHintAdvisor {
  /**
   * 현재 플레이어의 상태를 분석하여 초보자를 위한 가장 최적의 추천 액션을 반환합니다.
   */
  public static getRecommendedAction(
    player: PlayerTM,
    mapSlots: HexSlot[],
    globalState: { temperature: number; oxygen: number; oceansPlaced: number }
  ): ActionHint {
    // 1. 식물 8개 이상: 녹지 타일 배치 강력 추천
    if (player.resources.plants >= 8 && globalState.oxygen < 14) {
      const emptySlots = mapSlots.filter(s => s.tileType === 'empty' && !s.isOceanSlot);
      if (emptySlots.length > 0) {
        return {
          actionType: 'greenery',
          title: '🌱 식물 8개로 녹지 타일 배치',
          reason: '식물이 8개 이상 모였습니다. 녹지 타일을 놓으면 산소 농도(+1%)와 테라포밍 등급(TR +1점)이 즉시 올라가고, 게임 종료 시 1점의 승점이 됩니다.',
          detail: '화성 지도에서 빈 육각형 슬롯을 클릭하여 녹지 타일을 건설하세요.',
          badgeColor: '#22c55e'
        };
      }
    }

    // 2. 열 8개 이상: 기온 상승 액션 추천
    if (player.resources.heat >= 8 && globalState.temperature < 8) {
      return {
        actionType: 'heat',
        title: '🔥 열 8개로 화성 기온 2°C 상승',
        reason: '열 자원이 8개 이상 축적되었습니다. 화성 표면 온도를 2°C 올리고 TR 등급 1점을 즉시 획득할 수 있습니다.',
        detail: '하단 기업 매트의 [🔥 열 8개 ➔ 기온 +2°C] 버튼을 클릭하세요.',
        badgeColor: '#f97316'
      };
    }

    // 3. 핸드에 지금 당장 플레이 가능한 유용한 카드가 있는지 탐색
    const playableCards: { card: ProjectCard; priority: number }[] = [];
    for (const card of player.hand) {
      const check = canPlayCard(player, card, globalState);
      if (check.canPlay) {
        let priority = 1;
        // 생산력 증가 카드는 초중반에 매우 유리
        if (card.effects.productionChange) priority += 3;
        // 글로벌 파라미터 상승 카드는 TR 점수 확보에 직결
        if (card.effects.tempSteps || card.effects.oxygenSteps || card.effects.oceanCount) priority += 2;
        playableCards.push({ card, priority });
      }
    }

    if (playableCards.length > 0) {
      playableCards.sort((a, b) => b.priority - a.priority);
      const topChoice = playableCards[0].card;
      return {
        actionType: 'card',
        title: `🃏 카드 플레이: "${topChoice.name}"`,
        reason: `현재 비용(${topChoice.cost} M€)을 지불하고 즉시 발동할 수 있습니다. (${topChoice.description})`,
        detail: `우측 패널의 핸드 카드 목록에서 "${topChoice.name}" 카드의 [사용] 버튼을 클릭하세요.`,
        badgeColor: '#38bdf8'
      };
    }

    // 4. 자금이 넉넉한 경우 표준 프로젝트 추천
    if (player.resources.megacredits >= 18 && globalState.oceansPlaced < 9) {
      return {
        actionType: 'standard',
        title: '🌊 표준 프로젝트: 대양 타일 (18 M€)',
        reason: '화성에 대양 타일을 배치하면 즉시 TR 1점을 얻고, 향후 인접 타일 배치 시 2 M€의 보너스 캐시를 회수할 수 있습니다.',
        detail: '우측 상단의 표준 프로젝트 [대양(18)] 버튼을 클릭하세요.',
        badgeColor: '#0ea5e9'
      };
    }

    if (player.resources.megacredits >= 14 && globalState.temperature < 8) {
      return {
        actionType: 'standard',
        title: '☄️ 표준 프로젝트: 소행성 (14 M€)',
        reason: '온도를 2°C 상승시켜 TR 등급을 올릴 수 있는 표준 프로젝트입니다.',
        detail: '우측 상단의 표준 프로젝트 [소행성(14)] 버튼을 클릭하세요.',
        badgeColor: '#ef4444'
      };
    }

    // 5. 할 수 있는 액션을 모두 마친 경우: 패스 추천
    return {
      actionType: 'pass',
      title: '⏭️ 이번 세대 턴 종료 (패스)',
      reason: '현재 즉시 수행할 수 있는 추가 액션이 없습니다. 이번 세대를 패스하면 모든 플레이어가 행동을 마친 후 생산 단계를 거쳐 새로운 메가크레딧과 자원을 수령하게 됩니다.',
      detail: '우측 하단의 [턴 넘기기 / 세대 패스] 버튼을 클릭하세요.',
      badgeColor: '#64748b'
    };
  }
}
