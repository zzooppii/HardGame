import React from 'react';
import { useBurgundyStore } from '../store/useBurgundyStore';

export const PlayerStorage: React.FC = () => {
  const {
    players,
    currentTurnPlayerIndex,
    selectedKeySlotIndex,
    selectedDieIndex,
    selectKeySlot,
    sellGoodsAction,
    uiTheme
  } = useBurgundyStore();

  const isTabletop = uiTheme === 'tabletop';
  const currPlayer = players[currentTurnPlayerIndex];
  if (!currPlayer) return null;

  const activeDie = (selectedDieIndex !== null && !currPlayer.usedDice[selectedDieIndex]) ? currPlayer.dice[selectedDieIndex] : null;

  return (
    <div style={{
      background: isTabletop ? 'linear-gradient(145deg, #f7efe1 0%, #e2d2b5 100%)' : 'rgba(15, 23, 42, 0.75)',
      borderRadius: '14px',
      padding: '16px',
      border: isTabletop ? '2px solid #8a6534' : '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      boxShadow: isTabletop ? '0 8px 24px rgba(0,0,0,0.3)' : 'none'
    }}>
      {/* 1. 자원 요약 바 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isTabletop ? '1px solid #d4c19c' : '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="badge" style={{ background: 'rgba(234, 179, 8, 0.15)', color: isTabletop ? '#854d0e' : '#facc15', border: '1px solid #facc15' }}>
            🪙 은화 {currPlayer.silverlings}개
          </span>
          <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: isTabletop ? '#1e40af' : '#60a5fa', border: '1px solid #60a5fa' }}>
            👷 일꾼 {currPlayer.workers}개
          </span>
        </div>
        <div style={{ fontSize: '0.8rem', color: isTabletop ? '#6b441a' : 'var(--text-muted)' }}>
          판매한 상품: {currPlayer.soldGoodsCount}개
        </div>
      </div>

      {/* 2. 개인 타일 보관소 (Key Slots: 3칸) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isTabletop ? '#2b1805' : 'var(--gold-secondary)' }}>
            📦 타일 보관소 ({currPlayer.keySlots.filter(Boolean).length}/3)
          </span>
          <span style={{ fontSize: '0.72rem', color: isTabletop ? '#664d30' : 'var(--text-muted)' }}>
            보관된 타일을 클릭 후 영지에 배치하세요
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {currPlayer.keySlots.map((tile, sIdx) => {
            const isSelected = selectedKeySlotIndex === sIdx && tile !== null;

            return (
              <div
                key={sIdx}
                onClick={() => {
                  if (tile && !currPlayer.isAI) {
                    selectKeySlot(isSelected ? null : sIdx);
                  }
                }}
                style={{
                  height: '75px',
                  borderRadius: '10px',
                  background: tile 
                    ? tile.color 
                    : (isTabletop ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.25)'),
                  border: isSelected 
                    ? '2.5px solid #fbbf24' 
                    : (tile ? '1px solid rgba(255,255,255,0.3)' : (isTabletop ? '1.5px dashed #bfa57d' : '1.5px dashed rgba(255,255,255,0.15)')),
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px',
                  color: tile ? '#fff' : 'var(--text-muted)',
                  cursor: tile && !currPlayer.isAI ? 'pointer' : 'default',
                  boxShadow: isSelected ? '0 0 14px rgba(251, 191, 36, 0.7)' : 'none',
                  transition: 'all 0.2s ease',
                  transform: isSelected ? 'translateY(-2px)' : 'none'
                }}
              >
                {tile ? (
                  <>
                    <span style={{ fontSize: '1.4rem' }}>{tile.icon}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '2px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                      {tile.name}
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>빈 슬롯</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 보유 상품 슬롯 (판매 가능) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isTabletop ? '#2b1805' : 'var(--gold-secondary)' }}>
            🏷️ 보유 상품 ({currPlayer.goods.length}개)
          </span>
          <span style={{ fontSize: '0.72rem', color: isTabletop ? '#664d30' : 'var(--text-muted)' }}>
            주사위 눈금과 일치하는 상품 클릭 시 매각
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {currPlayer.goods.length === 0 ? (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>보유한 상품이 없습니다.</div>
          ) : (
            currPlayer.goods.map(g => {
              const canSell = activeDie === g.dieNumber && !currPlayer.isAI;

              return (
                <button
                  key={g.id}
                  onClick={() => canSell && sellGoodsAction(g.dieNumber)}
                  disabled={!canSell}
                  title={`${g.name} (${g.dieNumber}번 주사위로 매각 가능)`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: g.color,
                    color: '#fff',
                    border: canSell ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                    cursor: canSell ? 'pointer' : 'default',
                    opacity: canSell ? 1 : 0.6,
                    boxShadow: canSell ? '0 0 10px rgba(255,255,255,0.4)' : 'none'
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: '0.8rem', background: 'rgba(0,0,0,0.3)', padding: '2px 5px', borderRadius: '4px' }}>
                    {g.dieNumber}
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{g.name}</span>
                  {canSell && <span style={{ fontSize: '0.7rem', color: '#fef08a' }}>[매각]</span>}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
