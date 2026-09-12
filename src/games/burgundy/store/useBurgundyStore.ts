import { create } from 'zustand';
import type { PlayerBurgundy, HexTile, GoodsTile, BurgundyPhase } from '../types';
import { createInitialDuchy } from '../data/boardLayout';
import { generateTilePool, generateGoodsTiles } from '../data/tiles';
import { canPlaceTileOnSlot, executeTilePlacement, executeGoodsSale } from '../engine/gameLogic';
import { BurgundyAI } from '../engine/aiPlayer';
import { soundManager } from '../../../utils/sound';
import { showFeedback } from '../../../utils/feedback';

import { peerManager } from '../../../platform/network/peerManager';

interface BurgundyState {
  // 멀티플레이 상태
  playMode: 'solo' | 'local_pass' | 'online';
  myPlayerId: string;
  isHost: boolean;
  roomCode: string | null;

  phase: BurgundyPhase;
  round: number; // 1 ~ 5
  players: PlayerBurgundy[];
  currentTurnPlayerIndex: number;
  centralDepots: Record<number, HexTile[]>; // 디포 1 ~ 6
  blackMarketDepot: HexTile[];             // 은화 2개 암시장 타일들
  tileDeck: HexTile[];
  goodsDeck: GoodsTile[];
  logs: string[];
  isGameOver: boolean;
  aiDifficulty: 'easy' | 'normal' | 'hard';
  
  // 현재 UI 선택 상태
  selectedDieIndex: 0 | 1 | null;
  selectedKeySlotIndex: number | null;
  uiTheme: 'tabletop' | 'modern';

  // 액션
  initGame: (playerCount?: number, withAI?: boolean, aiDifficulty?: 'easy' | 'normal' | 'hard') => void;
  initOnlineGame: (
    playerCount: number,
    humanPlayers: { name: string; peerId: string }[],
    roomCode: string,
    myPlayerId: string,
    isHost: boolean
  ) => void;
  syncRemoteState: (newState: Partial<BurgundyState>) => void;
  syncToPeers: () => void;

  selectDie: (dieIndex: 0 | 1 | null) => void;
  selectKeySlot: (slotIndex: number | null) => void;
  adjustDieWithWorker: (dieIndex: 0 | 1, delta: number) => void;
  takeTileFromDepot: (depotNumber: number, tileId: string) => boolean;
  placeTileFromStorage: (slotId: number) => boolean;
  sellGoodsAction: (goodsDieNumber: number) => boolean;
  takeWorkersAction: () => boolean;
  buyFromBlackMarket: (tileId: string) => boolean;
  endTurnIfFinished: () => void;
  runAITurnIfNeeded: () => void;
  toggleUITheme: () => void;
}

const PHASES: BurgundyPhase[] = ['A', 'B', 'C', 'D', 'E'];

export const getSerializableBurgundyState = (state: BurgundyState) => ({
  phase: state.phase,
  round: state.round,
  players: state.players,
  currentTurnPlayerIndex: state.currentTurnPlayerIndex,
  centralDepots: state.centralDepots,
  blackMarketDepot: state.blackMarketDepot,
  tileDeck: state.tileDeck,
  goodsDeck: state.goodsDeck,
  logs: state.logs,
  isGameOver: state.isGameOver,
  aiDifficulty: state.aiDifficulty,
});

export const useBurgundyStore = create<BurgundyState>((set, get) => ({
  playMode: 'solo',
  myPlayerId: 'p-0',
  isHost: true,
  roomCode: null,

  phase: 'A',
  round: 1,
  players: [],
  currentTurnPlayerIndex: 0,
  centralDepots: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
  blackMarketDepot: [],
  tileDeck: [],
  goodsDeck: [],
  logs: [],
  isGameOver: false,
  aiDifficulty: 'normal',
  selectedDieIndex: null,
  selectedKeySlotIndex: null,
  uiTheme: (typeof localStorage !== 'undefined' && localStorage.getItem('pr_ui_theme') === 'modern') ? 'modern' : 'tabletop',

  syncToPeers: () => {
    if (get().playMode === 'online' && get().isHost) {
      peerManager.broadcastStateSync(getSerializableBurgundyState(get()));
    }
  },

  syncRemoteState: (newState) => {
    set((state) => ({
      ...state,
      ...newState
    }));
  },

  initGame: (playerCount = 2, withAI = true, aiDifficulty: 'easy' | 'normal' | 'hard' = 'normal') => {
    const tileDeck = generateTilePool();
    const goodsDeck = generateGoodsTiles();

    // 초기 플레이어 목록 생성
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
    const names = ['나 (플레이어)', 'AI 볼테르', 'AI 루이 14세', 'AI 잔 다르크'];

    const players: PlayerBurgundy[] = [];
    for (let i = 0; i < playerCount; i++) {
      players.push({
        id: `p-${i}`,
        name: i === 0 ? '나 (군주)' : (withAI ? names[i] : `플레이어 ${i + 1}`),
        color: colors[i],
        isAI: i > 0 && withAI,
        vp: 0,
        silverlings: 1, // 초기 은화 1개
        workers: i + 1, // 턴 순서별 일꾼 보정 (1번 1개, 2번 2개 등)
        keySlots: [null, null, null],
        goods: [goodsDeck.pop()!], // 시작 상품 1개
        soldGoodsCount: 0,
        duchy: createInitialDuchy(),
        dice: [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1],
        usedDice: [false, false],
        turnOrderPos: playerCount - i // 1번 플레이어가 앞섬
      });
    }

    // 중앙 1~6 디포 채우기 (디포당 1~2개 타일)
    const centralDepots: Record<number, HexTile[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    for (let d = 1; d <= 6; d++) {
      for (let c = 0; c < playerCount; c++) {
        if (tileDeck.length > 0) {
          centralDepots[d].push(tileDeck.pop()!);
        }
      }
    }

    // 암시장 타일 4개 배치
    const blackMarketDepot: HexTile[] = [];
    for (let b = 0; b < 4; b++) {
      if (tileDeck.length > 0) blackMarketDepot.push(tileDeck.pop()!);
    }

    soundManager.playDiceRoll();

    set({
      playMode: withAI ? 'solo' : 'local_pass',
      myPlayerId: 'p-0',
      isHost: true,
      roomCode: null,
      phase: 'A',
      round: 1,
      players,
      currentTurnPlayerIndex: 0,
      centralDepots,
      blackMarketDepot,
      tileDeck,
      goodsDeck,
      logs: ['🏰 버건디의 성 게임이 시작되었습니다! 영지를 번영시키세요.'],
      isGameOver: false,
      aiDifficulty,
      selectedDieIndex: 0,
      selectedKeySlotIndex: null
    });
  },

  // 온라인 실시간 멀티플레이 초기화
  initOnlineGame: (playerCount, humanPlayers, roomCode, myPlayerId, isHost) => {
    const tileDeck = generateTilePool();
    const goodsDeck = generateGoodsTiles();

    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
    const defaultAINames = ['AI 볼테르', 'AI 루이 14세', 'AI 잔 다르크'];

    const players: PlayerBurgundy[] = [];
    for (let i = 0; i < playerCount; i++) {
      const isHuman = i < humanPlayers.length;
      const playerName = isHuman ? humanPlayers[i].name : defaultAINames[i - humanPlayers.length];

      players.push({
        id: `p-${i}`,
        name: playerName,
        color: colors[i % colors.length],
        isAI: !isHuman,
        vp: 0,
        silverlings: 1,
        workers: i + 1,
        keySlots: [null, null, null],
        goods: [goodsDeck.pop()!],
        soldGoodsCount: 0,
        duchy: createInitialDuchy(),
        dice: [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1],
        usedDice: [false, false],
        turnOrderPos: playerCount - i
      });
    }

    const centralDepots: Record<number, HexTile[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    for (let d = 1; d <= 6; d++) {
      for (let c = 0; c < playerCount; c++) {
        if (tileDeck.length > 0) {
          centralDepots[d].push(tileDeck.pop()!);
        }
      }
    }

    const blackMarketDepot: HexTile[] = [];
    for (let b = 0; b < 4; b++) {
      if (tileDeck.length > 0) blackMarketDepot.push(tileDeck.pop()!);
    }

    soundManager.playDiceRoll();

    set({
      playMode: 'online',
      myPlayerId,
      isHost,
      roomCode,
      phase: 'A',
      round: 1,
      players,
      currentTurnPlayerIndex: 0,
      centralDepots,
      blackMarketDepot,
      tileDeck,
      goodsDeck,
      logs: [`🌐 온라인 멀티플레이 대전이 시작되었습니다! (방 코드: ${roomCode})`],
      isGameOver: false,
      selectedDieIndex: 0,
      selectedKeySlotIndex: null
    });

    if (isHost) {
      get().syncToPeers();
    }
  },

  selectDie: (dieIndex) => {
    soundManager.playClick();
    set({ selectedDieIndex: dieIndex });
  },

  selectKeySlot: (slotIndex) => {
    soundManager.playClick();
    set({ selectedKeySlotIndex: slotIndex });
  },

  // 일꾼 토큰을 소모하여 주사위 눈금 변경 (+1 또는 -1)
  adjustDieWithWorker: (dieIndex, delta) => {
    if (get().playMode === 'online' && !get().isHost) {
      peerManager.sendAction('adjustDieWithWorker', { dieIndex, delta });
      return;
    }

    const { players, currentTurnPlayerIndex } = get();
    const curr = players[currentTurnPlayerIndex];
    if (curr.workers <= 0 || curr.usedDice[dieIndex]) return;

    soundManager.playWoodToken();
    let val = curr.dice[dieIndex] + delta;
    if (val > 6) val = 1;
    if (val < 1) val = 6;

    const newDice: [number, number] = [...curr.dice];
    newDice[dieIndex] = val;

    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = {
      ...curr,
      workers: curr.workers - 1,
      dice: newDice
    };

    set({ players: updatedPlayers });
    showFeedback(`주사위 눈금 변경: [${val}] (일꾼 -1)`);
    get().syncToPeers();
  },

  // 중앙 디포에서 타일 가져오기
  takeTileFromDepot: (depotNumber, tileId) => {
    if (get().playMode === 'online' && !get().isHost) {
      const { selectedDieIndex } = get();
      peerManager.sendAction('takeTileFromDepot', { depotNumber, tileId, selectedDieIndex });
      return true;
    }

    const { players, currentTurnPlayerIndex, selectedDieIndex, centralDepots, logs } = get();
    const curr = players[currentTurnPlayerIndex];
    if (selectedDieIndex === null || curr.usedDice[selectedDieIndex]) return false;

    // 빈 키 슬롯 찾기
    const emptySlotIdx = curr.keySlots.findIndex(s => s === null);
    if (emptySlotIdx === -1) {
      showFeedback('보관소(3칸)가 꽉 차서 타일을 가져올 수 없습니다!');
      return false;
    }

    const dieVal = curr.dice[selectedDieIndex];
    if (dieVal !== depotNumber) {
      showFeedback(`선택한 주사위 눈금 [${dieVal}]과 디포 번호 [${depotNumber}]가 일치해야 합니다.`);
      return false;
    }

    const depotList = centralDepots[depotNumber] || [];
    const tileIdx = depotList.findIndex(t => t.id === tileId);
    if (tileIdx === -1) return false;

    const tile = depotList[tileIdx];
    const newDepotList = [...depotList];
    newDepotList.splice(tileIdx, 1);

    const newKeySlots = [...curr.keySlots];
    newKeySlots[emptySlotIdx] = tile;

    const newUsedDice: [boolean, boolean] = [...curr.usedDice];
    newUsedDice[selectedDieIndex] = true;

    soundManager.playParchment();
    showFeedback(`[${tile.name}] 타일 보관소 획득!`);

    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = {
      ...curr,
      keySlots: newKeySlots,
      usedDice: newUsedDice
    };

    set({
      players: updatedPlayers,
      centralDepots: { ...centralDepots, [depotNumber]: newDepotList },
      selectedDieIndex: newUsedDice[0] && newUsedDice[1] ? null : (newUsedDice[0] ? 1 : 0),
      logs: [`${curr.name}: ${depotNumber}번 디포에서 [${tile.name}] 타일 획득`, ...logs]
    });

    get().syncToPeers();
    get().endTurnIfFinished();
    return true;
  },

  // 내 보관소에서 영지(Duchy) 슬롯으로 타일 배치
  placeTileFromStorage: (slotId) => {
    if (get().playMode === 'online' && !get().isHost) {
      const { selectedDieIndex, selectedKeySlotIndex } = get();
      peerManager.sendAction('placeTileFromStorage', { slotId, selectedDieIndex, selectedKeySlotIndex });
      return true;
    }

    const { players, currentTurnPlayerIndex, selectedDieIndex, selectedKeySlotIndex, phase, logs } = get();
    const curr = players[currentTurnPlayerIndex];
    if (selectedDieIndex === null || selectedKeySlotIndex === null) {
      showFeedback('배치할 타일과 사용할 주사위를 먼저 선택하세요.');
      return false;
    }

    const tile = curr.keySlots[selectedKeySlotIndex];
    if (!tile) return false;

    const slot = curr.duchy.find(s => s.id === slotId);
    if (!slot) return false;

    const dieVal = curr.dice[selectedDieIndex];
    const check = canPlaceTileOnSlot(curr, tile, slot, dieVal, curr.workers);

    if (!check.valid) {
      showFeedback(check.reason || '배치할 수 없는 슬롯입니다.');
      return false;
    }

    // 타일 배치 실행
    const res = executeTilePlacement(curr, tile, slotId, phase);
    let updatedPlayer = res.updatedPlayer;

    // 일꾼 보정이 필요한 경우 일꾼 차감
    if (check.requiredWorkers > 0) {
      updatedPlayer = {
        ...updatedPlayer,
        workers: updatedPlayer.workers - check.requiredWorkers
      };
    }

    // 보관소에서 타일 제거 & 주사위 사용 처리
    const newKeySlots = [...updatedPlayer.keySlots];
    newKeySlots[selectedKeySlotIndex] = null;

    const newUsedDice: [boolean, boolean] = [...updatedPlayer.usedDice];
    if (!res.extraTurnGranted) {
      newUsedDice[selectedDieIndex] = true;
    }

    updatedPlayer = {
      ...updatedPlayer,
      keySlots: newKeySlots,
      usedDice: newUsedDice
    };

    soundManager.playWoodToken();
    if (res.vpGained > 0) {
      setTimeout(() => soundManager.playFanfare(), 150);
    }
    showFeedback(res.message);

    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = updatedPlayer;

    set({
      players: updatedPlayers,
      selectedDieIndex: newUsedDice[0] && newUsedDice[1] ? null : (newUsedDice[0] ? 1 : 0),
      selectedKeySlotIndex: null,
      logs: [`${curr.name}: ${res.message}`, ...logs]
    });

    get().syncToPeers();
    get().endTurnIfFinished();
    return true;
  },

  // 상품 판매 액션
  sellGoodsAction: (goodsDieNumber) => {
    if (get().playMode === 'online' && !get().isHost) {
      const { selectedDieIndex } = get();
      peerManager.sendAction('sellGoodsAction', { goodsDieNumber, selectedDieIndex });
      return true;
    }

    const { players, currentTurnPlayerIndex, selectedDieIndex, logs } = get();
    const curr = players[currentTurnPlayerIndex];
    if (selectedDieIndex === null || curr.usedDice[selectedDieIndex]) return false;

    const dieVal = curr.dice[selectedDieIndex];
    if (dieVal !== goodsDieNumber) {
      showFeedback(`주사위 눈금 [${dieVal}]과 상품 번호 [${goodsDieNumber}]가 일치해야 합니다.`);
      return false;
    }

    const res = executeGoodsSale(curr, goodsDieNumber);
    if (res.goodsSold.length === 0) {
      showFeedback('판매할 수 있는 해당 번호의 상품이 없습니다.');
      return false;
    }

    const newUsedDice: [boolean, boolean] = [...res.updatedPlayer.usedDice];
    newUsedDice[selectedDieIndex] = true;

    soundManager.playCoin();
    showFeedback(`상품 판매 완료: 은화 +${res.silverGained}, 승점 +${res.vpGained}`);

    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = {
      ...res.updatedPlayer,
      usedDice: newUsedDice
    };

    set({
      players: updatedPlayers,
      selectedDieIndex: newUsedDice[0] && newUsedDice[1] ? null : (newUsedDice[0] ? 1 : 0),
      logs: [`${curr.name}: [${goodsDieNumber}번 상품] ${res.goodsSold.length}개 판매 (+${res.vpGained} VP, +${res.silverGained} 은화)`, ...logs]
    });

    get().syncToPeers();
    get().endTurnIfFinished();
    return true;
  },

  // 일꾼 2개 영입 기본 액션
  takeWorkersAction: () => {
    if (get().playMode === 'online' && !get().isHost) {
      const { selectedDieIndex } = get();
      peerManager.sendAction('takeWorkersAction', { selectedDieIndex });
      return true;
    }

    const { players, currentTurnPlayerIndex, selectedDieIndex, logs } = get();
    const curr = players[currentTurnPlayerIndex];
    if (selectedDieIndex === null || curr.usedDice[selectedDieIndex]) return false;

    const newUsedDice: [boolean, boolean] = [...curr.usedDice];
    newUsedDice[selectedDieIndex] = true;

    soundManager.playWoodToken();
    showFeedback('일꾼 토큰 +2개 획득');

    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = {
      ...curr,
      workers: curr.workers + 2,
      usedDice: newUsedDice
    };

    set({
      players: updatedPlayers,
      selectedDieIndex: newUsedDice[0] && newUsedDice[1] ? null : (newUsedDice[0] ? 1 : 0),
      logs: [`${curr.name}: 주사위를 사용하여 일꾼 2개 획득`, ...logs]
    });

    get().syncToPeers();
    get().endTurnIfFinished();
    return true;
  },

  // 암시장에서 은화 2개로 타일 즉시 구매
  buyFromBlackMarket: (tileId) => {
    if (get().playMode === 'online' && !get().isHost) {
      peerManager.sendAction('buyFromBlackMarket', { tileId });
      return true;
    }

    const { players, currentTurnPlayerIndex, blackMarketDepot, logs } = get();
    const curr = players[currentTurnPlayerIndex];
    if (curr.silverlings < 2) {
      showFeedback('은화가 부족합니다 (은화 2개 필요).');
      return false;
    }

    const emptySlotIdx = curr.keySlots.findIndex(s => s === null);
    if (emptySlotIdx === -1) {
      showFeedback('보관소(3칸)가 꽉 찼습니다.');
      return false;
    }

    const tileIdx = blackMarketDepot.findIndex(t => t.id === tileId);
    if (tileIdx === -1) return false;

    const tile = blackMarketDepot[tileIdx];
    const newBM = [...blackMarketDepot];
    newBM.splice(tileIdx, 1);

    const newKeySlots = [...curr.keySlots];
    newKeySlots[emptySlotIdx] = tile;

    soundManager.playCoin();
    showFeedback(`암시장에서 [${tile.name}] 구매! (은화 -2)`);

    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = {
      ...curr,
      silverlings: curr.silverlings - 2,
      keySlots: newKeySlots
    };

    set({
      players: updatedPlayers,
      blackMarketDepot: newBM,
      logs: [`${curr.name}: 은화 2개로 암시장에서 [${tile.name}] 구매`, ...logs]
    });

    get().syncToPeers();
    return true;
  },

  // 턴 종료 및 라운드/페이즈 전진 판정
  endTurnIfFinished: () => {
    const { players, currentTurnPlayerIndex, round, phase, tileDeck } = get();
    const curr = players[currentTurnPlayerIndex];

    // 현재 플레이어가 주사위 2개를 모두 썼는지 확인
    if (!curr.usedDice[0] || !curr.usedDice[1]) {
      // ★ 핵심: 현재 플레이어가 AI이고 주사위가 아직 남아있다면, 두 번째 주사위 액션을 실행!
      if (curr.isAI && !get().isGameOver) {
        get().runAITurnIfNeeded();
      }
      return;
    }

    // 다음 플레이어로 턴 전환
    const nextPlayerIndex = (currentTurnPlayerIndex + 1) % players.length;

    // 전원 주사위를 모두 사용했으면 라운드 종료
    if (nextPlayerIndex === 0) {
      if (round < 5) {
        // 다음 라운드: 주사위 새로 굴림
        const refreshedPlayers = players.map(p => ({
          ...p,
          dice: [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1] as [number, number],
          usedDice: [false, false] as [boolean, boolean]
        }));
        soundManager.playDiceRoll();
        set({
          round: round + 1,
          players: refreshedPlayers,
          currentTurnPlayerIndex: 0,
          selectedDieIndex: 0
        });
        get().syncToPeers();
        get().runAITurnIfNeeded();
      } else {
        // 페이즈 완료
        const currentPhaseIdx = PHASES.indexOf(phase);
        if (currentPhaseIdx < PHASES.length - 1) {
          const nextPhase = PHASES[currentPhaseIdx + 1];
          // 광산 은화 보너스 지급
          const refreshedPlayers = players.map(p => {
            const mineCount = p.duchy.filter(s => s.placedTile?.category === 'mine').length;
            return {
              ...p,
              silverlings: p.silverlings + mineCount,
              dice: [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1] as [number, number],
              usedDice: [false, false] as [boolean, boolean]
            };
          });

          // 디포 새로 보충
          const newTileDeck = [...tileDeck];
          const newDepots: Record<number, HexTile[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
          for (let d = 1; d <= 6; d++) {
            for (let c = 0; c < players.length; c++) {
              if (newTileDeck.length > 0) newDepots[d].push(newTileDeck.pop()!);
            }
          }

          soundManager.playFanfare();
          set({
            phase: nextPhase,
            round: 1,
            players: refreshedPlayers,
            tileDeck: newTileDeck,
            centralDepots: newDepots,
            currentTurnPlayerIndex: 0,
            selectedDieIndex: 0
          });
          get().syncToPeers();
          get().runAITurnIfNeeded();
        } else {
          // 게임 완전 종료!
          set({ isGameOver: true });
          get().syncToPeers();
          return;
        }
      }
    } else {
      set({
        currentTurnPlayerIndex: nextPlayerIndex,
        selectedDieIndex: 0
      });
      get().syncToPeers();
      get().runAITurnIfNeeded();
    }
  },

  // AI 플레이어 자동 행동 처리 (주사위가 남아있는 동안 1개씩 순차 실행)
  runAITurnIfNeeded: () => {
    // 온라인 모드일 때 AI 턴 처리는 오직 호스트만 수행
    if (get().playMode === 'online' && !get().isHost) {
      return;
    }

    if (get().isGameOver) return;

    const curr = get().players[get().currentTurnPlayerIndex];
    if (!curr || !curr.isAI) return;

    // 이미 주사위를 둘 다 썼으면 실행 안 함
    if (curr.usedDice[0] && curr.usedDice[1]) return;

    setTimeout(() => {
      const state = get();
      if (state.isGameOver) return;
      const p = state.players[state.currentTurnPlayerIndex];
      if (!p || !p.isAI) return;
      if (p.usedDice[0] && p.usedDice[1]) return;

      const decision = BurgundyAI.decideAction(p, state.centralDepots, state.phase, state.aiDifficulty);
      if (decision) {
        if (decision.type === 'place_tile' && decision.tileIndexInKeySlots !== undefined && decision.targetSlotId !== undefined) {
          set({ selectedDieIndex: decision.dieIndex, selectedKeySlotIndex: decision.tileIndexInKeySlots });
          state.placeTileFromStorage(decision.targetSlotId);
        } else if (decision.type === 'take_tile' && decision.depotNumber !== undefined) {
          const depotTiles = state.centralDepots[decision.depotNumber];
          if (depotTiles && depotTiles.length > 0) {
            set({ selectedDieIndex: decision.dieIndex });
            state.takeTileFromDepot(decision.depotNumber, depotTiles[0].id);
          } else {
            // 디포가 비어있으면 안전하게 일꾼 획득으로 대체
            set({ selectedDieIndex: decision.dieIndex });
            state.takeWorkersAction();
          }
        } else if (decision.type === 'sell_goods') {
          set({ selectedDieIndex: decision.dieIndex });
          state.sellGoodsAction(decision.dieValue);
        } else {
          set({ selectedDieIndex: decision.dieIndex });
          state.takeWorkersAction();
        }
      } else {
        // 결정할 액션이 없으면 가용 주사위로 일꾼 획득 수행
        const unusedIndex = !p.usedDice[0] ? 0 : 1;
        set({ selectedDieIndex: unusedIndex });
        state.takeWorkersAction();
      }
    }, 600);
  },

  toggleUITheme: () => {
    const nextTheme = get().uiTheme === 'tabletop' ? 'modern' : 'tabletop';
    localStorage.setItem('pr_ui_theme', nextTheme);
    set({ uiTheme: nextTheme });
  }
}));

if (typeof window !== 'undefined') {
  (window as any).__BURGUNDY_STORE__ = useBurgundyStore;
}
