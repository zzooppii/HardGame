import type { CorporationCard } from '../types';

export const CORPORATIONS_DATA: CorporationCard[] = [
  {
    id: 'corp_tharsis',
    name: '타시스 공화국 (Tharsis Republic)',
    nameEn: 'Tharsis Republic',
    startingMegacredits: 40,
    startingResources: { steel: 2 },
    startingProduction: { megacredits: 1 },
    flavorText: '화성 최초의 독립 정부를 수립하고 인류의 거대 도시를 주도하는 공화국입니다.',
    specialAbility: '화성에 새 도시가 건설될 때마다 M€ 생산량 +1 및 3 M€ 즉시 수령.'
  },
  {
    id: 'corp_ecoline',
    name: '에코라인 (Ecoline)',
    nameEn: 'Ecoline',
    startingMegacredits: 36,
    startingResources: { plants: 3 },
    startingProduction: { plants: 2 },
    flavorText: '유전자 조작 식물과 온실 돔을 통해 붉은 행성을 푸른 오아시스로 변모시킵니다.',
    specialAbility: '식물 7개만으로 녹지 타일을 조성할 수 있습니다 (기본 8개).'
  },
  {
    id: 'corp_helion',
    name: '헬리온 (Helion)',
    nameEn: 'Helion',
    startingMegacredits: 42,
    startingResources: { heat: 4 },
    startingProduction: { heat: 3 },
    flavorText: '태양 궤도 거울과 지열 에너지를 독점하여 화성의 기온을 급상승시킵니다.',
    specialAbility: '열 자원을 언제든지 1:1로 메가크레딧(M€)처럼 사용할 수 있습니다.'
  },
  {
    id: 'corp_mining_guild',
    name: '마이닝 길드 (Mining Guild)',
    nameEn: 'Mining Guild',
    startingMegacredits: 30,
    startingResources: { steel: 5 },
    startingProduction: { steel: 1 },
    flavorText: '화성 지각에 풍부한 철광석과 희토류를 채굴하는 광업 연합체입니다.',
    specialAbility: '강철 또는 티타늄 배치 보너스를 획득할 때마다 강철 생산량 +1.'
  },
  {
    id: 'corp_inventors',
    name: '인벤터스 길드 (Inventors Guild)',
    nameEn: 'Inventors Guild',
    startingMegacredits: 45,
    startingResources: { energy: 2 },
    startingProduction: { energy: 1 },
    flavorText: '화성 테라포밍에 필요한 혁신적인 특허 기술과 과학 장비를 보급합니다.',
    specialAbility: '매 세대 카드 연구 시 카드 1장을 무료로 획득할 수 있습니다.'
  }
];
