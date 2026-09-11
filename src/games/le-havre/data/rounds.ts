import type { SupplyTile, RoundInfo, DockState } from '../types';

export const SUPPLY_TILES: SupplyTile[] = [
  { id: 1, goods: ['franc', 'fish'] },
  { id: 2, goods: ['wood', 'clay'] },
  { id: 3, goods: ['iron', 'grain'] },
  { id: 4, goods: ['cattle', 'fish'] },
  { id: 5, goods: ['wood', 'clay'] },
  { id: 6, goods: ['franc', 'iron'] },
  { id: 7, goods: ['grain', 'cattle'] }
];

export const INITIAL_DOCKS: DockState[] = [
  { id: 'franc', name: '프랑 (현금)', resource: 'franc', count: 1, icon: '🪙', color: '#facc15' },
  { id: 'fish', name: '어획 도크', resource: 'fish', count: 2, icon: '🐟', color: '#38bdf8' },
  { id: 'wood', name: '목재 도크', resource: 'wood', count: 2, icon: '🪵', color: '#a16207' },
  { id: 'clay', name: '점토 도크', resource: 'clay', count: 1, icon: '🧱', color: '#ea580c' },
  { id: 'iron', name: '철 도크', resource: 'iron', count: 0, icon: '⛓️', color: '#94a3b8' },
  { id: 'grain', name: '곡물 도크', resource: 'grain', count: 1, icon: '🌾', color: '#eab308' },
  { id: 'cattle', name: '가축 도크', resource: 'cattle', count: 0, icon: '🐄', color: '#ef4444' }
];

export const ROUNDS_DATA: RoundInfo[] = [
  {
    roundNumber: 1,
    foodRequired: 3,
    harvestGrain: false,
    breedCattle: false,
    newBuildingsReleased: ['b-smoke', 'b-charcoal'],
    newShipReleased: null
  },
  {
    roundNumber: 2,
    foodRequired: 4,
    harvestGrain: true,
    breedCattle: false,
    newBuildingsReleased: ['b-brick', 'b-bakery'],
    newShipReleased: null
  },
  {
    roundNumber: 3,
    foodRequired: 5,
    harvestGrain: true,
    breedCattle: true,
    newBuildingsReleased: ['b-butcher', 'b-wharf'],
    newShipReleased: 'wood'
  },
  {
    roundNumber: 4,
    foodRequired: 7,
    harvestGrain: true,
    breedCattle: true,
    newBuildingsReleased: ['b-tannery'],
    newShipReleased: 'wood'
  },
  {
    roundNumber: 5,
    foodRequired: 9,
    harvestGrain: true,
    breedCattle: true,
    newBuildingsReleased: ['b-ironworks', 'b-coke'],
    newShipReleased: 'iron'
  },
  {
    roundNumber: 6,
    foodRequired: 11,
    harvestGrain: true,
    breedCattle: true,
    newBuildingsReleased: ['b-shipping'],
    newShipReleased: 'steel'
  },
  {
    roundNumber: 7,
    foodRequired: 13,
    harvestGrain: true,
    breedCattle: true,
    newBuildingsReleased: ['b-bank'],
    newShipReleased: 'luxury'
  }
];
