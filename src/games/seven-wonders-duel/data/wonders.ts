import type { WonderCard } from '../types';

export const DUEL_WONDERS_DATA: WonderCard[] = [
  {
    id: 'wonder_pyramids',
    name: '피라미드',
    nameEn: 'The Pyramids',
    cost: { stone: 3, papyrus: 1 },
    effects: { victoryPoints: 9 },
    isConstructed: false
  },
  {
    id: 'wonder_colossus',
    name: '콜로서스 거상',
    nameEn: 'The Colossus',
    cost: { clay: 3, glass: 1 },
    effects: { victoryPoints: 3, militaryShields: 2 },
    isConstructed: false
  },
  {
    id: 'wonder_zeus',
    name: '올림피아 제우스 신상',
    nameEn: 'Statue of Zeus',
    cost: { wood: 1, stone: 1, clay: 1, papyrus: 2 },
    effects: { victoryPoints: 3, militaryShields: 1, destroyBrownCard: true },
    isConstructed: false
  },
  {
    id: 'wonder_gardens',
    name: '바빌론 공중정원',
    nameEn: 'Hanging Gardens',
    cost: { wood: 2, glass: 1, papyrus: 1 },
    effects: { victoryPoints: 3, coins: 6, extraTurn: true },
    isConstructed: false
  },
  {
    id: 'wonder_alexandria',
    name: '알렉산드리아 대도서관',
    nameEn: 'The Great Library',
    cost: { wood: 3, glass: 1, papyrus: 1 },
    effects: { victoryPoints: 4, takeProgressToken: true },
    isConstructed: false
  },
  {
    id: 'wonder_artemis',
    name: '에페소스 아르테미스 신전',
    nameEn: 'Temple of Artemis',
    cost: { stone: 1, wood: 1, glass: 1, papyrus: 1 },
    effects: { victoryPoints: 0, coins: 12, extraTurn: true },
    isConstructed: false
  },
  {
    id: 'wonder_circus',
    name: '키르쿠스 막시무스',
    nameEn: 'Circus Maximus',
    cost: { stone: 2, wood: 1, glass: 1 },
    effects: { victoryPoints: 3, militaryShields: 1, destroyGrayCard: true },
    isConstructed: false
  },
  {
    id: 'wonder_mausoleum',
    name: '할리카르나소스 마우솔레움',
    nameEn: 'The Mausoleum',
    cost: { clay: 2, glass: 2, papyrus: 1 },
    effects: { victoryPoints: 2, takeDiscardedCard: true },
    isConstructed: false
  },
  {
    id: 'wonder_pharos',
    name: '알렉산드리아 대등대',
    nameEn: 'The Great Lighthouse',
    cost: { wood: 1, stone: 1, papyrus: 2 },
    effects: { victoryPoints: 4, providesResources: { wood: 1, clay: 1, stone: 1 } },
    isConstructed: false
  },
  {
    id: 'wonder_appian_way',
    name: '아피아 가도',
    nameEn: 'The Appian Way',
    cost: { stone: 2, clay: 2, papyrus: 1 },
    effects: { victoryPoints: 3, coins: 3, extraTurn: true },
    isConstructed: false
  },
  {
    id: 'wonder_sphinx',
    name: '대스핑크스',
    nameEn: 'The Great Sphinx',
    cost: { stone: 1, clay: 1, glass: 2 },
    effects: { victoryPoints: 6, extraTurn: true },
    isConstructed: false
  },
  {
    id: 'wonder_piraios',
    name: '피레우스 항구',
    nameEn: 'Piraeus',
    cost: { wood: 2, clay: 1, stone: 1 },
    effects: { victoryPoints: 2, extraTurn: true, providesResources: { glass: 1, papyrus: 1 } },
    isConstructed: false
  }
];
