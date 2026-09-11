import React from 'react';
import { useBurgundyStore } from '../store/useBurgundyStore';
import { Users } from 'lucide-react';

export const PlayerBottomTray: React.FC = () => {
  const {
    players,
    currentTurnPlayerIndex,
    selectedDieIndex,
    selectedKeySlotIndex,
    selectDie,
    selectKeySlot,
    adjustDieWithWorker,
    takeWorkersAction,
    sellGoodsAction
  } = useBurgundyStore();

  const currPlayer = players[currentTurnPlayerIndex];
  if (!currPlayer) return null;

  const activeDie = (selectedDieIndex !== null && !currPlayer.usedDice[selectedDieIndex]) ? currPlayer.dice[selectedDieIndex] : null;

  return (
    <div className="saboteur-bottom-tray" style={{ borderRadius: '10px', padding: '10px 14px' }}>
      
      {/* 1. 상단 라벨 & 실시간 자원 현황 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid rgba(212, 175, 55, 0.15)', paddingBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#f8fafc' }}>
            내 컨트롤 허브 (DICE & STORAGE)
          </span>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
            나만 조작 가능
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ 
            background: 'rgba(212, 175, 55, 0.15)', 
            color: '#facc15', 
            border: '1px solid rgba(212, 175, 55, 0.3)', 
            padding: '1px 6px', 
            borderRadius: '4px', 
            fontSize: '0.72rem',
            fontWeight: 700 
          }}>
            🪙 은화 {currPlayer.silverlings}개
          </span>
          <span style={{ 
            background: 'rgba(59, 130, 246, 0.15)', 
            color: '#60a5fa', 
            border: '1px solid rgba(59, 130, 246, 0.3)', 
            padding: '1px 6px', 
            borderRadius: '4px', 
            fontSize: '0.72rem',
            fontWeight: 700 
          }}>
            👷 일꾼 {currPlayer.workers}개
          </span>
          <span style={{ 
            background: 'rgba(34, 197, 94, 0.15)', 
            color: '#4ade80', 
            border: '1px solid rgba(34, 197, 94, 0.3)', 
            padding: '1px 6px', 
            borderRadius: '4px', 
            fontSize: '0.72rem',
            fontWeight: 700 
          }}>
            🏆 {currPlayer.vp} VP
          </span>
        </div>
      </div>

      {/* 2. 주사위 & 보관소 & 상품 & 버튼 메인 트레이 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        
        {/* [A] 3D 주사위 2개 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#d4af37' }}>
            주사위:
          </span>

          {[0, 1].map(dIdx => {
            const dieVal = currPlayer.dice[dIdx];
            const isUsed = currPlayer.usedDice[dIdx];
            const isSelected = selectedDieIndex === dIdx && !isUsed;

            return (
              <div key={dIdx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div
                  className={`die-cube-3d ${isSelected ? 'selected' : ''} ${isUsed ? 'used' : ''}`}
                  onClick={() => !isUsed && !currPlayer.isAI && selectDie(dIdx as 0 | 1)}
                  style={{ width: '38px', height: '38px', fontSize: '1.2rem' }}
                  title={isUsed ? '사용한 주사위' : `주사위 [${dieVal}] 선택`}
                >
                  {dieVal}
                </div>

                {!isUsed && !currPlayer.isAI && isSelected && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button
                      onClick={() => adjustDieWithWorker(dIdx as 0 | 1, 1)}
                      disabled={currPlayer.workers <= 0}
                      title="일꾼 1개 소모하여 눈금 +1"
                      style={{
                        padding: '1px 4px',
                        borderRadius: '3px',
                        fontSize: '0.62rem',
                        fontWeight: 900,
                        background: currPlayer.workers > 0 ? '#3b82f6' : '#475569',
                        color: '#fff',
                        border: 'none',
                        cursor: currPlayer.workers > 0 ? 'pointer' : 'not-allowed'
                      }}
                    >
                      +1
                    </button>
                    <button
                      onClick={() => adjustDieWithWorker(dIdx as 0 | 1, -1)}
                      disabled={currPlayer.workers <= 0}
                      title="일꾼 1개 소모하여 눈금 -1"
                      style={{
                        padding: '1px 4px',
                        borderRadius: '3px',
                        fontSize: '0.62rem',
                        fontWeight: 900,
                        background: currPlayer.workers > 0 ? '#3b82f6' : '#475569',
                        color: '#fff',
                        border: 'none',
                        cursor: currPlayer.workers > 0 ? 'pointer' : 'not-allowed'
                      }}
                    >
                      -1
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* [B] 타일 보관소 (3칸) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#d4af37' }}>
            보관소:
          </span>

          <div style={{ display: 'flex', gap: '6px' }}>
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
                    width: '80px',
                    height: '54px',
                    borderRadius: '6px',
                    background: tile ? tile.color : 'rgba(10, 15, 13, 0.7)',
                    border: isSelected 
                      ? '2px solid #fbbf24' 
                      : (tile ? '1px solid rgba(255,255,255,0.3)' : '1px dashed rgba(212, 175, 55, 0.25)'),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '3px',
                    color: tile ? '#fff' : '#64748b',
                    cursor: tile && !currPlayer.isAI ? 'pointer' : 'default',
                    boxShadow: isSelected 
                      ? '0 0 14px rgba(250, 204, 21, 0.6), 0 3px 8px rgba(0,0,0,0.5)' 
                      : (tile ? '0 3px 8px rgba(0,0,0,0.5)' : 'inset 0 2px 4px rgba(0,0,0,0.6)'),
                    transform: isSelected ? 'translateY(-3px)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tile ? (
                    <>
                      <span style={{ fontSize: '1.1rem' }}>{tile.icon}</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '72px' }}>
                        {tile.name}
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>빈 슬롯</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* [C] 상품 슬롯 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#d4af37' }}>
            상품:
          </span>

          <div style={{ display: 'flex', gap: '4px' }}>
            {currPlayer.goods.length === 0 ? (
              <span style={{ fontSize: '0.68rem', color: '#64748b' }}>없음</span>
            ) : (
              currPlayer.goods.map(g => {
                const canSell = activeDie === g.dieNumber && !currPlayer.isAI;

                return (
                  <button
                    key={g.id}
                    onClick={() => canSell && sellGoodsAction(g.dieNumber)}
                    disabled={!canSell}
                    title={`${g.name} (${g.dieNumber}번 주사위로 매각)`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 6px',
                      borderRadius: '5px',
                      background: g.color,
                      color: '#fff',
                      border: canSell ? '1.5px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                      cursor: canSell ? 'pointer' : 'default',
                      opacity: canSell ? 1 : 0.5,
                      boxShadow: canSell ? '0 0 8px rgba(255,255,255,0.4)' : 'none'
                    }}
                  >
                    <span style={{ fontWeight: 800, fontSize: '0.7rem', background: 'rgba(0,0,0,0.35)', padding: '1px 3px', borderRadius: '3px' }}>
                      {g.dieNumber}
                    </span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600 }}>{g.name}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* [D] 일꾼 2개 영입 버튼 */}
        <button
          className="btn-gold"
          onClick={() => takeWorkersAction()}
          disabled={selectedDieIndex === null || currPlayer.usedDice[selectedDieIndex] || currPlayer.isAI}
          style={{
            padding: '8px 12px',
            fontSize: '0.78rem',
            borderRadius: '6px',
            fontWeight: 800,
            whiteSpace: 'nowrap'
          }}
          title="선택한 주사위 1개로 일꾼 토큰 2개 획득"
        >
          <Users size={14} /> 일꾼 +2
        </button>

      </div>
    </div>
  );
};
