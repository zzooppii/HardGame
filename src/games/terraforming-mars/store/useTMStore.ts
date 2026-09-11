import { create } from 'zustand';
import type { 
  TMGameState, 
  PlayerTM, 
  TMResource 
} from '../types';
import { CORPORATIONS_DATA } from '../data/corporations';
import { INITIAL_PROJECT_CARDS } from '../data/cards';
import { INITIAL_MAP_SLOTS } from '../data/mapTiles';
import { 
  canPlayCard, 
  placeMapTile, 
  processProductionPhase, 
  getAdjacentSlots 
} from '../engine/gameLogic';
import { TerraformingMarsAI } from '../engine/aiPlayer';
import { soundManager } from '../../../utils/sound';
import { showFeedback } from '../../../utils/feedback';
import { peerManager } from '../../../platform/network/peerManager';

interface TMStore extends TMGameState {
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
  syncRemoteState: (newState: Partial<TMGameState>) => void;
  syncToPeers: () => void;

  playCardAction: (cardId: string, targetSlotId?: string) => boolean;
  convertPlantsToGreeneryAction: (targetSlotId: string) => boolean;
  convertHeatToTemperatureAction: () => boolean;
  executeStandardProjectAction: (
    projectType: 'greenery' | 'city' | 'asteroid' | 'ocean' | 'power',
    targetSlotId?: string
  ) => boolean;
  buyCardFromMarket: (cardId: string) => boolean;
  passTurnAction: () => void;
  advanceTurn: () => void;
}

export const getSerializableTMState = (state: TMStore): any => {
  const {
    generation,
    phase,
    currentTurnPlayerIndex,
    players,
    mapSlots,
    temperature,
    oxygen,
    oceansPlaced,
    cardMarket,
    logs,
    isGameOver
  } = state;

  return JSON.parse(JSON.stringify({
    generation,
    phase,
    currentTurnPlayerIndex,
    players,
    mapSlots,
    temperature,
    oxygen,
    oceansPlaced,
    cardMarket,
    logs,
    isGameOver
  }));
};

export const useTMStore = create<TMStore>((set, get) => ({
  playMode: 'solo',
  myPlayerId: 'p-0',
  isHost: true,
  roomCode: null,

  generation: 1,
  phase: 'action',
  currentTurnPlayerIndex: 0,
  players: [],
  mapSlots: INITIAL_MAP_SLOTS,
  temperature: -30,
  oxygen: 0,
  oceansPlaced: 0,
  cardMarket: [],
  logs: [],
  isGameOver: false,

  initGame: (playerCount = 2, withAI = true) => {
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];
    const names = ['나 (화성 개척 총수)', 'AI 타시스 지사', 'AI 에코라인 바이오', 'AI 헬리온 에너지'];

    const players: PlayerTM[] = [];
    for (let i = 0; i < playerCount; i++) {
      const corp = CORPORATIONS_DATA[i % CORPORATIONS_DATA.length];
      const startingHand = INITIAL_PROJECT_CARDS.slice(i * 4, i * 4 + 4);

      players.push({
        id: `p-${i}`,
        name: i === 0 ? '나 (화성 개척 총수)' : (withAI ? names[i] : `플레이어 ${i + 1}`),
        color: colors[i],
        isAI: i > 0 && withAI,
        corporation: corp,
        tr: 20, // 시작 기본 테라포밍 등급
        resources: {
          megacredits: corp.startingMegacredits,
          steel: corp.startingResources.steel || 0,
          titanium: corp.startingResources.titanium || 0,
          plants: corp.startingResources.plants || 0,
          energy: corp.startingResources.energy || 0,
          heat: corp.startingResources.heat || 0
        },
        production: {
          megacredits: corp.startingProduction.megacredits || 0,
          steel: corp.startingProduction.steel || 0,
          titanium: corp.startingProduction.titanium || 0,
          plants: corp.startingProduction.plants || 0,
          energy: corp.startingProduction.energy || 0,
          heat: corp.startingProduction.heat || 0
        },
        hand: startingHand,
        playedCards: [],
        hasPassedThisGen: false
      });
    }

    const marketPool = INITIAL_PROJECT_CARDS.slice(playerCount * 4);

    soundManager.playCargoLoad();

    set({
      playMode: 'solo',
      myPlayerId: 'p-0',
      isHost: true,
      roomCode: null,
      generation: 1,
      phase: 'action',
      currentTurnPlayerIndex: 0,
      players,
      mapSlots: INITIAL_MAP_SLOTS.map(s => ({ ...s, tileType: 'empty', ownerPlayerId: null })),
      temperature: -30,
      oxygen: 0,
      oceansPlaced: 0,
      cardMarket: marketPool.slice(0, 4),
      logs: ['🚀 [테라포밍 마스] 화성 개척 프로젝트가 승인되었습니다! 붉은 행성을 인류의 제2의 보금자리로 만드세요.'],
      isGameOver: false
    });
  },

  initOnlineGame: (playerCount, humanPlayers, roomCode, myPlayerId, isHost) => {
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];
    const players: PlayerTM[] = [];

    for (let i = 0; i < playerCount; i++) {
      const human = humanPlayers[i];
      const name = human ? human.name : `AI 화성 기업 ${i + 1}`;
      const isAI = !human;
      const corp = CORPORATIONS_DATA[i % CORPORATIONS_DATA.length];
      const startingHand = INITIAL_PROJECT_CARDS.slice(i * 4, i * 4 + 4);

      players.push({
        id: `p-${i}`,
        name,
        color: colors[i],
        isAI,
        corporation: corp,
        tr: 20,
        resources: {
          megacredits: corp.startingMegacredits,
          steel: corp.startingResources.steel || 0,
          titanium: corp.startingResources.titanium || 0,
          plants: corp.startingResources.plants || 0,
          energy: corp.startingResources.energy || 0,
          heat: corp.startingResources.heat || 0
        },
        production: {
          megacredits: corp.startingProduction.megacredits || 0,
          steel: corp.startingProduction.steel || 0,
          titanium: corp.startingProduction.titanium || 0,
          plants: corp.startingProduction.plants || 0,
          energy: corp.startingProduction.energy || 0,
          heat: corp.startingProduction.heat || 0
        },
        hand: startingHand,
        playedCards: [],
        hasPassedThisGen: false
      });
    }

    const marketPool = INITIAL_PROJECT_CARDS.slice(playerCount * 4);

    set({
      playMode: 'online',
      myPlayerId,
      isHost,
      roomCode,
      generation: 1,
      phase: 'action',
      currentTurnPlayerIndex: 0,
      players,
      mapSlots: INITIAL_MAP_SLOTS.map(s => ({ ...s, tileType: 'empty', ownerPlayerId: null })),
      temperature: -30,
      oxygen: 0,
      oceansPlaced: 0,
      cardMarket: marketPool.slice(0, 4),
      logs: [`🌐 [온라인 개척] 방 코드: ${roomCode} | 화성 테라포밍 프로젝트가 시작되었습니다!`],
      isGameOver: false
    });

    if (isHost) {
      setTimeout(() => {
        get().syncToPeers();
      }, 300);
    }
  },

  syncRemoteState: (newState: Partial<TMGameState>) => {
    set(state => ({
      ...state,
      ...newState
    }));
  },

  syncToPeers: () => {
    const { playMode, isHost } = get();
    if (playMode === 'online' && isHost) {
      const serializable = getSerializableTMState(get());
      peerManager.broadcastStateSync(serializable);
    }
  },

  playCardAction: (cardId: string, targetSlotId?: string) => {
    const { 
      playMode, 
      isHost, 
      myPlayerId, 
      players, 
      currentTurnPlayerIndex, 
      temperature, 
      oxygen, 
      oceansPlaced, 
      mapSlots, 
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
      peerManager.sendAction('TM_PLAY_CARD', { cardId, targetSlotId }, myPlayerId);
      return true;
    }

    const curr = players[currentTurnPlayerIndex];
    const card = curr.hand.find(c => c.id === cardId);
    if (!card) return false;

    const check = canPlayCard(curr, card, { temperature, oxygen, oceansPlaced });
    if (!check.canPlay) {
      showFeedback(check.reason || '카드를 플레이할 수 없습니다.');
      return false;
    }

    soundManager.playBuild();

    let newTemp = temperature;
    let newOxy = oxygen;
    let newOceans = oceansPlaced;
    let newTr = curr.tr;
    let updatedSlots = [...mapSlots];

    // 비용 결제 (강철/티타늄 우선 소모 검증)
    let costRemain = card.cost;
    const res = { ...curr.resources };
    const prod = { ...curr.production };

    if (card.tags.includes('building') && res.steel > 0) {
      const steelUsed = Math.min(res.steel, Math.floor(costRemain / 2));
      res.steel -= steelUsed;
      costRemain -= steelUsed * 2;
    }
    if (card.tags.includes('space') && res.titanium > 0) {
      const titaniumUsed = Math.min(res.titanium, Math.floor(costRemain / 3));
      res.titanium -= titaniumUsed;
      costRemain -= titaniumUsed * 3;
    }

    // 헬리온 기업 열 결제
    if (curr.corporation.id === 'corp_helion' && costRemain > res.megacredits && res.heat > 0) {
      const mcShortage = costRemain - res.megacredits;
      const heatUsed = Math.min(res.heat, mcShortage);
      res.heat -= heatUsed;
      costRemain -= heatUsed;
    }

    res.megacredits = Math.max(0, res.megacredits - costRemain);

    // 카드 효과 적용
    if (card.effects.trBonus) newTr += card.effects.trBonus;

    if (card.effects.tempSteps) {
      const inc = card.effects.tempSteps * 2;
      newTemp = Math.min(8, newTemp + inc);
      newTr += card.effects.tempSteps;
    }

    if (card.effects.oxygenSteps) {
      newOxy = Math.min(14, newOxy + card.effects.oxygenSteps);
      newTr += card.effects.oxygenSteps;
    }

    if (card.effects.oceanCount) {
      newOceans = Math.min(9, newOceans + card.effects.oceanCount);
      newTr += card.effects.oceanCount;
      // 대양 타일 자동 배치
      if (targetSlotId) {
        const { updatedSlots: s } = placeMapTile(targetSlotId, 'ocean', curr.id, updatedSlots);
        updatedSlots = s;
      } else {
        const emptyOcean = updatedSlots.find(s => s.tileType === 'empty' && s.isOceanSlot);
        if (emptyOcean) {
          const { updatedSlots: s } = placeMapTile(emptyOcean.id, 'ocean', curr.id, updatedSlots);
          updatedSlots = s;
        }
      }
    }

    // 생산력 변경
    if (card.effects.productionChange) {
      for (const [r, amt] of Object.entries(card.effects.productionChange)) {
        prod[r as TMResource] += (amt || 0);
      }
    }

    // 즉발 자원 변경
    if (card.effects.resourceChange) {
      for (const [r, amt] of Object.entries(card.effects.resourceChange)) {
        res[r as TMResource] += (amt || 0);
      }
    }

    // 맵 타일 배치
    if (card.effects.placeTile) {
      const tile = card.effects.placeTile;
      const targetSlot = targetSlotId 
        ? updatedSlots.find(s => s.id === targetSlotId)
        : updatedSlots.find(s => s.tileType === 'empty' && !s.isOceanSlot);

      if (targetSlot) {
        const { updatedSlots: s, placedSlot } = placeMapTile(targetSlot.id, tile, curr.id, updatedSlots);
        updatedSlots = s;
        if (tile === 'greenery') {
          newOxy = Math.min(14, newOxy + 1);
          newTr += 1;
        }
        // 인접 해양 타일 보너스 수령 (개당 2M€)
        if (placedSlot) {
          const adj = getAdjacentSlots(placedSlot, updatedSlots);
          const adjOceans = adj.filter(slot => slot.tileType === 'ocean').length;
          if (adjOceans > 0) {
            res.megacredits += adjOceans * 2;
          }
        }
      }
    }

    const updatedPlayer: PlayerTM = {
      ...curr,
      tr: newTr,
      resources: res,
      production: prod,
      hand: curr.hand.filter(c => c.id !== cardId),
      playedCards: [...curr.playedCards, card]
    };

    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = updatedPlayer;

    set({
      players: updatedPlayers,
      mapSlots: updatedSlots,
      temperature: newTemp,
      oxygen: newOxy,
      oceansPlaced: newOceans,
      logs: [`🃏 ${curr.name}: [${card.name}] 프로젝트 실행 (${card.description})`, ...logs]
    });

    showFeedback(`[${card.name}] 카드 플레이 성공!`);
    get().syncToPeers();
    get().advanceTurn();
    return true;
  },

  convertPlantsToGreeneryAction: (targetSlotId: string) => {
    const { 
      playMode, 
      isHost, 
      myPlayerId, 
      players, 
      currentTurnPlayerIndex, 
      oxygen, 
      mapSlots, 
      logs 
    } = get();

    if (playMode === 'online' && !isHost) {
      peerManager.sendAction('TM_CONVERT_PLANTS', { targetSlotId }, myPlayerId);
      return true;
    }

    const curr = players[currentTurnPlayerIndex];
    const plantReq = curr.corporation.id === 'corp_ecoline' ? 7 : 8;
    if (curr.resources.plants < plantReq) {
      showFeedback(`식물이 부족합니다 (필요: ${plantReq}개)`);
      return false;
    }

    const { updatedSlots, placedSlot } = placeMapTile(targetSlotId, 'greenery', curr.id, mapSlots);
    if (!placedSlot) {
      showFeedback('배치할 수 없는 타일 위치입니다.');
      return false;
    }

    soundManager.playBuild();

    const newOxy = Math.min(14, oxygen + 1);
    const newTr = curr.tr + 1;

    const res = { ...curr.resources, plants: curr.resources.plants - plantReq };

    // 인접 해양 보너스 수령
    const adj = getAdjacentSlots(placedSlot, updatedSlots);
    const adjOceans = adj.filter(slot => slot.tileType === 'ocean').length;
    if (adjOceans > 0) {
      res.megacredits += adjOceans * 2;
    }

    const updatedPlayer: PlayerTM = {
      ...curr,
      tr: newTr,
      resources: res
    };

    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = updatedPlayer;

    set({
      players: updatedPlayers,
      mapSlots: updatedSlots,
      oxygen: newOxy,
      logs: [`🌿 ${curr.name}: 식물 ${plantReq}개를 소비하여 녹지 타일 조성! (산소 ${newOxy}%, TR +1)`, ...logs]
    });

    showFeedback('녹지 타일 조성 성공!');
    get().syncToPeers();
    get().advanceTurn();
    return true;
  },

  convertHeatToTemperatureAction: () => {
    const { 
      playMode, 
      isHost, 
      myPlayerId, 
      players, 
      currentTurnPlayerIndex, 
      temperature, 
      logs 
    } = get();

    if (playMode === 'online' && !isHost) {
      peerManager.sendAction('TM_CONVERT_HEAT', {}, myPlayerId);
      return true;
    }

    const curr = players[currentTurnPlayerIndex];
    if (curr.resources.heat < 8) {
      showFeedback('열이 부족합니다 (필요: 8개)');
      return false;
    }

    if (temperature >= 8) {
      showFeedback('온도가 이미 최고치(+8°C)에 도달했습니다.');
      return false;
    }

    soundManager.playFoghorn();

    const newTemp = Math.min(8, temperature + 2);
    const newTr = curr.tr + 1;

    const updatedPlayer: PlayerTM = {
      ...curr,
      tr: newTr,
      resources: { ...curr.resources, heat: curr.resources.heat - 8 }
    };

    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = updatedPlayer;

    set({
      players: updatedPlayers,
      temperature: newTemp,
      logs: [`🔥 ${curr.name}: 열 8개를 방출하여 온도 2°C 상승! (현재 ${newTemp}°C, TR +1)`, ...logs]
    });

    showFeedback('기온 상승 성공!');
    get().syncToPeers();
    get().advanceTurn();
    return true;
  },

  executeStandardProjectAction: (projectType, targetSlotId) => {
    const { 
      playMode, 
      isHost, 
      myPlayerId, 
      players, 
      currentTurnPlayerIndex, 
      temperature, 
      oxygen, 
      oceansPlaced, 
      mapSlots, 
      logs 
    } = get();

    if (playMode === 'online' && !isHost) {
      peerManager.sendAction('TM_STANDARD_PROJECT', { projectType, targetSlotId }, myPlayerId);
      return true;
    }

    const curr = players[currentTurnPlayerIndex];
    const costs: Record<string, number> = {
      power: 11,
      asteroid: 14,
      ocean: 18,
      greenery: 23,
      city: 25
    };

    const cost = costs[projectType] || 20;
    if (curr.resources.megacredits < cost) {
      showFeedback(`M€가 부족합니다 (필요: ${cost} M€)`);
      return false;
    }

    soundManager.playBuild();

    let newTemp = temperature;
    let newOxy = oxygen;
    let newOceans = oceansPlaced;
    let newTr = curr.tr;
    let updatedSlots = [...mapSlots];
    const res = { ...curr.resources, megacredits: curr.resources.megacredits - cost };
    const prod = { ...curr.production };
    let logMsg = '';

    if (projectType === 'power') {
      prod.energy += 1;
      logMsg = '발전소 표준 프로젝트 실행 (에너지 생산 +1)';
    } else if (projectType === 'asteroid') {
      newTemp = Math.min(8, newTemp + 2);
      newTr += 1;
      logMsg = '소행성 충돌 표준 프로젝트 (온도 +2°C, TR +1)';
    } else if (projectType === 'ocean') {
      newOceans = Math.min(9, newOceans + 1);
      newTr += 1;
      const emptyOcean = targetSlotId 
        ? updatedSlots.find(s => s.id === targetSlotId)
        : updatedSlots.find(s => s.tileType === 'empty' && s.isOceanSlot);
      if (emptyOcean) {
        const { updatedSlots: s } = placeMapTile(emptyOcean.id, 'ocean', curr.id, updatedSlots);
        updatedSlots = s;
      }
      logMsg = '대양 건설 표준 프로젝트 (해양 타일 배치, TR +1)';
    } else if (projectType === 'greenery') {
      newOxy = Math.min(14, newOxy + 1);
      newTr += 1;
      const emptySlot = targetSlotId 
        ? updatedSlots.find(s => s.id === targetSlotId)
        : updatedSlots.find(s => s.tileType === 'empty' && !s.isOceanSlot);
      if (emptySlot) {
        const { updatedSlots: s, placedSlot } = placeMapTile(emptySlot.id, 'greenery', curr.id, updatedSlots);
        updatedSlots = s;
        if (placedSlot) {
          const adj = getAdjacentSlots(placedSlot, updatedSlots);
          const adjOceans = adj.filter(slot => slot.tileType === 'ocean').length;
          if (adjOceans > 0) res.megacredits += adjOceans * 2;
        }
      }
      logMsg = '녹지 조성 표준 프로젝트 (녹지 타일 배치, 산소 +1%, TR +1)';
    } else if (projectType === 'city') {
      prod.megacredits += 1;
      const emptySlot = targetSlotId 
        ? updatedSlots.find(s => s.id === targetSlotId)
        : updatedSlots.find(s => s.tileType === 'empty' && !s.isOceanSlot);
      if (emptySlot) {
        const { updatedSlots: s, placedSlot } = placeMapTile(emptySlot.id, 'city', curr.id, updatedSlots);
        updatedSlots = s;
        if (placedSlot) {
          const adj = getAdjacentSlots(placedSlot, updatedSlots);
          const adjOceans = adj.filter(slot => slot.tileType === 'ocean').length;
          if (adjOceans > 0) res.megacredits += adjOceans * 2;
        }
      }
      logMsg = '도시 건설 표준 프로젝트 (도시 타일 배치, M€ 생산 +1)';
    }

    const updatedPlayer: PlayerTM = {
      ...curr,
      tr: newTr,
      resources: res,
      production: prod
    };

    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = updatedPlayer;

    set({
      players: updatedPlayers,
      mapSlots: updatedSlots,
      temperature: newTemp,
      oxygen: newOxy,
      oceansPlaced: newOceans,
      logs: [`🏗️ ${curr.name}: ${logMsg}`, ...logs]
    });

    showFeedback('표준 프로젝트 실행 완료!');
    get().syncToPeers();
    get().advanceTurn();
    return true;
  },

  buyCardFromMarket: (cardId: string) => {
    const { 
      playMode, 
      isHost, 
      myPlayerId, 
      players, 
      currentTurnPlayerIndex, 
      cardMarket, 
      logs 
    } = get();

    if (playMode === 'online' && !isHost) {
      peerManager.sendAction('TM_BUY_MARKET_CARD', { cardId }, myPlayerId);
      return true;
    }

    const curr = players[currentTurnPlayerIndex];
    const card = cardMarket.find(c => c.id === cardId);
    if (!card) return false;

    // 카드 연구 비용 3 M€
    if (curr.resources.megacredits < 3) {
      showFeedback('카드 연구비(3 M€)가 부족합니다.');
      return false;
    }

    soundManager.playCoin();

    const updatedPlayer: PlayerTM = {
      ...curr,
      resources: { ...curr.resources, megacredits: curr.resources.megacredits - 3 },
      hand: [...curr.hand, card]
    };

    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = updatedPlayer;

    set({
      players: updatedPlayers,
      cardMarket: cardMarket.filter(c => c.id !== cardId),
      logs: [`🔬 ${curr.name}: [${card.name}] 프로젝트 연구 구매 (3 M€ 소모)`, ...logs]
    });

    showFeedback(`[${card.name}] 연구 성공!`);
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
      peerManager.sendAction('TM_PASS', {}, myPlayerId);
      return;
    }

    const curr = players[currentTurnPlayerIndex];
    const updatedPlayers = players.map(p => 
      p.id === curr.id ? { ...p, hasPassedThisGen: true } : p
    );

    soundManager.playClick();

    set({
      players: updatedPlayers,
      logs: [`💤 ${curr.name}: 이번 세대 턴을 마쳤습니다.`, ...logs]
    });

    showFeedback(`${curr.name} 세대 패스`);
    get().syncToPeers();
    get().advanceTurn();
  },

  advanceTurn: () => {
    const { 
      players, 
      currentTurnPlayerIndex, 
      generation, 
      temperature, 
      oxygen, 
      oceansPlaced, 
      logs 
    } = get();

    const allPassed = players.every(p => p.hasPassedThisGen);

    if (allPassed) {
      // 1. 생산 단계 진행 (Production Phase)
      const { updatedPlayers, logs: prodLogs } = processProductionPhase(players);

      // 2. 테라포밍 3대 파라미터 완성 여부 점검 (온도 8°C, 산소 14%, 해양 9개)
      const isTerraformed = temperature >= 8 && oxygen >= 14 && oceansPlaced >= 9;

      if (isTerraformed || generation >= 8) {
        // 게임 완전 종료!
        soundManager.playGrandFanfare();
        set({
          isGameOver: true,
          phase: 'game_over',
          players: updatedPlayers,
          logs: ['🏁 [테라포밍 완수] 화성이 인류가 호흡할 수 있는 푸른 행성으로 탈바꿈했습니다! 최종 기업 승점을 정산합니다.', ...prodLogs, ...logs]
        });
        get().syncToPeers();
        return;
      } else {
        // 다음 세대 시작
        soundManager.playTempleChime();
        set({
          generation: generation + 1,
          currentTurnPlayerIndex: 0,
          players: updatedPlayers,
          logs: [`🔔 [제 ${generation + 1} 세대] 새로운 화성 개척 사이클이 시작되었습니다!`, ...prodLogs, ...logs]
        });
        get().syncToPeers();
      }
    } else {
      let nextIdx = (currentTurnPlayerIndex + 1) % players.length;
      let loopCount = 0;
      while (players[nextIdx].hasPassedThisGen && loopCount < players.length) {
        nextIdx = (nextIdx + 1) % players.length;
        loopCount++;
      }

      set({ currentTurnPlayerIndex: nextIdx });
      get().syncToPeers();
    }

    // AI 자동 턴 실행
    setTimeout(() => {
      const state = get();
      const nextP = state.players[state.currentTurnPlayerIndex];
      if (nextP && nextP.isAI && !state.isGameOver && !nextP.hasPassedThisGen) {
        const decision = TerraformingMarsAI.decideAction(nextP, state.mapSlots, {
          temperature: state.temperature,
          oxygen: state.oxygen,
          oceansPlaced: state.oceansPlaced
        });

        switch (decision.action) {
          case 'convert_plants':
            state.convertPlantsToGreeneryAction(decision.slotId);
            break;
          case 'convert_heat':
            state.convertHeatToTemperatureAction();
            break;
          case 'play_card':
            state.playCardAction(decision.cardId, decision.slotId);
            break;
          case 'standard_project':
            state.executeStandardProjectAction(decision.projectType, decision.slotId);
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
  (window as any).__TM_STORE__ = useTMStore;
}
