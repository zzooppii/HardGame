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
    <div className="saboteur-bottom-tray" style={{ marginTop: '16px', borderRadius: '12px' }}>
      {/* 1. 상단 라벨 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid rgba(212, 175, 55, 0.15)', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#f8fafc', letterSpacing: '0.3px' }}>
            내 주사위 및 보관소 트레이
          </span>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            나만 조작할 수 있습니다
          </span>
        </div>

        {/* 내 실시간 자원 현황 뱃지 */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <span style={{ 
            background: 'rgba(212, 175, 55, 0.15)', 
            color: '#facc15', 
            border: '1px solid rgba(212, 175, 55, 0.3)', 
            padding: '2px 8px', 
            borderRadius: '4px', 
            fontSize: '0.75rem',
            fontWeight: 700 
          }}>
            🪙 은화 {currPlayer.silverlings}개
          </span>
          <span style={{ 
            background: 'rgba(59, 130, 246, 0.15)', 
            color: '#60a5fa', 
            border: '1px solid rgba(59, 130, 246, 0.3)', 
            padding: '2px 8px', 
            borderRadius: '4px', 
            fontSize: '0.75rem',
            fontWeight: 700 
          }}>
            👷 일꾼 {currPlayer.workers}개
          </span>
          <span style={{ 
            background: 'rgba(34, 197, 94, 0.15)', 
            color: '#4ade80', 
            border: '1px solid rgba(34, 197, 94, 0.3)', 
            padding: '2px 8px', 
            borderRadius: '4px', 
            fontSize: '0.75rem',
            fontWeight: 700 
          }}>
            🏆 {currPlayer.vp} VP
          </span>
        </div>
      </div>

      {/* 2. 주사위 & 보관소 & 상품 & 버튼 메인 트레이 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
        
        {/* [A] 3D 주사위 2개 조작부 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(0,0,0,0.3)', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#d4af37' }}>
            주사위:
          </span>

          {[0, 1].map(dIdx => {
            const dieVal = currPlayer.dice[dIdx];
            const isUsed = currPlayer.usedDice[dIdx];
            const isSelected = selectedDieIndex === dIdx && !isUsed;

            return (
              <div key={dIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                  className={`die-cube-3d ${isSelected ? 'selected' : ''} ${isUsed ? 'used' : ''}`}
                  onClick={() => !isUsed && !currPlayer.isAI && selectDie(dIdx as 0 | 1)}
                  title={isUsed ? '이미 사용한 주사위입니다.' : `주사위 [${dieVal}] 선택`}
                >
                  {dieVal}
                </div>

                {/* 일꾼 보정 컨트롤 */}
                {!isUsed && !currPlayer.isAI && isSelected && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <button
                      onClick={() => adjustDieWithWorker(dIdx as 0 | 1, 1)}
                      disabled={currPlayer.workers <= 0}
                      title="일꾼 1개 소모하여 눈금 +1"
                      style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
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
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
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

        {/* [B] 타일 보관소 (사보타지 손패 카드 슬롯 감성) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#d4af37' }}>
            보관소:
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
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
                    width: '90px',
                    height: '66px',
                    borderRadius: '8px',
                    background: tile 
                      ? tile.color 
                      : 'rgba(10, 15, 13, 0.7)',
                    border: isSelected 
                      ? '2px solid #fbbf24' 
                      : (tile ? '1px solid rgba(255,255,255,0.3)' : '1px dashed rgba(212, 175, 55, 0.25)'),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    color: tile ? '#fff' : '#64748b',
                    cursor: tile && !currPlayer.isAI ? 'pointer' : 'default',
                    boxShadow: isSelected 
                      ? '0 0 16px rgba(250, 204, 21, 0.6), 0 4px 10px rgba(0,0,0,0.5)' 
                      : (tile ? '0 4px 10px rgba(0,0,0,0.5)' : 'inset 0 2px 5px rgba(0,0,0,0.6)'),
                    transform: isSelected ? 'translateY(-4px)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tile ? (
                    <>
                      <span style={{ fontSize: '1.25rem' }}>{tile.icon}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '82px', marginTop: '2px' }}>
                        {tile.name}
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: '0.68rem', opacity: 0.5 }}>빈 슬롯</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* [C] 보유 상품 슬롯 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#d4af37' }}>
            상품:
          </span>

          <div style={{ display: 'flex', gap: '6px' }}>
            {currPlayer.goods.length === 0 ? (
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>없음</span>
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
                      gap: '5px',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      background: g.color,
                      color: '#fff',
                      border: canSell ? '1.5px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                      cursor: canSell ? 'pointer' : 'default',
                      opacity: canSell ? 1 : 0.5,
                      boxShadow: canSell ? '0 0 10px rgba(255,255,255,0.4)' : 'none'
                    }}
                  >
                    <span style={{ fontWeight: 800, fontSize: '0.75rem', background: 'rgba(0,0,0,0.35)', padding: '1px 4px', borderRadius: '3px' }}>
                      {g.dieNumber}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>{g.name}</span>
                    {canSell && <span style={{ fontSize: '0.68rem', color: '#fef08a' }}>[매각]</span>}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* [D] 일꾼 2개 영입 버튼 (사보타지 우측 하단 액션 버튼 스타일) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn-gold"
            onClick={() => takeWorkersAction()}
            disabled={selectedDieIndex === null || currPlayer.usedDice[selectedDieIndex] || currPlayer.isAI}
            style={{
              padding: '10px 16px',
              fontSize: '0.82rem',
              borderRadius: '6px',
              fontWeight: 800
            }}
            title="선택한 주사위 1개로 일꾼 토큰 2개 획득"
          >
            <Users size={15} /> 일꾼 +2 영입
          </button>
        </div>

      </div>
    </div>
  );
};
