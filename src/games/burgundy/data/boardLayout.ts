import type { DuchySlot, TileCategory } from '../types';

/**
 * 버건디의 성 표준 1번 영지(Duchy Board 1) 레이아웃 정의
 * 중앙에 시작 성(Castle)이 위치하고 주변으로 36개의 육각 슬롯이 펼쳐집니다.
 * 육각 좌표계: Axial Coordinates (q, r)
 */

interface SlotTemplate {
  id: number;
  q: number;
  r: number;
  category: TileCategory;
  dieNumber: number;
  regionId: number;
}

export const DUCHY_BOARD_1_TEMPLATE: SlotTemplate[] = [
  // 1. 중앙 시작 성 (id: 0)
  { id: 0, q: 0, r: 0, category: 'castle', dieNumber: 1, regionId: 1 },

  // 2. 성 주변 링 1 (반경 1: 6칸)
  { id: 1, q: 1, r: -1, category: 'pasture', dieNumber: 2, regionId: 2 },
  { id: 2, q: 1, r: 0, category: 'city', dieNumber: 4, regionId: 3 },
  { id: 3, q: 0, r: 1, category: 'ship', dieNumber: 6, regionId: 4 },
  { id: 4, q: -1, r: 1, category: 'pasture', dieNumber: 3, regionId: 5 },
  { id: 5, q: -1, r: 0, category: 'city', dieNumber: 5, regionId: 6 },
  { id: 6, q: 0, r: -1, category: 'monastery', dieNumber: 1, regionId: 7 },

  // 3. 반경 2 (12칸)
  { id: 7, q: 2, r: -2, category: 'pasture', dieNumber: 3, regionId: 2 },
  { id: 8, q: 2, r: -1, category: 'city', dieNumber: 5, regionId: 3 },
  { id: 9, q: 2, r: 0, category: 'city', dieNumber: 6, regionId: 3 },
  { id: 10, q: 1, r: 1, category: 'ship', dieNumber: 2, regionId: 4 },
  { id: 11, q: 0, r: 2, category: 'ship', dieNumber: 4, regionId: 4 },
  { id: 12, q: -1, r: 2, category: 'mine', dieNumber: 6, regionId: 8 },
  { id: 13, q: -2, r: 2, category: 'pasture', dieNumber: 4, regionId: 5 },
  { id: 14, q: -2, r: 1, category: 'pasture', dieNumber: 1, regionId: 5 },
  { id: 15, q: -2, r: 0, category: 'city', dieNumber: 3, regionId: 6 },
  { id: 16, q: -1, r: -1, category: 'monastery', dieNumber: 2, regionId: 7 },
  { id: 17, q: 0, r: -2, category: 'monastery', dieNumber: 4, regionId: 7 },
  { id: 18, q: 1, r: -2, category: 'castle', dieNumber: 5, regionId: 9 },

  // 4. 외곽 반경 3 (18칸)
  { id: 19, q: 3, r: -3, category: 'pasture', dieNumber: 5, regionId: 2 },
  { id: 20, q: 3, r: -2, category: 'pasture', dieNumber: 1, regionId: 2 },
  { id: 21, q: 3, r: -1, category: 'city', dieNumber: 2, regionId: 3 },
  { id: 22, q: 3, r: 0, category: 'city', dieNumber: 1, regionId: 3 },
  { id: 23, q: 2, r: 1, category: 'ship', dieNumber: 5, regionId: 4 },
  { id: 24, q: 1, r: 2, category: 'ship', dieNumber: 3, regionId: 4 },
  { id: 25, q: 0, r: 3, category: 'mine', dieNumber: 1, regionId: 8 },
  { id: 26, q: -1, r: 3, category: 'mine', dieNumber: 2, regionId: 8 },
  { id: 27, q: -2, r: 3, category: 'castle', dieNumber: 3, regionId: 10 },
  { id: 28, q: -3, r: 3, category: 'pasture', dieNumber: 6, regionId: 5 },
  { id: 29, q: -3, r: 2, category: 'pasture', dieNumber: 2, regionId: 5 },
  { id: 30, q: -3, r: 1, category: 'city', dieNumber: 4, regionId: 6 },
  { id: 31, q: -3, r: 0, category: 'city', dieNumber: 6, regionId: 6 },
  { id: 32, q: -2, r: -1, category: 'monastery', dieNumber: 5, regionId: 7 },
  { id: 33, q: -1, r: -2, category: 'monastery', dieNumber: 6, regionId: 7 },
  { id: 34, q: 0, r: -3, category: 'mine', dieNumber: 3, regionId: 11 },
  { id: 35, q: 1, r: -3, category: 'castle', dieNumber: 4, regionId: 9 },
  { id: 36, q: 2, r: -3, category: 'pasture', dieNumber: 6, regionId: 2 }
];

/** 6방향 인접 육각 오프셋 */
export const HEX_DIRECTIONS = [
  { dq: 1, dr: 0 },
  { dq: 1, dr: -1 },
  { dq: 0, dr: -1 },
  { dq: -1, dr: 0 },
  { dq: -1, dr: 1 },
  { dq: 0, dr: 1 }
];

/** 두 육각 슬롯이 인접한지 확인 */
export function areSlotsAdjacent(slotA: { q: number; r: number }, slotB: { q: number; r: number }): boolean {
  const dq = slotA.q - slotB.q;
  const dr = slotA.r - slotB.r;
  return HEX_DIRECTIONS.some(d => d.dq === dq && d.dr === dr);
}

/** 새로운 플레이어를 위한 초기 영지 슬롯 생성 (중앙 시작 성 1개 배치) */
export function createInitialDuchy(): DuchySlot[] {
  return DUCHY_BOARD_1_TEMPLATE.map(t => {
    const isStartCastle = t.id === 0;
    return {
      ...t,
      placedTile: isStartCastle ? {
        id: 'start-castle',
        category: 'castle',
        type: 'castle',
        name: '시작 성',
        icon: '🏰',
        desc: '영지의 중심이 되는 군주의 시작 성',
        color: '#15803d'
      } : null
    };
  });
}
