import { create } from 'zustand';
import type { 
  DuelGameState, 
  DuelExpansionMode, 
  DuelAge, 
  PlayerDuel 
} from '../types';
import { DUEL_CARDS_DATA } from '../data/cards';
import { DUEL_WONDERS_DATA } from '../data/wonders';
import { PROGRESS_TOKENS_DATA } from '../data/progressTokens';
import { PANTHEON_GODS_DATA } from '../data/pantheonData';
import { buildPyramidForAge } from '../data/pyramidLayouts';
import { 
  calculateCardCost, 
  calculateWonderCost, 
  calculateDiscardGain, 
  checkImmediateVictory 
} from '../engine/gameLogic';
import { DuelAIPlayer } from '../engine/aiPlayer';
import { soundManager } from '../../../utils/sound';
import { showFeedback } from '../../../utils/feedback';
import { peerManager } from '../../../platform/network/peerManager';

interface DuelStore extends DuelGameState {
  playMode: 'solo' | 'local_pass' | 'online';
  myPlayerId: string;
  isHost: boolean;
  roomCode: string | null;

  initGame: (
    isSolo?: boolean, 
    expansionMode?: DuelExpansionMode, 
    aiDifficulty?: 'easy' | 'normal' | 'hard'
  ) => void;
  initOnlineGame: (
    expansionMode: DuelExpansionMode,
    humanPlayers: { name: string; peerId: string }[],
    roomCode: string,
    myPlayerId: string,
    isHost: boolean
  ) => void;
  syncRemoteState: (newState: Partial<DuelGameState>) => void;
  syncToPeers: () => void;

  pickWonderInDraft: (wonderId: string) => void;
  buildCardAction: (nodeId: string) => boolean;
  discardCardAction: (nodeId: string) => boolean;
  buildWonderAction: (nodeId: string, wonderId: string) => boolean;
  activateGodAction: (godId: string) => boolean;
  claimProgressTokenAction: (tokenId: string) => void;
  advanceTurn: (hasExtraTurn?: boolean) => void;
  startNextAge: () => void;
}

export const getSerializableDuelState = (state: DuelStore): any => {
  const {
    expansionMode,
    age,
    currentTurnPlayerIndex,
    players,
    militaryPosition,
    militaryLootTokens,
    pyramid,
    availableProgressTokens,
    discardedCards,
    wonderDraftPool,
    isWonderDraftPhase,
    wonderDraftStep,
    pantheonBoard,
    logs,
    isGameOver,
    victoryReason,
    winnerPlayerId,
    aiDifficulty
  } = state;

  return {
    expansionMode,
    age,
    currentTurnPlayerIndex,
    players,
    militaryPosition,
    militaryLootTokens,
    pyramid,
    availableProgressTokens,
    discardedCards,
    wonderDraftPool,
    isWonderDraftPhase,
    wonderDraftStep,
    pantheonBoard,
    logs,
    isGameOver,
    victoryReason,
    winnerPlayerId,
    aiDifficulty
  };
};

export const useDuelStore = create<DuelStore>((set, get) => ({
  expansionMode: 'base',
  playMode: 'solo',
  myPlayerId: 'p-0',
  isHost: true,
  roomCode: null,

  age: 1,
  currentTurnPlayerIndex: 0,
  players: [],
  militaryPosition: 0,
  militaryLootTokens: [
    { position: -3, penaltyCoins: 2, isTaken: false },
    { position: -6, penaltyCoins: 5, isTaken: false },
    { position: 3, penaltyCoins: 2, isTaken: false },
    { position: 6, penaltyCoins: 5, isTaken: false }
  ],
  pyramid: [],
  availableProgressTokens: [],
  discardedCards: [],
  wonderDraftPool: [],
  isWonderDraftPhase: true,
  wonderDraftStep: 0,
  logs: [],
  isGameOver: false,
  victoryReason: null,
  winnerPlayerId: null,
  aiDifficulty: 'normal',

  initGame: (isSolo = true, expansionMode: DuelExpansionMode = 'base', aiDifficulty: 'easy' | 'normal' | 'hard' = 'normal') => {
    const p0: PlayerDuel = {
      id: 'p-0',
      name: '나 (아테네 집정관)',
      color: '#38bdf8',
      isAI: false,
      coins: 7,
      wonders: [],
      constructedWonders: [],
      cards: [],
      scienceSymbols: [],
      progressTokens: [],
      tradeDiscounts: {},
      militaryTokensTaken: []
    };

    const p1: PlayerDuel = {
      id: 'p-1',
      name: isSolo ? 'AI 스파르타 군주' : '플레이어 2 (스파르타)',
      color: '#f43f5e',
      isAI: isSolo,
      coins: 7,
      wonders: [],
      constructedWonders: [],
      cards: [],
      scienceSymbols: [],
      progressTokens: [],
      tradeDiscounts: {},
      militaryTokensTaken: []
    };

    // 8장의 무작위 불가사의 풀 세팅 (4장씩 2라운드 드래프트)
    const shuffledWonders = [...DUEL_WONDERS_DATA].sort(() => Math.random() - 0.5).slice(0, 8);
    // 5장의 무작위 과학 진보 토큰 세팅
    const shuffledTokens = [...PROGRESS_TOKENS_DATA].sort(() => Math.random() - 0.5).slice(0, 5);

    // 1시대 피라미드 구성 (23장 중 20장 추출)
    const age1Cards = DUEL_CARDS_DATA.filter(c => c.age === 1).sort(() => Math.random() - 0.5).slice(0, 20);
    const pyramid = buildPyramidForAge(1, age1Cards);

    soundManager.playParchment();

    // 판테온 확장판 전용 보드 세팅
    let pantheonBoard = undefined;
    if (expansionMode === 'pantheon') {
      const shuffledGods = [...PANTHEON_GODS_DATA].sort(() => Math.random() - 0.5);
      pantheonBoard = {
        slots: [
          { mythology: 'greek' as const, godCard: shuffledGods[0] || null, costOffset: 0 },
          { mythology: 'roman' as const, godCard: shuffledGods[1] || null, costOffset: 1 },
          { mythology: 'egyptian' as const, godCard: shuffledGods[2] || null, costOffset: 2 },
          { mythology: 'mesopotamian' as const, godCard: shuffledGods[3] || null, costOffset: 3 },
          { mythology: 'phoenician' as const, godCard: shuffledGods[4] || null, costOffset: 4 }
        ],
        offeringTokensRemaining: 5
      };
    }

    set({
      expansionMode,
      playMode: 'solo',
      myPlayerId: 'p-0',
      isHost: true,
      roomCode: null,
      age: 1,
      currentTurnPlayerIndex: 0,
      players: [p0, p1],
      militaryPosition: 0,
      militaryLootTokens: [
        { position: -3, penaltyCoins: 2, isTaken: false },
        { position: -6, penaltyCoins: 5, isTaken: false },
        { position: 3, penaltyCoins: 2, isTaken: false },
        { position: 6, penaltyCoins: 5, isTaken: false }
      ],
      pyramid,
      availableProgressTokens: shuffledTokens,
      discardedCards: [],
      wonderDraftPool: shuffledWonders,
      isWonderDraftPhase: true,
      wonderDraftStep: 0,
      pantheonBoard,
      logs: [
        `🏛️ [세븐 원더스 듀얼] ${expansionMode === 'pantheon' ? '판테온 확장판' : '일반판'}이 시작되었습니다!`,
        '불가사의 드래프트를 시작합니다. 4장의 불가사의 중 원하는 불가사의를 선택하세요.'
      ],
      isGameOver: false,
      victoryReason: null,
      winnerPlayerId: null,
      aiDifficulty
    });
  },

  initOnlineGame: (expansionMode, humanPlayers, roomCode, myPlayerId, isHost) => {
    const p0: PlayerDuel = {
      id: 'p-0',
      name: humanPlayers[0]?.name || '호스트 플레이어',
      color: '#38bdf8',
      isAI: false,
      coins: 7,
      wonders: [],
      constructedWonders: [],
      cards: [],
      scienceSymbols: [],
      progressTokens: [],
      tradeDiscounts: {},
      militaryTokensTaken: []
    };

    const p1: PlayerDuel = {
      id: 'p-1',
      name: humanPlayers[1]?.name || '도전자 플레이어',
      color: '#f43f5e',
      isAI: false,
      coins: 7,
      wonders: [],
      constructedWonders: [],
      cards: [],
      scienceSymbols: [],
      progressTokens: [],
      tradeDiscounts: {},
      militaryTokensTaken: []
    };

    const shuffledWonders = [...DUEL_WONDERS_DATA].sort(() => Math.random() - 0.5).slice(0, 8);
    const shuffledTokens = [...PROGRESS_TOKENS_DATA].sort(() => Math.random() - 0.5).slice(0, 5);
    const age1Cards = DUEL_CARDS_DATA.filter(c => c.age === 1).sort(() => Math.random() - 0.5).slice(0, 20);
    const pyramid = buildPyramidForAge(1, age1Cards);

    let pantheonBoard = undefined;
    if (expansionMode === 'pantheon') {
      const shuffledGods = [...PANTHEON_GODS_DATA].sort(() => Math.random() - 0.5);
      pantheonBoard = {
        slots: [
          { mythology: 'greek' as const, godCard: shuffledGods[0] || null, costOffset: 0 },
          { mythology: 'roman' as const, godCard: shuffledGods[1] || null, costOffset: 1 },
          { mythology: 'egyptian' as const, godCard: shuffledGods[2] || null, costOffset: 2 },
          { mythology: 'mesopotamian' as const, godCard: shuffledGods[3] || null, costOffset: 3 },
          { mythology: 'phoenician' as const, godCard: shuffledGods[4] || null, costOffset: 4 }
        ],
        offeringTokensRemaining: 5
      };
    }

    set({
      expansionMode,
      playMode: 'online',
      myPlayerId,
      isHost,
      roomCode,
      age: 1,
      currentTurnPlayerIndex: 0,
      players: [p0, p1],
      militaryPosition: 0,
      militaryLootTokens: [
        { position: -3, penaltyCoins: 2, isTaken: false },
        { position: -6, penaltyCoins: 5, isTaken: false },
        { position: 3, penaltyCoins: 2, isTaken: false },
        { position: 6, penaltyCoins: 5, isTaken: false }
      ],
      pyramid,
      availableProgressTokens: shuffledTokens,
      discardedCards: [],
      wonderDraftPool: shuffledWonders,
      isWonderDraftPhase: true,
      wonderDraftStep: 0,
      pantheonBoard,
      logs: [
        `🏛️ [온라인 대전] ${expansionMode === 'pantheon' ? '판테온 확장판' : '일반판'}이 시작되었습니다! 방 코드: ${roomCode}`
      ],
      isGameOver: false,
      victoryReason: null,
      winnerPlayerId: null
    });
  },

  syncRemoteState: (newState) => {
    set(state => ({ ...state, ...newState }));
  },

  syncToPeers: () => {
    const { playMode, isHost } = get();
    if (playMode === 'online' && isHost) {
      peerManager.broadcast({
        type: 'STATE_SYNC',
        payload: getSerializableDuelState(get()),
        senderId: peerManager.myPeerId || 'host'
      });
    }
  },

  // 1. 불가사의 드래프트 (1라운드: P1->P2->P2->P1, 2라운드: P2->P1->P1->P2)
  pickWonderInDraft: (wonderId: string) => {
    const state = get();
    const { wonderDraftPool, wonderDraftStep, players } = state;
    const wonder = wonderDraftPool.find(w => w.id === wonderId);
    if (!wonder) return;

    // 드래프트 순서: 0(P0), 1(P1), 2(P1), 3(P0) | 4(P1), 5(P0), 6(P0), 7(P1)
    const turnOrder = [0, 1, 1, 0, 1, 0, 0, 1];
    const pickingPlayerIdx = turnOrder[wonderDraftStep];

    const updatedPlayers = [...players];
    updatedPlayers[pickingPlayerIdx].wonders.push(wonder);
    const updatedPool = wonderDraftPool.filter(w => w.id !== wonderId);
    const nextStep = wonderDraftStep + 1;

    soundManager.playCardPlace();

    if (nextStep >= 8) {
      // 드래프트 완료 ➔ 1시대 피라미드 게임 본격 시작
      set({
        players: updatedPlayers,
        wonderDraftPool: [],
        isWonderDraftPhase: false,
        wonderDraftStep: nextStep,
        currentTurnPlayerIndex: 0,
        logs: ['불가사의 드래프트가 완료되었습니다! 제1시대 카드 피라미드에서 카드를 선택하세요.', ...state.logs]
      });
    } else {
      set({
        players: updatedPlayers,
        wonderDraftPool: updatedPool,
        wonderDraftStep: nextStep,
        currentTurnPlayerIndex: turnOrder[nextStep],
        logs: [`${updatedPlayers[pickingPlayerIdx].name}님이 불가사의 [${wonder.name}]을(를) 선택했습니다.`, ...state.logs]
      });

      // AI가 선택할 차례면 자동 선택
      const nextP = updatedPlayers[turnOrder[nextStep]];
      if (nextP.isAI && updatedPool.length > 0) {
        setTimeout(() => {
          const currentPool = get().wonderDraftPool;
          const poolForRound = nextStep < 4 ? currentPool.slice(0, Math.min(4, currentPool.length)) : currentPool;
          const aiChoice = poolForRound[0] || currentPool[0];
          if (aiChoice) get().pickWonderInDraft(aiChoice.id);
        }, 500);
      }
    }

    get().syncToPeers();
  },

  // 2. 카드 가져와 건물 건설 (Build Card)
  buildCardAction: (nodeId: string) => {
    const state = get();
    const node = state.pyramid.find(n => n.id === nodeId);
    if (!node || !node.isAvailable || node.isTaken) return false;

    const currPlayer = state.players[state.currentTurnPlayerIndex];
    const opponent = state.players[state.currentTurnPlayerIndex === 0 ? 1 : 0];
    const cardCost = calculateCardCost(currPlayer, node.card, opponent);

    if (!cardCost.canAfford) {
      showFeedback('건설에 필요한 자원 또는 코인이 부족합니다!');
      soundManager.playError();
      return false;
    }

    // 코인 차감
    currPlayer.coins -= cardCost.totalCoinCost;
    currPlayer.cards.push(node.card);

    // 군사 방패 효과
    let newMilPos = state.militaryPosition;
    if (node.card.effects.militaryShields) {
      const dir = state.currentTurnPlayerIndex === 0 ? 1 : -1;
      newMilPos += node.card.effects.militaryShields * dir;
      soundManager.playCombatSword();
    } else {
      soundManager.playBuild();
    }

    // 과학 기호 등록
    if (node.card.effects.scienceSymbol) {
      currPlayer.scienceSymbols.push(node.card.effects.scienceSymbol);
    }

    // 무역 할인 등록
    if (node.card.effects.tradeDiscount) {
      currPlayer.tradeDiscounts = { ...currPlayer.tradeDiscounts, ...node.card.effects.tradeDiscount };
    }

    // 즉시 코인 획득
    if (node.card.effects.coins) {
      currPlayer.coins += node.card.effects.coins;
    }

    showFeedback(`[${node.card.name}] 건설 완료!`);

    // 피라미드 노드 갱신 및 덮인 카드 해제
    node.isTaken = true;
    const updatedPyramid = state.pyramid.map(n => {
      if (n.coveredBy.includes(nodeId)) {
        const remainingCover = n.coveredBy.filter(id => id !== nodeId);
        return {
          ...n,
          coveredBy: remainingCover,
          isAvailable: remainingCover.length === 0,
          isOpen: remainingCover.length === 0 ? true : n.isOpen
        };
      }
      return n;
    });

    set({
      pyramid: updatedPyramid,
      militaryPosition: newMilPos,
      logs: [`${currPlayer.name}님이 [${node.card.name}]을(를) 건설했습니다. (-${cardCost.totalCoinCost}원)`, ...state.logs]
    });

    // 즉시 승리 여부 검사
    const victory = checkImmediateVictory(newMilPos, state.players[0], state.players[1]);
    if (victory.isImmediate) {
      soundManager.playGrandFanfare();
      set({
        isGameOver: true,
        victoryReason: victory.victoryReason,
        winnerPlayerId: victory.winnerId
      });
      get().syncToPeers();
      return true;
    }

    get().advanceTurn();
    get().syncToPeers();
    return true;
  },

  // 3. 카드 버리고 코인 획득 (Discard Card for Coins)
  discardCardAction: (nodeId: string) => {
    const state = get();
    const node = state.pyramid.find(n => n.id === nodeId);
    if (!node || !node.isAvailable || node.isTaken) return false;

    const currPlayer = state.players[state.currentTurnPlayerIndex];
    const gain = calculateDiscardGain(currPlayer);
    currPlayer.coins += gain;

    soundManager.playCoin();
    showFeedback(`카드 버림: +${gain} 코인 획득!`);

    node.isTaken = true;
    const updatedPyramid = state.pyramid.map(n => {
      if (n.coveredBy.includes(nodeId)) {
        const remainingCover = n.coveredBy.filter(id => id !== nodeId);
        return {
          ...n,
          coveredBy: remainingCover,
          isAvailable: remainingCover.length === 0,
          isOpen: remainingCover.length === 0 ? true : n.isOpen
        };
      }
      return n;
    });

    set({
      pyramid: updatedPyramid,
      discardedCards: [node.card, ...state.discardedCards],
      logs: [`${currPlayer.name}님이 카드를 버리고 +${gain} 코인을 획득했습니다.`, ...state.logs]
    });

    get().advanceTurn();
    get().syncToPeers();
    return true;
  },

  // 4. 불가사의 건설 (Build Wonder)
  buildWonderAction: (nodeId: string, wonderId: string) => {
    const state = get();
    const node = state.pyramid.find(n => n.id === nodeId);
    if (!node || !node.isAvailable || node.isTaken) return false;

    const currPlayer = state.players[state.currentTurnPlayerIndex];
    const opponent = state.players[state.currentTurnPlayerIndex === 0 ? 1 : 0];
    const wonder = currPlayer.wonders.find(w => w.id === wonderId);
    if (!wonder || wonder.isConstructed) return false;

    const totalConstructed = state.players.reduce((sum, p) => sum + p.constructedWonders.length, 0);
    if (totalConstructed >= 7) {
      showFeedback('게임 전체에서 최대 7개의 불가사의만 건설될 수 있습니다!');
      soundManager.playError();
      return false;
    }

    const wCost = calculateWonderCost(currPlayer, wonder, opponent);
    if (!wCost.canAfford) {
      showFeedback('불가사의 건설 비용이 부족합니다!');
      soundManager.playError();
      return false;
    }

    currPlayer.coins -= wCost.totalCoinCost;
    wonder.isConstructed = true;
    wonder.constructedBy = currPlayer.id;
    currPlayer.constructedWonders.push(wonder);

    // 불가사의 권능 발동
    let newMilPos = state.militaryPosition;
    if (wonder.effects.militaryShields) {
      const dir = state.currentTurnPlayerIndex === 0 ? 1 : -1;
      newMilPos += wonder.effects.militaryShields * dir;
      soundManager.playCombatSword();
    } else {
      soundManager.playGrandFanfare();
    }

    if (wonder.effects.coins) {
      currPlayer.coins += wonder.effects.coins;
    }

    showFeedback(`불가사의 [${wonder.name}] 완공! 🎉`);

    node.isTaken = true;
    const updatedPyramid = state.pyramid.map(n => {
      if (n.coveredBy.includes(nodeId)) {
        const remainingCover = n.coveredBy.filter(id => id !== nodeId);
        return {
          ...n,
          coveredBy: remainingCover,
          isAvailable: remainingCover.length === 0,
          isOpen: remainingCover.length === 0 ? true : n.isOpen
        };
      }
      return n;
    });

    set({
      pyramid: updatedPyramid,
      militaryPosition: newMilPos,
      logs: [`🌟 ${currPlayer.name}님이 불가사의 [${wonder.name}]을(를) 완공했습니다!`, ...state.logs]
    });

    const victory = checkImmediateVictory(newMilPos, state.players[0], state.players[1]);
    if (victory.isImmediate) {
      soundManager.playGrandFanfare();
      set({
        isGameOver: true,
        victoryReason: victory.victoryReason,
        winnerPlayerId: victory.winnerId
      });
      get().syncToPeers();
      return true;
    }

    // 추가 턴 효과가 있는 경우 한 번 더 진행
    get().advanceTurn(wonder.effects.extraTurn);
    get().syncToPeers();
    return true;
  },

  // 5. 판테온 확장: 신 활성화 액션
  activateGodAction: (godId: string) => {
    const state = get();
    if (!state.pantheonBoard) return false;

    const currPlayer = state.players[state.currentTurnPlayerIndex];
    const god = PANTHEON_GODS_DATA.find(g => g.id === godId);
    if (!god) return false;

    if (currPlayer.coins < god.costInCoins) {
      showFeedback(`신의 권능을 활성화하기 위한 코인이 부족합니다! (${god.costInCoins}원 필요)`);
      soundManager.playError();
      return false;
    }

    currPlayer.coins -= god.costInCoins;
    soundManager.playTempleChime();
    showFeedback(`신 [${god.name}]의 기적이 발동되었습니다! ⚡`);

    // 신의 권능 적용
    let newMilPos = state.militaryPosition;
    if (god.effects.militaryShields) {
      const dir = state.currentTurnPlayerIndex === 0 ? 1 : -1;
      newMilPos += god.effects.militaryShields * dir;
    }
    if (god.effects.coins) {
      currPlayer.coins += god.effects.coins;
    }

    set({
      militaryPosition: newMilPos,
      logs: [`⚡ ${currPlayer.name}님이 신 [${god.name}]의 기적을 발동했습니다! (-${god.costInCoins}원)`, ...state.logs]
    });

    get().advanceTurn();
    get().syncToPeers();
    return true;
  },

  // 6. 진보 토큰 획득
  claimProgressTokenAction: (tokenId: string) => {
    const state = get();
    const token = state.availableProgressTokens.find(t => t.id === tokenId);
    if (!token) return;

    const currPlayer = state.players[state.currentTurnPlayerIndex];
    currPlayer.progressTokens.push(token);

    if (token.effects.coins) currPlayer.coins += token.effects.coins;
    soundManager.playFanfare();
    showFeedback(`진보 토큰 [${token.name}] 획득!`);

    set({
      availableProgressTokens: state.availableProgressTokens.filter(t => t.id !== tokenId),
      logs: [`💡 ${currPlayer.name}님이 진보 토큰 [${token.name}]을(를) 획득했습니다.`, ...state.logs]
    });
    get().syncToPeers();
  },

  // 7. 턴 교대 & 세대 완료 검사
  advanceTurn: (hasExtraTurn = false) => {
    const state = get();
    // 피라미드에 남은 카드가 모두 소진되었는지 확인
    const remainingCards = state.pyramid.filter(n => !n.isTaken);

    if (remainingCards.length === 0) {
      // 해당 시대 종료 -> 다음 시대로 진입
      if (state.age < 3) {
        get().startNextAge();
        return;
      } else {
        // 3시대 종료 -> 최종 승점 정산 (민간 승리)
        soundManager.playGrandFanfare();
        set({
          isGameOver: true,
          victoryReason: 'civilian',
          logs: ['🏁 제3시대가 종료되었습니다! 최종 승점을 정산합니다.', ...state.logs]
        });
        get().syncToPeers();
        return;
      }
    }

    // 추가 턴이면 플레이어 유지, 아니면 상대방 턴으로 전환
    const nextPlayerIndex = hasExtraTurn 
      ? state.currentTurnPlayerIndex 
      : (state.currentTurnPlayerIndex === 0 ? 1 : 0);

    set({ currentTurnPlayerIndex: nextPlayerIndex });

    // AI 차례인 경우 자동 실행
    setTimeout(() => {
      const currentState = get();
      const nextP = currentState.players[currentState.currentTurnPlayerIndex];
      if (nextP && nextP.isAI && !currentState.isGameOver && !currentState.isWonderDraftPhase) {
        const availNodes = currentState.pyramid.filter(n => n.isAvailable && !n.isTaken);
        if (availNodes.length > 0) {
          const opp = currentState.players[currentState.currentTurnPlayerIndex === 0 ? 1 : 0];
          const decision = DuelAIPlayer.decideAction(
            nextP,
            opp,
            availNodes,
            currentState.militaryPosition,
            currentState.currentTurnPlayerIndex === 0,
            currentState.pantheonBoard ? PANTHEON_GODS_DATA : undefined,
            currentState.aiDifficulty
          );

          if (decision.action === 'build_card') {
            currentState.buildCardAction(decision.nodeId);
          } else if (decision.action === 'build_wonder') {
            currentState.buildWonderAction(decision.nodeId, decision.wonderId);
          } else if (decision.action === 'discard_card') {
            currentState.discardCardAction(decision.nodeId);
          } else if (decision.action === 'activate_god') {
            currentState.activateGodAction(decision.godId);
          }
        }
      }
    }, 700);
  },

  // 8. 다음 시대로 진입
  startNextAge: () => {
    const state = get();
    const nextAge = (state.age + 1) as DuelAge;
    const nextCards = DUEL_CARDS_DATA.filter(c => c.age === nextAge).sort(() => Math.random() - 0.5).slice(0, 20);
    const newPyramid = buildPyramidForAge(nextAge, nextCards);

    soundManager.playParchment();

    // 군사적 열세에 있는 플레이어가 다음 시대 선 플레이어 선택
    let startingPlayer = 0;
    if (state.militaryPosition < 0) startingPlayer = 0; // 플레이어 1이 우세하면 플레이어 0이 선
    else if (state.militaryPosition > 0) startingPlayer = 1;

    set({
      age: nextAge,
      pyramid: newPyramid,
      currentTurnPlayerIndex: startingPlayer,
      logs: [`📜 제${nextAge}시대가 시작되었습니다! 카드가 새롭게 배치되었습니다.`, ...state.logs]
    });

    get().syncToPeers();
  }
}));
