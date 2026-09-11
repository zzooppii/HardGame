import type { DuelCard } from '../types';

export const DUEL_CARDS_DATA: DuelCard[] = [
  // ================= 1시대 (Age I - 23종 중 20장 사용) =================
  {
    id: 'c1_lumber_yard',
    name: '벌목장',
    nameEn: 'Lumber Yard',
    age: 1,
    color: 'brown',
    cost: {},
    effects: { resources: { wood: 1 } },
    description: '목재 1개를 생산합니다.'
  },
  {
    id: 'c1_logging_camp',
    name: '벌채 캠프',
    nameEn: 'Logging Camp',
    age: 1,
    color: 'brown',
    cost: { coins: 1 },
    effects: { resources: { wood: 1 } },
    description: '목재 1개를 생산합니다.'
  },
  {
    id: 'c1_clay_pool',
    name: '점토 채취장',
    nameEn: 'Clay Pool',
    age: 1,
    color: 'brown',
    cost: {},
    effects: { resources: { clay: 1 } },
    description: '점토 1개를 생산합니다.'
  },
  {
    id: 'c1_clay_pit',
    name: '점토 구덩이',
    nameEn: 'Clay Pit',
    age: 1,
    color: 'brown',
    cost: { coins: 1 },
    effects: { resources: { clay: 1 } },
    description: '점토 1개를 생산합니다.'
  },
  {
    id: 'c1_quarry',
    name: '채석장',
    nameEn: 'Quarry',
    age: 1,
    color: 'brown',
    cost: {},
    effects: { resources: { stone: 1 } },
    description: '석재 1개를 생산합니다.'
  },
  {
    id: 'c1_stone_pit',
    name: '채석 구덩이',
    nameEn: 'Stone Pit',
    age: 1,
    color: 'brown',
    cost: { coins: 1 },
    effects: { resources: { stone: 1 } },
    description: '석재 1개를 생산합니다.'
  },
  {
    id: 'c1_glassworks',
    name: '유리 공방',
    nameEn: 'Glassworks',
    age: 1,
    color: 'gray',
    cost: { coins: 1 },
    effects: { resources: { glass: 1 } },
    description: '유리 1개를 생산합니다.'
  },
  {
    id: 'c1_press',
    name: '인쇄소',
    nameEn: 'Press',
    age: 1,
    color: 'gray',
    cost: { coins: 1 },
    effects: { resources: { papyrus: 1 } },
    description: '파피루스 1개를 생산합니다.'
  },
  {
    id: 'c1_guard_tower',
    name: '감시탑',
    nameEn: 'Guard Tower',
    age: 1,
    color: 'red',
    cost: {},
    effects: { militaryShields: 1 },
    description: '방패 1개를 제공합니다.'
  },
  {
    id: 'c1_workshop',
    name: '공작소',
    nameEn: 'Workshop',
    age: 1,
    color: 'green',
    cost: { papyrus: 1 },
    effects: { scienceSymbol: 'compass', victoryPoints: 1 },
    description: '나침반 🧭 기호 및 1 승점을 제공합니다.'
  },
  {
    id: 'c1_apothecary',
    name: '약국',
    nameEn: 'Apothecary',
    age: 1,
    color: 'green',
    cost: { glass: 1 },
    effects: { scienceSymbol: 'wheel', victoryPoints: 1 },
    description: '바퀴 ⚙️ 기호 및 1 승점을 제공합니다.'
  },
  {
    id: 'c1_scriptorium',
    name: '서사소',
    nameEn: 'Scriptorium',
    age: 1,
    color: 'green',
    cost: { coins: 2 },
    effects: { scienceSymbol: 'tablet' },
    description: '서판 📜 기호를 제공합니다.'
  },
  {
    id: 'c1_pharmacist',
    name: '조제실',
    nameEn: 'Pharmacist',
    age: 1,
    color: 'green',
    cost: { coins: 2 },
    effects: { scienceSymbol: 'mortar' },
    description: '막자사발 🧪 기호를 제공합니다.'
  },
  {
    id: 'c1_theater',
    name: '극장',
    nameEn: 'Theater',
    age: 1,
    color: 'blue',
    cost: {},
    providesChainSymbol: 'mask',
    effects: { victoryPoints: 3 },
    description: '3 승점을 제공하며, 가면 연계를 제공합니다.'
  },
  {
    id: 'c1_altar',
    name: '제단',
    nameEn: 'Altar',
    age: 1,
    color: 'blue',
    cost: {},
    providesChainSymbol: 'moon',
    effects: { victoryPoints: 3 },
    description: '3 승점을 제공하며, 달 연계를 제공합니다.'
  },
  {
    id: 'c1_baths',
    name: '목욕탕',
    nameEn: 'Baths',
    age: 1,
    color: 'blue',
    cost: { stone: 1 },
    providesChainSymbol: 'raindrop',
    effects: { victoryPoints: 3 },
    description: '3 승점을 제공하며, 빗방울 연계를 제공합니다.'
  },
  {
    id: 'c1_tavern',
    name: '선술집',
    nameEn: 'Tavern',
    age: 1,
    color: 'yellow',
    cost: {},
    providesChainSymbol: 'pot',
    effects: { coins: 4 },
    description: '즉시 4 코인을 획득합니다.'
  },
  {
    id: 'c1_stone_reserve',
    name: '석재 비축기지',
    nameEn: 'Stone Reserve',
    age: 1,
    color: 'yellow',
    cost: { coins: 3 },
    effects: { tradeDiscount: { stone: 1 } },
    description: '석재 무역 구매 비용이 1원으로 고정됩니다.'
  },
  {
    id: 'c1_clay_reserve',
    name: '점토 비축기지',
    nameEn: 'Clay Reserve',
    age: 1,
    color: 'yellow',
    cost: { coins: 3 },
    effects: { tradeDiscount: { clay: 1 } },
    description: '점토 무역 구매 비용이 1원으로 고정됩니다.'
  },
  {
    id: 'c1_wood_reserve',
    name: '목재 비축기지',
    nameEn: 'Wood Reserve',
    age: 1,
    color: 'yellow',
    cost: { coins: 3 },
    effects: { tradeDiscount: { wood: 1 } },
    description: '목재 무역 구매 비용이 1원으로 고정됩니다.'
  },

  // ================= 2시대 (Age II - 23종 중 20장 사용) =================
  {
    id: 'c2_sawmill',
    name: '제재소',
    nameEn: 'Sawmill',
    age: 2,
    color: 'brown',
    cost: { coins: 2 },
    effects: { resources: { wood: 2 } },
    description: '목재 2개를 생산합니다.'
  },
  {
    id: 'c2_brickyard',
    name: '벽돌 가마',
    nameEn: 'Brickyard',
    age: 2,
    color: 'brown',
    cost: { coins: 2 },
    effects: { resources: { clay: 2 } },
    description: '점토 2개를 생산합니다.'
  },
  {
    id: 'c2_shelf_quarry',
    name: '대형 채석장',
    nameEn: 'Shelf Quarry',
    age: 2,
    color: 'brown',
    cost: { coins: 2 },
    effects: { resources: { stone: 2 } },
    description: '석재 2개를 생산합니다.'
  },
  {
    id: 'c2_drying_room',
    name: '건조실',
    nameEn: 'Drying Room',
    age: 2,
    color: 'gray',
    cost: {},
    effects: { resources: { papyrus: 1 } },
    description: '파피루스 1개를 생산합니다.'
  },
  {
    id: 'c2_glassblower',
    name: '유리 세공소',
    nameEn: 'Glassblower',
    age: 2,
    color: 'gray',
    cost: {},
    effects: { resources: { glass: 1 } },
    description: '유리 1개를 생산합니다.'
  },
  {
    id: 'c2_walls',
    name: '성벽',
    nameEn: 'Walls',
    age: 2,
    color: 'red',
    cost: { stone: 2 },
    providesChainSymbol: 'sword',
    effects: { militaryShields: 2 },
    description: '방패 2개를 제공합니다.'
  },
  {
    id: 'c2_barracks',
    name: '병영',
    nameEn: 'Barracks',
    age: 2,
    color: 'red',
    cost: { coins: 3 },
    effects: { militaryShields: 1 },
    description: '방패 1개를 제공합니다.'
  },
  {
    id: 'c2_horse_breeders',
    name: '마구간',
    nameEn: 'Horse Breeders',
    age: 2,
    color: 'red',
    cost: { clay: 1, wood: 1 },
    providesChainSymbol: 'horseshoe',
    effects: { militaryShields: 1 },
    description: '방패 1개를 제공합니다.'
  },
  {
    id: 'c2_tribunal',
    name: '법정',
    nameEn: 'Tribunal',
    age: 2,
    color: 'blue',
    cost: { wood: 2, glass: 1 },
    effects: { victoryPoints: 5 },
    description: '5 승점을 제공합니다.'
  },
  {
    id: 'c2_statue',
    name: '동상',
    nameEn: 'Statue',
    age: 2,
    color: 'blue',
    cost: { clay: 2 },
    chainSymbol: 'mask',
    providesChainSymbol: 'pillar',
    effects: { victoryPoints: 4 },
    description: '4 승점을 제공하며, 극장(가면)에서 연계 무료 건설 가능.'
  },
  {
    id: 'c2_aqueduct',
    name: '수로',
    nameEn: 'Aqueduct',
    age: 2,
    color: 'blue',
    cost: { stone: 3 },
    chainSymbol: 'raindrop',
    effects: { victoryPoints: 5 },
    description: '5 승점을 제공하며, 목욕탕(빗방울)에서 연계 무료 건설 가능.'
  },
  {
    id: 'c2_rostrum',
    name: '연단',
    nameEn: 'Rostrum',
    age: 2,
    color: 'blue',
    cost: { stone: 1, wood: 1 },
    effects: { victoryPoints: 4 },
    description: '4 승점을 제공합니다.'
  },
  {
    id: 'c2_library',
    name: '도서관',
    nameEn: 'Library',
    age: 2,
    color: 'green',
    cost: { stone: 1, wood: 1, glass: 1 },
    chainSymbol: 'book',
    effects: { scienceSymbol: 'quill', victoryPoints: 2 },
    description: '깃펜 ✒️ 기호 및 2 승점을 제공합니다.'
  },
  {
    id: 'c2_laboratory',
    name: '실험실',
    nameEn: 'Laboratory',
    age: 2,
    color: 'green',
    cost: { clay: 1, wood: 1, papyrus: 1 },
    effects: { scienceSymbol: 'gear', victoryPoints: 1 },
    description: '톱니 🔧 기호 및 1 승점을 제공합니다.'
  },
  {
    id: 'c2_school',
    name: '학교',
    nameEn: 'School',
    age: 2,
    color: 'green',
    cost: { wood: 1, papyrus: 2 },
    providesChainSymbol: 'harp',
    effects: { scienceSymbol: 'wheel', victoryPoints: 1 },
    description: '바퀴 ⚙️ 기호 및 1 승점을 제공합니다.'
  },
  {
    id: 'c2_brewery',
    name: '양조장',
    nameEn: 'Brewery',
    age: 2,
    color: 'yellow',
    cost: {},
    effects: { coins: 6 },
    description: '즉시 6 코인을 획득합니다.'
  },
  {
    id: 'c2_customs_house',
    name: '세관',
    nameEn: 'Customs House',
    age: 2,
    color: 'yellow',
    cost: { coins: 4 },
    effects: { tradeDiscount: { glass: 1, papyrus: 1 } },
    description: '유리와 파피루스 무역 비용이 1원으로 고정됩니다.'
  },
  {
    id: 'c2_caravanserai',
    name: '캐러밴 여관',
    nameEn: 'Caravanserai',
    age: 2,
    color: 'yellow',
    cost: { coins: 2, glass: 1, papyrus: 1 },
    effects: { resources: { wood: 1, clay: 1, stone: 1 } },
    description: '목재/점토/석재 중 매 턴 1개를 선택 생산합니다.'
  },

  // ================= 3시대 (Age III - 20장) =================
  {
    id: 'c3_arsenal',
    name: '무기고',
    nameEn: 'Arsenal',
    age: 3,
    color: 'red',
    cost: { clay: 3, wood: 2 },
    effects: { militaryShields: 3 },
    description: '방패 3개를 제공합니다.'
  },
  {
    id: 'c3_courthouse',
    name: '재판소',
    nameEn: 'Courthouse',
    age: 3,
    color: 'red',
    cost: { clay: 2, stone: 1, glass: 1 },
    effects: { militaryShields: 3 },
    description: '방패 3개를 제공합니다.'
  },
  {
    id: 'c3_academy',
    name: '학술원',
    nameEn: 'Academy',
    age: 3,
    color: 'green',
    cost: { stone: 1, wood: 1, glass: 2 },
    effects: { scienceSymbol: 'compass', victoryPoints: 3 },
    description: '나침반 🧭 기호 및 3 승점을 제공합니다.'
  },
  {
    id: 'c3_study',
    name: '서재',
    nameEn: 'Study',
    age: 3,
    color: 'green',
    cost: { wood: 2, papyrus: 1, glass: 1 },
    effects: { scienceSymbol: 'tablet', victoryPoints: 3 },
    description: '서판 📜 기호 및 3 승점을 제공합니다.'
  },
  {
    id: 'c3_university',
    name: '대학교',
    nameEn: 'University',
    age: 3,
    color: 'green',
    cost: { clay: 1, glass: 1, papyrus: 1 },
    chainSymbol: 'harp',
    effects: { scienceSymbol: 'mortar', victoryPoints: 2 },
    description: '막자사발 🧪 기호 및 2 승점을 제공합니다.'
  },
  {
    id: 'c3_observatory',
    name: '천문대',
    nameEn: 'Observatory',
    age: 3,
    color: 'green',
    cost: { stone: 1, papyrus: 2 },
    effects: { scienceSymbol: 'gear', victoryPoints: 2 },
    description: '톱니 🔧 기호 및 2 승점을 제공합니다.'
  },
  {
    id: 'c3_gardens',
    name: '정원',
    nameEn: 'Gardens',
    age: 3,
    color: 'blue',
    cost: { clay: 2, wood: 2 },
    chainSymbol: 'pillar',
    effects: { victoryPoints: 6 },
    description: '6 승점을 제공하며, 동상에서 연계 무료 건설 가능.'
  },
  {
    id: 'c3_pantheon',
    name: '판테온',
    nameEn: 'Pantheon',
    age: 3,
    color: 'blue',
    cost: { clay: 1, wood: 1, papyrus: 2 },
    chainSymbol: 'moon',
    effects: { victoryPoints: 6 },
    description: '6 승점을 제공하며, 제단에서 연계 무료 건설 가능.'
  },
  {
    id: 'c3_senate',
    name: '원로원',
    nameEn: 'Senate',
    age: 3,
    color: 'blue',
    cost: { clay: 2, stone: 1, papyrus: 1 },
    effects: { victoryPoints: 5 },
    description: '5 승점을 제공합니다.'
  },
  {
    id: 'c3_palace',
    name: '궁전',
    nameEn: 'Palace',
    age: 3,
    color: 'blue',
    cost: { clay: 1, wood: 1, stone: 1, glass: 2 },
    effects: { victoryPoints: 7 },
    description: '7 승점을 제공합니다.'
  },
  {
    id: 'c3_arena',
    name: '투기장',
    nameEn: 'Arena',
    age: 3,
    color: 'yellow',
    cost: { clay: 1, stone: 1, wood: 1 },
    effects: { victoryPoints: 3, coins: 6 },
    description: '즉시 6 코인을 얻고 3 승점을 제공합니다.'
  },

  // 3시대 특수 길드 카드 (Guilds)
  {
    id: 'c3_guild_merchants',
    name: '상인 길드',
    nameEn: 'Merchants Guild',
    age: 3,
    color: 'purple',
    cost: { clay: 1, wood: 1, glass: 1, papyrus: 1 },
    effects: { guildType: 'yellow_cards' },
    description: '도시 중 노란색 카드가 가장 많은 플레이어의 노란색 카드 1장당 1코인 및 1승점을 획득합니다.'
  },
  {
    id: 'c3_guild_shipowners',
    name: '선주 길드',
    nameEn: 'Shipowners Guild',
    age: 3,
    color: 'purple',
    cost: { clay: 1, stone: 1, glass: 1, papyrus: 1 },
    effects: { guildType: 'brown_gray_cards' },
    description: '갈색과 회색 카드가 가장 많은 플레이어의 카드 1장당 1코인 및 1승점을 획득합니다.'
  },
  {
    id: 'c3_guild_magistrates',
    name: '치안관 길드',
    nameEn: 'Magistrates Guild',
    age: 3,
    color: 'purple',
    cost: { wood: 2, clay: 1, papyrus: 1 },
    effects: { guildType: 'blue_cards' },
    description: '파란색 카드가 가장 많은 플레이어의 파란색 카드 1장당 1코인 및 1승점을 획득합니다.'
  },
  {
    id: 'c3_guild_scientists',
    name: '과학자 길드',
    nameEn: 'Scientists Guild',
    age: 3,
    color: 'purple',
    cost: { clay: 2, wood: 2 },
    effects: { guildType: 'green_cards' },
    description: '초록색 카드가 가장 많은 플레이어의 초록색 카드 1장당 1코인 및 1승점을 획득합니다.'
  },
  {
    id: 'c3_guild_tacticians',
    name: '전술가 길드',
    nameEn: 'Tacticians Guild',
    age: 3,
    color: 'purple',
    cost: { stone: 2, clay: 1, papyrus: 1 },
    effects: { guildType: 'red_cards' },
    description: '빨간색 카드가 가장 많은 플레이어의 빨간색 카드 1장당 1코인 및 1승점을 획득합니다.'
  }
];
