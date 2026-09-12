import React from 'react';
import { usePuertoRicoStore } from '../store/usePuertoRicoStore';
import { BUILDINGS_CATALOG } from '../data/buildings';
import { calculateBuildingCost } from '../engine/gameLogic';
import type { BuildingDef } from '../types';

interface BuildingMarketBoardProps {
  onSelectBuilding?: (buildingId: string) => void;
  isBuilderPhase?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export const BuildingMarketBoard: React.FC<BuildingMarketBoardProps> = ({ 
  onSelectBuilding, 
  isBuilderPhase = false,
  isOpen = false,
  onClose
}) => {
  const { players, currentTurnPlayerIndex, roleCards } = usePuertoRicoStore();
  const currPlayer = players[currentTurnPlayerIndex];

  const roleCard = roleCards.find(rc => rc.role === 'builder');
  const hasBuilderPrivilege = isBuilderPhase && roleCard?.selectedByPlayerId === currPlayer?.id;

  // 4개 행별 건물 분류 (스크린샷 3번의 4단계 채석장 할인 구조 완벽 일치)
  const TIER_1_IDS = ['small_indigo', 'small_sugar', 'small_market', 'hacienda', 'construction_hut', 'small_warehouse'];
  const TIER_2_IDS = ['large_indigo', 'large_sugar', 'hospice', 'office', 'large_market', 'large_warehouse'];
  const TIER_3_IDS = ['tobacco_storage', 'coffee_roaster', 'factory', 'university', 'harbor', 'wharf'];
  const TIER_4_IDS = ['guild_hall', 'residence', 'fortress', 'customs_house', 'city_hall'];

  const TIERS = [
    { level: 1, label: '일반 건물 (1단계)', quarryMax: 1, ids: TIER_1_IDS },
    { level: 2, label: '일반 건물 (2단계)', quarryMax: 2, ids: TIER_2_IDS },
    { level: 3, label: '일반 건물 (3단계)', quarryMax: 3, ids: TIER_3_IDS },
    { level: 4, label: '고급 건물 (4단계)', quarryMax: 4, ids: TIER_4_IDS }
  ];

  // 공급량 계산 (일반 건물 2채, 대형 건물 1채)
  const getRemainingStock = (def: BuildingDef) => {
    const totalMax = def.category === 'large' ? 1 : 2;
    const builtCount = players.reduce((sum, p) => {
      return sum + (p.buildings.some(b => b.buildingId === def.id) ? 1 : 0);
    }, 0);
    return Math.max(0, totalMax - builtCount);
  };

  const content = (
    <div 
      className="saboteur-board-panel"
      style={{
        padding: '14px 18px',
        borderRadius: '12px',
        background: 'linear-gradient(180deg, #fdf6e2 0%, #faecd0 100%)',
        border: '3px solid #b45309',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.75), inset 0 0 50px rgba(180, 83, 9, 0.1)',
        color: '#2b1805',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxSizing: 'border-box',
        maxWidth: '1200px',
        width: '100%'
      }}
    >
      {/* 1. 상단 보드 헤더 (양피지 건축 설계도 감성) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #b45309', paddingBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.3rem' }}>🏛️</span>
          <div>
            <h3 className="font-serif" style={{ fontSize: '1.15rem', fontWeight: 900, color: '#78350f', margin: 0 }}>
              산후안 공용 건물 보드판 (City Buildings Board)
            </h3>
            <span style={{ fontSize: '0.7rem', color: '#854d0e', fontWeight: 600 }}>
              일반 건물 각 2채 한정 | 대형 고급 건물 각 1채 한정
            </span>
          </div>
        </div>

        {/* 깃펜과 잉크병 & 금화 장식 & 닫기 버튼 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(120, 53, 15, 0.1)', padding: '4px 10px', borderRadius: '20px', border: '1px solid #d4af37' }}>
            <span style={{ fontSize: '1.1rem' }}>✒️</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#92400e' }}>
              건축 허가소
            </span>
            <span style={{ fontSize: '1rem' }}>🪙</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: '#991b1b',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              ✕ 닫기
            </button>
          )}
        </div>
      </div>

      {/* 2. 4단계 건물 그리드 (스크린샷 3번의 채석장 할인 라인 완벽 구현) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {TIERS.map(tier => (
          <div 
            key={tier.level}
            style={{
              display: 'grid',
              gridTemplateColumns: '85px 1fr',
              gap: '10px',
              alignItems: 'stretch',
              background: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '8px',
              border: '1px solid #d4c19c',
              padding: '6px 8px'
            }}
          >
            {/* 좌측: 채석장 할인 인디케이터 (스크린샷 3번 좌측 채석장 1~4개 뱃지) */}
            <div style={{
              background: 'linear-gradient(180deg, #57534e 0%, #292524 100%)',
              borderRadius: '6px',
              border: '1.5px solid #d4af37',
              padding: '6px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              textAlign: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
            }}>
              <span style={{ fontSize: '1.1rem' }}>⛏️</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#fef08a' }}>
                채석장 {tier.quarryMax}개
              </span>
              <span style={{ fontSize: '0.58rem', color: '#cbd5e1' }}>
                최대 {tier.quarryMax}🪙 할인
              </span>
            </div>

            {/* 우측: 해당 티어의 건물 카드들 */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${tier.ids.length}, 1fr)`, gap: '6px' }}>
              {tier.ids.map(bId => {
                const def = BUILDINGS_CATALOG.find(b => b.id === bId);
                if (!def) return null;

                const remaining = getRemainingStock(def);
                const isOutOfStock = remaining <= 0;
                const alreadyOwned = currPlayer?.buildings.some(b => b.buildingId === def.id);

                let cost = def.cost;
                let canAfford = false;
                if (currPlayer) {
                  cost = calculateBuildingCost(def, currPlayer, !!hasBuilderPrivilege);
                  canAfford = currPlayer.doubloons >= cost;
                }

                const canBuild = isBuilderPhase && !alreadyOwned && !isOutOfStock && canAfford;

                return (
                  <div
                    key={def.id}
                    onClick={() => {
                      if (canBuild && onSelectBuilding) {
                        onSelectBuilding(def.id);
                      }
                    }}
                    style={{
                      background: isOutOfStock 
                        ? '#e5e7eb' 
                        : (def.category === 'large' 
                            ? 'linear-gradient(180deg, #fef08a 0%, #fde047 100%)' 
                            : '#ffffff'),
                      border: canBuild 
                        ? '2px solid #22c55e' 
                        : (isOutOfStock ? '1px dashed #9ca3af' : '1.5px solid #854d0e'),
                      borderRadius: '6px',
                      padding: '6px 5px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      opacity: isOutOfStock ? 0.45 : (alreadyOwned ? 0.65 : 1),
                      boxShadow: canBuild 
                        ? '0 0 12px rgba(34, 197, 94, 0.6)' 
                        : '0 2px 4px rgba(0,0,0,0.15)',
                      cursor: canBuild ? 'pointer' : 'default',
                      minHeight: '76px',
                      transition: 'transform 0.15s ease'
                    }}
                    onMouseEnter={e => {
                      if (canBuild) e.currentTarget.style.transform = 'scale(1.03)';
                    }}
                    onMouseLeave={e => {
                      if (canBuild) e.currentTarget.style.transform = 'scale(1)';
                    }}
                    title={`${def.koreanName}: ${def.desc} (비용: ${cost}🪙, VP: ${def.vp})`}
                  >
                    {/* 카드 헤더: 좌측 비용(원형) & 우측 VP(육각형) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {/* 비용 원형 뱃지 */}
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: '#ca8a04',
                        color: '#fff',
                        fontSize: '0.68rem',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #713f12'
                      }}>
                        {def.cost}
                      </div>

                      {/* 일꾼 슬롯 도트 */}
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {Array.from({ length: def.maxColonists }).map((_, cIdx) => (
                          <div
                            key={cIdx}
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              border: '1px solid #78350f',
                              background: 'rgba(0,0,0,0.08)'
                            }}
                            title="일꾼 슬롯"
                          />
                        ))}
                      </div>

                      {/* VP 육각형 뱃지 */}
                      <div style={{
                        width: '18px',
                        height: '18px',
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                        background: '#0284c7',
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {def.vp}
                      </div>
                    </div>

                    {/* 건물명 */}
                    <div style={{ textAlign: 'center', padding: '2px 0' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#451a03', lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {def.koreanName}
                      </div>
                      <div style={{ fontSize: '0.58rem', color: '#78350f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
                        {def.desc}
                      </div>
                    </div>

                    {/* 카드 푸터: 재고 & 구매 상태 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.58rem', borderTop: '1px solid rgba(120, 53, 15, 0.15)', paddingTop: '2px' }}>
                      <span style={{ color: remaining > 0 ? '#15803d' : '#dc2626', fontWeight: 700 }}>
                        재고 {remaining}
                      </span>
                      {canBuild && (
                        <span style={{ color: '#16a34a', fontWeight: 900 }}>
                          [{cost}🪙 건설!]
                        </span>
                      )}
                      {alreadyOwned && (
                        <span style={{ color: '#6b7280', fontWeight: 600 }}>
                          보유중
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (isOpen) {
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 400,
          padding: '16px',
          overflowY: 'auto'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) onClose();
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};
