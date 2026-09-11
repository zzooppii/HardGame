import type { HexSlot } from '../types';

export const INITIAL_MAP_SLOTS: HexSlot[] = [
  // 중심부 (Radius 0)
  { id: 'hex_0_0', q: 0, r: 0, tileType: 'empty', ownerPlayerId: null, bonus: { plants: 1 } },

  // 안쪽 링 (Radius 1: 6개)
  { id: 'hex_1_0', q: 1, r: 0, tileType: 'empty', ownerPlayerId: null, bonus: { steel: 2 } },
  { id: 'hex_1_-1', q: 1, r: -1, tileType: 'empty', ownerPlayerId: null, isOceanSlot: true, bonus: { megacredits: 2 } },
  { id: 'hex_0_-1', q: 0, r: -1, tileType: 'empty', ownerPlayerId: null, bonus: { plants: 2 } },
  { id: 'hex_-1_0', q: -1, r: 0, tileType: 'empty', ownerPlayerId: null, isOceanSlot: true, bonus: { megacredits: 2 } },
  { id: 'hex_-1_1', q: -1, r: 1, tileType: 'empty', ownerPlayerId: null, bonus: { titanium: 1 } },
  { id: 'hex_0_1', q: 0, r: 1, tileType: 'empty', ownerPlayerId: null, bonus: { plants: 1 } },

  // 바깥쪽 링 (Radius 2: 12개)
  { id: 'hex_2_0', q: 2, r: 0, tileType: 'empty', ownerPlayerId: null, bonus: { steel: 1 } },
  { id: 'hex_2_-1', q: 2, r: -1, tileType: 'empty', ownerPlayerId: null, isOceanSlot: true, bonus: { megacredits: 2 } },
  { id: 'hex_2_-2', q: 2, r: -2, tileType: 'empty', ownerPlayerId: null, bonus: { titanium: 2 } },
  { id: 'hex_1_-2', q: 1, r: -2, tileType: 'empty', ownerPlayerId: null, isOceanSlot: true, bonus: { megacredits: 2 } },
  { id: 'hex_0_-2', q: 0, r: -2, tileType: 'empty', ownerPlayerId: null, bonus: { plants: 2 } },
  { id: 'hex_-1_-1', q: -1, r: -1, tileType: 'empty', ownerPlayerId: null, bonus: { steel: 2 } },
  { id: 'hex_-2_0', q: -2, r: 0, tileType: 'empty', ownerPlayerId: null, isOceanSlot: true, bonus: { megacredits: 2 } },
  { id: 'hex_-2_1', q: -2, r: 1, tileType: 'empty', ownerPlayerId: null, bonus: { plants: 1 } },
  { id: 'hex_-2_2', q: -2, r: 2, tileType: 'empty', ownerPlayerId: null, bonus: { titanium: 1 } },
  { id: 'hex_-1_2', q: -1, r: 2, tileType: 'empty', ownerPlayerId: null, isOceanSlot: true, bonus: { megacredits: 2 } },
  { id: 'hex_0_2', q: 0, r: 2, tileType: 'empty', ownerPlayerId: null, bonus: { plants: 2 } },
  { id: 'hex_1_1', q: 1, r: 1, tileType: 'empty', ownerPlayerId: null, bonus: { steel: 1 } }
];
