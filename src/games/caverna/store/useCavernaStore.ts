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

interface CavernaStore extends CavernaGameState {
  selectedFurnishingForBuild: FurnishingTile | null;
  isExpeditionModalOpen: boolean;
  activeDwarfForExpedition: string | null;

  initGame: (playerCount?: number, withAI?: boolean) => void;
  performAction: (actionSpaceId: string, actionDetail?: any) => boolean;
  buildFurnishingAction: (furnishingId: string) => boolean;
  claimExpeditionLoot: (lootId: string) => void;
  advanceTurn: () => void;
  openFurnishingModal: () => void;
  closeFurnishingModal: () => void;
}

export const useCavernaStore = create<CavernaStore>((set, get) => ({
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
          ruby: 1, // 시작 조커 루비 1개
          grain: 1, // 시작 종자 곡물 1개
          pumpkin: 0,
          food: 4, // 시작 식량 4
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

  performAction: (actionSpaceId: string, actionDetail?: any) => {
    const { 
      players, 
      currentTurnPlayerIndex, 
      actionSpaces, 
      logs, 
      isGameOver 
    } = get();

    if (isGameOver) return false;

    const currPlayer = players[currentTurnPlayerIndex];
    const actionSpace = actionSpaces.find(a => a.id === actionSpaceId);
    if (!actionSpace || actionSpace.occupiedByPlayerId !== null) {
      showFeedback('이미 다른 드워프가 점유 중인 행동 칸입니다.');
      return false;
    }

    // 미행동 드워프 찾기
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
      soundManager.playCargoLoad();
    }

    // 행동별 고유 로직 처리
    switch (actionSpace.actionType) {
      case 'logging':
      case 'quarry':
      case 'ore_mining':
      case 'ruby_mining':
      case 'sheep_farming':
        // 누적 자원 수령 완료
        break;

      case 'slash_and_burn': {
        const { updatedBoard, success } = slashAndBurn(updatedPlayer.fieldBoard);
        if (success) {
          updatedPlayer.fieldBoard = updatedBoard;
          updatedPlayer.resources.wood += 1;
          soundManager.playWoodToken();
          actionLog = '숲 1칸을 밭으로 개간하고 나무 1개를 얻었습니다.';
        } else {
          showFeedback('개간할 수 있는 숲이 없습니다.');
          return false;
        }
        break;
      }

      case 'sow_crops': {
        const cropKey: 'grain' | 'pumpkin' = actionDetail?.crop || (updatedPlayer.resources.grain > 0 ? 'grain' : 'pumpkin');
        if (updatedPlayer.resources[cropKey] <= 0) {
          showFeedback('파종할 종자가 없습니다.');
          return false;
        }
        const { updatedBoard, success } = sowCropOnField(updatedPlayer.fieldBoard, cropKey);
        if (success) {
          updatedPlayer.fieldBoard = updatedBoard;
          updatedPlayer.resources[cropKey] -= 1;
          soundManager.playParchment();
          actionLog = `밭에 ${cropKey === 'grain' ? '곡물' : '호박'} 종자를 파종했습니다.`;
        } else {
          showFeedback('파종할 빈 밭이 없습니다.');
          return false;
        }
        break;
      }

      case 'excavation': {
        const { updatedBoard, count } = excavateCavern(updatedPlayer.caveBoard);
        if (count > 0) {
          updatedPlayer.caveBoard = updatedBoard;
          updatedPlayer.resources.stone += 1;
          soundManager.playAnvilStrike();
          actionLog = `단단한 암석 ${count}칸을 발굴하여 빈 동굴을 확보했습니다. (돌 +1)`;
        } else {
          showFeedback('더 이상 발굴할 암석이 없습니다.');
          return false;
        }
        break;
      }

      case 'furnish_cavern': {
        set({ selectedFurnishingForBuild: INITIAL_FURNISHINGS[0] });
        actionLog = '방 인테리어 타일 선택으로 진입';
        break;
      }

      case 'blacksmith': {
        const oreToForge = Math.min(8, Math.max(1, actionDetail?.oreAmount || Math.min(4, updatedPlayer.resources.ore)));
        if (updatedPlayer.resources.ore >= oreToForge && oreToForge > 0) {
          updatedPlayer.resources.ore -= oreToForge;
          // 드워프 무기 레벨 단조
          updatedPlayer.dwarfs = updatedPlayer.dwarfs.map(d => {
            if (d.id === availableDwarf.id) {
              return { ...d, weaponLevel: Math.min(14, d.weaponLevel + oreToForge) };
            }
            return d;
          });
          soundManager.playAnvilStrike();
          actionLog = `광석 ${oreToForge}개로 무기(레벨 +${oreToForge})를 단조했습니다!`;
        } else {
          showFeedback('무기를 단조할 광석이 부족합니다.');
          return false;
        }
        break;
      }

      case 'expedition': {
        soundManager.playFanfare();
        actionLog = '영웅 원정에 출정하여 전리품을 획득했습니다.';
        break;
      }

      case 'fencing': {
        const { updatedBoard, count } = buildPasture(updatedPlayer.fieldBoard);
        if (count > 0 && updatedPlayer.resources.wood >= 2) {
          updatedPlayer.fieldBoard = updatedBoard;
          updatedPlayer.resources.wood -= 2;
          soundManager.playWoodToken();
          actionLog = `초원 ${count}칸에 울타리를 쳐 목초지로 전환했습니다.`;
        } else {
          showFeedback('목재(2개 필요) 또는 개간된 초원이 부족합니다.');
          return false;
        }
        break;
      }

      case 'cattle_farming': {
        updatedPlayer.livestock.cattle += 1;
        updatedPlayer.livestock.boar += 1;
        soundManager.playCargoLoad();
        actionLog = '가축 시장에서 소 1마리와 멧돼지 1마리를 분양받았습니다.';
        break;
      }
    }

    // 해당 행동 칸 점유 처리 및 누적 자원 리셋
    updatedActionSpaces = updatedActionSpaces.map(a => {
      if (a.id === actionSpaceId) {
        return { ...a, occupiedByPlayerId: currPlayer.id, accumulatedCount: 0 };
      }
      return a;
    });

    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = updatedPlayer;

    showFeedback(actionLog);

    set({
      players: updatedPlayers,
      actionSpaces: updatedActionSpaces,
      logs: [`${currPlayer.name}: ${actionLog}`, ...logs]
    });

    get().advanceTurn();
    return true;
  },

  buildFurnishingAction: (furnishingId: string) => {
    const { players, currentTurnPlayerIndex, availableFurnishings, logs } = get();
    const curr = players[currentTurnPlayerIndex];
    const furnishing = availableFurnishings.find(f => f.id === furnishingId);
    if (!furnishing) return false;

    // 자원 체크
    for (const [res, cost] of Object.entries(furnishing.cost)) {
      if ((curr.resources[res as CavernaResource] || 0) < (cost || 0)) {
        showFeedback(`건설 자원(${res})이 부족합니다.`);
        return false;
      }
    }

    // 빈 동굴 공간 찾기
    const { updatedBoard, success } = placeFurnishing(
      curr.caveBoard, 
      furnishing.id, 
      furnishing.category === 'dwelling'
    );

    if (!success) {
      showFeedback('타일을 배치할 빈 동굴 공간이 없습니다. 먼저 동굴을 발굴하세요.');
      return false;
    }

    // 자원 차감
    const updatedResources = { ...curr.resources };
    for (const [res, cost] of Object.entries(furnishing.cost)) {
      updatedResources[res as CavernaResource] -= (cost || 0);
    }

    // 즉각 보너스 지급
    if (furnishing.immediateBonus) {
      for (const [res, bonus] of Object.entries(furnishing.immediateBonus)) {
        updatedResources[res as CavernaResource] += (bonus || 0);
      }
    }

    // 주거 수용량 증가 시 신규 드워프 추가
    let updatedDwarfs = [...curr.dwarfs];
    if (furnishing.dwellingCapacity && updatedDwarfs.length < 5) {
      updatedDwarfs.push({
        id: `d-${curr.id}-${updatedDwarfs.length}`,
        name: `드워프 ${updatedDwarfs.length + 1}째`,
        weaponLevel: 0,
        hasActedThisRound: false,
        placedActionId: null
      });
    }

    soundManager.playBuild();

    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = {
      ...curr,
      resources: updatedResources,
      dwarfs: updatedDwarfs,
      caveBoard: updatedBoard,
      builtFurnishings: [...curr.builtFurnishings, furnishing.id]
    };

    set({
      players: updatedPlayers,
      selectedFurnishingForBuild: null,
      logs: [`${curr.name}: [${furnishing.name}] 완공! (VP +${furnishing.vp})`, ...logs]
    });

    showFeedback(`[${furnishing.name}] 완공!`);
    return true;
  },

  claimExpeditionLoot: (lootId: string) => {
    const { players, currentTurnPlayerIndex, logs } = get();
    const curr = players[currentTurnPlayerIndex];
    const loot = EXPEDITION_LOOT_TABLE.find(l => l.id === lootId);
    if (!loot) return;

    let updatedPlayer = {
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
    } else if (loot.specialAction === 'free_field') {
      const { updatedBoard } = slashAndBurn(updatedPlayer.fieldBoard);
      updatedPlayer.fieldBoard = updatedBoard;
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
  },

  advanceTurn: () => {
    const { players, currentTurnPlayerIndex, actionSpaces, round, logs } = get();

    // 모든 플레이어의 모든 드워프가 행동을 완료했는지 확인
    const allDwarfsDone = players.every(p => p.dwarfs.every(d => d.hasActedThisRound));

    if (allDwarfsDone) {
      // 1라운드 종료 ➔ 수확 및 밥 먹이기 단계
      const { updatedPlayers: fedPlayers, logs: harvestLogs } = processHarvestPhase(players);

      soundManager.playShipCargo();

      // 누적 행동 칸 자원 보충
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
      } else {
        // 8라운드 게임 완전 종료!
        soundManager.playGrandFanfare();
        set({
          isGameOver: true,
          phase: 'game_over',
          players: fedPlayers,
          logs: ['🏁 [카베르나] 8개 라운드가 모두 완료되었습니다! 최종 일족 번영도 점수를 집계합니다.', ...harvestLogs, ...logs]
        });
        return;
      }
    } else {
      // 다음 플레이어로 턴 전환 (드워프 미행동 플레이어 탐색)
      let nextIdx = (currentTurnPlayerIndex + 1) % players.length;
      let loopCount = 0;
      while (players[nextIdx].dwarfs.every(d => d.hasActedThisRound) && loopCount < players.length) {
        nextIdx = (nextIdx + 1) % players.length;
        loopCount++;
      }

      set({ currentTurnPlayerIndex: nextIdx });
    }

    // AI 플레이어 턴인 경우 자동 실행
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
