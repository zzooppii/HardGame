import type { GoodDefinition, ResourceType } from '../types';

export const GOODS_DEFINITIONS: Record<ResourceType, GoodDefinition> = {
  // --- [원자재 8종] ---
  fish: {
    id: 'fish',
    name: '어획',
    isProcessed: false,
    counterpartId: 'smoked_fish',
    foodValue: 1,
    fuelValue: 0,
    sellValue: 1,
    icon: '🐟',
    color: '#38bdf8'
  },
  wood: {
    id: 'wood',
    name: '목재',
    isProcessed: false,
    counterpartId: 'charcoal',
    foodValue: 0,
    fuelValue: 1,
    sellValue: 1,
    icon: '🪵',
    color: '#a16207'
  },
  clay: {
    id: 'clay',
    name: '점토',
    isProcessed: false,
    counterpartId: 'brick',
    foodValue: 0,
    fuelValue: 0,
    sellValue: 1,
    icon: '🧱',
    color: '#ea580c'
  },
  iron: {
    id: 'iron',
    name: '철',
    isProcessed: false,
    counterpartId: 'steel',
    foodValue: 0,
    fuelValue: 0,
    sellValue: 2,
    icon: '⛓️',
    color: '#94a3b8'
  },
  grain: {
    id: 'grain',
    name: '곡물',
    isProcessed: false,
    counterpartId: 'bread',
    foodValue: 0, // 곡물 자체는 밥으로 못 먹고 빵으로 가공해야 함 (또는 가축 사료)
    fuelValue: 0,
    sellValue: 1,
    icon: '🌾',
    color: '#eab308'
  },
  cattle: {
    id: 'cattle',
    name: '가축',
    isProcessed: false,
    counterpartId: 'meat',
    foodValue: 0, // 살아있는 가축은 도축해야 고기(3음식)가 됨
    fuelValue: 0,
    sellValue: 3,
    icon: '🐄',
    color: '#ef4444'
  },
  hide: {
    id: 'hide',
    name: '원피',
    isProcessed: false,
    counterpartId: 'leather',
    foodValue: 0,
    fuelValue: 0,
    sellValue: 2,
    icon: '🦬',
    color: '#d97706'
  },
  coal: {
    id: 'coal',
    name: '석탄',
    isProcessed: false,
    counterpartId: 'coke',
    foodValue: 0,
    fuelValue: 3, // 석탄 1개는 3에너지
    sellValue: 3,
    icon: '🪨',
    color: '#334155'
  },

  // --- [가공품 8종] ---
  smoked_fish: {
    id: 'smoked_fish',
    name: '훈제 어획',
    isProcessed: true,
    counterpartId: 'fish',
    foodValue: 2, // 2음식
    fuelValue: 0,
    sellValue: 2,
    icon: '🍥',
    color: '#0284c7'
  },
  charcoal: {
    id: 'charcoal',
    name: '숯',
    isProcessed: true,
    counterpartId: 'wood',
    foodValue: 0,
    fuelValue: 3, // 3에너지 (목재의 3배)
    sellValue: 2,
    icon: '🔥',
    color: '#ca8a04'
  },
  brick: {
    id: 'brick',
    name: '벽돌',
    isProcessed: true,
    counterpartId: 'clay',
    foodValue: 0,
    fuelValue: 0,
    sellValue: 2,
    icon: '🧱',
    color: '#c2410c'
  },
  steel: {
    id: 'steel',
    name: '강철',
    isProcessed: true,
    counterpartId: 'iron',
    foodValue: 0,
    fuelValue: 0,
    sellValue: 8, // 고부가가치 강철
    icon: '⚙️',
    color: '#cbd5e1'
  },
  bread: {
    id: 'bread',
    name: '빵',
    isProcessed: true,
    counterpartId: 'grain',
    foodValue: 2, // 2음식
    fuelValue: 0,
    sellValue: 2,
    icon: '🍞',
    color: '#facc15'
  },
  meat: {
    id: 'meat',
    name: '고기',
    isProcessed: true,
    counterpartId: 'cattle',
    foodValue: 3, // 3음식 (최고급 식량)
    fuelValue: 0,
    sellValue: 3,
    icon: '🥩',
    color: '#dc2626'
  },
  leather: {
    id: 'leather',
    name: '가죽',
    isProcessed: true,
    counterpartId: 'hide',
    foodValue: 0,
    fuelValue: 0,
    sellValue: 4,
    icon: '👞',
    color: '#b45309'
  },
  coke: {
    id: 'coke',
    name: '코크스',
    isProcessed: true,
    counterpartId: 'coal',
    foodValue: 0,
    fuelValue: 5, // 5에너지 (최고 효율 연료)
    sellValue: 5,
    icon: '⚡',
    color: '#1e293b'
  }
};
