import type { ProgressToken } from '../types';

export const PROGRESS_TOKENS_DATA: ProgressToken[] = [
  {
    id: 'pt_agriculture',
    name: '농업',
    nameEn: 'Agriculture',
    description: '즉시 6 코인을 얻고, 게임 종료 시 4 승점을 획득합니다.',
    effects: { coins: 6, victoryPoints: 4 }
  },
  {
    id: 'pt_architecture',
    name: '건축',
    nameEn: 'Architecture',
    description: '향후 건설하는 모든 불가사의의 자원 요구량이 2개 감소합니다.',
    effects: { victoryPoints: 0 }
  },
  {
    id: 'pt_economy',
    name: '경제',
    nameEn: 'Economy',
    description: '상대방이 무역으로 자원을 구매할 때 지불하는 주화를 내가 모두 획득합니다.',
    effects: { victoryPoints: 0 }
  },
  {
    id: 'pt_law',
    name: '법률',
    nameEn: 'Law',
    description: '이 토큰은 제7의 과학 기호(저울 ⚖️)로 취급되어 과학 승리에 결정적인 도움을 줍니다.',
    effects: { extraScienceLaw: true }
  },
  {
    id: 'pt_masonry',
    name: '조적술',
    nameEn: 'Masonry',
    description: '향후 건설하는 모든 파란색(민간) 건물의 파란색 요구 자원이 2개 감소합니다.',
    effects: { victoryPoints: 0 }
  },
  {
    id: 'pt_mathematics',
    name: '수학',
    nameEn: 'Mathematics',
    description: '게임 종료 시 내가 보유한 진보 토큰 1개당 3 승점을 획득합니다.',
    effects: { victoryPoints: 3 }
  },
  {
    id: 'pt_philosophy',
    name: '철학',
    nameEn: 'Philosophy',
    description: '게임 종료 시 순수 승점 7점을 획득합니다.',
    effects: { victoryPoints: 7 }
  },
  {
    id: 'pt_strategy',
    name: '전략',
    nameEn: 'Strategy',
    description: '향후 군사 건물을 건설할 때마다 방패 기호를 추가로 1개 더 획득합니다.',
    effects: { militaryShields: 1 }
  },
  {
    id: 'pt_theology',
    name: '신학',
    nameEn: 'Theology',
    description: '향후 건설하는 모든 불가사의에 [추가 턴] 능력이 부여됩니다.',
    effects: { replayWonder: true }
  },
  {
    id: 'pt_urbanism',
    name: '도시 계획',
    nameEn: 'Urbanism',
    description: '연계 기호(체인)로 건물을 무료 건설할 때마다 즉시 4 코인을 획득합니다.',
    effects: { freeChainCoins: 4 }
  }
];
