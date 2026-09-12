import { create } from 'zustand';
import type { 
  ActionLogEntry, 
  ActionPhase, 
  CargoShip, 
  GoodType, 
  PlantationTile, 
  PlantationType, 
  PlayerState, 
  PuertoRicoGameState, 
  RoleCardState, 
  RoleType 
} from '../types';
import { BUILDINGS_CATALOG, GOODS_DATA } from '../data/buildings';
import { calculateBuildingCost, calculateProduction, generateInitialPlantationDeck, hasBuilding } from '../engine/gameLogic';
import { PuertoRicoAI } from '../engine/aiPlayer';
import { peerManager } from '../../../platform/network/peerManager';

export type PlayMode = 'solo' | 'local_pass' | 'online';

export function getSerializableGameState(state: PuertoRicoGameState): Partial<PuertoRicoGameState> {
  return {
    players: state.players,
    governorIndex: state.governorIndex,
    currentTurnPlayerIndex: state.currentTurnPlayerIndex,
    currentRole: state.currentRole,
    roleCards: state.roleCards,
    round: state.round,
    plantationMarket: state.plantationMarket,
    quarrySupply: state.quarrySupply,
    colonistShip: state.colonistShip,
    colonistSupply: state.colonistSupply,
    vpSupply: state.vpSupply,
    goodsSupply: state.goodsSupply,
    tradingHouse: state.tradingHouse,
    cargoShips: state.cargoShips,
    currentPhase: state.currentPhase,
    playersCompletedAction: state.playersCompletedAction,
    captainConsecutivePasses: state.captainConsecutivePasses,
    isGameOver: state.isGameOver,
    endReason: state.endReason,
    actionLogs: state.actionLogs
  };
}

interface PuertoRicoStore extends PuertoRicoGameState {
  playMode: PlayMode;
  myPlayerId: string;
  isHost: boolean;
  roomCode: string | null;
  uiTheme: 'tabletop' | 'modern';
  showBuildingMarketModal: boolean;

  setShowBuildingMarketModal: (show: boolean) => void;
  toggleUITheme: () => void;
  initGame: (playerCount?: number, soloVsAI?: boolean) => void;
  initOnlineGame: (
    playerCount: number, 
    humanPlayers: { name: string; peerId?: string }[], 
    roomCode: string, 
    myPlayerId: string, 
    isHost: boolean
  ) => void;
  syncRemoteState: (newState: Partial<PuertoRicoGameState>) => void;

  selectRole: (role: RoleType) => void;
  executeSettler: (plantationType: PlantationType) => void;
  executeMayor: (assignments: {
    plantations: { id: string; hasColonist: boolean }[];
    buildings: { buildingId: string; colonists: number }[];
    unassigned: number;
  }) => void;
  executeBuilder: (buildingId: string | null) => void;
  executeCraftsman: (bonusGood?: GoodType) => void;
  executeTrader: (goodType: GoodType | null) => void;
  executeCaptain: (shipIndex: number | null, goodType: GoodType | null) => void;
  passCurrentAction: () => void;
  triggerAITurn: () => void;
  addLog: (text: string, type?: ActionLogEntry['type']) => void;
  finishRolePhase: () => void;
  nextPlayerAction: () => void;
  endRound: () => void;
  distributeMayorColonists: () => void;
  produceCraftsmanGoods: () => void;
  syncToPeers: () => void;
}

const INITIAL_ROLES: RoleType[] = [
  'settler',
  'mayor',
  'builder',
  'craftsman',
  'trader',
  'captain'
];

export const usePuertoRicoStore = create<PuertoRicoStore>((set, get) => ({
  playMode: 'solo',
  myPlayerId: 'p-0',
  isHost: true,
  roomCode: null,
  uiTheme: (localStorage.getItem('puerto_rico_theme') as 'tabletop' | 'modern') || 'tabletop',

  showBuildingMarketModal: false,
  setShowBuildingMarketModal: (show: boolean) => set({ showBuildingMarketModal: show }),

  toggleUITheme: () => {
    const nextTheme = get().uiTheme === 'tabletop' ? 'modern' : 'tabletop';
    localStorage.setItem('puerto_rico_theme', nextTheme);
    set({ uiTheme: nextTheme });
  },

  players: [],
  governorIndex: 0,
  currentTurnPlayerIndex: 0,
  currentRole: null,
  roleCards: [],
  round: 1,

  plantationMarket: [],
  plantationDrawPile: [],
  quarrySupply: 8,
  colonistShip: 3,
  colonistSupply: 55,
  vpSupply: 75,
  goodsSupply: {
    corn: 10,
    indigo: 11,
    sugar: 9,
    tobacco: 9,
    coffee: 9
  },

  tradingHouse: [],
  cargoShips: [
    { capacity: 4, goodType: null, loaded: 0 },
    { capacity: 5, goodType: null, loaded: 0 },
    { capacity: 6, goodType: null, loaded: 0 }
  ],

  currentPhase: 'idle',
  playersCompletedAction: [],
  captainConsecutivePasses: 0,
  isGameOver: false,
  endReason: null,
  actionLogs: [],

  syncToPeers: () => {
    if (get().playMode === 'online' && get().isHost) {
      peerManager.broadcastStateSync(getSerializableGameState(get()));
    }
  },

  syncRemoteState: (newState) => {
    set(state => ({
      ...state,
      ...newState
    }));
  },

  addLog: (text: string, type: ActionLogEntry['type'] = 'info') => {
    const newEntry: ActionLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      round: get().round,
      text,
      type,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    set(state => ({
      actionLogs: [newEntry, ...state.actionLogs.slice(0, 49)]
    }));
    get().syncToPeers();
  },

  initGame: (playerCount = 3, soloVsAI = true) => {
    const deck = generateInitialPlantationDeck();
    const marketSize = playerCount + 1;
    const market = deck.splice(0, marketSize);

    const players: PlayerState[] = [];
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
    const names = ['플레이어 (나)', '카리브 총독 (AI 1)', '상인 펠리페 (AI 2)', '제독 디에고 (AI 3)'];

    for (let i = 0; i < playerCount; i++) {
      const startPlantation: PlantationType = i === 0 ? 'indigo' : (i % 2 === 1 ? 'corn' : 'indigo');
      players.push({
        id: `p-${i}`,
        name: i === 0 ? '플레이어 1 (나)' : (soloVsAI ? names[i] : `플레이어 ${i + 1}`),
        isAI: soloVsAI && i > 0,
        color: colors[i % colors.length],
        doubloons: i === 0 ? 2 : (i === 1 ? 2 : 3),
        vpChips: 0,
        plantations: [
          { id: `start-${i}`, type: startPlantation, hasColonist: false }
        ],
        buildings: [],
        goods: { corn: 0, indigo: 0, sugar: 0, tobacco: 0, coffee: 0 },
        unassignedColonists: 0
      });
    }

    const rolesToUse: RoleType[] = (playerCount === 2 || playerCount >= 4)
      ? [...INITIAL_ROLES, 'prospector'] 
      : [...INITIAL_ROLES];

    const roleCards: RoleCardState[] = rolesToUse.map(role => ({
      role,
      doubloons: 0,
      selectedByPlayerId: null
    }));

    const cargoShips: CargoShip[] = playerCount === 2 
      ? [{ capacity: 3, goodType: null, loaded: 0 }, { capacity: 4, goodType: null, loaded: 0 }]
      : playerCount === 3
        ? [{ capacity: 4, goodType: null, loaded: 0 }, { capacity: 5, goodType: null, loaded: 0 }, { capacity: 6, goodType: null, loaded: 0 }]
        : [{ capacity: 5, goodType: null, loaded: 0 }, { capacity: 6, goodType: null, loaded: 0 }, { capacity: 7, goodType: null, loaded: 0 }];

    const colonistSupplyCount = playerCount === 2 ? 40 : playerCount === 3 ? 55 : playerCount === 4 ? 75 : 95;
    const vpSupplyCount = playerCount === 2 ? 65 : playerCount === 3 ? 75 : playerCount === 4 ? 100 : 122;

    set({
      playMode: soloVsAI ? 'solo' : 'local_pass',
      myPlayerId: 'p-0',
      isHost: true,
      roomCode: null,
      players,
      governorIndex: 0,
      currentTurnPlayerIndex: 0,
      currentRole: null,
      roleCards,
      round: 1,
      plantationMarket: market,
      plantationDrawPile: deck,
      quarrySupply: 8,
      colonistShip: playerCount,
      colonistSupply: colonistSupplyCount,
      vpSupply: vpSupplyCount,
      goodsSupply: { corn: 10, indigo: 11, sugar: 9, tobacco: 9, coffee: 9 },
      tradingHouse: [],
      cargoShips,
      currentPhase: 'select_role',
      playersCompletedAction: [],
      captainConsecutivePasses: 0,
      isGameOver: false,
      endReason: null,
      actionLogs: []
    });

    get().addLog(`⚓ 푸에르토리코 게임 시작! (${playerCount}인 모드)`, 'info');
    get().addLog(`👑 ${players[0].name}님이 첫 총독(Governor)입니다.`, 'role');
  },

  // 온라인 실시간 멀티플레이 초기화
  initOnlineGame: (playerCount, humanPlayers, roomCode, myPlayerId, isHost) => {
    const deck = generateInitialPlantationDeck();
    const marketSize = playerCount + 1;
    const market = deck.splice(0, marketSize);

    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
    const defaultAINames = ['총독 봇 (AI)', '상인 봇 (AI)', '제독 봇 (AI)'];
    const players: PlayerState[] = [];

    for (let i = 0; i < playerCount; i++) {
      const isHuman = i < humanPlayers.length;
      const playerName = isHuman ? humanPlayers[i].name : defaultAINames[i - humanPlayers.length];
      const startPlantation: PlantationType = i === 0 ? 'indigo' : (i % 2 === 1 ? 'corn' : 'indigo');

      players.push({
        id: `p-${i}`,
        name: playerName,
        isAI: !isHuman,
        color: colors[i % colors.length],
        doubloons: i === 0 ? 2 : (i === 1 ? 2 : 3),
        vpChips: 0,
        plantations: [
          { id: `start-${i}`, type: startPlantation, hasColonist: false }
        ],
        buildings: [],
        goods: { corn: 0, indigo: 0, sugar: 0, tobacco: 0, coffee: 0 },
        unassignedColonists: 0
      });
    }

    const rolesToUse: RoleType[] = (playerCount === 2 || playerCount >= 4)
      ? [...INITIAL_ROLES, 'prospector'] 
      : [...INITIAL_ROLES];

    const roleCards: RoleCardState[] = rolesToUse.map(role => ({
      role,
      doubloons: 0,
      selectedByPlayerId: null
    }));

    const cargoShips: CargoShip[] = playerCount === 2 
      ? [{ capacity: 3, goodType: null, loaded: 0 }, { capacity: 4, goodType: null, loaded: 0 }]
      : playerCount === 3
        ? [{ capacity: 4, goodType: null, loaded: 0 }, { capacity: 5, goodType: null, loaded: 0 }, { capacity: 6, goodType: null, loaded: 0 }]
        : [{ capacity: 5, goodType: null, loaded: 0 }, { capacity: 6, goodType: null, loaded: 0 }, { capacity: 7, goodType: null, loaded: 0 }];

    const colonistSupplyCount = playerCount === 2 ? 40 : playerCount === 3 ? 55 : playerCount === 4 ? 75 : 95;
    const vpSupplyCount = playerCount === 2 ? 65 : playerCount === 3 ? 75 : playerCount === 4 ? 100 : 122;

    set({
      playMode: 'online',
      myPlayerId,
      isHost,
      roomCode,
      players,
      governorIndex: 0,
      currentTurnPlayerIndex: 0,
      currentRole: null,
      roleCards,
      round: 1,
      plantationMarket: market,
      plantationDrawPile: deck,
      quarrySupply: 8,
      colonistShip: playerCount,
      colonistSupply: colonistSupplyCount,
      vpSupply: vpSupplyCount,
      goodsSupply: { corn: 10, indigo: 11, sugar: 9, tobacco: 9, coffee: 9 },
      tradingHouse: [],
      cargoShips,
      currentPhase: 'select_role',
      playersCompletedAction: [],
      captainConsecutivePasses: 0,
      isGameOver: false,
      endReason: null,
      actionLogs: []
    });

    get().addLog(`🌐 온라인 멀티플레이 대전이 시작되었습니다! (방 코드: ${roomCode})`, 'info');
    get().addLog(`👑 ${players[0].name}님이 첫 총독(Governor)입니다.`, 'role');

    if (isHost) {
      get().syncToPeers();
    }
  },

  selectRole: (role: RoleType) => {
    const { playMode, isHost, myPlayerId, players, currentTurnPlayerIndex, roleCards } = get();
    const currPlayer = players[currentTurnPlayerIndex];

    // 온라인 게스트인 경우 호스트에게 액션 요청
    if (playMode === 'online' && !isHost) {
      if (currPlayer.id !== myPlayerId) return;
      peerManager.sendActionToHost('selectRole', { role }, myPlayerId);
      return;
    }

    const player = players[currentTurnPlayerIndex];
    const roleCard = roleCards.find(rc => rc.role === role);
    if (!roleCard || roleCard.selectedByPlayerId !== null) return;

    const bonus = roleCard.doubloons;
    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = {
      ...player,
      doubloons: player.doubloons + bonus
    };

    const updatedRoleCards = roleCards.map(rc => 
      rc.role === role ? { ...rc, selectedByPlayerId: player.id, doubloons: 0 } : rc
    );

    let logText = `📜 ${player.name}님이 [${role.toUpperCase()}] 역할을 선택했습니다.`;
    if (bonus > 0) logText += ` (누적된 +${bonus} 두블론 획득)`;
    get().addLog(logText, 'role');

    let nextPhase: ActionPhase = 'idle';
    switch (role) {
      case 'settler': nextPhase = 'settler_action'; break;
      case 'mayor': nextPhase = 'mayor_assign'; break;
      case 'builder': nextPhase = 'builder_action'; break;
      case 'craftsman': nextPhase = 'craftsman_bonus'; break;
      case 'trader': nextPhase = 'trader_action'; break;
      case 'captain': nextPhase = 'captain_action'; break;
      case 'prospector': {
        updatedPlayers[currentTurnPlayerIndex].doubloons += 1;
        get().addLog(`⛏️ ${player.name}님이 금광부 특권으로 1 두블론을 채굴했습니다.`, 'reward');
        set({
          players: updatedPlayers,
          roleCards: updatedRoleCards,
          currentRole: role
        });
        get().syncToPeers();
        get().finishRolePhase();
        return;
      }
    }

    set({
      players: updatedPlayers,
      roleCards: updatedRoleCards,
      currentRole: role,
      currentPhase: nextPhase,
      playersCompletedAction: [],
      captainConsecutivePasses: 0
    });

    if (role === 'mayor') {
      get().distributeMayorColonists();
    } else if (role === 'craftsman') {
      get().produceCraftsmanGoods();
    }

    get().syncToPeers();

    const curr = get().players[get().currentTurnPlayerIndex];
    if (curr.isAI) {
      setTimeout(() => get().triggerAITurn(), 600);
    }
  },

  distributeMayorColonists: () => {
    const { players, currentTurnPlayerIndex, colonistShip, colonistSupply } = get();
    let shipCount = colonistShip;
    const updated = [...players];
    const n = players.length;

    let extra = 0;
    if (colonistSupply > 0) {
      extra = 1;
    }

    let idx = currentTurnPlayerIndex;
    while (shipCount > 0) {
      updated[idx] = {
        ...updated[idx],
        unassignedColonists: updated[idx].unassignedColonists + 1
      };
      shipCount--;
      idx = (idx + 1) % n;
    }

    if (extra > 0) {
      updated[currentTurnPlayerIndex] = {
        ...updated[currentTurnPlayerIndex],
        unassignedColonists: updated[currentTurnPlayerIndex].unassignedColonists + extra
      };
    }

    get().addLog(`🏛️ 이주민 배에서 일꾼들이 도착했습니다! (시장 특권: +${extra}명)`, 'info');

    set({
      players: updated,
      colonistShip: 0,
      colonistSupply: Math.max(0, colonistSupply - extra)
    });
    get().syncToPeers();
  },

  produceCraftsmanGoods: () => {
    const { players, goodsSupply } = get();
    const updatedPlayers = [...players];
    const newSupply = { ...goodsSupply };

    players.forEach((p, pIdx) => {
      const prod = calculateProduction(p);
      const gained: string[] = [];

      (Object.keys(prod) as GoodType[]).forEach(good => {
        const want = prod[good];
        if (want > 0) {
          const available = Math.min(want, newSupply[good]);
          if (available > 0) {
            updatedPlayers[pIdx].goods[good] += available;
            newSupply[good] -= available;
            gained.push(`${GOODS_DATA[good].koreanName} +${available}`);
          }
        }
      });

      if (hasBuilding(p, 'factory')) {
        const kinds = (Object.keys(prod) as GoodType[]).filter(g => prod[g] > 0).length;
        const factoryBonus = kinds === 2 ? 1 : kinds === 3 ? 2 : kinds === 4 ? 3 : kinds >= 5 ? 5 : 0;
        if (factoryBonus > 0) {
          updatedPlayers[pIdx].doubloons += factoryBonus;
          get().addLog(`🏭 ${p.name}님이 공장 보너스로 ${factoryBonus} 두블론을 획득했습니다!`, 'reward');
        }
      }

      if (gained.length > 0) {
        get().addLog(`⚙️ ${p.name} 생산: ${gained.join(', ')}`, 'info');
      }
    });

    set({
      players: updatedPlayers,
      goodsSupply: newSupply
    });
    get().syncToPeers();
  },

  executeSettler: (plantationType: PlantationType) => {
    const { playMode, isHost, myPlayerId, players, currentTurnPlayerIndex, plantationMarket, quarrySupply } = get();
    const player = players[currentTurnPlayerIndex];

    if (playMode === 'online' && !isHost) {
      if (player.id !== myPlayerId) return;
      peerManager.sendActionToHost('executeSettler', { plantationType }, myPlayerId);
      return;
    }

    if (player.plantations.length >= 12) {
      get().passCurrentAction();
      return;
    }

    let newMarket = [...plantationMarket];
    let newQuarry = quarrySupply;

    if (plantationType === 'quarry') {
      newQuarry = Math.max(0, quarrySupply - 1);
    } else {
      const mIdx = newMarket.indexOf(plantationType);
      if (mIdx !== -1) {
        newMarket.splice(mIdx, 1);
      }
    }

    const newPlantation: PlantationTile = {
      id: Math.random().toString(36).substring(2, 9),
      type: plantationType,
      hasColonist: hasBuilding(player, 'hospice')
    };

    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = {
      ...player,
      plantations: [...player.plantations, newPlantation]
    };

    const typeName = plantationType === 'quarry' ? '채석장' : GOODS_DATA[plantationType].koreanName;
    get().addLog(`🌱 ${player.name}님이 [${typeName}] 타일을 개척지에 배치했습니다.`, 'info');

    set({
      players: updatedPlayers,
      plantationMarket: newMarket,
      quarrySupply: newQuarry
    });

    get().syncToPeers();
    get().nextPlayerAction();
  },

  executeMayor: (assignments) => {
    const { playMode, isHost, myPlayerId, players, currentTurnPlayerIndex } = get();
    const player = players[currentTurnPlayerIndex];

    if (playMode === 'online' && !isHost) {
      if (player.id !== myPlayerId) return;
      peerManager.sendActionToHost('executeMayor', { assignments }, myPlayerId);
      return;
    }

    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = {
      ...player,
      plantations: player.plantations.map(p => {
        const found = assignments.plantations.find(a => a.id === p.id);
        return found ? { ...p, hasColonist: found.hasColonist } : p;
      }),
      buildings: player.buildings.map(b => {
        const found = assignments.buildings.find(a => a.buildingId === b.buildingId);
        return found ? { ...b, colonists: found.colonists } : b;
      }),
      unassignedColonists: assignments.unassigned
    };

    get().addLog(`🏛️ ${player.name}님이 일꾼 배치를 완료했습니다.`, 'info');

    set({ players: updatedPlayers });
    get().syncToPeers();
    get().nextPlayerAction();
  },

  executeBuilder: (buildingId: string | null) => {
    const { playMode, isHost, myPlayerId, players, currentTurnPlayerIndex, roleCards } = get();
    const player = players[currentTurnPlayerIndex];

    if (playMode === 'online' && !isHost) {
      if (player.id !== myPlayerId) return;
      peerManager.sendActionToHost('executeBuilder', { buildingId }, myPlayerId);
      return;
    }

    if (!buildingId) {
      get().addLog(`🏗️ ${player.name}님이 건설을 건너뛰었습니다.`, 'info');
      get().nextPlayerAction();
      return;
    }

    const buildingDef = BUILDINGS_CATALOG.find(b => b.id === buildingId);
    if (!buildingDef) return;

    const roleCard = roleCards.find(rc => rc.role === 'builder');
    const hasPrivilege = roleCard?.selectedByPlayerId === player.id;
    const cost = calculateBuildingCost(buildingDef, player, hasPrivilege);

    if (player.doubloons < cost || player.buildings.length >= 12) {
      get().passCurrentAction();
      return;
    }

    const hasUni = hasBuilding(player, 'university');
    const startingColonist = hasUni ? 1 : 0;

    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = {
      ...player,
      doubloons: player.doubloons - cost,
      buildings: [...player.buildings, { buildingId, colonists: startingColonist }]
    };

    get().addLog(`🏗️ ${player.name}님이 [${buildingDef.koreanName}] 건물을 ${cost}두블론에 건설했습니다!`, 'reward');

    set({ players: updatedPlayers });
    get().syncToPeers();
    get().nextPlayerAction();
  },

  executeCraftsman: (bonusGood?: GoodType) => {
    const { playMode, isHost, myPlayerId, players, currentTurnPlayerIndex, goodsSupply } = get();
    const player = players[currentTurnPlayerIndex];

    if (playMode === 'online' && !isHost) {
      if (player.id !== myPlayerId) return;
      peerManager.sendActionToHost('executeCraftsman', { bonusGood }, myPlayerId);
      return;
    }

    if (bonusGood && goodsSupply[bonusGood] > 0) {
      const updatedPlayers = [...players];
      updatedPlayers[currentTurnPlayerIndex].goods[bonusGood] += 1;
      set({
        players: updatedPlayers,
        goodsSupply: {
          ...goodsSupply,
          [bonusGood]: goodsSupply[bonusGood] - 1
        }
      });
      get().addLog(`⚙️ ${player.name}님이 감독관 특권으로 [${GOODS_DATA[bonusGood].koreanName}] 1개를 추가 획득했습니다!`, 'reward');
    }

    get().syncToPeers();
    get().finishRolePhase();
  },

  executeTrader: (goodType: GoodType | null) => {
    const { playMode, isHost, myPlayerId, players, currentTurnPlayerIndex, tradingHouse, roleCards, goodsSupply } = get();
    const player = players[currentTurnPlayerIndex];

    if (playMode === 'online' && !isHost) {
      if (player.id !== myPlayerId) return;
      peerManager.sendActionToHost('executeTrader', { goodType }, myPlayerId);
      return;
    }

    if (!goodType || tradingHouse.length >= 4 || player.goods[goodType] <= 0) {
      get().addLog(`⚖️ ${player.name}님이 판매를 건너뛰었습니다.`, 'info');
      get().nextPlayerAction();
      return;
    }

    // 사무소(Office)가 없으면 이미 상점에 있는 상품 판매 불가
    const canSellDuplicate = hasBuilding(player, 'office');
    if (tradingHouse.includes(goodType) && !canSellDuplicate) {
      get().addLog(`⚖️ ${player.name}님은 이미 상점에 있는 [${GOODS_DATA[goodType].koreanName}]을(를) 판매할 수 없습니다 (사무소 필요).`, 'info');
      get().nextPlayerAction();
      return;
    }

    const roleCard = roleCards.find(rc => rc.role === 'trader');
    const hasPrivilege = roleCard?.selectedByPlayerId === player.id;

    let price = GOODS_DATA[goodType].basePrice;
    if (hasPrivilege) price += 1;
    if (hasBuilding(player, 'small_market')) price += 1;
    if (hasBuilding(player, 'large_market')) price += 2;

    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = {
      ...player,
      doubloons: player.doubloons + price,
      goods: {
        ...player.goods,
        [goodType]: player.goods[goodType] - 1
      }
    };

    get().addLog(`⚖️ ${player.name}님이 [${GOODS_DATA[goodType].koreanName}] 1개를 상점에 판매하여 ${price}두블론을 받았습니다.`, 'trade');

    set({
      players: updatedPlayers,
      tradingHouse: [...tradingHouse, goodType],
      goodsSupply: {
        ...goodsSupply,
        [goodType]: goodsSupply[goodType] + 1
      }
    });

    get().syncToPeers();
    get().nextPlayerAction();
  },

  executeCaptain: (shipIndex: number | null, goodType: GoodType | null) => {
    const { playMode, isHost, myPlayerId, players, currentTurnPlayerIndex, cargoShips, vpSupply, roleCards, goodsSupply, captainConsecutivePasses } = get();
    const player = players[currentTurnPlayerIndex];

    if (playMode === 'online' && !isHost) {
      if (player.id !== myPlayerId) return;
      peerManager.sendActionToHost('executeCaptain', { shipIndex, goodType }, myPlayerId);
      return;
    }

    // 선적 불가능하거나 건너뛰는 경우
    if (shipIndex === null || goodType === null || player.goods[goodType] <= 0) {
      get().addLog(`⚓ ${player.name}님이 선적을 건너뛰었습니다.`, 'info');
      const nextPasses = captainConsecutivePasses + 1;
      if (nextPasses >= players.length) {
        set({ captainConsecutivePasses: 0 });
        get().finishRolePhase();
      } else {
        const nextIdx = (currentTurnPlayerIndex + 1) % players.length;
        set({
          currentTurnPlayerIndex: nextIdx,
          captainConsecutivePasses: nextPasses
        });
        get().syncToPeers();
        const nextPlayer = players[nextIdx];
        if (nextPlayer.isAI) {
          setTimeout(() => get().triggerAITurn(), 600);
        }
      }
      return;
    }

    const ship = cargoShips[shipIndex];
    const remainingSpace = ship.capacity - ship.loaded;
    const amountToShip = Math.min(player.goods[goodType], remainingSpace);

    if (amountToShip <= 0) {
      const nextPasses = captainConsecutivePasses + 1;
      if (nextPasses >= players.length) {
        set({ captainConsecutivePasses: 0 });
        get().finishRolePhase();
      } else {
        const nextIdx = (currentTurnPlayerIndex + 1) % players.length;
        set({
          currentTurnPlayerIndex: nextIdx,
          captainConsecutivePasses: nextPasses
        });
        get().syncToPeers();
        const nextPlayer = players[nextIdx];
        if (nextPlayer.isAI) {
          setTimeout(() => get().triggerAITurn(), 600);
        }
      }
      return;
    }

    const roleCard = roleCards.find(rc => rc.role === 'captain');
    const isFirstLoadByPrivilege = roleCard?.selectedByPlayerId === player.id;
    
    let earnedVp = amountToShip;
    if (isFirstLoadByPrivilege) earnedVp += 1;
    if (hasBuilding(player, 'harbor')) earnedVp += 1;

    const realVp = Math.min(earnedVp, vpSupply);

    const updatedShips = [...cargoShips];
    updatedShips[shipIndex] = {
      ...ship,
      goodType,
      loaded: ship.loaded + amountToShip
    };

    const updatedPlayers = [...players];
    updatedPlayers[currentTurnPlayerIndex] = {
      ...player,
      vpChips: player.vpChips + realVp,
      goods: {
        ...player.goods,
        [goodType]: player.goods[goodType] - amountToShip
      }
    };

    get().addLog(`⚓ ${player.name}님이 [${GOODS_DATA[goodType].koreanName}] ${amountToShip}개를 화물선에 선적하여 ${realVp} VP를 획득했습니다!`, 'ship');

    const nextIdx = (currentTurnPlayerIndex + 1) % players.length;

    set({
      players: updatedPlayers,
      cargoShips: updatedShips,
      vpSupply: Math.max(0, vpSupply - realVp),
      goodsSupply: {
        ...goodsSupply,
        [goodType]: goodsSupply[goodType] + amountToShip
      },
      captainConsecutivePasses: 0, // 선적 성공 시 연속 패스 카운트 0 초기화 (다회차 순환 루프)
      currentTurnPlayerIndex: nextIdx
    });

    get().syncToPeers();

    const nextPlayer = players[nextIdx];
    if (nextPlayer.isAI) {
      setTimeout(() => get().triggerAITurn(), 600);
    }
  },

  passCurrentAction: () => {
    const { playMode, isHost, myPlayerId, players, currentTurnPlayerIndex, currentRole, captainConsecutivePasses } = get();
    const player = players[currentTurnPlayerIndex];

    if (playMode === 'online' && !isHost) {
      if (player.id !== myPlayerId) return;
      peerManager.sendActionToHost('passCurrentAction', {}, myPlayerId);
      return;
    }

    get().addLog(`⏩ ${player.name}님이 행동을 패스했습니다.`, 'info');

    if (currentRole === 'captain') {
      const nextPasses = captainConsecutivePasses + 1;
      if (nextPasses >= players.length) {
        set({ captainConsecutivePasses: 0 });
        get().finishRolePhase();
      } else {
        const nextIdx = (currentTurnPlayerIndex + 1) % players.length;
        set({
          currentTurnPlayerIndex: nextIdx,
          captainConsecutivePasses: nextPasses
        });
        get().syncToPeers();
        const nextPlayer = players[nextIdx];
        if (nextPlayer.isAI) {
          setTimeout(() => get().triggerAITurn(), 600);
        }
      }
      return;
    }

    get().nextPlayerAction();
  },

  nextPlayerAction: () => {
    const { players, currentTurnPlayerIndex, playersCompletedAction } = get();
    const currId = players[currentTurnPlayerIndex].id;
    const newCompleted = [...playersCompletedAction, currId];

    if (newCompleted.length >= players.length) {
      get().finishRolePhase();
      return;
    }

    const nextIdx = (currentTurnPlayerIndex + 1) % players.length;
    set({
      currentTurnPlayerIndex: nextIdx,
      playersCompletedAction: newCompleted
    });

    get().syncToPeers();

    const nextPlayer = players[nextIdx];
    if (nextPlayer.isAI) {
      setTimeout(() => get().triggerAITurn(), 600);
    }
  },

  finishRolePhase: () => {
    const { currentRole, cargoShips, tradingHouse, players } = get();

    if (currentRole === 'captain') {
      const emptiedShips = cargoShips.map(s => 
        s.loaded >= s.capacity ? { ...s, goodType: null, loaded: 0 } : s
      );

      const updatedPlayers = players.map(p => {
        const hasSmallWarehouse = hasBuilding(p, 'small_warehouse');
        const hasLargeWarehouse = hasBuilding(p, 'large_warehouse');
        const totalGoodsCount = Object.values(p.goods).reduce((a, b) => a + b, 0);

        if (!hasSmallWarehouse && !hasLargeWarehouse && totalGoodsCount > 1) {
          const newGoods = { ...p.goods };
          let kept = false;
          (Object.keys(newGoods) as GoodType[]).reverse().forEach(g => {
            if (!kept && newGoods[g] > 0) {
              newGoods[g] = 1;
              kept = true;
            } else {
              newGoods[g] = 0;
            }
          });
          return { ...p, goods: newGoods };
        }
        return p;
      });

      set({
        cargoShips: emptiedShips,
        players: updatedPlayers
      });
    }

    if (currentRole === 'mayor') {
      // 공식 룰: 시장 단계 종료 시 모든 플레이어의 건물(Building)에 있는 빈 일꾼 슬롯 수 합계(최소 인원수)만큼 공급처에서 이주민 배로 충원
      const { colonistSupply } = get();
      const emptyBldgSlots = players.reduce((sum, p) => {
        return sum + p.buildings.reduce((bSum, b) => {
          const def = BUILDINGS_CATALOG.find(x => x.id === b.buildingId);
          return bSum + Math.max(0, (def?.maxColonists || 1) - b.colonists);
        }, 0);
      }, 0);

      const neededForShip = Math.max(players.length, emptyBldgSlots);
      const shipLoad = Math.min(neededForShip, colonistSupply);
      const remainingSupply = Math.max(0, colonistSupply - shipLoad);

      if (shipLoad < neededForShip) {
        get().addLog(`⚠️ 이주민 공급처가 고갈되어 이주민 배를 가득 채우지 못했습니다! (${shipLoad}/${neededForShip}명) 이번 라운드 종료 시 게임이 종료됩니다.`, 'reward');
      }

      set({
        colonistShip: shipLoad,
        colonistSupply: remainingSupply
      });
    }

    if (currentRole === 'trader' && tradingHouse.length >= 4) {
      get().addLog(`🏪 상점이 가득 차서 상품들이 유럽으로 출항했습니다. (상점 비워짐)`, 'info');
      set({ tradingHouse: [] });
    }

    if (currentRole === 'settler') {
      const { plantationDrawPile, players: pList } = get();
      const newDeck = [...plantationDrawPile];
      const countToDraw = pList.length + 1;
      const newMarket = newDeck.splice(0, countToDraw);
      set({
        plantationMarket: newMarket,
        plantationDrawPile: newDeck
      });
    }

    const { roleCards } = get();
    const selectedCount = roleCards.filter(rc => rc.selectedByPlayerId !== null).length;
    // 2인 게임은 1라운드에 각 플레이어가 3개씩 총 6개의 역할을 번갈아 선택함
    const maxRolesInRound = players.length === 2 ? 6 : players.length;

    if (selectedCount >= maxRolesInRound) {
      get().endRound();
    } else {
      const { governorIndex } = get();
      const nextSelectorIdx = (governorIndex + selectedCount) % players.length;
      set({
        currentPhase: 'select_role',
        currentTurnPlayerIndex: nextSelectorIdx,
        currentRole: null,
        playersCompletedAction: []
      });

      const nextPlayer = players[nextSelectorIdx];
      get().addLog(`👉 ${nextPlayer.name}님이 역할을 선택할 차례입니다. (${selectedCount + 1}/${maxRolesInRound})`, 'role');

      get().syncToPeers();

      if (nextPlayer.isAI) {
        setTimeout(() => get().triggerAITurn(), 600);
      }
    }
  },

  endRound: () => {
    const { 
      players, 
      governorIndex, 
      round, 
      roleCards, 
      colonistSupply, 
      colonistShip,
      vpSupply 
    } = get();

    // 선택되지 않은 역할 카드들에 +1 두블론 누적, 선택 상태 초기화
    const updatedRoleCards = roleCards.map(rc => ({
      ...rc,
      doubloons: rc.selectedByPlayerId === null ? rc.doubloons + 1 : rc.doubloons,
      selectedByPlayerId: null
    }));

    let isEnded = false;
    let reason: string | null = null;

    // 공식 룰 종료 조건 (라운드가 완전히 끝난 시점에 정산):
    // 1. 시장 단계에서 공급처가 고갈되어 배를 충분히 채우지 못했거나 공급처 0
    // 2. 승점(VP) 칩이 모두 소진됨
    // 3. 한 플레이어가 12채의 건물을 모두 건설함
    if (colonistSupply <= 0 && colonistShip === 0) {
      isEnded = true;
      reason = '이주민 공급처가 모두 고갈되었습니다.';
    } else if (vpSupply <= 0) {
      isEnded = true;
      reason = '승점(VP) 칩이 모두 소진되었습니다.';
    } else if (players.some(p => p.buildings.length >= 12)) {
      isEnded = true;
      reason = '한 플레이어가 도시 건물 12칸을 모두 건설했습니다!';
    }

    if (isEnded) {
      get().addLog(`🏆 게임이 종료되었습니다! (${reason}) 최종 승점을 계산합니다.`, 'reward');
      set({
        isGameOver: true,
        endReason: reason,
        currentPhase: 'game_over'
      });
      get().syncToPeers();
      return;
    }

    const nextGovIdx = (governorIndex + 1) % players.length;
    get().addLog(`🔄 라운드 ${round} 종료! 총독이 ${players[nextGovIdx].name}님으로 교체됩니다.`, 'info');

    set({
      round: round + 1,
      governorIndex: nextGovIdx,
      currentTurnPlayerIndex: nextGovIdx,
      roleCards: updatedRoleCards,
      currentPhase: 'select_role',
      currentRole: null,
      playersCompletedAction: []
    });

    get().syncToPeers();

    const nextGov = players[nextGovIdx];
    if (nextGov.isAI) {
      setTimeout(() => get().triggerAITurn(), 600);
    }
  },

  triggerAITurn: () => {
    const state = get();
    const { currentPhase, currentTurnPlayerIndex, players, roleCards } = state;
    const aiPlayer = players[currentTurnPlayerIndex];

    if (!aiPlayer || !aiPlayer.isAI || state.isGameOver) return;

    if (currentPhase === 'select_role') {
      const chosenRole = PuertoRicoAI.selectRole(state, aiPlayer);
      get().selectRole(chosenRole);
      return;
    }

    if (currentPhase === 'settler_action') {
      const roleCard = roleCards.find(rc => rc.role === 'settler');
      const hasPrivilege = roleCard?.selectedByPlayerId === aiPlayer.id;
      const canQuarry = hasPrivilege || hasBuilding(aiPlayer, 'construction_hut');
      const chosen = PuertoRicoAI.choosePlantation(state, aiPlayer, canQuarry);

      if (chosen) {
        get().executeSettler(chosen);
      } else {
        get().passCurrentAction();
      }
      return;
    }

    if (currentPhase === 'mayor_assign') {
      const assignment = PuertoRicoAI.autoAssignColonists(aiPlayer);
      get().executeMayor(assignment);
      return;
    }

    if (currentPhase === 'builder_action') {
      const roleCard = roleCards.find(rc => rc.role === 'builder');
      const hasPrivilege = roleCard?.selectedByPlayerId === aiPlayer.id;
      const buildingId = PuertoRicoAI.chooseBuilding(state, aiPlayer, hasPrivilege);
      get().executeBuilder(buildingId);
      return;
    }

    if (currentPhase === 'craftsman_bonus') {
      const prod = calculateProduction(aiPlayer);
      const producedGoods = (['coffee', 'tobacco', 'sugar', 'indigo', 'corn'] as GoodType[])
        .filter(g => prod[g] > 0 && state.goodsSupply[g] > 0);
      const bonus = producedGoods[0] || undefined;
      get().executeCraftsman(bonus);
      return;
    }

    if (currentPhase === 'trader_action') {
      const good = PuertoRicoAI.chooseGoodToTrade(state, aiPlayer);
      get().executeTrader(good);
      return;
    }

    if (currentPhase === 'captain_action') {
      const action = PuertoRicoAI.chooseShippingAction(state, aiPlayer);
      if (action) {
        get().executeCaptain(action.shipIndex, action.goodType);
      } else {
        get().passCurrentAction();
      }
      return;
    }
  }
}));
