import type { DigSite, ArnakGuardian } from '../types';

export const INITIAL_GUARDIANS: ArnakGuardian[] = [
  {
    id: 'guard_serpent',
    name: '거대 비늘 뱀 (Giant Serpent)',
    nameEn: 'Giant Serpent',
    defeatCost: { arrowheads: 1, rubies: 1 },
    victoryPoints: 5,
    boonDescription: '석판 2개 또는 나침반 2개 즉시 지급',
    isDefeated: false,
    icon: '🐍'
  },
  {
    id: 'guard_golem',
    name: '화강암 골렘 (Granite Golem)',
    nameEn: 'Granite Golem',
    defeatCost: { arrowheads: 2, coins: 1 },
    victoryPoints: 5,
    boonDescription: '보석 1개 즉시 발굴',
    isDefeated: false,
    icon: '🗿'
  },
  {
    id: 'guard_bird',
    name: '천둥새 (Thunderbird)',
    nameEn: 'Thunderbird',
    defeatCost: { arrowheads: 1, compasses: 2 },
    victoryPoints: 5,
    boonDescription: '비행기 무료 이동 토큰 획득',
    isDefeated: false,
    icon: '🦅'
  },
  {
    id: 'guard_panther',
    name: '그림자 흑표범 (Shadow Panther)',
    nameEn: 'Shadow Panther',
    defeatCost: { rubies: 1, coins: 2 },
    victoryPoints: 5,
    boonDescription: '화살촉 1개 + 나침반 1개 획득',
    isDefeated: false,
    icon: '🐆'
  },
  {
    id: 'guard_crocodile',
    name: '늪지 악어 괴수 (Swamp Croc)',
    nameEn: 'Swamp Croc',
    defeatCost: { tablets: 2, arrowheads: 1 },
    victoryPoints: 5,
    boonDescription: '석판 1개 + 코인 2개 획득',
    isDefeated: false,
    icon: '🐊'
  },
  {
    id: 'guard_spider',
    name: '거대 거미 모신 (Giant Arachnid)',
    nameEn: 'Giant Arachnid',
    defeatCost: { rubies: 1, arrowheads: 1 },
    victoryPoints: 5,
    boonDescription: '연구 트랙 조사 비용 1회 무료',
    isDefeated: false,
    icon: '🕷️'
  }
];

export const INITIAL_DIG_SITES: DigSite[] = [
  // --- 레벨 0: 기본 베이스캠프 (항상 개방, 나침반 비용 0) ---
  {
    id: 'site_camp_water',
    name: '맑은 강가 (Water Stream)',
    level: 0,
    travelReq: ['boots'],
    compassCostToDiscover: 0,
    rewards: { coins: 1, compasses: 1 },
    isDiscovered: true,
    occupiedByPlayerId: null,
    siteSlotIcon: '🌊'
  },
  {
    id: 'site_camp_brush',
    name: '덤불 숲 (Dense Brush)',
    level: 0,
    travelReq: ['boots'],
    compassCostToDiscover: 0,
    rewards: { coins: 2 },
    isDiscovered: true,
    occupiedByPlayerId: null,
    siteSlotIcon: '🌿'
  },
  {
    id: 'site_camp_clay',
    name: '진흙 강둑 (Clay Bank)',
    level: 0,
    travelReq: ['boots'],
    compassCostToDiscover: 0,
    rewards: { tablets: 1 },
    isDiscovered: true,
    occupiedByPlayerId: null,
    siteSlotIcon: '🏺'
  },
  {
    id: 'site_camp_ruins_edge',
    name: '유적 외곽 (Ruins Outpost)',
    level: 0,
    travelReq: ['boots'],
    compassCostToDiscover: 0,
    rewards: { compasses: 1, drawCard: 1 },
    isDiscovered: true,
    occupiedByPlayerId: null,
    siteSlotIcon: '⛺'
  },
  {
    id: 'site_camp_rocks',
    name: '풍화된 바위 (Weathered Rocks)',
    level: 0,
    travelReq: ['boots'],
    compassCostToDiscover: 0,
    rewards: { arrowheads: 1 },
    isDiscovered: true,
    occupiedByPlayerId: null,
    siteSlotIcon: '🪨'
  },

  // --- 레벨 1: 정글 유적 발굴지 (나침반 3개 소모하여 탐험 발굴) ---
  {
    id: 'site_lvl1_waterfall',
    name: '신비의 폭포 동굴 (Waterfall Cavern)',
    level: 1,
    travelReq: ['boat'],
    compassCostToDiscover: 3,
    rewards: { tablets: 1, compasses: 1, rubies: 1 },
    isDiscovered: false,
    occupiedByPlayerId: null,
    siteSlotIcon: '🏞️'
  },
  {
    id: 'site_lvl1_altar',
    name: '고대 제단 (Ancient Altar)',
    level: 1,
    travelReq: ['car'],
    compassCostToDiscover: 3,
    rewards: { arrowheads: 1, tablets: 1, coins: 1 },
    isDiscovered: false,
    occupiedByPlayerId: null,
    siteSlotIcon: '🏛️'
  },
  {
    id: 'site_lvl1_sanctuary',
    name: '비취 성소 (Jade Sanctuary)',
    level: 1,
    travelReq: ['boat'],
    compassCostToDiscover: 3,
    rewards: { rubies: 1, arrowheads: 1 },
    isDiscovered: false,
    occupiedByPlayerId: null,
    siteSlotIcon: '⛩️'
  },
  {
    id: 'site_lvl1_graveyard',
    name: '석조 묘지 (Stone Necropolis)',
    level: 1,
    travelReq: ['car'],
    compassCostToDiscover: 3,
    rewards: { tablets: 2, coins: 1 },
    isDiscovered: false,
    occupiedByPlayerId: null,
    siteSlotIcon: '🪦'
  },

  // --- 레벨 2: 심층 고대 유적 (나침반 6개 소모, 막대한 보상과 강력한 수호자) ---
  {
    id: 'site_lvl2_pyramid',
    name: '황금빛 태양 피라미드 (Sun Pyramid)',
    level: 2,
    travelReq: ['plane'],
    compassCostToDiscover: 6,
    rewards: { rubies: 2, arrowheads: 1, tablets: 1 },
    isDiscovered: false,
    occupiedByPlayerId: null,
    siteSlotIcon: '🛕'
  },
  {
    id: 'site_lvl2_observatory',
    name: '별빛 천문대 (Celestial Observatory)',
    level: 2,
    travelReq: ['plane'],
    compassCostToDiscover: 6,
    rewards: { rubies: 1, arrowheads: 2, coins: 2 },
    isDiscovered: false,
    occupiedByPlayerId: null,
    siteSlotIcon: '🌌'
  }
];
