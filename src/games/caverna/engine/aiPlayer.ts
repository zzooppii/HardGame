import type { 
  PlayerCaverna, 
  ActionSpace, 
  FurnishingTile,
  CavernaResource
} from '../types';

export interface AIDecision {
  actionSpaceId: string;
  furnishingIdToBuild?: string;
  cropToSow?: 'grain' | 'pumpkin';
  oreToForge?: number;
  expeditionLootId?: string;
}

export class CavernaAI {
  public static decideAction(
    player: PlayerCaverna,
    availableActions: ActionSpace[],
    furnishings: FurnishingTile[]
  ): AIDecision {
    // 1. 비어있는 행동 칸만 필터링
    const openActions = availableActions.filter(a => a.occupiedByPlayerId === null);
    if (openActions.length === 0) {
      return { actionSpaceId: availableActions[0].id };
    }

    // 2. 식량 안보 체크 (드워프 수 x 2 이상의 식량이 확보되어 있는지)
    const neededFood = player.dwarfs.length * 2;
    if (player.resources.food < neededFood) {
      // 식량/가축 누적 행동 우선 탐색
      const sheepAct = openActions.find(a => a.id === 'act_sheep' && a.accumulatedCount >= 2);
      if (sheepAct) return { actionSpaceId: sheepAct.id };

      const slashBurn = openActions.find(a => a.id === 'act_slash_burn');
      if (slashBurn && player.resources.grain > 0) return { actionSpaceId: slashBurn.id };
    }

    // 3. 누적 자원이 풍성한 행동 칸 탐색 (나무 5개 이상, 돌 3개 이상, 광석 4개 이상)
    const richLogging = openActions.find(a => a.id === 'act_logging' && a.accumulatedCount >= 5);
    if (richLogging) return { actionSpaceId: richLogging.id };

    const richQuarry = openActions.find(a => a.id === 'act_quarry' && a.accumulatedCount >= 3);
    if (richQuarry) return { actionSpaceId: richQuarry.id };

    const richOre = openActions.find(a => a.id === 'act_ore_mine' && a.accumulatedCount >= 4);
    if (richOre) return { actionSpaceId: richOre.id };

    const rubyAct = openActions.find(a => a.id === 'act_ruby_mine');
    if (rubyAct && rubyAct.accumulatedCount >= 2) return { actionSpaceId: rubyAct.id };

    // 4. 방 타일 건설 가능 여부 확인
    const furnishAct = openActions.find(a => a.id === 'act_furnish');
    if (furnishAct) {
      const buildable = furnishings.filter(f => {
        if (player.builtFurnishings.includes(f.id)) return false;
        for (const [res, cost] of Object.entries(f.cost)) {
          if ((player.resources[res as CavernaResource] || 0) < (cost || 0)) return false;
        }
        return true;
      });

      if (buildable.length > 0) {
        // 가장 높은 점수의 방 선택
        buildable.sort((a, b) => b.vp - a.vp);
        return {
          actionSpaceId: furnishAct.id,
          furnishingIdToBuild: buildable[0].id
        };
      }
    }

    // 5. 무기 제작 및 원정 (광석 2개 이상 보유 시)
    const blacksmithAct = openActions.find(a => a.id === 'act_blacksmith');
    if (blacksmithAct && player.resources.ore >= 2) {
      const forgeAmount = Math.min(8, player.resources.ore);
      return {
        actionSpaceId: blacksmithAct.id,
        oreToForge: forgeAmount,
        expeditionLootId: 'loot_food'
      };
    }

    // 6. 원정 행동 칸 (무기가 이미 있는 경우)
    const currentUnactedDwarf = player.dwarfs.find(d => !d.hasActedThisRound);
    const expAct = openActions.find(a => a.id === 'act_expedition');
    if (expAct && currentUnactedDwarf && currentUnactedDwarf.weaponLevel >= 3) {
      return {
        actionSpaceId: expAct.id,
        expeditionLootId: currentUnactedDwarf.weaponLevel >= 4 ? 'loot_ore' : 'loot_food'
      };
    }

    // 7. 동굴 발굴 (빈 동굴 공간이 부족한 경우)
    const excavateAct = openActions.find(a => a.id === 'act_excavate');
    if (excavateAct) {
      return { actionSpaceId: excavateAct.id };
    }

    // 8. 기본 fallback
    return { actionSpaceId: openActions[0].id };
  }
}
