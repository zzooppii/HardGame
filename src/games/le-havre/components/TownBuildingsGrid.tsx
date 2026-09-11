import React from 'react';
import { useLeHavreStore } from '../store/useLeHavreStore';
import type { BuildingCard } from '../types';
import { Building2, User, Coins } from 'lucide-react';
import { soundManager } from '../../../utils/sound';

export const TownBuildingsGrid: React.FC = () => {
  const { 
    buildings, 
    players, 
    currentTurnPlayerIndex, 
    isGameOver,
    selectBuildingForDetail,
    buyBuildingWithCash
  } = useLeHavreStore();

  const currPlayer = players[currentTurnPlayerIndex];
  const isMyTurn = currPlayer && !currPlayer.isAI && !isGameOver;

  const getOwnerBadge = (b: BuildingCard) => {
    if (b.ownerId === 'town') {
      return <span style={{ fontSize: '0.65rem', background: 'rgba(148, 163, 184, 0.2)', color: '#cbd5e1', padding: '1px 6px', borderRadius: '4px' }}>공공</span>;
    }
    const owner = players.find(p => p.id === b.ownerId);
    if (owner) {
      return (
        <span style={{ 
          fontSize: '0.65rem', 
          background: owner.color, 
          color: '#fff', 
          padding: '1px 6px', 
          borderRadius: '4px',
          fontWeight: 700 
        }}>
          {owner.name.split(' ')[0]}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="saboteur-board-panel" style={{
      padding: '12px 14px',
      background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(9, 14, 26, 0.95) 100%)',
      border: '1.5px solid rgba(212, 175, 55, 0.35)',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      height: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      
      {/* 상단 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={16} color="#facc15" />
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc' }}>
            🏛️ 르아브르 시가지 건물 거리 (Town Street)
          </span>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            (일꾼을 보내 가공/건설 액션 수행)
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
          총 {buildings.length}채 활성화
        </span>
      </div>

      {/* 건물 카드 스크롤 그리드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
        gap: '8px',
        flex: 1,
        overflowY: 'auto',
        paddingRight: '4px'
      }}>
        {buildings.map((b) => {
          const isOccupied = b.workerOnBuilding !== null;
          const occupant = isOccupied ? players.find(p => p.id === b.workerOnBuilding) : null;
          const canBuy = b.ownerId === 'town' && b.buyCostFranc > 0 && currPlayer && currPlayer.francs >= b.buyCostFranc && isMyTurn;

          return (
            <div
              key={b.id}
              onClick={() => {
                soundManager.playClick();
                selectBuildingForDetail(b);
              }}
              style={{
                background: isOccupied 
                  ? 'rgba(30, 41, 59, 0.6)' 
                  : 'rgba(20, 30, 45, 0.9)',
                border: isOccupied 
                  ? '1px solid rgba(255,255,255,0.1)' 
                  : '1.2px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '8px',
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.15s ease',
                boxShadow: isOccupied ? 'none' : '0 2px 6px rgba(0,0,0,0.3)',
                minHeight: '105px'
              }}
              className="building-hover-card"
            >
              {/* 카드 상단: 이름 & 소유자 배지 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '4px' }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.15 }}>
                    {b.name}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                    {b.nameEn}
                  </div>
                </div>
                {getOwnerBadge(b)}
              </div>

              {/* 카드 중단: 설명 요약 */}
              <div style={{ 
                fontSize: '0.7rem', 
                color: '#cbd5e1', 
                lineHeight: 1.25, 
                margin: '4px 0',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {b.description}
              </div>

              {/* 카드 하단: 입장료 & 가치(VP) & 점유 현황 */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderTop: '1px solid rgba(255,255,255,0.06)',
                paddingTop: '4px',
                fontSize: '0.7rem' 
              }}>
                <div style={{ display: 'flex', gap: '6px', color: '#94a3b8' }}>
                  <span>입장: {b.entryCost.food > 0 ? `🍖${b.entryCost.food}` : (b.entryCost.franc > 0 ? `🪙${b.entryCost.franc}` : '무료')}</span>
                  <span style={{ color: '#facc15' }}>가치 {b.value}VP</span>
                </div>

                {/* 현재 점유 중인 일꾼 표시 */}
                {isOccupied ? (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '3px', 
                    background: occupant?.color || '#ef4444', 
                    color: '#fff',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontSize: '0.65rem',
                    fontWeight: 800 
                  }}>
                    <User size={10} />
                    <span>{occupant?.name.split(' ')[0]}</span>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.65rem', color: '#4ade80', fontWeight: 700 }}>
                    이용 가능
                  </span>
                )}
              </div>

              {/* 현금 즉시 매입 버튼 (타운 소유 건물이면서 돈이 충분할 때) */}
              {canBuy && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    buyBuildingWithCash(b.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: 'rgba(234, 179, 8, 0.9)',
                    border: 'none',
                    color: '#1a1003',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}
                  title={`현금 ${b.buyCostFranc} 프랑으로 건물 즉시 매입`}
                >
                  <Coins size={10} /> 매입({b.buyCostFranc}F)
                </button>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
