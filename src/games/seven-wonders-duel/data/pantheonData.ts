import type { PantheonGodCard, DuelCard } from '../types';

export const PANTHEON_GODS_DATA: PantheonGodCard[] = [
  // 1. 그리스 신화 (Greek)
  {
    id: 'god_zeus',
    mythology: 'greek',
    name: '제우스',
    nameEn: 'Zeus',
    description: '피라미드에 있는 카드 1장을 즉시 파괴하여 버립니다 (아래층 카드가 열릴 수 있음).',
    effects: { stealCard: true },
    costInCoins: 4
  },
  {
    id: 'god_aphrodite',
    mythology: 'greek',
    name: '아프로디테',
    nameEn: 'Aphrodite',
    description: '게임 종료 시 순수 승점 9점을 획득합니다.',
    effects: { victoryPoints: 9 },
    costInCoins: 3
  },
  {
    id: 'god_hades',
    mythology: 'greek',
    name: '하데스',
    nameEn: 'Hades',
    description: '버려진 카드 더미에서 원하는 카드 1장을 무료로 가져와 내 도시에 건설합니다.',
    effects: { takeProgressToken: true },
    costInCoins: 4
  },

  // 2. 로마 신화 (Roman - 군사 중심)
  {
    id: 'god_mars',
    mythology: 'roman',
    name: '마르스',
    nameEn: 'Mars',
    description: '군사 분쟁 트랙의 말을 즉시 2칸 전진시킵니다.',
    effects: { militaryShields: 2 },
    costInCoins: 4
  },
  {
    id: 'god_minerva',
    mythology: 'roman',
    name: '미네르바',
    nameEn: 'Minerva',
    description: '상대방이 군사 분쟁 말을 내 수도 쪽으로 전진시키지 못하도록 막는 수호 폰을 배치합니다.',
    effects: { victoryPoints: 3 },
    costInCoins: 3
  },
  {
    id: 'god_neptune',
    mythology: 'roman',
    name: '넵투누스',
    nameEn: 'Neptune',
    description: '군사 트랙의 군사 약탈 토큰 1개를 즉시 획득하여 발동합니다.',
    effects: { militaryShields: 1 },
    costInCoins: 3
  },

  // 3. 이집트 신화 (Egyptian - 불가사의 중심)
  {
    id: 'god_ra',
    mythology: 'egyptian',
    name: '라',
    nameEn: 'Ra',
    description: '내 미완성 불가사의 1개를 자원 소모 없이 즉시 무료로 건설합니다.',
    effects: { freeWonder: true },
    costInCoins: 5
  },
  {
    id: 'god_isis',
    mythology: 'egyptian',
    name: '이시스',
    nameEn: 'Isis',
    description: '버려진 카드 더미에서 카드 1장을 가져와 내 불가사의 건설용 카드로 사용합니다.',
    effects: { freeWonder: true },
    costInCoins: 4
  },
  {
    id: 'god_anubis',
    mythology: 'egyptian',
    name: '아누비스',
    nameEn: 'Anubis',
    description: '상대방이 이미 건설한 불가사의 1개를 파괴하여 비활성화시킵니다.',
    effects: { victoryPoints: 3 },
    costInCoins: 6
  },

  // 4. 메소포타미아 신화 (Mesopotamian - 과학 중심)
  {
    id: 'god_ishtar',
    mythology: 'mesopotamian',
    name: '이슈타르',
    nameEn: 'Ishtar',
    description: '원하는 과학 기호 1개를 복제하거나, 진보 토큰 1개를 즉시 획득합니다.',
    effects: { takeProgressToken: true },
    costInCoins: 5
  },
  {
    id: 'god_enki',
    mythology: 'mesopotamian',
    name: '엔키',
    nameEn: 'Enki',
    description: '미공개 진보 토큰 2개 중 1개를 선택하여 즉시 내 도시로 가져옵니다.',
    effects: { takeProgressToken: true },
    costInCoins: 4
  },
  {
    id: 'god_nisaba',
    mythology: 'mesopotamian',
    name: '니사바',
    nameEn: 'Nisaba',
    description: '상대방이 보유한 과학 기호 1개를 복사하여 내 도시에 과학 기호로 등록합니다.',
    effects: { victoryPoints: 2 },
    costInCoins: 4
  },

  // 5. 페니키아 신화 (Phoenician - 상업 및 자금 중심)
  {
    id: 'god_baal',
    mythology: 'phoenician',
    name: '바알',
    nameEn: 'Baal',
    description: '상대방이 가진 원자재(갈색) 또는 공예품(회색) 카드 1장을 빼앗아 내 도시로 가져옵니다.',
    effects: { stealCard: true },
    costInCoins: 5
  },
  {
    id: 'god_tanit',
    mythology: 'phoenician',
    name: '타니트',
    nameEn: 'Tanit',
    description: '은행에서 즉시 12 코인을 획득합니다.',
    effects: { coins: 12 },
    costInCoins: 3
  },
  {
    id: 'god_astarte',
    mythology: 'phoenician',
    name: '아스타르테',
    nameEn: 'Astarte',
    description: '즉시 7 코인을 은행에서 가져와 이 신 카드 위에 올립니다. 게임 종료 시 이 돈은 승점이 됩니다.',
    effects: { coins: 7, victoryPoints: 7 },
    costInCoins: 4
  }
];

// 판테온 확장 신전 카드 (Grand Temples - 3시대 길드 카드 대체)
export const PANTHEON_TEMPLE_CARDS: DuelCard[] = [
  {
    id: 'temple_greek',
    name: '그리스 신전',
    nameEn: 'Greek Temple',
    age: 3,
    color: 'temple',
    cost: { coins: 0 },
    effects: { victoryPoints: 5 },
    description: '신전 건설 시 신화 토큰에 따라 최대 10 승점을 획득합니다.'
  },
  {
    id: 'temple_roman',
    name: '로마 신전',
    nameEn: 'Roman Temple',
    age: 3,
    color: 'temple',
    cost: { coins: 0 },
    effects: { victoryPoints: 5 },
    description: '신전 건설 시 신화 토큰에 따라 최대 10 승점을 획득합니다.'
  },
  {
    id: 'temple_egyptian',
    name: '이집트 신전',
    nameEn: 'Egyptian Temple',
    age: 3,
    color: 'temple',
    cost: { coins: 0 },
    effects: { victoryPoints: 5 },
    description: '신전 건설 시 신화 토큰에 따라 최대 10 승점을 획득합니다.'
  }
];
