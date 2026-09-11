import type { ProjectCard } from '../types';

export const INITIAL_PROJECT_CARDS: ProjectCard[] = [
  {
    id: 'card_asteroid',
    name: '소행성 충돌 (Asteroid)',
    nameEn: 'Asteroid',
    cost: 14,
    tags: ['space', 'event'],
    effects: {
      tempSteps: 1, // 온도 +2°C
      resourceChange: { titanium: 2 }
    },
    victoryPoints: 0,
    description: '소행성을 지표면에 충돌시켜 기온을 2°C 올리고 티타늄 2개를 얻습니다.'
  },
  {
    id: 'card_deimos_down',
    name: '데이모스 낙하 (Deimos Down)',
    nameEn: 'Deimos Down',
    cost: 31,
    tags: ['space', 'event'],
    effects: {
      tempSteps: 3, // 온도 +6°C
      resourceChange: { steel: 4 }
    },
    victoryPoints: 0,
    description: '화성의 위성 데이모스를 지표면에 추락시켜 온도를 6°C 급상승시킵니다.'
  },
  {
    id: 'card_geothermal_power',
    name: '지열 발전소 (Geothermal Power)',
    nameEn: 'Geothermal Power',
    cost: 11,
    tags: ['power', 'building'],
    effects: {
      productionChange: { energy: 2 }
    },
    victoryPoints: 0,
    description: '화성 내부 열을 이용해 에너지 생산량을 +2 증가시킵니다.'
  },
  {
    id: 'card_nuclear_power',
    name: '원자력 발전소 (Nuclear Power)',
    nameEn: 'Nuclear Power',
    cost: 10,
    tags: ['power', 'building'],
    effects: {
      productionChange: { energy: 3, megacredits: -2 }
    },
    victoryPoints: 0,
    description: '에너지 생산량을 +3 증가시키지만 M€ 생산량이 -2 감소합니다.'
  },
  {
    id: 'card_algae',
    name: '해조류 배양 (Algae)',
    nameEn: 'Algae',
    cost: 10,
    tags: ['plant'],
    requirements: { minOceans: 2 },
    effects: {
      productionChange: { plants: 2 },
      resourceChange: { plants: 1 }
    },
    victoryPoints: 0,
    description: '바다에 해조류를 퍼뜨려 식물 생산량을 +2 올립니다. (해양 2개 이상 필요)'
  },
  {
    id: 'card_mangrove',
    name: '맹그로브 군락 (Mangrove)',
    nameEn: 'Mangrove',
    cost: 12,
    tags: ['plant'],
    requirements: { minTemperature: 4 },
    effects: {
      placeTile: 'greenery'
    },
    victoryPoints: 1,
    description: '온화해진 해안가에 녹지를 즉시 조성합니다. (온도 4°C 이상 필요)'
  },
  {
    id: 'card_domed_crater',
    name: '크레이터 돔 도시 (Domed Crater)',
    nameEn: 'Domed Crater',
    cost: 24,
    tags: ['city', 'building'],
    requirements: { maxOxygen: 7 },
    effects: {
      productionChange: { megacredits: 3, energy: -1 },
      placeTile: 'city'
    },
    victoryPoints: 1,
    description: '거대 충돌구에 돔을 씌워 도시를 건설하고 M€ 생산량을 +3 올립니다.'
  },
  {
    id: 'card_noctis_city',
    name: '녹티스 시티 (Noctis City)',
    nameEn: 'Noctis City',
    cost: 18,
    tags: ['city', 'building'],
    effects: {
      productionChange: { megacredits: 3, energy: -1 },
      placeTile: 'city'
    },
    victoryPoints: 0,
    description: '녹티스 라비린투스 협곡에 인류의 핵심 거점 도시를 건설합니다.'
  },
  {
    id: 'card_space_mirrors',
    name: '태양광 반사 거울 (Space Mirrors)',
    nameEn: 'Space Mirrors',
    cost: 3,
    tags: ['space', 'power'],
    effects: {
      productionChange: { energy: 1 }
    },
    victoryPoints: 0,
    description: '궤도 거울을 배치해 에너지 생산량을 +1 증가시킵니다.'
  },
  {
    id: 'card_ironworks',
    name: '제철소 설립 (Ironworks)',
    nameEn: 'Ironworks',
    cost: 11,
    tags: ['building'],
    effects: {
      productionChange: { steel: 1 }
    },
    victoryPoints: 0,
    description: '화성 제철소를 건립해 강철 생산량을 +1 증가시킵니다.'
  },
  {
    id: 'card_strip_mine',
    name: '노천 광산 (Strip Mine)',
    nameEn: 'Strip Mine',
    cost: 25,
    tags: ['building'],
    effects: {
      productionChange: { steel: 2, titanium: 1, energy: -2 },
      oxygenSteps: 1 // 산소 +1%
    },
    victoryPoints: 0,
    description: '대규모 노천 광산을 채굴해 강철 +2, 티타늄 +1 생산량을 올립니다.'
  },
  {
    id: 'card_import_hydrogen',
    name: '수소 수입선 (Import of Hydrogen)',
    nameEn: 'Import of Hydrogen',
    cost: 16,
    tags: ['space', 'earth'],
    effects: {
      oceanCount: 1, // 해양 +1
      productionChange: { plants: 1 }
    },
    victoryPoints: 0,
    description: '외행성에서 수소를 수입해 바다 1개를 채우고 식물 생산을 늘립니다.'
  },
  {
    id: 'card_ice_asteroid',
    name: '얼음 소행성 유도 (Ice Asteroid)',
    nameEn: 'Ice Asteroid',
    cost: 23,
    tags: ['space', 'event'],
    effects: {
      oceanCount: 2 // 해양 +2개
    },
    victoryPoints: 0,
    description: '얼음으로 가득 찬 소행성 2개를 충돌시켜 해양 타일 2개를 배치합니다.'
  },
  {
    id: 'card_greenhouse',
    name: '대형 온실 공장 (Greenhouses)',
    nameEn: 'Greenhouses',
    cost: 6,
    tags: ['plant', 'building'],
    effects: {
      resourceChange: { plants: 4 }
    },
    victoryPoints: 0,
    description: '즉시 식물 자원 4개를 수확합니다.'
  },
  {
    id: 'card_microbes',
    name: '호극성 박테리아 (Extremophiles)',
    nameEn: 'Extremophiles',
    cost: 4,
    tags: ['microbe'],
    effects: {
      tempSteps: 1 // 온도 +2°C
    },
    victoryPoints: 0,
    description: '극저온에서 번식하는 박테리아를 방류해 온도를 2°C 올립니다.'
  },
  {
    id: 'card_subterranean_reservoir',
    name: '지하 대수층 개발 (Sub-Zero Reservoir)',
    nameEn: 'Sub-Zero Reservoir',
    cost: 11,
    tags: ['event'],
    effects: {
      oceanCount: 1
    },
    victoryPoints: 0,
    description: '지하에 갇힌 빙하수를 퍼올려 해양 타일 1개를 배치합니다.'
  },
  {
    id: 'card_space_elevator',
    name: '우주 엘리베이터 (Space Elevator)',
    nameEn: 'Space Elevator',
    cost: 27,
    tags: ['space', 'building'],
    effects: {
      productionChange: { titanium: 1, megacredits: 5 }
    },
    victoryPoints: 2,
    description: '화성 궤도 엘리베이터를 완공하여 티타늄과 M€ 생산을 폭발적으로 증대시킵니다.'
  },
  {
    id: 'card_research_outpost',
    name: '화성 과학 전초기지 (Research Outpost)',
    nameEn: 'Research Outpost',
    cost: 18,
    tags: ['science', 'building', 'city'],
    effects: {
      productionChange: { energy: -1 },
      placeTile: 'city'
    },
    victoryPoints: 1,
    description: '모든 프로젝트 카드 플레이 비용을 영구히 1 M€ 할인하는 연구 도시를 짓습니다.'
  },
  {
    id: 'card_terraforming_ganymede',
    name: '가니메데 테라포밍 (Terraforming Ganymede)',
    nameEn: 'Terraforming Ganymede',
    cost: 33,
    tags: ['space', 'earth'],
    effects: {
      trBonus: 2
    },
    victoryPoints: 2,
    description: '목성의 위성 가니메데까지 개척을 확장하여 TR +2와 승점을 얻습니다.'
  },
  {
    id: 'card_trees',
    name: '침엽수림 식재 (Trees)',
    nameEn: 'Trees',
    cost: 13,
    tags: ['plant'],
    requirements: { minTemperature: -4 },
    effects: {
      productionChange: { plants: 3 },
      resourceChange: { plants: 1 },
      placeTile: 'greenery'
    },
    victoryPoints: 1,
    description: '영하 4도 이상에서 생존하는 침엽수림 녹지를 조성합니다.'
  }
];
