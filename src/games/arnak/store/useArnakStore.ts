import { create } from 'zustand';
import type { 
  ArnakGameState, 
  PlayerArnak, 
  ArnakGuardian,
  ArnakResource
} from '../types';
import { INITIAL_DIG_SITES, INITIAL_GUARDIANS } from '../data/sites';
import { STARTER_CARDS, INITIAL_ITEMS, INITIAL_ARTIFACTS } from '../data/cards';
import { RESEARCH_TRACK, TEMPLE_BONUS_TILES } from '../data/research';
import { 
  shuffleCards, 
  drawHand, 
  canAdvanceResearch, 
  canDefeatGuardian, 
  processRoundEnd 
} from '../engine/gameLogic';
import { ArnakAI } from '../engine/aiPlayer';
import { soundManager } from '../../../utils/sound';
import { showFeedback } from '../../../utils/feedback';
import { peerManager } from '../../../platform/network/peerManager';

interface ArnakStore extends ArnakGameState {
  playMode: 'solo' | 'local_pass' | 'online';
  myPlayerId: string;
  isHost: boolean;
  roomCode: string | null;

  initGame: (playerCount?: number, withAI?: boolean) => void;
  initOnlineGame: (
    playerCount: number,
    humanPlayers: { name: string; peerId: string }[],
    roomCode: string,
    myPlayerId: string,
    isHost: boolean
  ) => void;
  syncRemoteState: (newState: Partial<ArnakGameState>) => void;
  syncToPeers: () => void;

  placeWorkerAction: (siteId: string) => boolean;
  defeatGuardianAction: (siteId: string) => boolean;
  advanceResearchAction: (tokenType: 'glass' | 'book') => boolean;
  playCardAction: (cardId: string) => boolean;
  buyCardAction: (cardId: string, cardType: 'item' | 'artifact') => boolean;
  passTurnAction: () => void;
  advanceTurn: () => void;
}

export const getSerializableArnakState = (state: ArnakStore): any => {
  const {
    round,
    phase,
    currentTurnPlayerIndex,
    players,
    digSites,
    itemMarket,
    artifactMarket,
    itemDeck,
    artifactDeck,
    availableGuardians,
    logs,
    isGameOver
  } = state;

  return JSON.parse(JSON.stringify({
    round,
    phase,
    currentTurnPlayerIndex,
    players,
    digSites,
    itemMarket,
    artifactMarket,
    itemDeck,
    artifactDeck,
    availableGuardians,
    logs,
    isGameOver
  }));
};

export const useArnakStore = create<ArnakStore>((set, get) => ({
  playMode: 'solo',
  myPlayerId: 'p-0',
  isHost: true,
  roomCode: null,

  round: 1,
  phase: 'action',
  currentTurnPlayerIndex: 0,
  players: [],
  digSites: INITIAL_DIG_SITES,
  itemMarket: [],
  artifactMarket: [],
  itemDeck: [],
  artifactDeck: [],
  availableGuardians: INITIAL_GUARDIANS,
  logs: [],
  isGameOver: false,

  initGame: (playerCount = 2, withAI = true) => {
    const colors = ['#10b981', '#f59e0b', '#3b82f6', '#ec4899'];
    const names = ['나 (수석 탐험가)', 'AI 라이언 고고학 박사', 'AI 엘레나 연구관', 'AI 카터 대위'];

    const players: PlayerArnak[] = [];
    for (let i = 0; i < playerCount; i++) {
      // 각 플레이어 시작 덱: 6장 셔플 후 5장 드로우
      const starterDeck = shuffleCards([...STARTER_CARDS]);
      const { newDeck, drawn } = drawHand(starterDeck, [], 5);

      players.push({
        id: `p-${i}`,
        name: i === 0 ? '나 (수석 탐험가)' : (withAI ? names[i] : `플레이어 ${i + 1}`),
        color: colors[i],
        isAI: i > 0 && withAI,
        resources: {
          coins: 2,
          compasses: 1,
          tablets: 0,
          arrowheads: 0,
          rubies: 0
        },
        archaeologists: [
          { id: `arc-${i}-1`, isPlaced: false, placedSiteId: null },
          { id: `arc-${i}-2`, isPlaced: false, placedSiteId: null }
        ],
        deck: newDeck,
        hand: drawn,
        playArea: [],
        discard: [],
        defeatedGuardians: [],
        glassStep: 0,
        bookStep: 0,
        templeTilesClaimed: [],
        fearCardsCount: 0,
        hasPassedTurnThisRound: false
      });
    }

    const shuffledItems = shuffleCards([...INITIAL_ITEMS]);
    const shuffledArtifacts = shuffleCards([...INITIAL_ARTIFACTS]);

    // 1라운드: 아이템 3장, 유물 1장 마켓 오픈
    const initialItemMarket = shuffledItems.slice(0, 3);
    const initialArtifactMarket = shuffledArtifacts.slice(0, 2);

    soundManager.playArnakArtifact();

    set({
      playMode: 'solo',
      myPlayerId: 'p-0',
      isHost: true,
      roomCode: null,
      round: 1,
      phase: 'action',
      currentTurnPlayerIndex: 0,
      players,
      digSites: INITIAL_DIG_SITES.map(s => ({ ...s, occupiedByPlayerId: null })),
      itemMarket: initialItemMarket,
      artifactMarket: initialArtifactMarket,
      itemDeck: shuffledItems.slice(3),
      artifactDeck: shuffledArtifacts.slice(2),
      availableGuardians: [...INITIAL_GUARDIANS],
      logs: ['🌿 [아르낙의 잊혀진 유적] 미지의 섬에 도달했습니다! 정글 유적을 탐험하고 고대 사원을 밝혀내세요.'],
      isGameOver: false
    });
  },

  initOnlineGame: (playerCount, humanPlayers, roomCode, myPlayerId, isHost) => {
    const colors = ['#10b981', '#f59e0b', '#3b82f6', '#ec4899'];
    const players: PlayerArnak[] = [];

    for (let i = 0; i < playerCount; i++) {
      const human = humanPlayers[i];
      const name = human ? human.name : `AI 고고학자 ${i + 1}`;
      const isAI = !human;

      const starterDeck = shuffleCards([...STARTER_CARDS]);
      const { newDeck, drawn } = drawHand(starterDeck, [], 5);

      players.push({
        id: `p-${i}`,
        name,
        color: colors[i],
        isAI,
        resources: {
          coins: 2,
          compasses: 1,
          tablets: 0,
          arrowheads: 0,
          rubies: 0
        },
        archaeologists: [
          { id: `arc-${i}-1`, isPlaced: false, placedSiteId: null },
          { id: `arc-${i}-2`, isPlaced: false, placedSiteId: null }
        ],
        deck: newDeck,
        hand: drawn,
        playArea: [],
        discard: [],
        defeatedGuardians: [],
        glassStep: 0,
        bookStep: 0,
        templeTilesClaimed: [],
        fearCardsCount: 0,
        hasPassedTurnThisRound: false
      });
    }

    const shuffledItems = shuffleCards([...INITIAL_ITEMS]);
    const shuffledArtifacts = shuffleCards([...INITIAL_ARTIFACTS]);

    set({
      playMode: 'online',
      myPlayerId,
      isHost,
      roomCode,
      round: 1,
      phase: 'action',
      currentTurnPlayerIndex: 0,
      players,
      digSites: INITIAL_DIG_SITES.map(s => ({ ...s, occupiedByPlayerId: null })),
      itemMarket: shuffledItems.slice(0, 3),
      artifactMarket: shuffledArtifacts.slice(0, 2),
      itemDeck: shuffledItems.slice(3),
      artifactDeck: shuffledArtifacts.slice(2),
      availableGuardians: [...INITIAL_GUARDIANS],
      logs: [`🌐 [온라인 대전] 방 코드: ${roomCode} | 아르낙 탐험이 시작되었습니다!`],
      isGameOver: false
    });

    if (isHost) {
      setTimeout(() => {
        get().syncToPeers();
      }, 300);
    }
  },

  syncRemoteState: (newState: Partial<ArnakGameState>) => {
    set(state => ({
      ...state,
      ...newState
    }));
  },

  syncToPeers: () => {
    const { playMode, isHost } = get();
    if (playMode === 'online' && isHost) {
      const serializable = getSerializableArnakState(get());
      peerManager.broadcastStateSync(serializable);
    }
  },

  placeWorkerAction: (siteId: string) => {
    const { 
      playMode, 
      isHost, 
      myPlayerId, 
      players, 
      currentTurnPlayerIndex, 
      digSites, 
      availableGuardians, 
      logs, 
      isGameOver 
    } = get();

    if (isGameOver) return false;

    if (playMode === 'online' && !isHost) {
      const curr = players[currentTurnPlayerIndex];
      if (curr.id !== myPlayerId) {
        showFeedback('내 차례가 아닙니다.');
        return false;
      }
      peerManager.sendAction('ARNAK_PLACE_WORKER', { siteId }, myPlayerId);
      return true;
    }

    const currPlayer = players[currentTurnPlayerIndex];
    const site = digSites.find(s => s.id === siteId);
    if (!site || site.occupiedByPlayerId !== null) {
      showFeedback('이미 다른 탐험가가 작업 중인 발굴지입니다.');
      return false;
    }

    const availableWorker = currPlayer.archaeologists.find(a => !a.isPlaced);
    if (!availableWorker) {
      showFeedback('이번 라운드에 파견할 수 있는 고고학자 일꾼이 없습니다.');
      return false;
    }

    // 미발굴지 탐험 시 나침반 비용 검증
    if (!site.isDiscovered) {
      if (currPlayer.resources.compasses < site.compassCostToDiscover) {
        showFeedback(`나침반이 부족합니다 (필요: ${site.compassCostToDiscover}개)`);
        return false;
      }
    }

    let updatedPlayer = {
      ...currPlayer,
      resources: { ...currPlayer.resources },
      archaeologists: currPlayer.archaeologists.map(a => 
        a.id === availableWorker.id ? { ...a, isPlaced: true, placedSiteId: siteId } : a
      )
    };

    let updatedSites = [...digSites];
    let updatedGuardians = [...availableGuardians];
    let siteLog = '';

    // 나침반 소모 및 수호자 등장 (신규 발굴 시)
    if (!site.isDiscovered) {
      updatedPlayer.resources.compasses -= site.compassCostToDiscover;
      soundManager.playArnakArtifact();

      // 수호자 출현
      let spawnedGuardian: ArnakGuardian | null = null;
      if (updatedGuardians.length > 0) {
        spawnedGuardian = { ...updatedGuardians[0], isDefeated: false, siteId: site.id };
        updatedGuardians = updatedGuardians.slice(1);
      }

      updatedSites = updatedSites.map(s => 
        s.id === siteId ? { 
          ...s, 
          isDiscovered: true, 
          occupiedByPlayerId: currPlayer.id, 
          guardian: spawnedGuardian 
        } : s
      );

      siteLog = `${site.name} 신규 발굴! (나침반 -${site.compassCostToDiscover})` + 
        (spawnedGuardian ? ` ⚠️ 고대 수호자 [${spawnedGuardian.name}] 출현!` : '');
    } else {
      soundManager.playClick();
      updatedSites = updatedSites.map(s => 
        s.id === siteId ? { ...s, occupiedByPlayerId: currPlayer.id } : s
      );
      siteLog = `${site.name} 탐험`;
    }

    // 발굴지 보상 지급
    for (const [res, amount] of Object.entries(site.rewards)) {
      if (res === 'drawCard') {
        const { newDeck, newDiscard, drawn } = drawHand(updatedPlayer.deck, updatedPlayer.discard, amount as number);
        updatedPlayer.deck = newDeck;
        updatedPlayer.discard = newDiscard;
        updatedPlayer.hand = [...updatedPlayer.hand, ...drawn];
      } else if (amount) {
        updatedPlayer.resources[res as ArnakResource] += amount as number;
      }
    }

    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = updatedPlayer;

    set({
      players: updatedPlayers,
      digSites: updatedSites,
      availableGuardians: updatedGuardians,
      logs: [`${currPlayer.name}: ${siteLog}`, ...logs]
    });

    showFeedback(`${site.name}에 고고학자를 파견했습니다!`);
    get().syncToPeers();
    get().advanceTurn();
    return true;
  },

  defeatGuardianAction: (siteId: string) => {
    const { 
      playMode, 
      isHost, 
      myPlayerId, 
      players, 
      currentTurnPlayerIndex, 
      digSites, 
      logs 
    } = get();

    if (playMode === 'online' && !isHost) {
      peerManager.sendAction('ARNAK_DEFEAT_GUARDIAN', { siteId }, myPlayerId);
      return true;
    }

    const curr = players[currentTurnPlayerIndex];
    const site = digSites.find(s => s.id === siteId);
    if (!site || !site.guardian || site.guardian.isDefeated) {
      showFeedback('제압할 수호자가 없습니다.');
      return false;
    }

    if (!canDefeatGuardian(curr, site.guardian)) {
      showFeedback('수호자 제압에 필요한 자원이 부족합니다.');
      return false;
    }

    soundManager.playExpeditionHorn();

    const updatedResources = { ...curr.resources };
    for (const [res, req] of Object.entries(site.guardian.defeatCost)) {
      updatedResources[res as ArnakResource] -= (req || 0);
    }

    const defeatedGuardian: ArnakGuardian = {
      ...site.guardian,
      isDefeated: true
    };

    const updatedPlayer: PlayerArnak = {
      ...curr,
      resources: updatedResources,
      defeatedGuardians: [...curr.defeatedGuardians, defeatedGuardian]
    };

    const updatedSites = digSites.map(s => 
      s.id === siteId ? { ...s, guardian: null } : s
    );

    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = updatedPlayer;

    set({
      players: updatedPlayers,
      digSites: updatedSites,
      logs: [`⚔️ ${curr.name}: [${defeatedGuardian.name}] 제압 성공! (+5점 획득)`, ...logs]
    });

    showFeedback(`수호자 ${defeatedGuardian.name}을(를) 제압했습니다! (+5점)`);
    get().syncToPeers();
    get().advanceTurn();
    return true;
  },

  advanceResearchAction: (tokenType: 'glass' | 'book') => {
    const { 
      playMode, 
      isHost, 
      myPlayerId, 
      players, 
      currentTurnPlayerIndex, 
      logs 
    } = get();

    if (playMode === 'online' && !isHost) {
      peerManager.sendAction('ARNAK_ADVANCE_RESEARCH', { tokenType }, myPlayerId);
      return true;
    }

    const curr = players[currentTurnPlayerIndex];
    const check = canAdvanceResearch(curr, tokenType);
    if (!check.canAdvance) {
      showFeedback(check.reason || '연구 트랙을 전진할 수 없습니다.');
      return false;
    }

    soundManager.playTempleChime();

    const currentStep = tokenType === 'glass' ? curr.glassStep : curr.bookStep;
    const nextStepIndex = currentStep + 1;
    const targetStep = RESEARCH_TRACK[nextStepIndex];

    const updatedResources = { ...curr.resources };
    if (check.cost) {
      for (const [res, req] of Object.entries(check.cost)) {
        updatedResources[res as ArnakResource] -= (req || 0);
      }
    }

    // 조사 보상 수령
    if (targetStep.rewardResource) {
      for (const [res, amt] of Object.entries(targetStep.rewardResource)) {
        updatedResources[res as ArnakResource] += (amt || 0);
      }
    }

    let templePointsClaimed = [...curr.templeTilesClaimed];
    // 사원 최상층(5단계) 도달 시 사원 보너스 타일 지급
    if (nextStepIndex === 5 && TEMPLE_BONUS_TILES.length > templePointsClaimed.length) {
      const bonusVp = TEMPLE_BONUS_TILES[templePointsClaimed.length];
      templePointsClaimed.push(bonusVp);
      soundManager.playGrandFanfare();
    }

    const updatedPlayer: PlayerArnak = {
      ...curr,
      resources: updatedResources,
      glassStep: tokenType === 'glass' ? nextStepIndex : curr.glassStep,
      bookStep: tokenType === 'book' ? nextStepIndex : curr.bookStep,
      templeTilesClaimed: templePointsClaimed
    };

    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = updatedPlayer;

    const tokenName = tokenType === 'glass' ? '🔍 돋보기' : '📖 연구 수첩';

    set({
      players: updatedPlayers,
      logs: [`🏛️ ${curr.name}: ${tokenName} [${targetStep.name}] 진입! (${targetStep.bonusDesc})`, ...logs]
    });

    showFeedback(`연구 트랙 전진: ${targetStep.name}!`);
    get().syncToPeers();
    get().advanceTurn();
    return true;
  },

  playCardAction: (cardId: string) => {
    const { 
      playMode, 
      isHost, 
      myPlayerId, 
      players, 
      currentTurnPlayerIndex, 
      logs 
    } = get();

    if (playMode === 'online' && !isHost) {
      peerManager.sendAction('ARNAK_PLAY_CARD', { cardId }, myPlayerId);
      return true;
    }

    const curr = players[currentTurnPlayerIndex];
    const card = curr.hand.find(c => c.id === cardId);
    if (!card) return false;

    if (card.type === 'fear') {
      showFeedback('공포 카드는 효과가 없어 플레이할 수 없습니다.');
      return false;
    }

    soundManager.playParchment();

    const updatedResources = { ...curr.resources };
    if (card.effect.gainResources) {
      for (const [res, amt] of Object.entries(card.effect.gainResources)) {
        updatedResources[res as ArnakResource] += (amt || 0);
      }
    }

    let updatedDeck = [...curr.deck];
    let updatedDiscard = [...curr.discard];
    let updatedHand = curr.hand.filter(c => c.id !== cardId);

    if (card.effect.drawCards) {
      const { newDeck, newDiscard, drawn } = drawHand(updatedDeck, updatedDiscard, card.effect.drawCards);
      updatedDeck = newDeck;
      updatedDiscard = newDiscard;
      updatedHand = [...updatedHand, ...drawn];
    }

    const updatedPlayer: PlayerArnak = {
      ...curr,
      resources: updatedResources,
      deck: updatedDeck,
      discard: updatedDiscard,
      hand: updatedHand,
      playArea: [...curr.playArea, card]
    };

    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = updatedPlayer;

    set({
      players: updatedPlayers,
      logs: [`🃏 ${curr.name}: 카드 [${card.name}] 사용 (${card.description})`, ...logs]
    });

    showFeedback(`카드 [${card.name}] 발동!`);
    get().syncToPeers();
    get().advanceTurn();
    return true;
  },

  buyCardAction: (cardId: string, cardType: 'item' | 'artifact') => {
    const { 
      playMode, 
      isHost, 
      myPlayerId, 
      players, 
      currentTurnPlayerIndex, 
      itemMarket, 
      artifactMarket, 
      itemDeck, 
      artifactDeck, 
      logs 
    } = get();

    if (playMode === 'online' && !isHost) {
      peerManager.sendAction('ARNAK_BUY_CARD', { cardId, cardType }, myPlayerId);
      return true;
    }

    const curr = players[currentTurnPlayerIndex];
    const market = cardType === 'item' ? itemMarket : artifactMarket;
    const card = market.find(c => c.id === cardId);
    if (!card) return false;

    // 비용 검증
    if (cardType === 'item') {
      const cost = card.costCoins || 0;
      if (curr.resources.coins < cost) {
        showFeedback(`코인이 부족합니다 (필요: ${cost} 🪙)`);
        return false;
      }
    } else {
      const cost = card.costCompasses || 0;
      if (curr.resources.compasses < cost) {
        showFeedback(`나침반이 부족합니다 (필요: ${cost} 🧭)`);
        return false;
      }
    }

    soundManager.playCoin();

    const updatedResources = { ...curr.resources };
    if (cardType === 'item') {
      updatedResources.coins -= (card.costCoins || 0);
    } else {
      updatedResources.compasses -= (card.costCompasses || 0);
    }

    // 아이템 카드는 덱 맨 아래로, 유물 카드는 획득 즉시 무료 발동 후 버린 카드 더미로 이동
    let updatedDeck = [...curr.deck];
    let updatedDiscard = [...curr.discard];

    if (cardType === 'item') {
      updatedDeck.unshift(card); // 덱 바닥으로
    } else {
      // 유물 즉시 발동
      if (card.effect.gainResources) {
        for (const [res, amt] of Object.entries(card.effect.gainResources)) {
          updatedResources[res as ArnakResource] += (amt || 0);
        }
      }
      updatedDiscard.push(card);
    }

    // 마켓 리필
    let newMarket = market.filter(c => c.id !== cardId);
    let newDeckPool = cardType === 'item' ? [...itemDeck] : [...artifactDeck];
    if (newDeckPool.length > 0) {
      const drawnNewCard = newDeckPool.pop();
      if (drawnNewCard) newMarket.push(drawnNewCard);
    }

    const updatedPlayer: PlayerArnak = {
      ...curr,
      resources: updatedResources,
      deck: updatedDeck,
      discard: updatedDiscard
    };

    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = updatedPlayer;

    set({
      players: updatedPlayers,
      itemMarket: cardType === 'item' ? newMarket : itemMarket,
      artifactMarket: cardType === 'artifact' ? newMarket : artifactMarket,
      itemDeck: cardType === 'item' ? newDeckPool : itemDeck,
      artifactDeck: cardType === 'artifact' ? newDeckPool : artifactDeck,
      logs: [`🛍️ ${curr.name}: [${card.name}] 카드 구입! (+${card.victoryPoints}점)`, ...logs]
    });

    showFeedback(`[${card.name}] 카드를 구입했습니다!`);
    get().syncToPeers();
    get().advanceTurn();
    return true;
  },

  passTurnAction: () => {
    const { 
      playMode, 
      isHost, 
      myPlayerId, 
      players, 
      currentTurnPlayerIndex, 
      logs 
    } = get();

    if (playMode === 'online' && !isHost) {
      peerManager.sendAction('ARNAK_PASS', {}, myPlayerId);
      return;
    }

    const curr = players[currentTurnPlayerIndex];
    const updatedPlayers = players.map(p => 
      p.id === curr.id ? { ...p, hasPassedTurnThisRound: true } : p
    );

    soundManager.playClick();

    set({
      players: updatedPlayers,
      logs: [`💤 ${curr.name}: 이번 라운드 턴을 패스했습니다.`, ...logs]
    });

    showFeedback(`${curr.name} 패스 완료`);
    get().syncToPeers();
    get().advanceTurn();
  },

  advanceTurn: () => {
    const { players, currentTurnPlayerIndex, digSites, round, logs } = get();

    // 모든 플레이어가 패스했는지 확인
    const allPassed = players.every(p => p.hasPassedTurnThisRound);

    if (allPassed) {
      // 라운드 종료 처리
      const { updatedPlayers, updatedSites, logs: roundLogs } = processRoundEnd(players, digSites);

      if (round < 5) {
        soundManager.playTempleChime();
        set({
          round: round + 1,
          currentTurnPlayerIndex: 0,
          players: updatedPlayers,
          digSites: updatedSites,
          logs: [`🔔 [제 ${round + 1} 라운드] 새로운 탐험의 날이 밝았습니다! (총 5라운드)`, ...roundLogs, ...logs]
        });
        get().syncToPeers();
      } else {
        // 5라운드 완료 -> 게임 완전 종료!
        soundManager.playGrandFanfare();
        set({
          isGameOver: true,
          phase: 'game_over',
          players: updatedPlayers,
          digSites: updatedSites,
          logs: ['🏁 [아르낙] 5개 라운드의 대탐험이 모두 끝났습니다! 최종 승점을 정산합니다.', ...roundLogs, ...logs]
        });
        get().syncToPeers();
        return;
      }
    } else {
      // 다음 패스 안 한 플레이어로 순환
      let nextIdx = (currentTurnPlayerIndex + 1) % players.length;
      let loopCount = 0;
      while (players[nextIdx].hasPassedTurnThisRound && loopCount < players.length) {
        nextIdx = (nextIdx + 1) % players.length;
        loopCount++;
      }

      set({ currentTurnPlayerIndex: nextIdx });
      get().syncToPeers();
    }

    // AI 플레이어 턴인 경우 자동 행동 실행
    setTimeout(() => {
      const state = get();
      const nextP = state.players[state.currentTurnPlayerIndex];
      if (nextP && nextP.isAI && !state.isGameOver && !nextP.hasPassedTurnThisRound) {
        const decision = ArnakAI.decideAction(nextP, state.digSites, state.itemMarket, state.artifactMarket);

        switch (decision.action) {
          case 'research':
            state.advanceResearchAction(decision.tokenType);
            break;
          case 'place_worker':
            state.placeWorkerAction(decision.siteId);
            break;
          case 'defeat_guardian':
            state.defeatGuardianAction(decision.siteId);
            break;
          case 'play_card':
            state.playCardAction(decision.cardId);
            break;
          case 'buy_card':
            state.buyCardAction(decision.cardId, decision.cardType);
            break;
          case 'pass':
          default:
            state.passTurnAction();
            break;
        }
      }
    }, 700);
  }
}));

if (typeof window !== 'undefined') {
  (window as any).__ARNAK_STORE__ = useArnakStore;
}
