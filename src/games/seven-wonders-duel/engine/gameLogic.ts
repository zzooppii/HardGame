import type { 
  PlayerDuel, 
  DuelCard, 
  WonderCard, 
  DuelResource, 
  DuelCardColor 
} from '../types';

/**
 * 플레이어가 생산하는 자원 수량 계산 (갈색, 회색, 노란색, 완성된 불가사의)
 */
export const getPlayerResourceProduction = (player: PlayerDuel): Record<DuelResource, number> => {
  const prod: Record<DuelResource, number> = {
    wood: 0,
    clay: 0,
    stone: 0,
    glass: 0,
    papyrus: 0
  };

  // 1. 건설된 카드들로부터 자원 합산
  for (const card of player.cards) {
    if (card.effects.resources) {
      for (const [res, amt] of Object.entries(card.effects.resources)) {
        if (amt) prod[res as DuelResource] += amt;
      }
    }
  }

  // 2. 건설된 불가사의로부터 자원 합산
  for (const wonder of player.constructedWonders) {
    if (wonder.effects.providesResources) {
      for (const [res, amt] of Object.entries(wonder.effects.providesResources)) {
        if (amt) prod[res as DuelResource] += amt;
      }
    }
  }

  return prod;
};

/**
 * 특정 카드를 건설하기 위해 필요한 총 코인 비용 및 무역 비용 계산
 */
export const calculateCardCost = (
  player: PlayerDuel,
  card: DuelCard,
  opponent: PlayerDuel
): { canAfford: boolean; totalCoinCost: number; isFreeByChain: boolean } => {
  // 1. 연계 기호 무료 검사
  if (card.chainSymbol) {
    const hasChain = player.cards.some(c => c.providesChainSymbol === card.chainSymbol);
    if (hasChain) {
      return { canAfford: true, totalCoinCost: 0, isFreeByChain: true };
    }
  }

  let requiredCoins = card.cost.coins || 0;

  // 2. 자원 요구량 검사 및 부족분 무역 구매 계산
  const myProd = getPlayerResourceProduction(player);
  const oppProd = getPlayerResourceProduction(opponent);

  const resourceTypes: DuelResource[] = ['wood', 'clay', 'stone', 'glass', 'papyrus'];
  for (const res of resourceTypes) {
    const directAmt = (card.cost as any)[res] || 0;
    const objAmt = card.cost.resources ? (card.cost.resources[res] || 0) : 0;
    const neededAmt = directAmt + objAmt;

    if (neededAmt > 0) {
      const deficit = Math.max(0, neededAmt - (myProd[res] || 0));
      if (deficit > 0) {
        const unitCost = player.tradeDiscounts[res] 
          ? player.tradeDiscounts[res]! 
          : (2 + (oppProd[res] || 0));
        requiredCoins += deficit * unitCost;
      }
    }
  }

  return {
    canAfford: player.coins >= requiredCoins,
    totalCoinCost: requiredCoins,
    isFreeByChain: false
  };
};

/**
 * 불가사의 건설 비용 계산
 */
export const calculateWonderCost = (
  player: PlayerDuel,
  wonder: WonderCard,
  opponent: PlayerDuel
): { canAfford: boolean; totalCoinCost: number } => {
  const myProd = getPlayerResourceProduction(player);
  const oppProd = getPlayerResourceProduction(opponent);
  let requiredCoins = 0;

  for (const [resKey, neededAmt] of Object.entries(wonder.cost)) {
    if (!neededAmt) continue;
    const res = resKey as DuelResource;
    const deficit = Math.max(0, neededAmt - (myProd[res] || 0));

    if (deficit > 0) {
      const unitCost = player.tradeDiscounts[res] 
        ? player.tradeDiscounts[res]! 
        : (2 + (oppProd[res] || 0));
      requiredCoins += deficit * unitCost;
    }
  }

  return {
    canAfford: player.coins >= requiredCoins,
    totalCoinCost: requiredCoins
  };
};

/**
 * 카드 버리기를 통해 획득하는 코인 계산: 기본 2원 + 보유한 노란색(상업) 카드 수
 */
export const calculateDiscardGain = (player: PlayerDuel): number => {
  const yellowCardsCount = player.cards.filter(c => c.color === 'yellow').length;
  return 2 + yellowCardsCount;
};

/**
 * 군사 및 과학 즉시 승리 여부 검사
 */
export const checkImmediateVictory = (
  militaryPosition: number,
  player0: PlayerDuel,
  player1: PlayerDuel
): { isImmediate: boolean; victoryReason: 'military' | 'science' | null; winnerId: string | null } => {
  // 1. 군사적 우세: 트랙이 +9에 도달하면 플레이어 0 승리, -9에 도달하면 플레이어 1 승리
  if (militaryPosition >= 9) {
    return { isImmediate: true, victoryReason: 'military', winnerId: player0.id };
  }
  if (militaryPosition <= -9) {
    return { isImmediate: true, victoryReason: 'military', winnerId: player1.id };
  }

  // 2. 과학적 우세: 서로 다른 과학 기호 6종 이상 수집
  const p0UniqueScience = new Set(player0.scienceSymbols).size;
  if (p0UniqueScience >= 6) {
    return { isImmediate: true, victoryReason: 'science', winnerId: player0.id };
  }

  const p1UniqueScience = new Set(player1.scienceSymbols).size;
  if (p1UniqueScience >= 6) {
    return { isImmediate: true, victoryReason: 'science', winnerId: player1.id };
  }

  return { isImmediate: false, victoryReason: null, winnerId: null };
};

/**
 * 3시대 종료 후 최종 민간 승점 종합 정산
 */
export const calculateCivilianScore = (
  player: PlayerDuel,
  opponent: PlayerDuel,
  isPlayer0: boolean,
  militaryPosition: number
): {
  blueCards: number;
  greenCards: number;
  yellowCards: number;
  wonders: number;
  progressTokens: number;
  militaryPoints: number;
  treasuryPoints: number;
  guildPoints: number;
  total: number;
} => {
  // 1. 파란색 건물 점수
  const blueCards = player.cards
    .filter(c => c.color === 'blue')
    .reduce((sum, c) => sum + (c.effects.victoryPoints || 0), 0);

  // 2. 초록색 건물 점수
  const greenCards = player.cards
    .filter(c => c.color === 'green')
    .reduce((sum, c) => sum + (c.effects.victoryPoints || 0), 0);

  // 3. 노란색 건물 점수
  const yellowCards = player.cards
    .filter(c => c.color === 'yellow')
    .reduce((sum, c) => sum + (c.effects.victoryPoints || 0), 0);

  // 4. 완성된 불가사의 점수
  const wonders = player.constructedWonders
    .reduce((sum, w) => sum + w.effects.victoryPoints, 0);

  // 5. 진보 토큰 점수
  let progressTokens = player.progressTokens
    .reduce((sum, pt) => sum + (pt.effects.victoryPoints || 0), 0);
  if (player.progressTokens.some(pt => pt.id === 'pt_mathematics')) {
    progressTokens += player.progressTokens.length * 3;
  }

  // 6. 군사 트랙 우위 점수 (내 쪽으로 밀려있는 구간에 따라 0, 2, 5, 10점)
  const myMilitaryAdvantage = isPlayer0 ? militaryPosition : -militaryPosition;
  let militaryPoints = 0;
  if (myMilitaryAdvantage >= 6) militaryPoints = 10;
  else if (myMilitaryAdvantage >= 3) militaryPoints = 5;
  else if (myMilitaryAdvantage >= 1) militaryPoints = 2;

  // 7. 보유 주화 (3코인당 1점)
  const treasuryPoints = Math.floor(player.coins / 3);

  // 8. 길드 카드 점수
  let guildPoints = 0;
  for (const card of player.cards) {
    if (card.color === 'purple' && card.effects.guildType) {
      const type = card.effects.guildType;
      const countP = (color: DuelCardColor) => player.cards.filter(c => c.color === color).length;
      const countOpp = (color: DuelCardColor) => opponent.cards.filter(c => c.color === color).length;

      if (type === 'yellow_cards') {
        guildPoints += Math.max(countP('yellow'), countOpp('yellow'));
      } else if (type === 'blue_cards') {
        guildPoints += Math.max(countP('blue'), countOpp('blue'));
      } else if (type === 'green_cards') {
        guildPoints += Math.max(countP('green'), countOpp('green'));
      } else if (type === 'red_cards') {
        guildPoints += Math.max(countP('red'), countOpp('red'));
      } else if (type === 'brown_gray_cards') {
        const bgP = countP('brown') + countP('gray');
        const bgOpp = countOpp('brown') + countOpp('gray');
        guildPoints += Math.max(bgP, bgOpp);
      }
    }
  }

  const total = blueCards + greenCards + yellowCards + wonders + progressTokens + militaryPoints + treasuryPoints + guildPoints;

  return {
    blueCards,
    greenCards,
    yellowCards,
    wonders,
    progressTokens,
    militaryPoints,
    treasuryPoints,
    guildPoints,
    total
  };
};
