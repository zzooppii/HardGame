import { create } from 'zustand';
import type { 
  LeHavreGameState, 
  PlayerLeHavre, 
  ResourceType, 
  BuildingCard,
  ShipCard
} from '../types';
import { INITIAL_DOCKS, ROUNDS_DATA } from '../data/rounds';
import { INITIAL_BUILDINGS } from '../data/buildings';
import { INITIAL_SHIPS } from '../data/ships';
import { 
  advanceSupplyShip, 
  executeTakeDock, 
  canEnterBuilding, 
  processRoundEnd,
  calculateAvailableFuel
} from '../engine/gameLogic';
import { LeHavreAI } from '../engine/aiPlayer';
import { soundManager } from '../../../utils/sound';
import { showFeedback } from '../../../utils/feedback';

interface LeHavreStore extends LeHavreGameState {
  selectedBuildingForDetail: BuildingCard | null;
  selectedShipForDetail: ShipCard | null;

  initGame: (playerCount?: number, withAI?: boolean) => void;
  takeDockAction: (dockId: string) => boolean;
  enterBuildingAction: (buildingId: string, actionDetail?: any) => boolean;
  buyBuildingWithCash: (buildingId: string) => boolean;
  repayLoanAction: () => boolean;
  endTurnAndAdvance: () => void;
  selectBuildingForDetail: (b: BuildingCard | null) => void;
  selectShipForDetail: (s: ShipCard | null) => void;
}

export const useLeHavreStore = create<LeHavreStore>((set, get) => ({
  round: 1,
  turnInRound: 0,
  currentSupplyTileIndex: 0,
  currentTurnPlayerIndex: 0,
  players: [],
  docks: INITIAL_DOCKS,
  buildings: INITIAL_BUILDINGS,
  ships: INITIAL_SHIPS,
  phase: 'turn_action',
  logs: [],
  isGameOver: false,
  selectedBuildingForDetail: null,
  selectedShipForDetail: null,

  selectBuildingForDetail: (b) => set({ selectedBuildingForDetail: b }),
  selectShipForDetail: (s) => set({ selectedShipForDetail: s }),

  initGame: (playerCount = 2, withAI = true) => {
    const colors = ['#0284c7', '#dc2626', '#16a34a', '#ca8a04'];
    const names = ['나 (선주)', 'AI 앙리 선장', 'AI 빅토르', 'AI 클로드'];

    const initialInventory: Record<ResourceType, number> = {
      fish: 0,
      wood: 0,
      clay: 0,
      iron: 0,
      grain: 0,
      cattle: 0,
      hide: 0,
      coal: 0,
      smoked_fish: 0,
      charcoal: 0,
      brick: 0,
      steel: 0,
      bread: 0,
      meat: 0,
      leather: 0,
      coke: 0
    };

    const players: PlayerLeHavre[] = [];
    for (let i = 0; i < playerCount; i++) {
      players.push({
        id: `p-${i}`,
        name: i === 0 ? '나 (항구 거물)' : (withAI ? names[i] : `플레이어 ${i + 1}`),
        color: colors[i],
        isAI: i > 0 && withAI,
        francs: 5, // 시작 자금 5프랑
        loans: 0,
        inventory: { 
          ...initialInventory,
          coal: 1 // 시작 연료 석탄 1개 지급
        },
        buildingsOwned: [],
        shipsOwned: [],
        workerPosition: null
      });
    }

    // 도크 초기화
    const freshDocks = INITIAL_DOCKS.map(d => ({ ...d }));
    // 건물 초기화
    const freshBuildings = INITIAL_BUILDINGS.map(b => ({ ...b, workerOnBuilding: null, ownerId: 'town' }));
    // 선박 초기화
    const freshShips = INITIAL_SHIPS.map(s => ({ ...s, ownerId: null }));

    soundManager.playShipCargo();

    set({
      round: 1,
      turnInRound: 0,
      currentSupplyTileIndex: 0,
      currentTurnPlayerIndex: 0,
      players,
      docks: freshDocks,
      buildings: freshBuildings,
      ships: freshShips,
      phase: 'turn_action',
      logs: ['⚓ 노르망디 르아브르 항구에 오신 것을 환영합니다! 상품을 선적하고 거대한 무역 제국을 건설하세요.'],
      isGameOver: false,
      selectedBuildingForDetail: null,
      selectedShipForDetail: null
    });
  },

  // 1. 도크 상품 전량 수집 액션
  takeDockAction: (dockId: string) => {
    const { players, currentTurnPlayerIndex, docks, logs, isGameOver } = get();
    if (isGameOver) return false;

    const currPlayer = players[currentTurnPlayerIndex];
    const dock = docks.find(d => d.id === dockId);
    if (!dock || dock.count <= 0) {
      showFeedback('비어 있는 도크에서는 상품을 가져올 수 없습니다.');
      return false;
    }

    const { updatedPlayer, gainedAmount, resourceName } = executeTakeDock(currPlayer, dock);

    const updatedDocks = docks.map(d => d.id === dockId ? { ...d, count: 0 } : d);
    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = updatedPlayer;

    soundManager.playParchment();
    showFeedback(`${resourceName} +${gainedAmount}개 획득!`);

    set({
      players: updatedPlayers,
      docks: updatedDocks,
      logs: [`${currPlayer.name}: ${resourceName} ${gainedAmount}개 획득`, ...logs]
    });

    get().endTurnAndAdvance();
    return true;
  },

  // 2. 건물 일꾼 이동 및 기능 실행
  enterBuildingAction: (buildingId: string, actionDetail?: any) => {
    const { players, currentTurnPlayerIndex, buildings, ships, logs, isGameOver } = get();
    if (isGameOver) return false;

    const currPlayer = players[currentTurnPlayerIndex];
    const building = buildings.find(b => b.id === buildingId);
    if (!building) return false;

    const check = canEnterBuilding(currPlayer, building);
    if (!check.canEnter) {
      showFeedback(check.reason || '이 건물에 들어갈 수 없습니다.');
      return false;
    }

    // 입장료 지불 (타운 소유가 아니고 다른 사람 소유일 때)
    let updatedPlayer = { ...currPlayer };
    const updatedPlayers = [...players];

    if (check.francCost > 0 || check.foodCost > 0) {
      updatedPlayer.francs -= check.francCost;
      // 소유주에게 입장료 입금
      const ownerIdx = updatedPlayers.findIndex(p => p.id === building.ownerId);
      if (ownerIdx !== -1) {
        updatedPlayers[ownerIdx] = {
          ...updatedPlayers[ownerIdx],
          francs: updatedPlayers[ownerIdx].francs + check.francCost
        };
      }
    }

    let actionMessage = '';
    let updatedBuildings = [...buildings];
    let updatedShips = [...ships];

    // 건물 고유 기능 실행
    switch (building.actionType) {
      case 'smoke_fish': {
        // 어획 -> 훈제어 전량 가공
        const fishCount = updatedPlayer.inventory.fish || 0;
        if (fishCount > 0) {
          updatedPlayer.inventory.fish = 0;
          updatedPlayer.inventory.smoked_fish = (updatedPlayer.inventory.smoked_fish || 0) + fishCount;
          updatedPlayer.francs += 1; // 훈제 보너스 1프랑
          soundManager.playBuild();
          actionMessage = `어획 ${fishCount}마리를 훈제 어획으로 가공 (+1 프랑)`;
        } else {
          showFeedback('가공할 어획이 없습니다.');
          return false;
        }
        break;
      }
      case 'burn_charcoal': {
        // 목재 -> 숯 전량 가공
        const woodCount = updatedPlayer.inventory.wood || 0;
        if (woodCount > 0) {
          updatedPlayer.inventory.wood = 0;
          updatedPlayer.inventory.charcoal = (updatedPlayer.inventory.charcoal || 0) + woodCount;
          soundManager.playWoodToken();
          actionMessage = `목재 ${woodCount}개를 고화력 숯으로 가공`;
        } else {
          showFeedback('가공할 목재가 없습니다.');
          return false;
        }
        break;
      }
      case 'bake_brick': {
        // 점토 -> 벽돌 가공 (연료 소모)
        const clayCount = updatedPlayer.inventory.clay || 0;
        const availFuel = calculateAvailableFuel(updatedPlayer);
        if (clayCount > 0 && availFuel >= 1) {
          // 연료 1 소모 (목재 우선)
          if (updatedPlayer.inventory.wood > 0) updatedPlayer.inventory.wood--;
          else if (updatedPlayer.inventory.charcoal > 0) updatedPlayer.inventory.charcoal--;
          else if (updatedPlayer.inventory.coal > 0) updatedPlayer.inventory.coal--;
          else if (updatedPlayer.inventory.coke > 0) updatedPlayer.inventory.coke--;

          updatedPlayer.inventory.clay = 0;
          updatedPlayer.inventory.brick = (updatedPlayer.inventory.brick || 0) + clayCount;
          soundManager.playBuild();
          actionMessage = `점토 ${clayCount}개를 단단한 벽돌로 소성 완료`;
        } else {
          showFeedback('점토 또는 가마를 때울 연료가 부족합니다.');
          return false;
        }
        break;
      }
      case 'bake_bread': {
        // 곡물 -> 빵 가공
        const grainCount = updatedPlayer.inventory.grain || 0;
        if (grainCount > 0) {
          updatedPlayer.inventory.grain = 0;
          updatedPlayer.inventory.bread = (updatedPlayer.inventory.bread || 0) + grainCount;
          const cashGained = Math.floor(grainCount / 2);
          updatedPlayer.francs += cashGained;
          soundManager.playCoin();
          actionMessage = `곡물 ${grainCount}개로 빵 ${grainCount}개 제조 (+${cashGained} 프랑)`;
        } else {
          showFeedback('가공할 곡물이 없습니다.');
          return false;
        }
        break;
      }
      case 'butcher': {
        // 가축 -> 고기 + 원피
        const cattleCount = updatedPlayer.inventory.cattle || 0;
        if (cattleCount > 0) {
          updatedPlayer.inventory.cattle = 0;
          updatedPlayer.inventory.meat = (updatedPlayer.inventory.meat || 0) + (cattleCount * 2);
          updatedPlayer.inventory.hide = (updatedPlayer.inventory.hide || 0) + cattleCount;
          soundManager.playWoodToken();
          actionMessage = `가축 ${cattleCount}마리 도축 (고기 ${cattleCount * 2}개, 원피 ${cattleCount}개 획득)`;
        } else {
          showFeedback('도축할 가축이 없습니다.');
          return false;
        }
        break;
      }
      case 'tannery': {
        // 원피 -> 가죽
        const hideCount = updatedPlayer.inventory.hide || 0;
        if (hideCount > 0) {
          updatedPlayer.inventory.hide = 0;
          updatedPlayer.inventory.leather = (updatedPlayer.inventory.leather || 0) + hideCount;
          soundManager.playParchment();
          actionMessage = `원피 ${hideCount}개를 고급 가죽으로 무두질 완료`;
        } else {
          showFeedback('가공할 원피가 없습니다.');
          return false;
        }
        break;
      }
      case 'forge_steel': {
        // 철 -> 강철 (에너지 5 필요)
        const ironCount = updatedPlayer.inventory.iron || 0;
        const availFuel = calculateAvailableFuel(updatedPlayer);
        if (ironCount > 0 && availFuel >= 5) {
          // 에너지 5 차감 (석탄, 코크스, 숯 등에서 차감)
          let fuelLeft = 5;
          if (updatedPlayer.inventory.coke > 0) {
            updatedPlayer.inventory.coke--;
            fuelLeft -= 5;
          } else if (updatedPlayer.inventory.coal > 0) {
            updatedPlayer.inventory.coal--;
            fuelLeft -= 3;
          }
          while (fuelLeft > 0) {
            if (updatedPlayer.inventory.charcoal > 0) {
              updatedPlayer.inventory.charcoal--;
              fuelLeft -= 3;
            } else if (updatedPlayer.inventory.wood > 0) {
              updatedPlayer.inventory.wood--;
              fuelLeft -= 1;
            } else break;
          }

          updatedPlayer.inventory.iron = 0;
          updatedPlayer.inventory.steel = (updatedPlayer.inventory.steel || 0) + ironCount;
          soundManager.playBuild();
          actionMessage = `철 ${ironCount}개를 최고급 강철로 제련 완료`;
        } else {
          showFeedback('철 또는 용광로 에너지(5 이상)가 부족합니다.');
          return false;
        }
        break;
      }
      case 'coke_oven': {
        // 석탄 -> 코크스
        const coalCount = updatedPlayer.inventory.coal || 0;
        if (coalCount > 0) {
          updatedPlayer.inventory.coal = 0;
          updatedPlayer.inventory.coke = (updatedPlayer.inventory.coke || 0) + coalCount;
          updatedPlayer.francs += 1;
          soundManager.playBuild();
          actionMessage = `석탄 ${coalCount}개를 최고효율 코크스로 가공 (+1 프랑)`;
        } else {
          showFeedback('가공할 석탄이 없습니다.');
          return false;
        }
        break;
      }
      case 'wharf': {
        // 선박 건조
        const shipIdToBuild = actionDetail?.targetShipToBuildId;
        const targetShip = ships.find(s => s.id === shipIdToBuild && s.ownerId === null);
        if (!targetShip) {
          showFeedback('건조할 수 있는 선박을 선택하세요.');
          return false;
        }
        // 자원 체크
        for (const [res, count] of Object.entries(targetShip.buildCost)) {
          if ((updatedPlayer.inventory[res as ResourceType] || 0) < (count || 0)) {
            showFeedback(`건조 자원(${res})이 부족합니다.`);
            return false;
          }
        }
        // 자원 차감
        for (const [res, count] of Object.entries(targetShip.buildCost)) {
          updatedPlayer.inventory[res as ResourceType] -= (count || 0);
        }

        updatedShips = ships.map(s => s.id === targetShip.id ? { ...s, ownerId: currPlayer.id } : s);
        updatedPlayer.shipsOwned = [...updatedPlayer.shipsOwned, targetShip.id];
        soundManager.playShipCargo();
        soundManager.playFanfare();
        actionMessage = `[${targetShip.name}] 진수 완료! 매 라운드 식량 ${targetShip.foodProvided} 절감`;
        break;
      }
      case 'build_firm':
      case 'construction': {
        // 건물 건설
        const bId = actionDetail?.targetBuildingToBuildId;
        const targetToBuild = buildings.find(b => b.id === bId && b.ownerId === 'town');
        if (!targetToBuild) {
          showFeedback('건설할 건물을 선택하세요.');
          return false;
        }
        // 자원 체크
        for (const [res, count] of Object.entries(targetToBuild.buildCost)) {
          if ((updatedPlayer.inventory[res as ResourceType] || 0) < (count || 0)) {
            showFeedback(`건설 자원(${res})이 부족합니다.`);
            return false;
          }
        }
        // 자원 차감
        for (const [res, count] of Object.entries(targetToBuild.buildCost)) {
          updatedPlayer.inventory[res as ResourceType] -= (count || 0);
        }

        updatedBuildings = buildings.map(b => b.id === targetToBuild.id ? { ...b, ownerId: currPlayer.id } : b);
        updatedPlayer.buildingsOwned = [...updatedPlayer.buildingsOwned, targetToBuild.id];
        soundManager.playBuild();
        actionMessage = `[${targetToBuild.name}] 신규 준공! (가치: ${targetToBuild.value} VP)`;
        break;
      }
      case 'bank': {
        updatedPlayer.francs += 8;
        soundManager.playCoin();
        actionMessage = '르아브르 은행에서 현금 8프랑 인출';
        break;
      }
      case 'market': {
        // 원자재 2개 선택 지급 (목재 1, 어획 1)
        updatedPlayer.inventory.wood = (updatedPlayer.inventory.wood || 0) + 1;
        updatedPlayer.inventory.fish = (updatedPlayer.inventory.fish || 0) + 1;
        soundManager.playParchment();
        actionMessage = '자유 시장에서 목재 1개, 어획 1개 조달';
        break;
      }
      case 'shipping_line': {
        // 해운사: 보유 선박 척수 x 6프랑 무역 수익
        const shipCount = updatedPlayer.shipsOwned.length;
        const tradeProfit = Math.max(8, shipCount * 8);
        updatedPlayer.francs += tradeProfit;
        soundManager.playCoin();
        soundManager.playFanfare();
        actionMessage = `해운 무역 수출 완료 (+${tradeProfit} 프랑 획득)`;
        break;
      }
    }

    // 이전 건물에서 내 일꾼 제거 & 새 건물로 일꾼 이동
    updatedBuildings = updatedBuildings.map(b => {
      if (b.workerOnBuilding === currPlayer.id) {
        return { ...b, workerOnBuilding: null };
      }
      if (b.id === buildingId) {
        return { ...b, workerOnBuilding: currPlayer.id };
      }
      return b;
    });

    updatedPlayer.workerPosition = buildingId;
    updatedPlayers[currentTurnPlayerIndex] = updatedPlayer;

    showFeedback(actionMessage);

    set({
      players: updatedPlayers,
      buildings: updatedBuildings,
      ships: updatedShips,
      logs: [`${currPlayer.name}: [${building.name}] 이용 - ${actionMessage}`, ...logs]
    });

    get().endTurnAndAdvance();
    return true;
  },

  // 3. 프랑으로 타운 건물 즉시 매입
  buyBuildingWithCash: (buildingId: string) => {
    const { players, currentTurnPlayerIndex, buildings, logs } = get();
    const curr = players[currentTurnPlayerIndex];
    const b = buildings.find(item => item.id === buildingId && item.ownerId === 'town');
    if (!b || b.buyCostFranc <= 0) return false;

    if (curr.francs < b.buyCostFranc) {
      showFeedback('매입할 프랑이 부족합니다.');
      return false;
    }

    soundManager.playCoin();
    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = {
      ...curr,
      francs: curr.francs - b.buyCostFranc,
      buildingsOwned: [...curr.buildingsOwned, b.id]
    };

    const updatedBuildings = buildings.map(item => item.id === b.id ? { ...item, ownerId: curr.id } : item);

    showFeedback(`[${b.name}] 매입 완료! (${b.buyCostFranc} 프랑)`);

    set({
      players: updatedPlayers,
      buildings: updatedBuildings,
      logs: [`${curr.name}: 현금 ${b.buyCostFranc}프랑으로 [${b.name}] 매입`, ...logs]
    });

    return true;
  },

  // 4. 대출 상환 (5프랑으로 대출 1건 상환)
  repayLoanAction: () => {
    const { players, currentTurnPlayerIndex, logs } = get();
    const curr = players[currentTurnPlayerIndex];
    if (curr.loans <= 0) {
      showFeedback('상환할 대출이 없습니다.');
      return false;
    }
    if (curr.francs < 5) {
      showFeedback('상환금(5프랑)이 부족합니다.');
      return false;
    }

    soundManager.playCoin();
    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = {
      ...curr,
      francs: curr.francs - 5,
      loans: curr.loans - 1
    };

    showFeedback('대출 1건 상환 완료 (5프랑 납부)');

    set({
      players: updatedPlayers,
      logs: [`${curr.name}: 대출 1건 상환 완료 (-5 프랑)`, ...logs]
    });

    return true;
  },

  // 5. 턴 전진 및 라운드 처리
  endTurnAndAdvance: () => {
    const { 
      players, 
      currentTurnPlayerIndex, 
      turnInRound, 
      round, 
      currentSupplyTileIndex, 
      docks, 
      ships,
      logs 
    } = get();

    // 다음 플레이어로 턴 이동
    const nextPlayerIndex = (currentTurnPlayerIndex + 1) % players.length;
    const nextTurnInRound = turnInRound + 1;

    // 보급선 1칸 전진 & 도크 적재
    const { updatedDocks, nextTileIndex, supplied } = advanceSupplyShip(docks, currentSupplyTileIndex);

    const supNames: Record<string, string> = {
      franc: '프랑',
      fish: '어획',
      wood: '목재',
      clay: '점토',
      iron: '철',
      grain: '곡물',
      cattle: '가축'
    };
    const supplyLog = `🚢 보급선 입항: ${supNames[supplied[0]]}, ${supNames[supplied[1]]} 도크에 입고됨`;

    // 7번째 턴 완료 시 라운드 종료
    if (nextTurnInRound >= 7) {
      const currentRoundInfo = ROUNDS_DATA[round - 1];
      const { updatedPlayers: fedPlayers, roundLogs } = processRoundEnd(players, currentRoundInfo, ships);

      soundManager.playShipCargo();

      if (round < 7) {
        // 다음 라운드로 진행
        set({
          round: round + 1,
          turnInRound: 0,
          currentSupplyTileIndex: nextTileIndex,
          currentTurnPlayerIndex: nextPlayerIndex,
          docks: updatedDocks,
          players: fedPlayers,
          logs: [`🔔 [제 ${round + 1} 라운드] 시작!`, ...roundLogs, supplyLog, ...logs]
        });
      } else {
        // 게임 완전 종료!
        soundManager.playGrandFanfare();
        set({
          isGameOver: true,
          phase: 'game_over',
          players: fedPlayers,
          logs: ['🏁 [르아브르] 7개 라운드가 모두 종료되었습니다! 최종 자산 집계를 시작합니다.', ...roundLogs, ...logs]
        });
        return;
      }
    } else {
      set({
        turnInRound: nextTurnInRound,
        currentSupplyTileIndex: nextTileIndex,
        currentTurnPlayerIndex: nextPlayerIndex,
        docks: updatedDocks,
        logs: [supplyLog, ...logs]
      });
    }

    // AI 플레이어 턴인 경우 자동 실행
    setTimeout(() => {
      const state = get();
      const nextP = state.players[state.currentTurnPlayerIndex];
      if (nextP && nextP.isAI && !state.isGameOver) {
        const roundInfo = ROUNDS_DATA[state.round - 1];
        const decision = LeHavreAI.decideAction(nextP, state.docks, state.buildings, state.ships, roundInfo);

        if (decision.actionType === 'take_dock' && decision.dockId) {
          state.takeDockAction(decision.dockId);
        } else if (decision.actionType === 'use_building' && decision.buildingId) {
          state.enterBuildingAction(decision.buildingId, decision.buildingActionDetail);
        }
      }
    }, 700);
  }
}));
