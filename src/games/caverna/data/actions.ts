import type { ActionSpace } from '../types';

export const INITIAL_ACTION_SPACES: ActionSpace[] = [
  // --- [상시 기본 행동 칸] ---
  {
    id: 'act_logging',
    name: '벌목장 (Logging)',
    roundAppeared: 0,
    accumulatesResource: { resource: 'wood', amountPerRound: 3 },
    accumulatedCount: 3,
    occupiedByPlayerId: null,
    description: '누적된 모든 나무를 수확합니다.',
    actionType: 'logging'
  },
  {
    id: 'act_quarry',
    name: '채석장 (Quarry)',
    roundAppeared: 0,
    accumulatesResource: { resource: 'stone', amountPerRound: 1 },
    accumulatedCount: 1,
    occupiedByPlayerId: null,
    description: '누적된 모든 돌을 수확합니다.',
    actionType: 'quarry'
  },
  {
    id: 'act_ore_mine',
    name: '광석 채굴 (Ore Mine)',
    roundAppeared: 0,
    accumulatesResource: { resource: 'ore', amountPerRound: 2 },
    accumulatedCount: 2,
    occupiedByPlayerId: null,
    description: '누적된 모든 광석을 채굴합니다.',
    actionType: 'ore_mining'
  },
  {
    id: 'act_ruby_mine',
    name: '루비 광산 (Ruby Mine)',
    roundAppeared: 0,
    accumulatesResource: { resource: 'ruby', amountPerRound: 1 },
    accumulatedCount: 1,
    occupiedByPlayerId: null,
    description: '귀중한 조커 자원 루비를 획득합니다.',
    actionType: 'ruby_mining'
  },
  {
    id: 'act_slash_burn',
    name: '화전 개간 (Slash & Burn)',
    roundAppeared: 0,
    accumulatedCount: 0,
    occupiedByPlayerId: null,
    description: '숲 1칸을 밭으로 개간하고 나무 1개를 얻습니다.',
    actionType: 'slash_and_burn'
  },
  {
    id: 'act_sow',
    name: '파종 및 빵 (Sow & Bread)',
    roundAppeared: 0,
    accumulatedCount: 0,
    occupiedByPlayerId: null,
    description: '일군 밭에 곡물이나 호박을 파종합니다.',
    actionType: 'sow_crops'
  },
  {
    id: 'act_excavate',
    name: '동굴 발굴 (Excavation)',
    roundAppeared: 0,
    accumulatedCount: 0,
    occupiedByPlayerId: null,
    description: '단단한 암석 2칸을 뚫어 빈 동굴 공간으로 만듭니다 (돌 1개 획득).',
    actionType: 'excavation'
  },
  {
    id: 'act_furnish',
    name: '방 인테리어 (Furnish)',
    roundAppeared: 0,
    accumulatedCount: 0,
    occupiedByPlayerId: null,
    description: '발굴된 동굴에 방 타일을 건설합니다.',
    actionType: 'furnish_cavern'
  },
  {
    id: 'act_blacksmith',
    name: '무기 대장간 (Blacksmith)',
    roundAppeared: 0,
    accumulatedCount: 0,
    occupiedByPlayerId: null,
    description: '광석을 최대 8개까지 소모해 무기를 단조하고 1단계 원정을 떠납니다.',
    actionType: 'blacksmith'
  },
  {
    id: 'act_expedition',
    name: '영웅 원정 (Expedition)',
    roundAppeared: 1,
    accumulatedCount: 0,
    occupiedByPlayerId: null,
    description: '무장한 드워프가 전장으로 떠나 전리품 2개를 획득하고 무기를 강화합니다.',
    actionType: 'expedition'
  },
  {
    id: 'act_sheep',
    name: '양 목축 (Sheep Market)',
    roundAppeared: 2,
    accumulatesResource: { resource: 'sheep', amountPerRound: 1 },
    accumulatedCount: 1,
    occupiedByPlayerId: null,
    description: '누적된 양을 데려와 목초지에 방목합니다.',
    actionType: 'sheep_farming'
  },
  {
    id: 'act_cattle',
    name: '가축 시장 (Cattle & Boar)',
    roundAppeared: 3,
    accumulatedCount: 0,
    occupiedByPlayerId: null,
    description: '소 1마리와 멧돼지 1마리를 분양받아 옵니다.',
    actionType: 'cattle_farming'
  },
  {
    id: 'act_fence',
    name: '울타리 치기 (Fencing)',
    roundAppeared: 0,
    accumulatedCount: 0,
    occupiedByPlayerId: null,
    description: '나무를 사용해 초원에 울타리를 치고 가축 수용 공간을 넓힙니다.',
    actionType: 'fencing'
  }
];
