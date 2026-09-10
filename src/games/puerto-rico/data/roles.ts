import type { RoleType } from '../types';

export interface RoleDef {
  type: RoleType;
  name: string;
  koreanName: string;
  actionDesc: string;
  privilegeDesc: string;
  icon: string;
  themeColor: string;
}

export const ROLES_DATA: Record<RoleType, RoleDef> = {
  settler: {
    type: 'settler',
    name: 'Settler',
    koreanName: '개척자',
    actionDesc: '모든 플레이어는 오픈된 농장 타일 1개를 자신의 섬에 배치합니다.',
    privilegeDesc: '농장 타일 대신 [채석장] 타일을 선택할 수 있습니다 (건축 비용 할인).',
    icon: '🌱',
    themeColor: '#22c55e'
  },
  mayor: {
    type: 'mayor',
    name: 'Mayor',
    koreanName: '시장',
    actionDesc: '이주민 배에 있는 일꾼을 시계방향으로 1명씩 가져온 후, 개인판의 일꾼을 자유롭게 재배치합니다.',
    privilegeDesc: '공급처에서 [일꾼 1명]을 추가로 가져옵니다.',
    icon: '🏛️',
    themeColor: '#3b82f6'
  },
  builder: {
    type: 'builder',
    name: 'Builder',
    koreanName: '건축가',
    actionDesc: '두블론을 지불하여 자신의 도시 구역에 건물 1채를 건설합니다.',
    privilegeDesc: '건설 비용을 [1두블론 할인] 받습니다.',
    icon: '🏗️',
    themeColor: '#f59e0b'
  },
  craftsman: {
    type: 'craftsman',
    name: 'Craftsman',
    koreanName: '감독관',
    actionDesc: '일꾼이 배치된 농장과 생산 건물 조합에 맞춰 상품 자원을 공급처에서 생산합니다.',
    privilegeDesc: '자신이 이번에 생산한 상품 종류 중 [1개를 추가]로 생산합니다.',
    icon: '⚙️',
    themeColor: '#8b5cf6'
  },
  trader: {
    type: 'trader',
    name: 'Trader',
    koreanName: '상인',
    actionDesc: '상점(Trading House)에 상품 1개를 판매하여 두블론을 획득합니다 (중복 상품 불가).',
    privilegeDesc: '판매 시 [1두블론을 추가]로 획득합니다.',
    icon: '⚖️',
    themeColor: '#06b6d4'
  },
  captain: {
    type: 'captain',
    name: 'Captain',
    koreanName: '선장',
    actionDesc: '화물선(Cargo Ship)에 상품을 실어 1개당 1 승점(VP)을 얻습니다. 남은 상품은 기본 1개만 보관 가능합니다.',
    privilegeDesc: '첫 선적 시 [1 승점(VP)을 추가]로 획득합니다.',
    icon: '⚓',
    themeColor: '#38bdf8'
  },
  prospector: {
    type: 'prospector',
    name: 'Prospector',
    koreanName: '금광부',
    actionDesc: '다른 플레이어는 아무것도 하지 않습니다.',
    privilegeDesc: '공급처에서 즉시 [1두블론]을 획득합니다.',
    icon: '⛏️',
    themeColor: '#eab308'
  }
};
