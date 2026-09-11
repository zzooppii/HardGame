import type { CavernaResource, LivestockType } from '../types';

export interface ExpeditionLoot {
  id: string;
  minLevel: number;
  name: string;
  description: string;
  grantResource?: Partial<Record<CavernaResource, number>>;
  grantLivestock?: Partial<Record<LivestockType, number>>;
  specialAction?: 'free_stable' | 'free_field' | 'free_cavern';
}

export const EXPEDITION_LOOT_TABLE: ExpeditionLoot[] = [
  {
    id: 'loot_wood',
    minLevel: 1,
    name: '목재 보급 (Wood)',
    description: '목재 1개를 획득합니다.',
    grantResource: { wood: 1 }
  },
  {
    id: 'loot_food',
    minLevel: 1,
    name: '비상 식량 (Food)',
    description: '식량 2를 획득합니다.',
    grantResource: { food: 2 }
  },
  {
    id: 'loot_grain',
    minLevel: 2,
    name: '곡물 종자 (Grain)',
    description: '곡물 1개를 획득합니다.',
    grantResource: { grain: 1 }
  },
  {
    id: 'loot_stone',
    minLevel: 2,
    name: '단단한 돌 (Stone)',
    description: '돌 1개를 획득합니다.',
    grantResource: { stone: 1 }
  },
  {
    id: 'loot_sheep',
    minLevel: 3,
    name: '새끼 양 (Sheep)',
    description: '양 1마리를 포획해 옵니다.',
    grantLivestock: { sheep: 1 }
  },
  {
    id: 'loot_pumpkin',
    minLevel: 3,
    name: '호박 수확물 (Pumpkin)',
    description: '호박 1개를 획득합니다.',
    grantResource: { pumpkin: 1 }
  },
  {
    id: 'loot_ore',
    minLevel: 4,
    name: '고순도 광석 2개 (Ore)',
    description: '광석 2개를 채굴해 옵니다.',
    grantResource: { ore: 2 }
  },
  {
    id: 'loot_boar',
    minLevel: 4,
    name: '야생 멧돼지 (Boar)',
    description: '멧돼지 1마리를 길들입니다.',
    grantLivestock: { boar: 1 }
  },
  {
    id: 'loot_stable',
    minLevel: 5,
    name: '야전 외양간 (Free Stable)',
    description: '목초지에 외양간 1개를 무료로 짓습니다.',
    specialAction: 'free_stable'
  },
  {
    id: 'loot_donkey',
    minLevel: 6,
    name: '짐꾼 당나귀 (Donkey)',
    description: '당나귀 1마리를 획득합니다.',
    grantLivestock: { donkey: 1 }
  },
  {
    id: 'loot_field',
    minLevel: 6,
    name: '토지 개간 (Free Field)',
    description: '숲 1칸을 무료로 밭으로 개간합니다.',
    specialAction: 'free_field'
  },
  {
    id: 'loot_cattle',
    minLevel: 7,
    name: '건장한 황소 (Cattle)',
    description: '소 1마리를 축사에 들입니다.',
    grantLivestock: { cattle: 1 }
  },
  {
    id: 'loot_ruby',
    minLevel: 7,
    name: '빛나는 루비 (Ruby)',
    description: '조커 자원 루비 1개를 획득합니다.',
    grantResource: { ruby: 1 }
  },
  {
    id: 'loot_cavern',
    minLevel: 8,
    name: '발굴 지원 (Free Cavern)',
    description: '단단한 암석 2칸을 즉시 뚫어 빈 동굴로 개척합니다.',
    specialAction: 'free_cavern'
  }
];
