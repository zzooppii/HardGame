import type { 
  PlayerLeHavre, 
  DockState, 
  BuildingCard, 
  ShipCard, 
  RoundInfo,
  ResourceType 
} from '../types';
import { calculateAvailableFood, canEnterBuilding } from './gameLogic';

export interface AIDecision {
  actionType: 'take_dock' | 'use_building';
  dockId?: string;
  buildingId?: string;
  buildingActionDetail?: {
    targetBuildingToBuildId?: string;
    targetShipToBuildId?: string;
  };
}

export class LeHavreAI {
  /** AI 플레이어 최적 행동 결정 */
  static decideAction(
    aiPlayer: PlayerLeHavre,
    docks: DockState[],
    buildings: BuildingCard[],
    ships: ShipCard[],
    currentRoundInfo: RoundInfo
  ): AIDecision {
    const availFood = calculateAvailableFood(aiPlayer);
    const neededFood = currentRoundInfo.foodRequired;

    // 1. [식량 안보 최우선] 식량이 위험할 때 어획 도크에 2마리 이상 있으면 우선 수집
    const fishDock = docks.find(d => d.id === 'fish');
    if (availFood < neededFood && fishDock && fishDock.count >= 2) {
      return { actionType: 'take_dock', dockId: 'fish' };
    }

    // 2. [선박 건조 기회 포착] 부두(Wharf)가 비어있고 목재 5개+연료 3개가 있으면 선박 건조
    const wharf = buildings.find(b => b.actionType === 'wharf' && b.workerOnBuilding === null);
    const unbuiltWoodShip = ships.find(s => s.type === 'wood' && s.ownerId === null);
    if (wharf && unbuiltWoodShip && (aiPlayer.inventory.wood || 0) >= 5) {
      const check = canEnterBuilding(aiPlayer, wharf);
      if (check.canEnter) {
        return {
          actionType: 'use_building',
          buildingId: wharf.id,
          buildingActionDetail: { targetShipToBuildId: unbuiltWoodShip.id }
        };
      }
    }

    // 3. [건물 건설 기회] 시공사(Building Firm)가 비어있고 건설 가능한 건물이 있을 때
    const buildFirm = buildings.find(b => b.actionType === 'build_firm' && b.workerOnBuilding === null);
    if (buildFirm) {
      const check = canEnterBuilding(aiPlayer, buildFirm);
      if (check.canEnter) {
        // 지을 수 있는 타운 미소유 건물 찾기
        const buildable = buildings.find(b => {
          if (b.ownerId !== 'town') return false;
          // 비용 체크
          for (const [res, req] of Object.entries(b.buildCost)) {
            if ((aiPlayer.inventory[res as ResourceType] || 0) < (req || 0)) {
              return false;
            }
          }
          return Object.keys(b.buildCost).length > 0;
        });

        if (buildable) {
          return {
            actionType: 'use_building',
            buildingId: buildFirm.id,
            buildingActionDetail: { targetBuildingToBuildId: buildable.id }
          };
        }
      }
    }

    // 4. [가공 건물 활용]
    // 4-1. 어물 훈제장 (어획 2개 이상일 때)
    const smokeHouse = buildings.find(b => b.actionType === 'smoke_fish' && b.workerOnBuilding === null);
    if (smokeHouse && (aiPlayer.inventory.fish || 0) >= 2) {
      const check = canEnterBuilding(aiPlayer, smokeHouse);
      if (check.canEnter) {
        return { actionType: 'use_building', buildingId: smokeHouse.id };
      }
    }

    // 4-2. 제탄소 (목재 2개 이상일 때)
    const charcoal = buildings.find(b => b.actionType === 'burn_charcoal' && b.workerOnBuilding === null);
    if (charcoal && (aiPlayer.inventory.wood || 0) >= 3) {
      const check = canEnterBuilding(aiPlayer, charcoal);
      if (check.canEnter) {
        return { actionType: 'use_building', buildingId: charcoal.id };
      }
    }

    // 4-3. 벽돌 가마 (점토 2개 이상일 때)
    const brickworks = buildings.find(b => b.actionType === 'bake_brick' && b.workerOnBuilding === null);
    if (brickworks && (aiPlayer.inventory.clay || 0) >= 2) {
      const check = canEnterBuilding(aiPlayer, brickworks);
      if (check.canEnter) {
        return { actionType: 'use_building', buildingId: brickworks.id };
      }
    }

    // 5. [도크 상품 수집] 가장 많이 쌓인 도크 선택 (최소 1개 이상)
    const sortedDocks = [...docks]
      .filter(d => d.count > 0)
      .sort((a, b) => b.count - a.count);

    if (sortedDocks.length > 0) {
      return { actionType: 'take_dock', dockId: sortedDocks[0].id };
    }

    // 기본 대체: 시장으로 이동
    const market = buildings.find(b => b.actionType === 'market' && b.workerOnBuilding === null);
    if (market && canEnterBuilding(aiPlayer, market).canEnter) {
      return { actionType: 'use_building', buildingId: market.id };
    }

    // 최후의 보루: 1번 도크 수집
    return { actionType: 'take_dock', dockId: docks[0].id };
  }
}
