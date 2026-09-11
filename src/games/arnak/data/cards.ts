import type { ArnakCard } from '../types';

export const FEAR_CARD: ArnakCard = {
  id: 'card_fear',
  name: '미지의 공포 (Fear)',
  nameEn: 'Fear',
  type: 'fear',
  travelIcon: 'boots',
  victoryPoints: -1,
  description: '미지의 정글에서 마주한 전율. 게임 종료 시 -1점 감점.',
  effect: {}
};

export const STARTER_CARDS: ArnakCard[] = [
  {
    id: 'start_funding_1',
    name: '연구 지원금 (Funding)',
    nameEn: 'Funding',
    type: 'starter',
    travelIcon: 'boots',
    victoryPoints: 0,
    description: '코인 1개를 획득합니다.',
    effect: { gainResources: { coins: 1 } }
  },
  {
    id: 'start_funding_2',
    name: '탐사 자금 (Funding)',
    nameEn: 'Funding',
    type: 'starter',
    travelIcon: 'boots',
    victoryPoints: 0,
    description: '코인 1개를 획득합니다.',
    effect: { gainResources: { coins: 1 } }
  },
  {
    id: 'start_compass_1',
    name: '항해 나침반 (Compass)',
    nameEn: 'Compass',
    type: 'starter',
    travelIcon: 'boat',
    victoryPoints: 0,
    description: '나침반 1개를 획득합니다.',
    effect: { gainResources: { compasses: 1 } }
  },
  {
    id: 'start_compass_2',
    name: '정글 길잡이 (Guide)',
    nameEn: 'Guide',
    type: 'starter',
    travelIcon: 'car',
    victoryPoints: 0,
    description: '나침반 1개를 획득합니다.',
    effect: { gainResources: { compasses: 1 } }
  },
  { ...FEAR_CARD, id: 'start_fear_1' },
  { ...FEAR_CARD, id: 'start_fear_2' }
];

export const INITIAL_ITEMS: ArnakCard[] = [
  {
    id: 'item_revolver',
    name: '탐험용 리볼버 (Revolver)',
    nameEn: 'Revolver',
    type: 'item',
    costCoins: 3,
    travelIcon: 'car',
    victoryPoints: 2,
    description: '화살촉 1개 획득 또는 수호자 제압 비용 화살촉 1개 면제.',
    effect: { gainResources: { arrowheads: 1 } }
  },
  {
    id: 'item_journal',
    name: '고고학 연구 수첩 (Field Journal)',
    nameEn: 'Field Journal',
    type: 'item',
    costCoins: 2,
    travelIcon: 'boots',
    victoryPoints: 1,
    description: '석판 1개 및 카드 1장 드로우.',
    effect: { gainResources: { tablets: 1 }, drawCards: 1 }
  },
  {
    id: 'item_airplane',
    name: '경비행기 전세권 (Charter Flight)',
    nameEn: 'Charter Flight',
    type: 'item',
    costCoins: 4,
    travelIcon: 'plane',
    victoryPoints: 3,
    description: '어떤 유적지든 이동 제약 없이 즉시 도달할 수 있는 비행기 이동.',
    effect: { freeTravelPlane: true }
  },
  {
    id: 'item_canteen',
    name: '군용 수통 (Army Canteen)',
    nameEn: 'Army Canteen',
    type: 'item',
    costCoins: 1,
    travelIcon: 'boat',
    victoryPoints: 1,
    description: '나침반 1개 및 코인 1개 즉시 보급.',
    effect: { gainResources: { compasses: 1, coins: 1 } }
  },
  {
    id: 'item_machete',
    name: '강철 마체테 (Steel Machete)',
    nameEn: 'Steel Machete',
    type: 'item',
    costCoins: 2,
    travelIcon: 'boots',
    victoryPoints: 2,
    description: '코인 1개와 나침반 1개 획득.',
    effect: { gainResources: { coins: 1, compasses: 1 } }
  },
  {
    id: 'item_camera',
    name: '빈티지 카메라 (Vintage Camera)',
    nameEn: 'Vintage Camera',
    type: 'item',
    costCoins: 3,
    travelIcon: 'car',
    victoryPoints: 3,
    description: '석판 1개와 카드 1장 드로우.',
    effect: { gainResources: { tablets: 1 }, drawCards: 1 }
  }
];

export const INITIAL_ARTIFACTS: ArnakCard[] = [
  {
    id: 'art_sun_mask',
    name: '황금빛 태양 가면 (Sun Mask)',
    nameEn: 'Sun Mask',
    type: 'artifact',
    costCompasses: 3,
    travelIcon: 'plane',
    victoryPoints: 4,
    description: '보석 1개 즉시 획득 및 연구 트랙 조사 시 나침반 1개 할인.',
    effect: { gainResources: { rubies: 1 } }
  },
  {
    id: 'art_feather_serpent',
    name: '깃털 달린 뱀의 피리 (Feathered Flute)',
    nameEn: 'Feathered Flute',
    type: 'artifact',
    costCompasses: 2,
    travelIcon: 'boat',
    victoryPoints: 3,
    description: '석판 1개 및 화살촉 1개 발굴.',
    effect: { gainResources: { tablets: 1, arrowheads: 1 } }
  },
  {
    id: 'art_crystal_skull',
    name: '수정 해골 (Crystal Skull)',
    nameEn: 'Crystal Skull',
    type: 'artifact',
    costCompasses: 4,
    travelIcon: 'plane',
    victoryPoints: 5,
    description: '보석 1개와 카드 1장 드로우.',
    effect: { gainResources: { rubies: 1 }, drawCards: 1 }
  },
  {
    id: 'art_obsidian_blade',
    name: '흑요석 단도 (Obsidian Blade)',
    nameEn: 'Obsidian Blade',
    type: 'artifact',
    costCompasses: 3,
    travelIcon: 'car',
    victoryPoints: 3,
    description: '화살촉 2개 즉시 획득.',
    effect: { gainResources: { arrowheads: 2 } }
  },
  {
    id: 'art_golden_idol',
    name: '풍요의 황금 우상 (Golden Idol)',
    nameEn: 'Golden Idol',
    type: 'artifact',
    costCompasses: 3,
    travelIcon: 'boots',
    victoryPoints: 4,
    description: '코인 2개와 나침반 2개 획득.',
    effect: { gainResources: { coins: 2, compasses: 2 } }
  }
];
