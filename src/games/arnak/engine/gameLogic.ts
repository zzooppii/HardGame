import type { 
  PlayerArnak, 
  ArnakCard, 
  DigSite, 
  ArnakGuardian, 
  ArnakResource
} from '../types';
import { RESEARCH_TRACK } from '../data/research';
import { FEAR_CARD } from '../data/cards';

/**
 * 덱 셔플 (Fisher-Yates)
 */
export const shuffleCards = (cards: ArnakCard[]): ArnakCard[] => {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * 핸드 드로우 (부족 시 버린 덱 리셔플)
 */
export const drawHand = (
  deck: ArnakCard[],
  discard: ArnakCard[],
  count: number = 5
): { newDeck: ArnakCard[]; newDiscard: ArnakCard[]; drawn: ArnakCard[] } => {
  let curDeck = [...deck];
  let curDiscard = [...discard];
  const drawn: ArnakCard[] = [];

  for (let i = 0; i < count; i++) {
    if (curDeck.length === 0) {
      if (curDiscard.length === 0) break;
      curDeck = shuffleCards(curDiscard);
      curDiscard = [];
    }
    const card = curDeck.pop();
    if (card) drawn.push(card);
  }

  return { newDeck: curDeck, newDiscard: curDiscard, drawn };
};

/**
 * 연구 트랙 전진 가능 여부 검사
 */
export const canAdvanceResearch = (
  player: PlayerArnak,
  tokenType: 'glass' | 'book'
): { canAdvance: boolean; reason?: string; cost?: Partial<Record<ArnakResource, number>> } => {
  const currentStep = tokenType === 'glass' ? player.glassStep : player.bookStep;
  if (currentStep >= 5) {
    return { canAdvance: false, reason: '이미 사원 최상층에 도달했습니다.' };
  }

  const nextStepIndex = currentStep + 1;
  const targetStep = RESEARCH_TRACK[nextStepIndex];

  // 수첩은 돋보기보다 앞설 수 없음 (동일 위치까지만 가능)
  if (tokenType === 'book' && nextStepIndex > player.glassStep) {
    return { canAdvance: false, reason: '연구 수첩은 돋보기가 탐사한 위치를 넘어설 수 없습니다. 먼저 돋보기를 전진시키세요.' };
  }

  const cost = tokenType === 'glass' ? targetStep.glassCost : targetStep.bookCost;

  for (const [res, required] of Object.entries(cost)) {
    if ((player.resources[res as ArnakResource] || 0) < (required || 0)) {
      return { canAdvance: false, reason: `자원이 부족합니다 (${res} 필요)` };
    }
  }

  return { canAdvance: true, cost };
};

/**
 * 수호자 제압 가능 여부
 */
export const canDefeatGuardian = (
  player: PlayerArnak,
  guardian: ArnakGuardian
): boolean => {
  for (const [res, required] of Object.entries(guardian.defeatCost)) {
    if ((player.resources[res as ArnakResource] || 0) < (required || 0)) {
      return false;
    }
  }
  return true;
};

/**
 * 최종 점수 산출
 */
export const calculateTotalScore = (player: PlayerArnak): {
  researchPoints: number;
  templePoints: number;
  guardianPoints: number;
  cardPoints: number;
  fearPenalty: number;
  totalScore: number;
} => {
  // 1. 연구 트랙 점수
  const glassVp = RESEARCH_TRACK[player.glassStep]?.glassPoints || 0;
  const bookVp = RESEARCH_TRACK[player.bookStep]?.bookPoints || 0;
  const researchPoints = glassVp + bookVp;

  // 2. 사원 타일 점수
  const templePoints = player.templeTilesClaimed.reduce((acc, vp) => acc + vp, 0);

  // 3. 제압한 수호자 점수 (체당 5점)
  const guardianPoints = player.defeatedGuardians.length * 5;

  // 4. 모든 소유 카드 점수
  const allCards = [...player.deck, ...player.hand, ...player.playArea, ...player.discard];
  const cardPoints = allCards.reduce((acc, c) => acc + (c.type !== 'fear' ? c.victoryPoints : 0), 0);

  // 5. 공포 카드 감점 (1장당 -1점)
  const totalFearCount = player.fearCardsCount + allCards.filter(c => c.type === 'fear').length;
  const fearPenalty = totalFearCount * 1;

  const totalScore = researchPoints + templePoints + guardianPoints + cardPoints - fearPenalty;

  return {
    researchPoints,
    templePoints,
    guardianPoints,
    cardPoints,
    fearPenalty,
    totalScore
  };
};

/**
 * 라운드 종료 처리
 */
export const processRoundEnd = (
  players: PlayerArnak[],
  sites: DigSite[]
): { updatedPlayers: PlayerArnak[]; updatedSites: DigSite[]; logs: string[] } => {
  const roundLogs: string[] = [];

  // 1. 미제압 수호자 패널티 (공포 카드 획득) 및 일꾼 귀가
  const updatedPlayers = players.map(p => {
    let fearGain = 0;
    p.archaeologists.forEach(arc => {
      if (arc.placedSiteId) {
        const site = sites.find(s => s.id === arc.placedSiteId);
        if (site && site.guardian && !site.guardian.isDefeated) {
          fearGain++;
          roundLogs.push(`😱 [공포] ${p.name}의 고고학자가 ${site.name}에서 수호자 ${site.guardian.name}의 습격을 받아 공포 카드 1장을 얻었습니다!`);
        }
      }
    });

    // 사용한 카드 및 남은 핸드 카드를 버린 카드 더미로 이동
    const combinedDiscard = [...p.discard, ...p.playArea, ...p.hand];

    // 공포 카드 추가
    for (let f = 0; f < fearGain; f++) {
      combinedDiscard.push({ ...FEAR_CARD, id: `fear_penalty_${Date.now()}_${f}` });
    }

    // 새로운 5장 드로우
    const { newDeck, newDiscard, drawn } = drawHand(p.deck, combinedDiscard, 5);

    // 고고학자 귀가
    const resetArchaeologists = p.archaeologists.map(arc => ({
      ...arc,
      isPlaced: false,
      placedSiteId: null
    }));

    return {
      ...p,
      archaeologists: resetArchaeologists,
      deck: newDeck,
      discard: newDiscard,
      hand: drawn,
      playArea: [],
      fearCardsCount: p.fearCardsCount + fearGain,
      hasPassedTurnThisRound: false
    };
  });

  // 2. 발굴지 일꾼 점유 해제
  const updatedSites = sites.map(s => ({
    ...s,
    occupiedByPlayerId: null
  }));

  roundLogs.push('⛺ [라운드 종료] 모든 고고학자가 베이스캠프로 복귀하고 새로운 핸드 카드를 준비했습니다.');

  return {
    updatedPlayers,
    updatedSites,
    logs: roundLogs
  };
};
