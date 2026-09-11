import type { HexTile, BuildingType, AnimalType, BurgundyPhase, GoodsTile } from '../types';

/** 건물 8종 정의 */
export const BUILDINGS_DATA: Record<BuildingType, { name: string; icon: string; desc: string }> = {
  warehouse: {
    name: '창고',
    icon: '🛖',
    desc: '보유 중인 상품 1종류를 즉시 매각 (은화 1개 + 승점)'
  },
  bank: {
    name: '은행',
    icon: '🏦',
    desc: '은화(Silverling) 2개를 즉시 획득'
  },
  church: {
    name: '교회',
    icon: '⛪',
    desc: '중앙 디포에서 성/광산/수도원 타일 중 1개를 무료로 즉시 획득'
  },
  boarding_house: {
    name: '여관',
    icon: '🏨',
    desc: '일꾼(Worker) 토큰 4개를 즉시 획득'
  },
  market: {
    name: '시장',
    icon: '🏪',
    desc: '중앙 디포에서 가축 또는 선박 타일 중 1개를 무료로 즉시 획득'
  },
  watchtower: {
    name: '감시탑',
    icon: '🗼',
    desc: '배치 즉시 4 승점(VP) 획득'
  },
  carpenter: {
    name: '목공소',
    icon: '🪚',
    desc: '중앙 디포에서 건물 타일 중 1개를 무료로 즉시 획득'
  },
  city_hall: {
    name: '시청',
    icon: '🏛️',
    desc: '내 타일 보관소에 있는 타일 1개를 영지에 즉시 무료 배치'
  }
};

/** 동물 4종 정의 */
export const ANIMALS_DATA: Record<AnimalType, { name: string; icon: string }> = {
  sheep: { name: '양', icon: '🐑' },
  cow: { name: '소', icon: '🐄' },
  pig: { name: '돼지', icon: '🐖' },
  chicken: { name: '닭', icon: '🐓' }
};

/** 지식/수도원 타일 목록 */
export const KNOWLEDGE_TILES: { id: number; name: string; icon: string; desc: string }[] = [
  { id: 1, name: '일꾼 훈련소', icon: '📜', desc: '일꾼을 가져올 때 2개 대신 3개를 획득' },
  { id: 2, name: '상업 무역로', icon: '📜', desc: '상품 판매 시 승점 1점 추가 획득' },
  { id: 3, name: '은광 채굴 기술', icon: '📜', desc: '광산 1개당 페이즈 종료 시 은화 +1 추가 획득' },
  { id: 4, name: '가축 번식 지식', icon: '📜', desc: '가축 타일 배치 시 1점 추가 획득' },
  { id: 5, name: '건축 길드', icon: '📜', desc: '게임 종료 시 지어진 건물 1채당 1점' },
  { id: 6, name: '대지주 협회', icon: '📜', desc: '게임 종료 시 완성된 구역 1개당 2점' }
];

/** 구역 크기별 완성 점수표 (1 ~ 8칸) */
export const REGION_SIZE_SCORES: Record<number, number> = {
  1: 1,
  2: 3,
  3: 6,
  4: 10,
  5: 15,
  6: 21,
  7: 28,
  8: 36
};

/** 페이즈별 조기 완성 보너스 점수표 */
export const PHASE_COMPLETION_BONUS: Record<BurgundyPhase, number> = {
  A: 10,
  B: 8,
  C: 6,
  D: 4,
  E: 2
};

/** 상품 타일 6종 생성 헬퍼 */
export function generateGoodsTiles(): GoodsTile[] {
  const goods: GoodsTile[] = [];
  const goodsDefs = [
    { num: 1, color: '#f87171', name: '비단' },
    { num: 2, color: '#fb923c', name: '향신료' },
    { num: 3, color: '#facc15', name: '목재' },
    { num: 4, color: '#4ade80', name: '곡물' },
    { num: 5, color: '#60a5fa', name: '도자기' },
    { num: 6, color: '#c084fc', name: '와인' }
  ];

  goodsDefs.forEach(def => {
    for (let i = 0; i < 6; i++) {
      goods.push({
        id: `goods-${def.num}-${i}`,
        dieNumber: def.num,
        name: def.name,
        color: def.color
      });
    }
  });

  return goods.sort(() => Math.random() - 0.5);
}

/** 중앙 디포를 채울 육각 타일 풀 생성 헬퍼 */
export function generateTilePool(): HexTile[] {
  const pool: HexTile[] = [];
  let counter = 1;

  // 1. 성 타일 (녹색)
  for (let i = 0; i < 12; i++) {
    pool.push({
      id: `castle-${counter++}`,
      category: 'castle',
      type: 'castle',
      name: '성',
      icon: '🏰',
      desc: '즉시 원하는 무료 행동 1회를 추가로 수행합니다.',
      color: '#15803d'
    });
  }

  // 2. 선박 타일 (파란색)
  for (let i = 0; i < 15; i++) {
    pool.push({
      id: `ship-${counter++}`,
      category: 'ship',
      type: 'ship',
      name: '선박',
      icon: '🚢',
      desc: '턴 순서 트랙 1칸 전진 + 주사위 눈금 디포의 상품 더미를 가져옵니다.',
      color: '#0284c7'
    });
  }

  // 3. 광산 타일 (회색)
  for (let i = 0; i < 12; i++) {
    pool.push({
      id: `mine-${counter++}`,
      category: 'mine',
      type: 'mine',
      name: '광산',
      icon: '⛏️',
      desc: '각 페이즈(A~E) 종료 시 은화 1개를 채굴합니다.',
      color: '#475569'
    });
  }

  // 4. 건물 8종 타일 (베이지)
  const bTypes: BuildingType[] = ['warehouse', 'bank', 'church', 'boarding_house', 'market', 'watchtower', 'carpenter', 'city_hall'];
  bTypes.forEach(bType => {
    const meta = BUILDINGS_DATA[bType];
    for (let i = 0; i < 4; i++) {
      pool.push({
        id: `building-${bType}-${counter++}`,
        category: 'city',
        type: bType,
        buildingType: bType,
        name: meta.name,
        icon: meta.icon,
        desc: meta.desc,
        color: '#b45309'
      });
    }
  });

  // 5. 가축 목장 타일 (연두색)
  const aTypes: AnimalType[] = ['sheep', 'cow', 'pig', 'chicken'];
  aTypes.forEach(aType => {
    const meta = ANIMALS_DATA[aType];
    [3, 4].forEach(count => {
      for (let i = 0; i < 4; i++) {
        pool.push({
          id: `pasture-${aType}-${count}-${counter++}`,
          category: 'pasture',
          type: `${aType}_${count}`,
          animalType: aType,
          animalCount: count,
          name: `${meta.name} (${count}마리)`,
          icon: meta.icon,
          desc: `배치 시 ${count}점 획득 (같은 목장 내 기존 ${meta.name} 점수 누적 합산)`,
          color: '#65a30d'
        });
      }
    });
  });

  // 6. 수도원/지식 타일 (노란색)
  KNOWLEDGE_TILES.forEach(kt => {
    for (let i = 0; i < 3; i++) {
      pool.push({
        id: `monastery-${kt.id}-${counter++}`,
        category: 'monastery',
        type: `knowledge_${kt.id}`,
        knowledgeId: kt.id,
        name: kt.name,
        icon: kt.icon,
        desc: kt.desc,
        color: '#ca8a04'
      });
    }
  });

  // 무작위 셔플
  return pool.sort(() => Math.random() - 0.5);
}
