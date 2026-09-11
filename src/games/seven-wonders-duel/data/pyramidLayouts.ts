import type { DuelAge, PyramidNode, DuelCard } from '../types';

export interface LayoutSlot {
  index: number;
  row: number;
  col: number;
  initialOpen: boolean;
  coveredByIndices: number[]; // 이 카드를 덮고 있는 아래층 카드 인덱스들
}

// 1시대 피라미드 슬롯 정의 (20장)
export const AGE_I_LAYOUT: LayoutSlot[] = [
  // Row 0 (2장 - 앞면)
  { index: 0, row: 0, col: 0, initialOpen: true, coveredByIndices: [2, 3] },
  { index: 1, row: 0, col: 1, initialOpen: true, coveredByIndices: [3, 4] },

  // Row 1 (3장 - 뒷면)
  { index: 2, row: 1, col: 0, initialOpen: false, coveredByIndices: [5, 6] },
  { index: 3, row: 1, col: 1, initialOpen: false, coveredByIndices: [6, 7] },
  { index: 4, row: 1, col: 2, initialOpen: false, coveredByIndices: [7, 8] },

  // Row 2 (4장 - 앞면)
  { index: 5, row: 2, col: 0, initialOpen: true, coveredByIndices: [9, 10] },
  { index: 6, row: 2, col: 1, initialOpen: true, coveredByIndices: [10, 11] },
  { index: 7, row: 2, col: 2, initialOpen: true, coveredByIndices: [11, 12] },
  { index: 8, row: 2, col: 3, initialOpen: true, coveredByIndices: [12, 13] },

  // Row 3 (5장 - 뒷면)
  { index: 9, row: 3, col: 0, initialOpen: false, coveredByIndices: [14, 15] },
  { index: 10, row: 3, col: 1, initialOpen: false, coveredByIndices: [15, 16] },
  { index: 11, row: 3, col: 2, initialOpen: false, coveredByIndices: [16, 17] },
  { index: 12, row: 3, col: 3, initialOpen: false, coveredByIndices: [17, 18] },
  { index: 13, row: 3, col: 4, initialOpen: false, coveredByIndices: [18, 19] },

  // Row 4 (6장 - 앞면, 시작 시 즉시 선택 가능)
  { index: 14, row: 4, col: 0, initialOpen: true, coveredByIndices: [] },
  { index: 15, row: 4, col: 1, initialOpen: true, coveredByIndices: [] },
  { index: 16, row: 4, col: 2, initialOpen: true, coveredByIndices: [] },
  { index: 17, row: 4, col: 3, initialOpen: true, coveredByIndices: [] },
  { index: 18, row: 4, col: 4, initialOpen: true, coveredByIndices: [] },
  { index: 19, row: 4, col: 5, initialOpen: true, coveredByIndices: [] }
];

// 2시대 역피라미드 슬롯 정의 (20장)
export const AGE_II_LAYOUT: LayoutSlot[] = [
  // Row 0 (6장 - 앞면)
  { index: 0, row: 0, col: 0, initialOpen: true, coveredByIndices: [6] },
  { index: 1, row: 0, col: 1, initialOpen: true, coveredByIndices: [6, 7] },
  { index: 2, row: 0, col: 2, initialOpen: true, coveredByIndices: [7, 8] },
  { index: 3, row: 0, col: 3, initialOpen: true, coveredByIndices: [8, 9] },
  { index: 4, row: 0, col: 4, initialOpen: true, coveredByIndices: [9, 10] },
  { index: 5, row: 0, col: 5, initialOpen: true, coveredByIndices: [10] },

  // Row 1 (5장 - 뒷면)
  { index: 6, row: 1, col: 0, initialOpen: false, coveredByIndices: [11] },
  { index: 7, row: 1, col: 1, initialOpen: false, coveredByIndices: [11, 12] },
  { index: 8, row: 1, col: 2, initialOpen: false, coveredByIndices: [12, 13] },
  { index: 9, row: 1, col: 3, initialOpen: false, coveredByIndices: [13, 14] },
  { index: 10, row: 1, col: 4, initialOpen: false, coveredByIndices: [14] },

  // Row 2 (4장 - 앞면)
  { index: 11, row: 2, col: 0, initialOpen: true, coveredByIndices: [15] },
  { index: 12, row: 2, col: 1, initialOpen: true, coveredByIndices: [15, 16] },
  { index: 13, row: 2, col: 2, initialOpen: true, coveredByIndices: [16, 17] },
  { index: 14, row: 2, col: 3, initialOpen: true, coveredByIndices: [17] },

  // Row 3 (3장 - 뒷면)
  { index: 15, row: 3, col: 0, initialOpen: false, coveredByIndices: [18] },
  { index: 16, row: 3, col: 1, initialOpen: false, coveredByIndices: [18, 19] },
  { index: 17, row: 3, col: 2, initialOpen: false, coveredByIndices: [19] },

  // Row 4 (2장 - 앞면, 시작 시 즉시 선택 가능)
  { index: 18, row: 4, col: 0, initialOpen: true, coveredByIndices: [] },
  { index: 19, row: 4, col: 1, initialOpen: true, coveredByIndices: [] }
];

// 3시대 다이아몬드 슬롯 정의 (20장)
export const AGE_III_LAYOUT: LayoutSlot[] = [
  // Row 0 (2장 - 앞면)
  { index: 0, row: 0, col: 0, initialOpen: true, coveredByIndices: [2, 3] },
  { index: 1, row: 0, col: 1, initialOpen: true, coveredByIndices: [3, 4] },

  // Row 1 (3장 - 뒷면)
  { index: 2, row: 1, col: 0, initialOpen: false, coveredByIndices: [5, 6] },
  { index: 3, row: 1, col: 1, initialOpen: false, coveredByIndices: [6, 7] },
  { index: 4, row: 1, col: 2, initialOpen: false, coveredByIndices: [7, 8] },

  // Row 2 (4장 - 앞면)
  { index: 5, row: 2, col: 0, initialOpen: true, coveredByIndices: [9] },
  { index: 6, row: 2, col: 1, initialOpen: true, coveredByIndices: [9, 10] },
  { index: 7, row: 2, col: 2, initialOpen: true, coveredByIndices: [11, 12] },
  { index: 8, row: 2, col: 3, initialOpen: true, coveredByIndices: [12] },

  // Row 3 (4장 - 뒷면)
  { index: 9, row: 3, col: 0, initialOpen: false, coveredByIndices: [13] },
  { index: 10, row: 3, col: 1, initialOpen: false, coveredByIndices: [13, 14] },
  { index: 11, row: 3, col: 2, initialOpen: false, coveredByIndices: [14, 15] },
  { index: 12, row: 3, col: 3, initialOpen: false, coveredByIndices: [15] },

  // Row 4 (3장 - 앞면)
  { index: 13, row: 4, col: 0, initialOpen: true, coveredByIndices: [16, 17] },
  { index: 14, row: 4, col: 1, initialOpen: true, coveredByIndices: [17, 18] },
  { index: 15, row: 4, col: 2, initialOpen: true, coveredByIndices: [18, 19] },

  // Row 5 (4장 - 뒷면)
  { index: 16, row: 5, col: 0, initialOpen: false, coveredByIndices: [] },
  { index: 17, row: 5, col: 1, initialOpen: false, coveredByIndices: [] },
  { index: 18, row: 5, col: 2, initialOpen: false, coveredByIndices: [] },
  { index: 19, row: 5, col: 3, initialOpen: false, coveredByIndices: [] }
];

/**
 * 덱 카드들을 지정된 시대 피라미드 노드 배열로 조립
 */
export const buildPyramidForAge = (age: DuelAge, cards: DuelCard[]): PyramidNode[] => {
  const layout = age === 1 ? AGE_I_LAYOUT : (age === 2 ? AGE_II_LAYOUT : AGE_III_LAYOUT);

  return layout.map(slot => {
    const card = cards[slot.index];
    const coveredBy = slot.coveredByIndices.map(idx => `node_${age}_${idx}`);
    return {
      id: `node_${age}_${slot.index}`,
      card,
      age,
      row: slot.row,
      col: slot.col,
      isOpen: slot.initialOpen,
      isAvailable: coveredBy.length === 0,
      coveredBy,
      covers: [],
      isTaken: false
    };
  });
};
