import React from 'react';
import { useLeHavreStore } from '../store/useLeHavreStore';
import { SUPPLY_TILES } from '../data/rounds';
import { Ship, ArrowDownToLine } from 'lucide-react';
import { soundManager } from '../../../utils/sound';

export const PortDocksBoard: React.FC = () => {
  const { 
    docks, 
    currentSupplyTileIndex, 
    takeDockAction, 
    players, 
    currentTurnPlayerIndex,
    isGameOver 
  } = useLeHavreStore();

  const currPlayer = players[currentTurnPlayerIndex];
  const isMyTurn = currPlayer && !currPlayer.isAI && !isGameOver;
  const currentSupplyTile = SUPPLY_TILES[currentSupplyTileIndex];

  return (
    <div className="saboteur-board-panel" style={{
      padding: '12px 14px',
      background: 'linear-gradient(180deg, rgba(10, 25, 47, 0.95) 0%, rgba(6, 17, 34, 0.95) 100%)',
      border: '1.5px solid rgba(56, 189, 248, 0.35)',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      height: '100%',
      boxSizing: 'border-box'
    }}>
      
      {/* 상단: 보급선 입항 현황 트랙 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(56, 189, 248, 0.08)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '8px',
        padding: '6px 12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Ship size={16} color="#38bdf8" />
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc' }}>
            입항 보급선 No.{currentSupplyTile.id}
          </span>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            (다음 전진 시 상품 입고)
          </span>
        </div>

        {/* 7단계 순환 램프 */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {SUPPLY_TILES.map((st, idx) => (
            <div
              key={st.id}
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.65rem',
                fontWeight: 800,
                background: idx === currentSupplyTileIndex ? '#38bdf8' : 'rgba(255,255,255,0.06)',
                color: idx === currentSupplyTileIndex ? '#0f172a' : '#64748b',
                border: idx === currentSupplyTileIndex ? '1px solid #7dd3fc' : '1px solid rgba(255,255,255,0.08)',
                boxShadow: idx === currentSupplyTileIndex ? '0 0 8px rgba(56, 189, 248, 0.6)' : 'none'
              }}
            >
              {st.id}
            </div>
          ))}
        </div>
      </div>

      {/* 헤더 안내문 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#e2e8f0' }}>
            ⚓ 르아브르 항구 7대 공급 도크 (Docks)
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: isMyTurn ? '#4ade80' : '#94a3b8' }}>
          {isMyTurn ? '💡 도크 클릭 시 누적 상품 전량 획득' : '대기 중'}
        </span>
      </div>

      {/* 7개 도크 슬롯 리스트 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '8px',
        flex: 1,
        minHeight: 0
      }}>
        {docks.map((dock) => {
          const hasGoods = dock.count > 0;

          return (
            <button
              key={dock.id}
              disabled={!isMyTurn || !hasGoods}
              onClick={() => {
                soundManager.playClick();
                takeDockAction(dock.id);
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 6px',
                borderRadius: '10px',
                background: hasGoods 
                  ? 'linear-gradient(180deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)' 
                  : 'rgba(15, 23, 42, 0.4)',
                border: hasGoods 
                  ? `1.5px solid ${dock.color}` 
                  : '1px dashed rgba(255, 255, 255, 0.1)',
                cursor: isMyTurn && hasGoods ? 'pointer' : 'default',
                opacity: hasGoods ? 1 : 0.45,
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: hasGoods ? `0 4px 12px rgba(0, 0, 0, 0.5)` : 'none'
              }}
              title={hasGoods ? `${dock.name} ${dock.count}개 즉시 획득` : '비어 있음'}
            >
              {/* 상단 도크 이름 */}
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1', textAlign: 'center', lineHeight: 1.1 }}>
                {dock.name.split(' ')[0]}
              </div>

              {/* 중앙 대형 아이콘 */}
              <div style={{ 
                fontSize: '1.8rem', 
                margin: '6px 0',
                filter: hasGoods ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' : 'grayscale(1)' 
              }}>
                {dock.icon}
              </div>

              {/* 하단 누적 수량 뱃지 */}
              <div style={{
                background: hasGoods ? dock.color : 'rgba(255,255,255,0.08)',
                color: hasGoods ? '#0f172a' : '#64748b',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 900,
                minWidth: '28px',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px'
              }}>
                {hasGoods && <ArrowDownToLine size={11} />}
                {dock.count}
              </div>

              {/* 클릭 가능 표시 펄스 테두리 */}
              {isMyTurn && hasGoods && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '10px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  pointerEvents: 'none'
                }} />
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
};
