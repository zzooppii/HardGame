import type { Achievement } from '../types';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  // 1. 공통 플랫폼 업적
  {
    id: 'first_step',
    title: '전략가의 첫 걸음',
    description: '어떤 명작이든 첫 번째 게임을 완주했습니다.',
    category: 'common',
    icon: '🎲',
    conditionDesc: '첫 게임 1회 완주',
    unlockedAt: null
  },
  {
    id: 'first_victory',
    title: '영광의 첫 승리',
    description: '어떤 게임이든 첫 번째 1위 승리를 거두었습니다.',
    category: 'common',
    icon: '👑',
    conditionDesc: '첫 1위 승리 달성',
    unlockedAt: null
  },
  {
    id: 'euro_master',
    title: '유로 마스터피스 대가',
    description: '6대 명작(푸에르토리코, 버건디, 르아브르, 카베르나, 아르낙, 테라포밍 마스)을 모두 최소 1회 이상 플레이했습니다.',
    category: 'common',
    icon: '🏛️',
    conditionDesc: '6대 명작 각 1회 이상 플레이',
    unlockedAt: null
  },
  {
    id: 'triple_crown',
    title: '트리플 크라운',
    description: '통산 3회 이상 승리를 달성했습니다.',
    category: 'common',
    icon: '🎖️',
    conditionDesc: '통산 3승 달성',
    unlockedAt: null
  },
  {
    id: 'perfectionist',
    title: '백전백승 전략가',
    description: '최소 3게임 이상 플레이하며 승률 60% 이상을 유지 중입니다.',
    category: 'common',
    icon: '🌟',
    conditionDesc: '3판 이상 플레이 및 승률 60% 이상 달성',
    unlockedAt: null
  },

  // 2. 푸에르토리코 업적
  {
    id: 'pr_winner',
    title: '신대륙의 총독',
    description: '푸에르토리코에서 1위를 차지하며 승리했습니다.',
    category: 'puerto-rico',
    icon: '⛵',
    conditionDesc: '푸에르토리코 1위 달성',
    unlockedAt: null
  },
  {
    id: 'pr_high_score',
    title: '산후안의 대번영',
    description: '푸에르토리코에서 최종 점수 50점 이상을 획득했습니다.',
    category: 'puerto-rico',
    icon: '🪙',
    conditionDesc: '푸에르토리코 50점 이상 기록',
    unlockedAt: null
  },

  // 3. 버건디의 성 업적
  {
    id: 'burgundy_winner',
    title: '부르고뉴의 지배자',
    description: '버건디의 성에서 가장 높은 점수로 영지를 완성하여 승리했습니다.',
    category: 'burgundy',
    icon: '🏰',
    conditionDesc: '버건디의 성 1위 달성',
    unlockedAt: null
  },
  {
    id: 'burgundy_high_score',
    title: '찬란한 영지',
    description: '버건디의 성에서 200점 이상의 대기록을 달성했습니다.',
    category: 'burgundy',
    icon: '💎',
    conditionDesc: '버건디의 성 200점 이상 기록',
    unlockedAt: null
  },

  // 4. 르아브르 업적
  {
    id: 'le_havre_winner',
    title: '노르망디 항구의 거물',
    description: '르아브르에서 해운과 물류 제국을 건설하여 승리했습니다.',
    category: 'le-havre',
    icon: '🚢',
    conditionDesc: '르아브르 1위 달성',
    unlockedAt: null
  },
  {
    id: 'le_havre_wealthy',
    title: '해운 백만장자',
    description: '르아브르에서 최종 자산(프랑+건물+선박) 100프랑 이상을 달성했습니다.',
    category: 'le-havre',
    icon: '💰',
    conditionDesc: '르아브르 100점(프랑) 이상 기록',
    unlockedAt: null
  },

  // 5. 카베르나 업적
  {
    id: 'caverna_winner',
    title: '전설의 드워프 일족',
    description: '카베르나에서 가장 번영한 동굴과 농장을 일구어 승리했습니다.',
    category: 'caverna',
    icon: '⛏️',
    conditionDesc: '카베르나 1위 달성',
    unlockedAt: null
  },
  {
    id: 'caverna_high_score',
    title: '황금빛 산맥',
    description: '카베르나에서 70점 이상의 고득점을 기록했습니다.',
    category: 'caverna',
    icon: '⛰️',
    conditionDesc: '카베르나 70점 이상 기록',
    unlockedAt: null
  },

  // 6. 아르낙의 잊혀진 유적 업적
  {
    id: 'arnak_winner',
    title: '고대 문명의 정복자',
    description: '아르낙에서 신비로운 유적을 탐사하고 수호자를 극복하여 승리했습니다.',
    category: 'arnak',
    icon: '🗿',
    conditionDesc: '아르낙 1위 달성',
    unlockedAt: null
  },
  {
    id: 'arnak_high_score',
    title: '비밀의 사원 지킴이',
    description: '아르낙에서 60점 이상의 탐사 점수를 기록했습니다.',
    category: 'arnak',
    icon: '🧭',
    conditionDesc: '아르낙 60점 이상 기록',
    unlockedAt: null
  },

  // 7. 테라포밍 마스 업적
  {
    id: 'tm_winner',
    title: '화성의 최고경영자',
    description: '테라포밍 마스에서 최고의 테라포밍 기여도로 승리했습니다.',
    category: 'terraforming-mars',
    icon: '🪐',
    conditionDesc: '테라포밍 마스 1위 달성',
    unlockedAt: null
  },
  {
    id: 'tm_high_score',
    title: '붉은 행성의 신화',
    description: '테라포밍 마스에서 70점 이상의 TR 및 승점을 달성했습니다.',
    category: 'terraforming-mars',
    icon: '🚀',
    conditionDesc: '테라포밍 마스 70점 이상 기록',
    unlockedAt: null
  },
  {
    id: 'green_mars',
    title: '푸른 행성의 기적',
    description: '화성 표면에 녹지와 대양을 적극적으로 조성하며 완주했습니다.',
    category: 'terraforming-mars',
    icon: '🌱',
    conditionDesc: '테라포밍 마스 게임 완주',
    unlockedAt: null
  },

  // 8. 세븐 원더스 듀얼 업적
  {
    id: 'duel_winner',
    title: '고대 문명의 패자',
    description: '세븐 원더스 듀얼에서 라이벌 문명을 꺾고 승리했습니다.',
    category: 'seven-wonders-duel',
    icon: '👑',
    conditionDesc: '세븐 원더스 듀얼 1위 승리 달성',
    unlockedAt: null
  },
  {
    id: 'duel_military',
    title: '군사적 패권 장악',
    description: '군사 분쟁 트랙을 끝까지 전진시켜 상대 수도를 함락하고 즉시 승리했습니다.',
    category: 'seven-wonders-duel',
    icon: '⚔️',
    conditionDesc: '군사적 압도 승리 달성',
    unlockedAt: null
  },
  {
    id: 'duel_scientific',
    title: '과학적 우위 달성',
    description: '서로 다른 6가지 과학 발전 기호를 완성하여 지식으로 즉시 승리했습니다.',
    category: 'seven-wonders-duel',
    icon: '🔬',
    conditionDesc: '과학적 패권 승리 달성',
    unlockedAt: null
  },
  {
    id: 'duel_pantheon_master',
    title: '신들의 총애',
    description: '판테온 확장판에서 신들의 은총을 힘입어 승리를 쟁취했습니다.',
    category: 'seven-wonders-duel',
    icon: '⚡',
    conditionDesc: '판테온 확장판에서 1위 승리 달성',
    unlockedAt: null
  }
];
