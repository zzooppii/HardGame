import type { 
  PlayerTM, 
  ProjectCard, 
  HexSlot, 
  HexTileType
} from '../types';

/**
 * 카드 사용 조건 검증
 */
export const canPlayCard = (
  player: PlayerTM,
  card: ProjectCard,
  globalState: { temperature: number; oxygen: number; oceansPlaced: number }
): { canPlay: boolean; reason?: string } => {
  // 1. 글로벌 파라미터 요구 조건
  if (card.requirements) {
    const { minTemperature, maxTemperature, minOxygen, maxOxygen, minOceans, maxOceans } = card.requirements;
    if (minTemperature !== undefined && globalState.temperature < minTemperature) {
      return { canPlay: false, reason: `온도가 ${minTemperature}°C 이상이어야 합니다 (현재: ${globalState.temperature}°C)` };
    }
    if (maxTemperature !== undefined && globalState.temperature > maxTemperature) {
      return { canPlay: false, reason: `온도가 ${maxTemperature}°C 이하여야 합니다 (현재: ${globalState.temperature}°C)` };
    }
    if (minOxygen !== undefined && globalState.oxygen < minOxygen) {
      return { canPlay: false, reason: `산소 농도가 ${minOxygen}% 이상이어야 합니다 (현재: ${globalState.oxygen}%)` };
    }
    if (maxOxygen !== undefined && globalState.oxygen > maxOxygen) {
      return { canPlay: false, reason: `산소 농도가 ${maxOxygen}% 이하여야 합니다 (현재: ${globalState.oxygen}%)` };
    }
    if (minOceans !== undefined && globalState.oceansPlaced < minOceans) {
      return { canPlay: false, reason: `해양 타일이 ${minOceans}개 이상이어야 합니다 (현재: ${globalState.oceansPlaced}개)` };
    }
    if (maxOceans !== undefined && globalState.oceansPlaced > maxOceans) {
      return { canPlay: false, reason: `해양 타일이 ${maxOceans}개 이하여야 합니다 (현재: ${globalState.oceansPlaced}개)` };
    }
  }

  // 2. 비용 계산 (강철: 건물 태그당 2M€, 티타늄: 우주 태그당 3M€, 헬리온 기업: 열을 M€로 사용)
  let maxPayingPower = player.resources.megacredits;
  if (player.corporation.id === 'corp_helion') {
    maxPayingPower += player.resources.heat;
  }
  if (card.tags.includes('building')) {
    maxPayingPower += player.resources.steel * 2;
  }
  if (card.tags.includes('space')) {
    maxPayingPower += player.resources.titanium * 3;
  }

  if (maxPayingPower < card.cost) {
    return { canPlay: false, reason: `비용이 부족합니다 (필요: ${card.cost} M€)` };
  }

  return { canPlay: true };
};

/**
 * 인접 헥스 타일 탐색 (axial coordinates: (1,0), (1,-1), (0,-1), (-1,0), (-1,1), (0,1))
 */
export const getAdjacentSlots = (slot: HexSlot, allSlots: HexSlot[]): HexSlot[] => {
  const directions = [
    { q: 1, r: 0 },
    { q: 1, r: -1 },
    { q: 0, r: -1 },
    { q: -1, r: 0 },
    { q: -1, r: 1 },
    { q: 0, r: 1 }
  ];

  return directions
    .map(dir => allSlots.find(s => s.q === slot.q + dir.q && s.r === slot.r + dir.r))
    .filter((s): s is HexSlot => s !== undefined);
};

/**
 * 화성 표면 타일 배치
 */
export const placeMapTile = (
  slotId: string,
  tileType: HexTileType,
  playerId: string,
  mapSlots: HexSlot[]
): { updatedSlots: HexSlot[]; placedSlot: HexSlot | null } => {
  const targetSlot = mapSlots.find(s => s.id === slotId);
  if (!targetSlot || targetSlot.tileType !== 'empty') {
    return { updatedSlots: mapSlots, placedSlot: null };
  }

  const updatedSlots = mapSlots.map(s => {
    if (s.id === slotId) {
      return {
        ...s,
        tileType,
        ownerPlayerId: playerId
      };
    }
    return s;
  });

  return { updatedSlots, placedSlot: targetSlot };
};

/**
 * 생산 단계 처리 (Production Phase)
 */
export const processProductionPhase = (
  players: PlayerTM[]
): { updatedPlayers: PlayerTM[]; logs: string[] } => {
  const phaseLogs: string[] = [];

  const updatedPlayers = players.map(player => {
    const res = { ...player.resources };
    const prod = player.production;

    // 1. 남은 에너지는 열(Heat) 창고로 자동 전환
    res.heat += res.energy;
    res.energy = 0;

    // 2. 생산량만큼 각 자원 수령
    // 메가크레딧 = TR + 메가크레딧 생산량
    const mcGain = Math.max(0, player.tr + prod.megacredits);
    res.megacredits += mcGain;
    res.steel += prod.steel;
    res.titanium += prod.titanium;
    res.plants += prod.plants;
    res.energy += prod.energy;
    res.heat += prod.heat;

    phaseLogs.push(`🏭 ${player.name}: M€ +${mcGain}(TR ${player.tr} + 생산 ${prod.megacredits}), 강철 +${prod.steel}, 식물 +${prod.plants}, 에너지 +${prod.energy}, 열 +${prod.heat} 생산`);

    return {
      ...player,
      resources: res,
      hasPassedThisGen: false
    };
  });

  return { updatedPlayers, logs: phaseLogs };
};

/**
 * 최종 점수 산출
 */
export const calculateTotalScore = (
  player: PlayerTM,
  mapSlots: HexSlot[]
): {
  trScore: number;
  greeneryScore: number;
  cityScore: number;
  cardScore: number;
  totalScore: number;
} => {
  // 1. TR 기본 점수
  const trScore = player.tr;

  // 2. 녹지 타일 점수 (보유한 녹지 1개당 1점)
  const myGreeneries = mapSlots.filter(s => s.ownerPlayerId === player.id && s.tileType === 'greenery');
  const greeneryScore = myGreeneries.length;

  // 3. 도시 타일 점수 (보유한 도시 인접 6칸에 있는 모든 녹지 타일 1개당 1점)
  const myCities = mapSlots.filter(s => s.ownerPlayerId === player.id && s.tileType === 'city');
  let cityScore = 0;
  myCities.forEach(citySlot => {
    const adj = getAdjacentSlots(citySlot, mapSlots);
    const adjacentGreeneries = adj.filter(s => s.tileType === 'greenery');
    cityScore += adjacentGreeneries.length;
  });

  // 4. 플레이한 카드 점수
  const cardScore = player.playedCards.reduce((acc, c) => acc + (c.victoryPoints || 0), 0);

  const totalScore = trScore + greeneryScore + cityScore + cardScore;

  return {
    trScore,
    greeneryScore,
    cityScore,
    cardScore,
    totalScore
  };
};
