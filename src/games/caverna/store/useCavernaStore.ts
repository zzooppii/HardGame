import { create } from 'zustand';
import type { 
  CavernaGameState, 
  PlayerCaverna, 
  FurnishingTile, 
  CavernaResource,
  LivestockType
} from '../types';
import { INITIAL_ACTION_SPACES } from '../data/actions';
import { INITIAL_FURNISHINGS } from '../data/furnishings';
import { EXPEDITION_LOOT_TABLE } from '../data/expeditions';
import { 
  createInitialCaveBoard, 
  createInitialFieldBoard,
  excavateCavern,
  slashAndBurn,
  sowCropOnField,
  buildPasture,
  placeFurnishing,
  processHarvestPhase
} from '../engine/gameLogic';
import { CavernaAI } from '../engine/aiPlayer';
import { soundManager } from '../../../utils/sound';
import { showFeedback } from '../../../utils/feedback';
import { peerManager } from '../../../platform/network/peerManager';

interface CavernaStore extends CavernaGameState {
  playMode: 'solo' | 'local_pass' | 'online';
  myPlayerId: string;
  isHost: boolean;
  roomCode: string | null;

  selectedFurnishingForBuild: FurnishingTile | null;
  isExpeditionModalOpen: boolean;
  activeDwarfForExpedition: string | null;

  initGame: (playerCount?: number, withAI?: boolean) => void;
  initOnlineGame: (
    playerCount: number,
    humanPlayers: { name: string; peerId: string }[],
    roomCode: string,
    myPlayerId: string,
    isHost: boolean
  ) => void;
  syncRemoteState: (newState: Partial<CavernaGameState>) => void;
  syncToPeers: () => void;

  performAction: (actionSpaceId: string, actionDetail?: any) => boolean;
  buildFurnishingAction: (furnishingId: string) => boolean;
  claimExpeditionLoot: (lootId: string) => void;
  advanceTurn: () => void;
  openFurnishingModal: () => void;
  closeFurnishingModal: () => void;
}

export const getSerializableCavernaState = (state: CavernaStore): any => {
  const {
    round,
    phase,
    currentTurnPlayerIndex,
    currentDwarfIndex,
    players,
    actionSpaces,
    availableFurnishings,
    logs,
    isGameOver
  } = state;

  return JSON.parse(JSON.stringify({
    round,
    phase,
    currentTurnPlayerIndex,
    currentDwarfIndex,
    players,
    actionSpaces,
    availableFurnishings,
    logs,
    isGameOver
  }));
};

export const useCavernaStore = create<CavernaStore>((set, get) => ({
  playMode: 'solo',
  myPlayerId: 'p-0',
  isHost: true,
  roomCode: null,

  round: 1,
  phase: 'action',
  currentTurnPlayerIndex: 0,
  currentDwarfIndex: 0,
  players: [],
  actionSpaces: INITIAL_ACTION_SPACES,
  availableFurnishings: INITIAL_FURNISHINGS,
  logs: [],
  isGameOver: false,
  selectedFurnishingForBuild: null,
  isExpeditionModalOpen: false,
  activeDwarfForExpedition: null,

  openFurnishingModal: () => set({ selectedFurnishingForBuild: INITIAL_FURNISHINGS[0] }),
  closeFurnishingModal: () => set({ selectedFurnishingForBuild: null }),

  initGame: (playerCount = 2, withAI = true) => {
    const colors = ['#0284c7', '#dc2626', '#16a34a', '#ca8a04'];
    const names = ['나 (드워프 족장)', 'AI 토린 참나무방패', 'AI 김리', 'AI 발린'];

    const players: PlayerCaverna[] = [];
    for (let i = 0; i < playerCount; i++) {
      players.push({
        id: `p-${i}`,
        name: i === 0 ? '나 (드워프 족장)' : (withAI ? names[i] : `플레이어 ${i + 1}`),
        color: colors[i],
        isAI: i > 0 && withAI,
        resources: {
          wood: 1,
          stone: 0,
          ore: 0,
          ruby: 1,
          grain: 1,
          pumpkin: 0,
          food: 4,
          gold: 0
        },
        livestock: {
          sheep: 0,
          boar: 0,
          cattle: 0,
          donkey: 0
        },
        dwarfs: [
          { id: `d-${i}-0`, name: '첫째 드워프', weaponLevel: 0, hasActedThisRound: false, placedActionId: null },
          { id: `d-${i}-1`, name: '둘째 드워프', weaponLevel: 0, hasActedThisRound: false, placedActionId: null }
        ],
        caveBoard: createInitialCaveBoard(),
        fieldBoard: createInitialFieldBoard(),
        builtFurnishings: ['furn_entry_dwelling']
      });
    }

    const freshActions = INITIAL_ACTION_SPACES.map(a => ({ ...a, occupiedByPlayerId: null }));

    soundManager.playCargoLoad();

    set({
      playMode: 'solo',
      myPlayerId: 'p-0',
      isHost: true,
      roomCode: null,
      round: 1,
      phase: 'action',
      currentTurnPlayerIndex: 0,
      currentDwarfIndex: 0,
      players,
      actionSpaces: freshActions,
      availableFurnishings: [...INITIAL_FURNISHINGS],
      logs: ['⛏️ [카베르나: 동굴 농부들] 동굴을 파내 방을 만들고, 숲을 개간하여 풍요로운 드워프 일족을 번성시키세요!'],
      isGameOver: false,
      selectedFurnishingForBuild: null,
      isExpeditionModalOpen: false,
      activeDwarfForExpedition: null
    });
  },

  initOnlineGame: (playerCount, humanPlayers, roomCode, myPlayerId, isHost) => {
    const colors = ['#0284c7', '#dc2626', '#16a34a', '#ca8a04'];
    const players: PlayerCaverna[] = [];

    for (let i = 0; i < playerCount; i++) {
      const human = humanPlayers[i];
      const name = human ? human.name : `AI 드워프 ${i + 1}`;
      const isAI = !human;

      players.push({
        id: `p-${i}`,
        name: name,
        color: colors[i],
        isAI: isAI,
        resources: {
          wood: 1,
          stone: 0,
          ore: 0,
          ruby: 1,
          grain: 1,
          pumpkin: 0,
          food: 4,
          gold: 0
        },
        livestock: {
          sheep: 0,
          boar: 0,
          cattle: 0,
          donkey: 0
        },
        dwarfs: [
          { id: `d-${i}-0`, name: '첫째 드워프', weaponLevel: 0, hasActedThisRound: false, placedActionId: null },
          { id: `d-${i}-1`, name: '둘째 드워프', weaponLevel: 0, hasActedThisRound: false, placedActionId: null }
        ],
        caveBoard: createInitialCaveBoard(),
        fieldBoard: createInitialFieldBoard(),
        builtFurnishings: ['furn_entry_dwelling']
      });
    }

    const freshActions = INITIAL_ACTION_SPACES.map(a => ({ ...a, occupiedByPlayerId: null }));

    set({
      playMode: 'online',
      myPlayerId,
      isHost,
      roomCode,
      round: 1,
      phase: 'action',
      currentTurnPlayerIndex: 0,
      currentDwarfIndex: 0,
      players,
      actionSpaces: freshActions,
      availableFurnishings: [...INITIAL_FURNISHINGS],
      logs: [`🌐 [온라인 대전] 방 코드: ${roomCode} | 게임이 시작되었습니다!`],
      isGameOver: false,
      selectedFurnishingForBuild: null,
      isExpeditionModalOpen: false,
      activeDwarfForExpedition: null
    });

    if (isHost) {
      setTimeout(() => {
        get().syncToPeers();
      }, 300);
    }
  },

  syncRemoteState: (newState: Partial<CavernaGameState>) => {
    set(state => ({
      ...state,
      ...newState
    }));
  },

  syncToPeers: () => {
    const { playMode, isHost } = get();
    if (playMode === 'online' && isHost) {
      const serializable = getSerializableCavernaState(get());
      peerManager.broadcastStateSync(serializable);
    }
  },

  performAction: (actionSpaceId: string, actionDetail?: any) => {
    const { 
      playMode,
      isHost,
      myPlayerId,
      players, 
      currentTurnPlayerIndex, 
      actionSpaces, 
      logs, 
      isGameOver 
    } = get();

    if (isGameOver) return false;

    // 온라인 게스트인 경우 액션 호스트에게 전달
    if (playMode === 'online' && !isHost) {
      const currP = players[currentTurnPlayerIndex];
      if (currP.id !== myPlayerId) {
        showFeedback('내 차례가 아닙니다.');
        return false;
      }
      peerManager.sendAction('CAVERNA_PERFORM_ACTION', {
        actionSpaceId,
        actionDetail
      }, myPlayerId);
      return true;
    }

    const currPlayer = players[currentTurnPlayerIndex];
    const actionSpace = actionSpaces.find(a => a.id === actionSpaceId);
    if (!actionSpace || actionSpace.occupiedByPlayerId !== null) {
      showFeedback('이미 다른 드워프가 점유 중인 행동 칸입니다.');
      return false;
    }

    const availableDwarf = currPlayer.dwarfs.find(d => !d.hasActedThisRound);
    if (!availableDwarf) {
      showFeedback('이번 라운드에 일할 수 있는 드워프가 없습니다.');
      return false;
    }

    let updatedPlayer = {
      ...currPlayer,
      resources: { ...currPlayer.resources },
      livestock: { ...currPlayer.livestock },
      caveBoard: currPlayer.caveBoard.map(r => r.map(c => ({ ...c }))),
      fieldBoard: currPlayer.fieldBoard.map(r => r.map(c => ({ ...c }))),
      dwarfs: currPlayer.dwarfs.map(d => d.id === availableDwarf.id ? { ...d, hasActedThisRound: true, placedActionId: actionSpaceId } : d)
    };

    let updatedActionSpaces = [...actionSpaces];
    let actionLog = '';

    // 사운드 효과 분기
    if (actionSpace.id.includes('ore') || actionSpace.id.includes('cavern') || actionSpace.id.includes('excavat')) {
      soundManager.playPickaxeMine();
    } else if (actionSpace.id.includes('forest') || actionSpace.id.includes('wood') || actionSpace.id.includes('slash')) {
      soundManager.playAxeChop();
    } else {
      soundManager.playClick();
    }

    // 누적 자원 수령
    if (actionSpace.accumulatesResource) {
      const { resource } = actionSpace.accumulatesResource;
      const count = actionSpace.accumulatedCount;
      if (['sheep', 'boar', 'cattle', 'donkey'].includes(resource)) {
        updatedPlayer.livestock[resource as LivestockType] += count;
      } else {
        updatedPlayer.resources[resource as CavernaResource] += count;
      }
      actionLog = `${actionSpace.name}에서 ${resource} +${count}개 수확`;
      updatedActionSpaces = updatedActionSpaces.map(a => a.id === actionSpaceId ? { ...a, accumulatedCount: 0 } : a);
    }

    // 특수 액션 로직
    if (actionSpace.id === 'act_excavate') {
      const { updatedBoard, count } = excavateCavern(updatedPlayer.caveBoard);
      updatedPlayer.caveBoard = updatedBoard;
      updatedPlayer.resources.stone += count;
      soundManager.playPickaxeMine();
      actionLog += ` (동굴 ${count}칸 발굴 및 석재 +${count})`;
    } else if (actionSpace.id === 'act_slash_burn') {
      const { updatedBoard } = slashAndBurn(updatedPlayer.fieldBoard);
      updatedPlayer.fieldBoard = updatedBoard;
      soundManager.playAxeChop();
      actionLog += ` (숲 1칸 벌목 화전 개간)`;
    } else if (actionSpace.id === 'act_sow') {
      const cropToSow = actionDetail?.crop || (updatedPlayer.resources.grain > 0 ? 'grain' : 'pumpkin');
      if (updatedPlayer.resources[cropToSow as 'grain' | 'pumpkin'] > 0) {
        const { updatedBoard, success } = sowCropOnField(updatedPlayer.fieldBoard, cropToSow);
        if (success) {
          updatedPlayer.fieldBoard = updatedBoard;
          updatedPlayer.resources[cropToSow as 'grain' | 'pumpkin'] -= 1;
          actionLog += ` (밭에 ${cropToSow === 'grain' ? '곡물' : '호박'} 파종 완료)`;
        }
      }
    } else if (actionSpace.id === 'act_fences') {
      const { updatedBoard } = buildPasture(updatedPlayer.fieldBoard);
      updatedPlayer.fieldBoard = updatedBoard;
      actionLog += ` (울타리 목초지 조성)`;
    } else if (actionSpace.id === 'act_furnish') {
      soundManager.playBuild();
      if (actionDetail?.furnishingId) {
        get().buildFurnishingAction(actionDetail.furnishingId);
      } else {
        set({ selectedFurnishingForBuild: INITIAL_FURNISHINGS[0] });
      }
      actionLog += ` (가구 배치 및 방 타일 건축 마켓 방문)`;
    } else if (actionSpace.id === 'act_blacksmith') {
      const oreSpent = Math.min(updatedPlayer.resources.ore, 6);
      if (oreSpent > 0) {
        updatedPlayer.resources.ore -= oreSpent;
        updatedPlayer.dwarfs = updatedPlayer.dwarfs.map(d => 
          d.id === availableDwarf.id ? { ...d, weaponLevel: Math.min(14, d.weaponLevel + oreSpent) } : d
        );
        soundManager.playAnvilStrike();
        actionLog += ` (무기 레벨 +${oreSpent} 단조! 현재 Lv ${availableDwarf.weaponLevel + oreSpent})`;
      }
    } else if (actionSpace.id === 'act_expedition_1' || actionSpace.id === 'act_expedition_2') {
      soundManager.playExpeditionHorn();
      const currentWeapon = availableDwarf.weaponLevel;
      if (currentWeapon > 0) {
        updatedPlayer.dwarfs = updatedPlayer.dwarfs.map(d => 
          d.id === availableDwarf.id ? { ...d, weaponLevel: Math.min(14, d.weaponLevel + 1) } : d
        );
        actionLog += ` (원정 출정! 무기숙련도 +1 상승)`;
        set({
          isExpeditionModalOpen: true,
          activeDwarfForExpedition: availableDwarf.id
        });
      }
    }

    updatedActionSpaces = updatedActionSpaces.map(a => 
      a.id === actionSpaceId ? { ...a, occupiedByPlayerId: currPlayer.id } : a
    );

    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = updatedPlayer;

    const newLogs = [`${currPlayer.name}: ${actionLog || actionSpace.name} 수행`, ...logs];

    set({
      players: updatedPlayers,
      actionSpaces: updatedActionSpaces,
      logs: newLogs
    });

    get().syncToPeers();
    get().advanceTurn();
    return true;
  },

  buildFurnishingAction: (furnishingId: string) => {
    const { 
      playMode,
      isHost,
      myPlayerId,
      players, 
      currentTurnPlayerIndex, 
      availableFurnishings, 
      logs 
    } = get();

    if (playMode === 'online' && !isHost) {
      peerManager.sendAction('CAVERNA_BUILD_FURNISHING', { furnishingId }, myPlayerId);
      set({ selectedFurnishingForBuild: null });
      return true;
    }

    const curr = players[currentTurnPlayerIndex];
    const furnishing = availableFurnishings.find(f => f.id === furnishingId);
    if (!furnishing) return false;

    // 비용 검증
    for (const [res, cost] of Object.entries(furnishing.cost)) {
      if ((curr.resources[res as CavernaResource] || 0) < (cost || 0)) {
        showFeedback(`자원이 부족합니다: ${res} 필요`);
        return false;
      }
    }

    const { updatedBoard, success } = placeFurnishing(curr.caveBoard, furnishingId, furnishing.category === 'dwelling');
    if (!success) {
      showFeedback('배치 가능한 빈 동굴(Cavern) 슬롯이 없습니다. 먼저 동굴을 발굴하세요.');
      return false;
    }

    soundManager.playBuild();

    const updatedResources = { ...curr.resources };
    for (const [res, cost] of Object.entries(furnishing.cost)) {
      updatedResources[res as CavernaResource] -= (cost || 0);
    }

    const updatedPlayer: PlayerCaverna = {
      ...curr,
      resources: updatedResources,
      caveBoard: updatedBoard,
      builtFurnishings: [...curr.builtFurnishings, furnishingId]
    };

    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = updatedPlayer;

    const remainingFurnishings = availableFurnishings.filter(f => f.id !== furnishingId);

    set({
      players: updatedPlayers,
      availableFurnishings: remainingFurnishings,
      selectedFurnishingForBuild: null,
      logs: [`${curr.name}: [${furnishing.name}] 방 건축 완료! (+${furnishing.vp}점)`, ...logs]
    });

    showFeedback(`[${furnishing.name}] 방을 건축했습니다!`);
    get().syncToPeers();
    return true;
  },

  claimExpeditionLoot: (lootId: string) => {
    const { 
      playMode,
      isHost,
      myPlayerId,
      players, 
      currentTurnPlayerIndex, 
      logs 
    } = get();

    if (playMode === 'online' && !isHost) {
      peerManager.sendAction('CAVERNA_CLAIM_LOOT', { lootId }, myPlayerId);
      set({
        isExpeditionModalOpen: false,
        activeDwarfForExpedition: null
      });
      return;
    }

    const curr = players[currentTurnPlayerIndex];
    const loot = EXPEDITION_LOOT_TABLE.find(l => l.id === lootId);
    if (!loot) return;

    const updatedPlayer: PlayerCaverna = {
      ...curr,
      resources: { ...curr.resources },
      livestock: { ...curr.livestock },
      caveBoard: curr.caveBoard.map(r => r.map(c => ({ ...c }))),
      fieldBoard: curr.fieldBoard.map(r => r.map(c => ({ ...c })))
    };

    if (loot.grantResource) {
      for (const [res, amount] of Object.entries(loot.grantResource)) {
        updatedPlayer.resources[res as CavernaResource] += (amount || 0);
      }
    }

    if (loot.grantLivestock) {
      for (const [res, amount] of Object.entries(loot.grantLivestock)) {
        updatedPlayer.livestock[res as LivestockType] += (amount || 0);
      }
    }

    if (loot.specialAction === 'free_cavern') {
      const { updatedBoard } = excavateCavern(updatedPlayer.caveBoard);
      updatedPlayer.caveBoard = updatedBoard;
      soundManager.playPickaxeMine();
    } else if (loot.specialAction === 'free_field') {
      const { updatedBoard } = slashAndBurn(updatedPlayer.fieldBoard);
      updatedPlayer.fieldBoard = updatedBoard;
      soundManager.playAxeChop();
    } else if (loot.specialAction === 'free_stable') {
      const { updatedBoard } = buildPasture(updatedPlayer.fieldBoard);
      updatedPlayer.fieldBoard = updatedBoard;
    }

    soundManager.playCoin();

    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = updatedPlayer;

    set({
      players: updatedPlayers,
      isExpeditionModalOpen: false,
      activeDwarfForExpedition: null,
      logs: [`${curr.name}: 원정 전리품 [${loot.name}] 획득!`, ...logs]
    });

    get().syncToPeers();
  },

  advanceTurn: () => {
    const { players, currentTurnPlayerIndex, actionSpaces, round, logs } = get();

    const allDwarfsDone = players.every(p => p.dwarfs.every(d => d.hasActedThisRound));

    if (allDwarfsDone) {
      const { updatedPlayers: fedPlayers, logs: harvestLogs } = processHarvestPhase(players);
      soundManager.playShipCargo();

      const refreshedActions = actionSpaces.map(a => {
        let count = a.accumulatedCount;
        if (a.accumulatesResource) {
          count += a.accumulatesResource.amountPerRound;
        }
        return {
          ...a,
          occupiedByPlayerId: null,
          accumulatedCount: count
        };
      });

      if (round < 8) {
        set({
          round: round + 1,
          currentTurnPlayerIndex: 0,
          players: fedPlayers,
          actionSpaces: refreshedActions,
          logs: [`🔔 [제 ${round + 1} 라운드] 시작! 새로운 동굴 개척의 날이 밝았습니다.`, ...harvestLogs, ...logs]
        });
        get().syncToPeers();
      } else {
        soundManager.playGrandFanfare();
        set({
          isGameOver: true,
          phase: 'game_over',
          players: fedPlayers,
          logs: ['🏁 [카베르나] 8개 라운드가 모두 완료되었습니다! 최종 일족 번영도 점수를 집계합니다.', ...harvestLogs, ...logs]
        });
        get().syncToPeers();
        return;
      }
    } else {
      let nextIdx = (currentTurnPlayerIndex + 1) % players.length;
      let loopCount = 0;
      while (players[nextIdx].dwarfs.every(d => d.hasActedThisRound) && loopCount < players.length) {
        nextIdx = (nextIdx + 1) % players.length;
        loopCount++;
      }

      set({ currentTurnPlayerIndex: nextIdx });
      get().syncToPeers();
    }

    setTimeout(() => {
      const state = get();
      const nextP = state.players[state.currentTurnPlayerIndex];
      if (nextP && nextP.isAI && !state.isGameOver) {
        const decision = CavernaAI.decideAction(nextP, state.actionSpaces, state.availableFurnishings);
        state.performAction(decision.actionSpaceId, {
          furnishingId: decision.furnishingIdToBuild,
          crop: decision.cropToSow,
          oreAmount: decision.oreToForge
        });
      }
    }, 700);
  }
}));

if (typeof window !== 'undefined') {
  (window as any).__CAVERNA_STORE__ = useCavernaStore;
}
