import type { 
  BoardSlot, 
  PlayerCaverna, 
  LivestockType, 
  FurnishingTile
} from '../types';

/**
 * 4x3 기본 동굴 보드 생성
 * - (0,0): 초기 입구 거주지 (초기 드워프 2명 거주)
 * - (0,1): 기본 발굴된 빈 동굴
 * - 나머지 10칸: 미발굴 단단한 암석
 */
export const createInitialCaveBoard = (): BoardSlot[][] => {
  const board: BoardSlot[][] = [];
  for (let r = 0; r < 4; r++) {
    const row: BoardSlot[] = [];
    for (let c = 0; c < 3; c++) {
      if (r === 0 && c === 0) {
        row.push({ row: r, col: c, type: 'dwelling', tileId: 'furn_entry_dwelling' });
      } else if (r === 0 && c === 1) {
        row.push({ row: r, col: c, type: 'cavern_empty' });
      } else {
        row.push({ row: r, col: c, type: 'solid_rock' });
      }
    }
    board.push(row);
  }
  return board;
};

/**
 * 4x3 기본 숲/농경 보드 생성
 * - (0,0), (0,1): 기본 개간된 초원
 * - 나머지 10칸: 깊은 숲
 */
export const createInitialFieldBoard = (): BoardSlot[][] => {
  const board: BoardSlot[][] = [];
  for (let r = 0; r < 4; r++) {
    const row: BoardSlot[] = [];
    for (let c = 0; c < 3; c++) {
      if (r === 0 && (c === 0 || c === 1)) {
        row.push({ row: r, col: c, type: 'cleared_meadow' });
      } else {
        row.push({ row: r, col: c, type: 'deep_forest' });
      }
    }
    board.push(row);
  }
  return board;
};

/**
 * 동굴 발굴: 암석 2칸을 빈 동굴로 개간
 */
export const excavateCavern = (caveBoard: BoardSlot[][]): { updatedBoard: BoardSlot[][]; count: number } => {
  const updated = caveBoard.map(row => row.map(slot => ({ ...slot })));
  let excavated = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      if (updated[r][c].type === 'solid_rock' && excavated < 2) {
        updated[r][c].type = 'cavern_empty';
        excavated++;
      }
    }
  }
  return { updatedBoard: updated, count: excavated };
};

/**
 * 화전 개간: 깊은 숲 1칸을 밭으로 개간
 */
export const slashAndBurn = (fieldBoard: BoardSlot[][]): { updatedBoard: BoardSlot[][]; success: boolean } => {
  const updated = fieldBoard.map(row => row.map(slot => ({ ...slot })));
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      if (updated[r][c].type === 'deep_forest') {
        updated[r][c].type = 'field_empty';
        return { updatedBoard: updated, success: true };
      }
    }
  }
  return { updatedBoard: updated, success: false };
};

/**
 * 파종: 빈 밭에 곡물 또는 호박 파종
 */
export const sowCropOnField = (
  fieldBoard: BoardSlot[][],
  cropType: 'grain' | 'pumpkin'
): { updatedBoard: BoardSlot[][]; success: boolean } => {
  const updated = fieldBoard.map(row => row.map(slot => ({ ...slot })));
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      if (updated[r][c].type === 'field_empty') {
        updated[r][c].type = cropType === 'grain' ? 'field_grain' : 'field_pumpkin';
        updated[r][c].cropCount = cropType === 'grain' ? 3 : 2; // 곡물은 1개 심으면 총 3개(수확용 2개 추가), 호박은 2개
        return { updatedBoard: updated, success: true };
      }
    }
  }
  return { updatedBoard: updated, success: false };
};

/**
 * 울타리 치기: 빈 초원 2칸을 목초지로 전환
 */
export const buildPasture = (fieldBoard: BoardSlot[][]): { updatedBoard: BoardSlot[][]; count: number } => {
  const updated = fieldBoard.map(row => row.map(slot => ({ ...slot })));
  let pastures = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      if (updated[r][c].type === 'cleared_meadow' && pastures < 2) {
        updated[r][c].type = 'pasture';
        pastures++;
      }
    }
  }
  return { updatedBoard: updated, count: pastures };
};

/**
 * 방 타일 배치: 빈 동굴 공간 1곳에 타일 건설
 */
export const placeFurnishing = (
  caveBoard: BoardSlot[][],
  tileId: string,
  isDwelling: boolean
): { updatedBoard: BoardSlot[][]; success: boolean } => {
  const updated = caveBoard.map(row => row.map(slot => ({ ...slot })));
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      if (updated[r][c].type === 'cavern_empty') {
        updated[r][c].type = isDwelling ? 'dwelling' : 'furnishing';
        updated[r][c].tileId = tileId;
        return { updatedBoard: updated, success: true };
      }
    }
  }
  return { updatedBoard: updated, success: false };
};

/**
 * 라운드 종료 수확 & 밥 먹이기 & 번식 처리
 */
export const processHarvestPhase = (players: PlayerCaverna[]): { updatedPlayers: PlayerCaverna[]; logs: string[] } => {
  const logs: string[] = [];
  const updatedPlayers = players.map(player => {
    const updated = {
      ...player,
      resources: { ...player.resources },
      livestock: { ...player.livestock },
      fieldBoard: player.fieldBoard.map(row => row.map(slot => ({ ...slot }))),
      dwarfs: player.dwarfs.map(d => ({ ...d, hasActedThisRound: false, placedActionId: null }))
    };

    // 1. 농작물 수확 (Field Harvest)
    let grainHarvested = 0;
    let pumpkinHarvested = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        const slot = updated.fieldBoard[r][c];
        if (slot.type === 'field_grain' && slot.cropCount && slot.cropCount > 0) {
          slot.cropCount--;
          grainHarvested++;
          if (slot.cropCount === 0) slot.type = 'field_empty';
        } else if (slot.type === 'field_pumpkin' && slot.cropCount && slot.cropCount > 0) {
          slot.cropCount--;
          pumpkinHarvested++;
          if (slot.cropCount === 0) slot.type = 'field_empty';
        }
      }
    }
    updated.resources.grain += grainHarvested;
    updated.resources.pumpkin += pumpkinHarvested;
    if (grainHarvested > 0 || pumpkinHarvested > 0) {
      logs.push(`${player.name}: 곡물 ${grainHarvested}개, 호박 ${pumpkinHarvested}개 수확 완료`);
    }

    // 2. 밥 먹이기 (Feeding the Dwarfs: 1인당 식량 2 소모)
    const dwarfCount = updated.dwarfs.length;
    const requiredFood = dwarfCount * 2;
    let foodAvailable = updated.resources.food;

    if (foodAvailable >= requiredFood) {
      updated.resources.food -= requiredFood;
      logs.push(`${player.name}: 드워프 ${dwarfCount}명 식량 ${requiredFood} 배급 완료`);
    } else {
      let needed = requiredFood - foodAvailable;
      updated.resources.food = 0;

      // 루비(조커)를 식량 2로 자동 환전
      while (needed > 0 && updated.resources.ruby > 0) {
        updated.resources.ruby--;
        needed = Math.max(0, needed - 2);
        logs.push(`${player.name}: 비상 식량 부족으로 루비 1개를 식량으로 환전`);
      }

      // 곡물이나 호박을 식량 1로 환전
      while (needed > 0 && updated.resources.grain > 0) {
        updated.resources.grain--;
        needed--;
      }
      while (needed > 0 && updated.resources.pumpkin > 0) {
        updated.resources.pumpkin--;
        needed--;
      }

      if (needed > 0) {
        logs.push(`⚠️ ${player.name}: 식량이 ${needed} 부족하여 배고픔 페널티(-${needed * 3}점) 발생!`);
        updated.resources.gold -= (needed * 3);
      }
    }

    // 3. 가축 번식 (Animal Breeding: 각 가축 2마리 이상 시 +1)
    const animalTypes: LivestockType[] = ['sheep', 'boar', 'cattle', 'donkey'];
    animalTypes.forEach(animal => {
      if (updated.livestock[animal] >= 2) {
        updated.livestock[animal]++;
        const names: Record<LivestockType, string> = { sheep: '양', boar: '멧돼지', cattle: '소', donkey: '당나귀' };
        logs.push(`${player.name}: ${names[animal]} 1마리가 번식하여 태어났습니다! 🐾`);
      }
    });

    return updated;
  });

  return { updatedPlayers, logs };
};

/**
 * 최종 점수 집계 (End-game Score Breakdown)
 */
export const calculateCavernaScore = (player: PlayerCaverna, furnishings: FurnishingTile[]): {
  total: number;
  livestockScore: number;
  cropScore: number;
  dwarfScore: number;
  furnishingScore: number;
  goldScore: number;
  rubyScore: number;
} => {
  // 1. 가축 점수
  let livestockScore = 0;
  const types: LivestockType[] = ['sheep', 'boar', 'cattle', 'donkey'];
  types.forEach(t => {
    const count = player.livestock[t];
    if (count === 0) {
      livestockScore -= 2; // 가축 종류가 아예 없으면 종류당 -2점 페널티
    } else {
      if (t === 'sheep') livestockScore += count;
      else if (t === 'boar') livestockScore += count * 2;
      else if (t === 'cattle') livestockScore += count * 3;
      else if (t === 'donkey') livestockScore += count * 1.5;
    }
  });

  // 2. 농작물 점수 (곡물 0.5점, 호박 1점)
  const cropScore = Math.floor(player.resources.grain * 0.5) + player.resources.pumpkin;

  // 3. 드워프 점수 (1인당 5점)
  const dwarfScore = player.dwarfs.length * 5;

  // 4. 방 타일 점수 (명시 VP + 조건부)
  let furnishingScore = 0;
  player.builtFurnishings.forEach(fId => {
    const f = furnishings.find(x => x.id === fId);
    if (f) {
      furnishingScore += f.vp;
      if (f.id === 'furn_weaving_parlor') {
        furnishingScore += player.livestock.sheep;
      } else if (f.id === 'furn_miner_cabin') {
        furnishingScore += Math.floor(player.resources.ore / 2);
      } else if (f.id === 'furn_treasury') {
        furnishingScore += player.resources.ruby * 2;
      }
    }
  });

  // 5. 금화 및 루비 점수
  const goldScore = player.resources.gold;
  const rubyScore = player.resources.ruby;

  const total = Math.round(livestockScore + cropScore + dwarfScore + furnishingScore + goldScore + rubyScore);

  return {
    total,
    livestockScore: Math.round(livestockScore),
    cropScore,
    dwarfScore,
    furnishingScore,
    goldScore,
    rubyScore
  };
};
