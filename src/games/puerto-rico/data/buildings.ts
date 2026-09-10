import type { BuildingDef, GoodType } from '../types';

export const GOODS_DATA: Record<GoodType, { name: string; koreanName: string; basePrice: number; color: string; bgColor: string; icon: string }> = {
  corn: { name: 'Corn', koreanName: '옥수수', basePrice: 0, color: '#facc15', bgColor: '#713f12', icon: '🌽' },
  indigo: { name: 'Indigo', koreanName: '인디고', basePrice: 1, color: '#60a5fa', bgColor: '#1e3a8a', icon: '🫐' },
  sugar: { name: 'Sugar', koreanName: '설탕', basePrice: 2, color: '#f8fafc', bgColor: '#475569', icon: '🍬' },
  tobacco: { name: 'Tobacco', koreanName: '담배', basePrice: 3, color: '#a3e635', bgColor: '#365314', icon: '🍂' },
  coffee: { name: 'Coffee', koreanName: '커피', basePrice: 4, color: '#b45309', bgColor: '#451a03', icon: '☕' },
};

export const BUILDINGS_CATALOG: BuildingDef[] = [
  // 1열 (비용 1-3)
  {
    id: 'small_indigo',
    name: 'Small Indigo Plant',
    koreanName: '소형 인디고 염색소',
    cost: 1,
    quarryDiscountMax: 1,
    vp: 1,
    category: 'production',
    goodType: 'indigo',
    maxColonists: 1,
    desc: '인디고 1개를 생산할 수 있는 소형 염색소.'
  },
  {
    id: 'small_sugar',
    name: 'Small Sugar Mill',
    koreanName: '소형 설탕 제당소',
    cost: 2,
    quarryDiscountMax: 1,
    vp: 1,
    category: 'production',
    goodType: 'sugar',
    maxColonists: 1,
    desc: '설탕 1개를 생산할 수 있는 소형 제당소.'
  },
  {
    id: 'small_market',
    name: 'Small Market',
    koreanName: '소형 시장',
    cost: 1,
    quarryDiscountMax: 1,
    vp: 1,
    category: 'violet',
    maxColonists: 1,
    desc: '상인 페이즈에서 상품을 판매할 때마다 1두블론을 추가로 받습니다.'
  },
  {
    id: 'hacienda',
    name: 'Hacienda',
    koreanName: '하시엔다',
    cost: 2,
    quarryDiscountMax: 1,
    vp: 1,
    category: 'violet',
    maxColonists: 1,
    desc: '개척자 페이즈에서 농장 타일을 고르기 전, 덱 맨 위에서 무작위 농장 1개를 추가로 가져옵니다.'
  },
  {
    id: 'construction_hut',
    name: 'Construction Hut',
    koreanName: '건설소',
    cost: 2,
    quarryDiscountMax: 1,
    vp: 1,
    category: 'violet',
    maxColonists: 1,
    desc: '개척자 페이즈에서 개척자 특권이 없어도 채석장 타일을 가져올 수 있습니다.'
  },
  {
    id: 'small_warehouse',
    name: 'Small Warehouse',
    koreanName: '소형 창고',
    cost: 3,
    quarryDiscountMax: 1,
    vp: 1,
    category: 'violet',
    maxColonists: 1,
    desc: '선장 페이즈 종료 시, 한 종류의 상품을 수량 제한 없이 전부 보관할 수 있습니다.'
  },

  // 2열 (비용 3-5)
  {
    id: 'large_indigo',
    name: 'Large Indigo Plant',
    koreanName: '대형 인디고 염색소',
    cost: 3,
    quarryDiscountMax: 2,
    vp: 2,
    category: 'production',
    goodType: 'indigo',
    maxColonists: 3,
    desc: '최대 3개의 인디고를 생산할 수 있는 대형 염색소.'
  },
  {
    id: 'large_sugar',
    name: 'Large Sugar Mill',
    koreanName: '대형 설탕 제당소',
    cost: 4,
    quarryDiscountMax: 2,
    vp: 2,
    category: 'production',
    goodType: 'sugar',
    maxColonists: 3,
    desc: '최대 3개의 설탕을 생산할 수 있는 대형 제당소.'
  },
  {
    id: 'hospice',
    name: 'Hospice',
    koreanName: '구호원',
    cost: 4,
    quarryDiscountMax: 2,
    vp: 2,
    category: 'violet',
    maxColonists: 1,
    desc: '개척자 페이즈에서 농장이나 채석장을 가져올 때 즉시 이주민 공급처에서 일꾼 1명을 그 타일에 놓습니다.'
  },
  {
    id: 'office',
    name: 'Office',
    koreanName: '상점 사무소',
    cost: 5,
    quarryDiscountMax: 2,
    vp: 2,
    category: 'violet',
    maxColonists: 1,
    desc: '상인 페이즈에서 상점에 이미 있는 종류의 상품이라도 판매할 수 있습니다.'
  },
  {
    id: 'large_market',
    name: 'Large Market',
    koreanName: '대형 시장',
    cost: 5,
    quarryDiscountMax: 2,
    vp: 2,
    category: 'violet',
    maxColonists: 1,
    desc: '상인 페이즈에서 상품을 판매할 때마다 2두블론을 추가로 받습니다. (소형 시장과 중첩 가능)'
  },
  {
    id: 'large_warehouse',
    name: 'Large Warehouse',
    koreanName: '대형 창고',
    cost: 6,
    quarryDiscountMax: 2,
    vp: 2,
    category: 'violet',
    maxColonists: 1,
    desc: '선장 페이즈 종료 시, 두 종류의 상품을 수량 제한 없이 전부 보관할 수 있습니다.'
  },

  // 3열 (비용 5-8)
  {
    id: 'tobacco_storage',
    name: 'Tobacco Storage',
    koreanName: '담배 건조소',
    cost: 5,
    quarryDiscountMax: 3,
    vp: 3,
    category: 'production',
    goodType: 'tobacco',
    maxColonists: 3,
    desc: '최대 3개의 담배를 가공 생산할 수 있는 건조소.'
  },
  {
    id: 'coffee_roaster',
    name: 'Coffee Roaster',
    koreanName: '커피 로스터리',
    cost: 6,
    quarryDiscountMax: 3,
    vp: 3,
    category: 'production',
    goodType: 'coffee',
    maxColonists: 2,
    desc: '최대 2개의 고급 커피를 가공 생산할 수 있는 로스터리.'
  },
  {
    id: 'factory',
    name: 'Factory',
    koreanName: '공장',
    cost: 7,
    quarryDiscountMax: 3,
    vp: 3,
    category: 'violet',
    maxColonists: 1,
    desc: '감독관 페이즈에서 생산한 상품 종류 수에 따라 보너스 돈을 받습니다 (2종: 1원, 3종: 2원, 4종: 3원, 5종: 5원).'
  },
  {
    id: 'university',
    name: 'University',
    koreanName: '대학교',
    cost: 8,
    quarryDiscountMax: 3,
    vp: 3,
    category: 'violet',
    maxColonists: 1,
    desc: '건축가 페이즈에서 건물을 지을 때 즉시 이주민 공급처에서 일꾼 1명을 해당 건물에 놓습니다.'
  },
  {
    id: 'harbor',
    name: 'Harbor',
    koreanName: '항구',
    cost: 8,
    quarryDiscountMax: 3,
    vp: 3,
    category: 'violet',
    maxColonists: 1,
    desc: '선장 페이즈에서 상품을 선적할 때마다 추가로 1 승점을 얻습니다.'
  },
  {
    id: 'wharf',
    name: 'Wharf',
    koreanName: '전용 부두',
    cost: 9,
    quarryDiscountMax: 3,
    vp: 3,
    category: 'violet',
    maxColonists: 1,
    desc: '선장 페이즈에서 공용 화물선의 상태와 상관없이 원하는 종류의 상품을 자신의 전용 배에 모두 선적할 수 있습니다.'
  },

  // 4열 (비용 10 대형 승점 건물, 채석장 최대 4원 할인, 기본 4VP + 보너스 점수)
  {
    id: 'guild_hall',
    name: 'Guild Hall',
    koreanName: '길드홀',
    cost: 10,
    quarryDiscountMax: 4,
    vp: 4,
    category: 'large',
    maxColonists: 1,
    desc: '게임 종료 시 소형 생산 건물 1개당 1점, 대형 생산 건물 1개당 2점의 추가 승점을 얻습니다.'
  },
  {
    id: 'residence',
    name: 'Residence',
    koreanName: '총독 관저',
    cost: 10,
    quarryDiscountMax: 4,
    vp: 4,
    category: 'large',
    maxColonists: 1,
    desc: '게임 종료 시 보유한 농장 및 채석장 타일 수에 따라 추가 승점을 얻습니다 (9개 이하: 4점, 10개: 5점, 11개: 6점, 12개: 7점).'
  },
  {
    id: 'fortress',
    name: 'Fortress',
    koreanName: '요새',
    cost: 10,
    quarryDiscountMax: 4,
    vp: 4,
    category: 'large',
    maxColonists: 1,
    desc: '게임 종료 시 자신의 개인판에 배치된 일꾼 3명당 1점의 추가 승점을 얻습니다.'
  },
  {
    id: 'customs_house',
    name: 'Customs House',
    koreanName: '세관',
    cost: 10,
    quarryDiscountMax: 4,
    vp: 4,
    category: 'large',
    maxColonists: 1,
    desc: '게임 종료 시 획득한 승점(VP) 칩 4개당 1점의 추가 승점을 얻습니다.'
  },
  {
    id: 'city_hall',
    name: 'City Hall',
    koreanName: '시청',
    cost: 10,
    quarryDiscountMax: 4,
    vp: 4,
    category: 'large',
    maxColonists: 1,
    desc: '게임 종료 시 자신이 보유한 보라색 건물 1개당 1점의 추가 승점을 얻습니다.'
  }
];
