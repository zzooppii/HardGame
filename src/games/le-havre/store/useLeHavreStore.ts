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
import { peerManager } from '../../../platform/network/peerManager';

interface LeHavreStore extends LeHavreGameState {
  playMode: 'solo' | 'local_pass' | 'online';
  myPlayerId: string;
  isHost: boolean;
  roomCode: string | null;

  selectedBuildingForDetail: BuildingCard | null;
  selectedShipForDetail: ShipCard | null;

  initGame: (playerCount?: number, withAI?: boolean) => void;
  initOnlineGame: (
    playerCount: number,
    humanPlayers: { name: string; peerId: string }[],
    roomCode: string,
    myPlayerId: string,
    isHost: boolean
  ) => void;
  syncRemoteState: (newState: Partial<LeHavreGameState>) => void;
  syncToPeers: () => void;

  takeDockAction: (dockId: string) => boolean;
  enterBuildingAction: (buildingId: string, actionDetail?: any) => boolean;
  buyBuildingWithCash: (buildingId: string) => boolean;
  repayLoanAction: () => boolean;
  endTurnAndAdvance: () => void;
  selectBuildingForDetail: (b: BuildingCard | null) => void;
  selectShipForDetail: (s: ShipCard | null) => void;
}

export const getSerializableLeHavreState = (state: LeHavreStore): any => {
  const {
    round,
    turnInRound,
    currentSupplyTileIndex,
    currentTurnPlayerIndex,
    players,
    docks,
    buildings,
    ships,
    phase,
    logs,
    isGameOver
  } = state;

  return JSON.parse(JSON.stringify({
    round,
    turnInRound,
    currentSupplyTileIndex,
    currentTurnPlayerIndex,
    players,
    docks,
    buildings,
    ships,
    phase,
    logs,
    isGameOver
  }));
};

const createInitialInventory = (): Record<ResourceType, number> => ({
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
});

export const useLeHavreStore = create<LeHavreStore>((set, get) => ({
  playMode: 'solo',
  myPlayerId: 'p-0',
  isHost: true,
  roomCode: null,

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

  syncToPeers: () => {
    if (get().playMode === 'online' && get().isHost) {
      peerManager.broadcastStateSync(getSerializableLeHavreState(get()));
    }
  },

  syncRemoteState: (newState) => {
    set((state) => ({
      ...state,
      ...newState
    }));
  },

  initGame: (playerCount = 2, withAI = true) => {
    const colors = ['#0284c7', '#dc2626', '#16a34a', '#ca8a04'];
    const names = ['나 (선주)', 'AI 앙리 선장', 'AI 빅토르', 'AI 클로드'];

    const players: PlayerLeHavre[] = [];
    for (let i = 0; i < playerCount; i++) {
      players.push({
        id: `p-${i}`,
        name: i === 0 ? '나 (항구 거물)' : (withAI ? names[i] : `플레이어 ${i + 1}`),
        color: colors[i],
        isAI: i > 0 && withAI,
        francs: 5,
        loans: 0,
        inventory: { 
          ...createInitialInventory(),
          coal: 1
        },
        buildingsOwned: [],
        shipsOwned: [],
        workerPosition: null
      });
    }

    const freshDocks = INITIAL_DOCKS.map(d => ({ ...d }));
    const freshBuildings = INITIAL_BUILDINGS.map(b => ({ ...b, workerOnBuilding: null, ownerId: 'town' }));
    const freshShips = INITIAL_SHIPS.map(s => ({ ...s, ownerId: null }));

    soundManager.playCargoLoad();

    set({
      playMode: withAI ? 'solo' : 'local_pass',
      myPlayerId: 'p-0',
      isHost: true,
      roomCode: null,
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

  // 온라인 멀티플레이 초기화
  initOnlineGame: (playerCount, humanPlayers, roomCode, myPlayerId, isHost) => {
    const colors = ['#0284c7', '#dc2626', '#16a34a', '#ca8a04'];
    const defaultAINames = ['AI 앙리 선장', 'AI 빅토르', 'AI 클로드'];

    const players: PlayerLeHavre[] = [];
    for (let i = 0; i < playerCount; i++) {
      const isHuman = i < humanPlayers.length;
      const playerName = isHuman ? humanPlayers[i].name : defaultAINames[i - humanPlayers.length];

      players.push({
        id: `p-${i}`,
        name: playerName,
        color: colors[i % colors.length],
        isAI: !isHuman,
        francs: 5,
        loans: 0,
        inventory: {
          ...createInitialInventory(),
          coal: 1
        },
        buildingsOwned: [],
        shipsOwned: [],
        workerPosition: null
      });
    }

    const freshDocks = INITIAL_DOCKS.map(d => ({ ...d }));
    const freshBuildings = INITIAL_BUILDINGS.map(b => ({ ...b, workerOnBuilding: null, ownerId: 'town' }));
    const freshShips = INITIAL_SHIPS.map(s => ({ ...s, ownerId: null }));

    soundManager.playCargoLoad();

    set({
      playMode: 'online',
      myPlayerId,
      isHost,
      roomCode,
      round: 1,
      turnInRound: 0,
      currentSupplyTileIndex: 0,
      currentTurnPlayerIndex: 0,
      players,
      docks: freshDocks,
      buildings: freshBuildings,
      ships: freshShips,
      phase: 'turn_action',
      logs: [`🌐 온라인 르아브르 대전이 시작되었습니다! (방 코드: ${roomCode})`],
      isGameOver: false,
      selectedBuildingForDetail: null,
      selectedShipForDetail: null
    });

    if (isHost) {
      get().syncToPeers();
    }
  },

  // 1. 도크 상품 전량 수집 액션
  takeDockAction: (dockId: string) => {
    if (get().playMode === 'online' && !get().isHost) {
      peerManager.sendAction('takeDockAction', { dockId });
      return true;
    }

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

    soundManager.playCargoLoad();
    showFeedback(`${resourceName} +${gainedAmount}개 획득!`);

    set({
      players: updatedPlayers,
      docks: updatedDocks,
      logs: [`${currPlayer.name}: ${resourceName} ${gainedAmount}개 획득`, ...logs]
    });

    if (get().playMode === 'online' && get().isHost) {
      get().syncToPeers();
    }

    get().endTurnAndAdvance();
    return true;
  },

  // 2. 건물 일꾼 이동 및 기능 실행
  enterBuildingAction: (buildingId: string, actionDetail?: any) => {
    if (get().playMode === 'online' && !get().isHost) {
      peerManager.sendAction('enterBuildingAction', { buildingId, actionDetail });
      return true;
    }

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

    let updatedPlayer = { ...currPlayer };
    const updatedPlayers = [...players];

    if (check.francCost > 0 || check.foodCost > 0) {
      updatedPlayer.francs -= check.francCost;
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

    switch (building.actionType) {
      case 'smoke_fish': {
        const fishCount = updatedPlayer.inventory.fish || 0;
        if (fishCount > 0) {
          updatedPlayer.inventory.fish = 0;
          updatedPlayer.inventory.smoked_fish = (updatedPlayer.inventory.smoked_fish || 0) + fishCount;
          updatedPlayer.francs += 1;
          soundManager.playAnvilStrike();
          actionMessage = `어획 ${fishCount}마리를 훈제 어획으로 가공 (+1 프랑)`;
        } else {
          showFeedback('가공할 어획이 없습니다.');
          return false;
        }
        break;
      }
      case 'burn_charcoal': {
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
        const clayCount = updatedPlayer.inventory.clay || 0;
        const availFuel = calculateAvailableFuel(updatedPlayer);
        if (clayCount > 0 && availFuel >= 1) {
          if (updatedPlayer.inventory.wood > 0) updatedPlayer.inventory.wood--;
          else if (updatedPlayer.inventory.charcoal > 0) updatedPlayer.inventory.charcoal--;
          else if (updatedPlayer.inventory.coal > 0) updatedPlayer.inventory.coal--;
          else if (updatedPlayer.inventory.coke > 0) updatedPlayer.inventory.coke--;

          updatedPlayer.inventory.clay = 0;
          updatedPlayer.inventory.brick = (updatedPlayer.inventory.brick || 0) + clayCount;
          soundManager.playAnvilStrike();
          actionMessage = `점토 ${clayCount}개를 단단한 벽돌로 소성 완료`;
        } else {
          showFeedback('점토 또는 가마를 때울 연료가 부족합니다.');
          return false;
        }
        break;
      }
      case 'bake_bread': {
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
        const ironCount = updatedPlayer.inventory.iron || 0;
        const availFuel = calculateAvailableFuel(updatedPlayer);
        if (ironCount > 0 && availFuel >= 5) {
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
              fuelLeft -= 2;
            } else if (updatedPlayer.inventory.wood > 0) {
              updatedPlayer.inventory.wood--;
              fuelLeft -= 1;
            } else {
              break;
            }
          }

          updatedPlayer.inventory.iron = 0;
          updatedPlayer.inventory.steel = (updatedPlayer.inventory.steel || 0) + ironCount;
          soundManager.playAnvilStrike();
          actionMessage = `철 ${ironCount}개를 최고급 강철로 제련 완료`;
        } else {
          showFeedback('철 또는 용광로 에너지(5 이상)가 부족합니다.');
          return false;
        }
        break;
      }
      case 'coke_oven': {
        const coalCount = updatedPlayer.inventory.coal || 0;
        if (coalCount > 0) {
          updatedPlayer.inventory.coal = 0;
          updatedPlayer.inventory.coke = (updatedPlayer.inventory.coke || 0) + coalCount;
          updatedPlayer.francs += 1;
          soundManager.playAnvilStrike();
          actionMessage = `석탄 ${coalCount}개를 최고효율 코크스로 가공 (+1 프랑)`;
        } else {
          showFeedback('가공할 석탄이 없습니다.');
          return false;
        }
        break;
      }
      case 'wharf': {
        const shipIdToBuild = actionDetail?.targetShipToBuildId;
        const targetShip = ships.find(s => s.id === shipIdToBuild && s.ownerId === null);
        if (!targetShip) {
          showFeedback('건조할 수 있는 선박을 선택하세요.');
          return false;
        }

        for (const [res, count] of Object.entries(targetShip.buildCost)) {
          if ((updatedPlayer.inventory[res as ResourceType] || 0) < (count || 0)) {
            showFeedback(`건조 자원(${res})이 부족합니다.`);
            return false;
          }
        }

        for (const [res, count] of Object.entries(targetShip.buildCost)) {
          updatedPlayer.inventory[res as ResourceType] -= (count || 0);
        }

        updatedShips = ships.map(s => s.id === targetShip.id ? { ...s, ownerId: currPlayer.id } : s);
        updatedPlayer.shipsOwned = [...updatedPlayer.shipsOwned, targetShip.id];
        soundManager.playFoghorn();
        actionMessage = `[${targetShip.name}] 진수 완료! 매 라운드 식량 ${targetShip.foodProvided} 절감`;
        break;
      }
      case 'build_firm':
      case 'construction': {
        const bId = actionDetail?.targetBuildingToBuildId;
        const targetToBuild = buildings.find(b => b.id === bId && b.ownerId === 'town');
        if (!targetToBuild) {
          showFeedback('건설할 건물을 선택하세요.');
          return false;
        }

        for (const [res, count] of Object.entries(targetToBuild.buildCost)) {
          if ((updatedPlayer.inventory[res as ResourceType] || 0) < (count || 0)) {
            showFeedback(`건설 자원(${res})이 부족합니다.`);
            return false;
          }
        }

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
        updatedPlayer.inventory.wood = (updatedPlayer.inventory.wood || 0) + 1;
        updatedPlayer.inventory.fish = (updatedPlayer.inventory.fish || 0) + 1;
        soundManager.playParchment();
        actionMessage = '자유 시장에서 목재 1개, 어획 1개 조달';
        break;
      }
      case 'shipping_line': {
        const shipCount = updatedPlayer.shipsOwned.length;
        const tradeProfit = Math.max(8, shipCount * 8);
        updatedPlayer.francs += tradeProfit;
        soundManager.playCoin();
        soundManager.playFanfare();
        actionMessage = `해운 무역 수출 완료 (+${tradeProfit} 프랑 획득)`;
        break;
      }
    }

    updatedBuildings = updatedBuildings.map(b => {
      if (b.workerOnBuilding === currPlayer.id) return { ...b, workerOnBuilding: null };
      if (b.id === buildingId) return { ...b, workerOnBuilding: currPlayer.id };
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

    if (get().playMode === 'online' && get().isHost) {
      get().syncToPeers();
    }

    get().endTurnAndAdvance();
    return true;
  },

  // 3. 프랑으로 타운 건물 즉시 매입
  buyBuildingWithCash: (buildingId: string) => {
    if (get().playMode === 'online' && !get().isHost) {
      peerManager.sendAction('buyBuildingWithCash', { buildingId });
      return true;
    }

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

    if (get().playMode === 'online' && get().isHost) {
      get().syncToPeers();
    }

    return true;
  },

  // 4. 대출 상환 (5프랑으로 대출 1건 상환)
  repayLoanAction: () => {
    if (get().playMode === 'online' && !get().isHost) {
      peerManager.sendAction('repayLoanAction', {});
      return true;
    }

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

    if (get().playMode === 'online' && get().isHost) {
      get().syncToPeers();
    }

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

    const nextPlayerIndex = (currentTurnPlayerIndex + 1) % players.length;
    const nextTurnInRound = turnInRound + 1;

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

    if (nextTurnInRound >= 7) {
      const currentRoundInfo = ROUNDS_DATA[round - 1];
      const { updatedPlayers: fedPlayers, roundLogs } = processRoundEnd(players, currentRoundInfo, ships);

      soundManager.playCargoLoad();

      if (round < 7) {
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
        soundManager.playGrandFanfare();
        set({
          isGameOver: true,
          phase: 'game_over',
          players: fedPlayers,
          logs: ['🏁 [르아브르] 7개 라운드가 모두 종료되었습니다! 최종 자산 집계를 시작합니다.', ...roundLogs, ...logs]
        });
        if (get().playMode === 'online' && get().isHost) {
          get().syncToPeers();
        }
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

    if (get().playMode === 'online' && get().isHost) {
      get().syncToPeers();
    }

    if (get().playMode === 'online' && !get().isHost) {
      return;
    }

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

if (typeof window !== 'undefined') {
  (window as any).__LE_HAVRE_STORE__ = useLeHavreStore;
}
