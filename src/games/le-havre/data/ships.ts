import type { ShipCard } from '../types';

export const INITIAL_SHIPS: ShipCard[] = [
  {
    id: 'ship-wood-1',
    name: '목조 수송선 A',
    type: 'wood',
    buildCost: { wood: 5 },
    costEnergy: 3,
    buyCostFranc: 14,
    value: 14,
    foodProvided: 5,
    ownerId: null
  },
  {
    id: 'ship-wood-2',
    name: '목조 수송선 B',
    type: 'wood',
    buildCost: { wood: 5 },
    costEnergy: 3,
    buyCostFranc: 14,
    value: 14,
    foodProvided: 5,
    ownerId: null
  },
  {
    id: 'ship-iron-1',
    name: '철갑 증기선 A',
    type: 'iron',
    buildCost: { iron: 4 },
    costEnergy: 3,
    buyCostFranc: 20,
    value: 20,
    foodProvided: 7,
    ownerId: null
  },
  {
    id: 'ship-iron-2',
    name: '철갑 증기선 B',
    type: 'iron',
    buildCost: { iron: 4 },
    costEnergy: 3,
    buyCostFranc: 20,
    value: 20,
    foodProvided: 7,
    ownerId: null
  },
  {
    id: 'ship-steel-1',
    name: '대양 강철선',
    type: 'steel',
    buildCost: { steel: 2 },
    costEnergy: 3,
    buyCostFranc: 26,
    value: 26,
    foodProvided: 10,
    ownerId: null
  },
  {
    id: 'ship-luxury',
    name: '타이타닉 호화 여객선',
    type: 'luxury',
    buildCost: { steel: 3 },
    costEnergy: 3,
    buyCostFranc: 34,
    value: 38,
    foodProvided: 0,
    ownerId: null
  }
];
