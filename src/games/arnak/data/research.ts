import type { ResearchStep } from '../types';

export const RESEARCH_TRACK: ResearchStep[] = [
  {
    step: 0,
    name: '연구 베이스캠프 (Base Camp)',
    glassCost: {},
    bookCost: {},
    glassPoints: 0,
    bookPoints: 0,
    bonusDesc: '연구 준비 완료'
  },
  {
    step: 1,
    name: '고대 비문 해석 (Inscriptions)',
    glassCost: { compasses: 1, coins: 1 },
    bookCost: { coins: 1 },
    glassPoints: 3,
    bookPoints: 2,
    bonusDesc: '돋보기: 석판 1개 / 수첩: 코인 1개 획득',
    rewardResource: { tablets: 1 }
  },
  {
    step: 2,
    name: '지하 납골당 조사 (Crypts)',
    glassCost: { tablets: 1, compasses: 1 },
    bookCost: { tablets: 1 },
    glassPoints: 7,
    bookPoints: 5,
    bonusDesc: '돋보기: 화살촉 1개 / 수첩: 나침반 1개 획득',
    rewardResource: { arrowheads: 1 }
  },
  {
    step: 3,
    name: '별빛 성좌 관측소 (Observatory)',
    glassCost: { arrowheads: 1, tablets: 1 },
    bookCost: { arrowheads: 1 },
    glassPoints: 12,
    bookPoints: 9,
    bonusDesc: '돋보기: 보석 1개 / 수첩: 석판 2개 획득',
    rewardResource: { rubies: 1 }
  },
  {
    step: 4,
    name: '비밀의 성소 회랑 (Sanctuary Hall)',
    glassCost: { rubies: 1, arrowheads: 1 },
    bookCost: { rubies: 1 },
    glassPoints: 18,
    bookPoints: 14,
    bonusDesc: '돋보기: 보석 1개 + 화살촉 1개 / 수첩: 원하는 자원 2개',
    rewardResource: { rubies: 1, arrowheads: 1 }
  },
  {
    step: 5,
    name: '잃어버린 사원 최상층 (Lost Temple)',
    glassCost: { rubies: 1, arrowheads: 2, tablets: 2 },
    bookCost: { rubies: 1, arrowheads: 1, tablets: 2 },
    glassPoints: 25,
    bookPoints: 20,
    bonusDesc: '고대 사원의 정점에 도달! 최고 승점 사원 타일 획득',
    rewardResource: { rubies: 2 }
  }
];

export const TEMPLE_BONUS_TILES = [11, 8, 6, 4, 2]; // 사원 도달 시 선착순 보너스 승점 타일
