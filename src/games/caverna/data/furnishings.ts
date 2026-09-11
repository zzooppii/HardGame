import type { FurnishingTile } from '../types';

export const INITIAL_FURNISHINGS: FurnishingTile[] = [
  {
    id: 'furn_dwelling',
    name: '기본 거주방 (Dwelling)',
    nameEn: 'Simple Dwelling',
    category: 'dwelling',
    cost: { wood: 4, stone: 3 },
    vp: 3,
    dwellingCapacity: 1,
    description: '새로운 드워프 가족 1명을 맞이할 수 있는 주거 공간입니다.'
  },
  {
    id: 'furn_entry_dwelling',
    name: '입구 거주방 (Entry Dwelling)',
    nameEn: 'Entry Dwelling',
    category: 'dwelling',
    cost: { wood: 2, stone: 2 },
    vp: 2,
    dwellingCapacity: 1,
    description: '동굴 입구에 지은 아담한 방입니다.'
  },
  {
    id: 'furn_weaving_parlor',
    name: '직조실 (Weaving Parlor)',
    nameEn: 'Weaving Parlor',
    category: 'score',
    cost: { wood: 2, stone: 1 },
    vp: 4,
    description: '보유한 양 1마리당 추가 1점을 획득합니다.'
  },
  {
    id: 'furn_milking_parlor',
    name: '착유실 (Milking Parlor)',
    nameEn: 'Milking Parlor',
    category: 'production',
    cost: { wood: 2, stone: 2 },
    vp: 3,
    description: '소 1마리 이상 보유 시 매 라운드 식량 2를 자동 생산합니다.'
  },
  {
    id: 'furn_blacksmith_workshop',
    name: '단조 공방 (Smithy)',
    nameEn: 'Blacksmith Workshop',
    category: 'craft',
    cost: { wood: 1, stone: 2, ore: 2 },
    vp: 4,
    immediateBonus: { ore: 2 },
    description: '건설 즉시 광석 2개를 얻으며, 무기 단조 비용이 1 줄어듭니다.'
  },
  {
    id: 'furn_brewery',
    name: '맥주 양조장 (Brewery)',
    nameEn: 'Beer Brewery',
    category: 'production',
    cost: { wood: 2, stone: 1 },
    vp: 3,
    description: '곡물 1개를 식량 3으로 언제든 양조할 수 있습니다.'
  },
  {
    id: 'furn_miner_cabin',
    name: '광부의 오두막 (Miner Cabin)',
    nameEn: 'Miner Cabin',
    category: 'score',
    cost: { wood: 2, stone: 2 },
    vp: 5,
    description: '보유한 광석 2개당 1점을 추가로 받습니다.'
  },
  {
    id: 'furn_treasury',
    name: '보물 창고 (Treasury)',
    nameEn: 'Treasury Room',
    category: 'score',
    cost: { stone: 3, ruby: 1 },
    vp: 6,
    description: '보유한 루비 1개당 추가 2점을 획득합니다.'
  },
  {
    id: 'furn_guest_room',
    name: '손님방 (Guest Room)',
    nameEn: 'Guest Room',
    category: 'dwelling',
    cost: { wood: 3, stone: 2 },
    vp: 3,
    dwellingCapacity: 1,
    description: '방문객이나 용병 드워프를 묵게 할 수 있는 쾌적한 방입니다.'
  },
  {
    id: 'furn_pantry',
    name: '식량 저장고 (Pantry)',
    nameEn: 'Food Pantry',
    category: 'production',
    cost: { wood: 2, stone: 1 },
    vp: 2,
    immediateBonus: { food: 4 },
    description: '건설 즉시 비상 식량 4를 창고에 채웁니다.'
  },
  {
    id: 'furn_carpenter',
    name: '목공소 (Carpenter)',
    nameEn: 'Wood Workshop',
    category: 'craft',
    cost: { stone: 2 },
    vp: 3,
    immediateBonus: { wood: 3 },
    description: '건설 즉시 목재 3개를 지원받습니다.'
  },
  {
    id: 'furn_stone_carver',
    name: '석공소 (Stone Carver)',
    nameEn: 'Stone Carver',
    category: 'craft',
    cost: { wood: 2 },
    vp: 3,
    immediateBonus: { stone: 2 },
    description: '건설 즉시 돌 2개를 지원받습니다.'
  }
];
