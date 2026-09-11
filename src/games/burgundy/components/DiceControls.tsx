import React from 'react';
import { useBurgundyStore } from '../store/useBurgundyStore';
import { Users } from 'lucide-react';

export const DiceControls: React.FC = () => {
  const {
    players,
    currentTurnPlayerIndex,
    selectedDieIndex,
    selectDie,
    adjustDieWithWorker,
    takeWorkersAction,
    uiTheme
  } = useBurgundyStore();

  const isTabletop = uiTheme === 'tabletop';
  const currPlayer = players[currentTurnPlayerIndex];
  if (!currPlayer) return null;

  return (
    <div style={{
      background: isTabletop ? 'linear-gradient(145deg, #fdf6e2 0%, #ecdcb9 100%)' : 'rgba(15, 23, 42, 0.85)',
      borderRadius: '12px',
      padding: '14px 16px',
      border: isTabletop ? '2px solid #8a6534' : '1px solid var(--border-subtle)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px',
      boxShadow: isTabletop ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
    }}>
      {/* 1. 주사위 2개 표시 및 선택 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isTabletop ? '#2b1805' : 'var(--gold-secondary)' }}>
          🎲 내 주사위:
        </span>

        {[0, 1].map(dIdx => {
          const dieVal = currPlayer.dice[dIdx];
          const isUsed = currPlayer.usedDice[dIdx];
          const isSelected = selectedDieIndex === dIdx && !isUsed;

          return (
            <div key={dIdx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => !isUsed && !currPlayer.isAI && selectDie(dIdx as 0 | 1)}
                disabled={isUsed || currPlayer.isAI}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: isUsed 
                    ? 'rgba(0,0,0,0.3)' 
                    : (isSelected 
                        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                        : (isTabletop ? '#fffdf7' : '#1e293b')),
                  border: isSelected 
                    ? '2.5px solid #fff' 
                    : (isTabletop ? '2px solid #a17845' : '1.5px solid var(--border-subtle)'),
                  color: isUsed ? '#64748b' : (isSelected ? '#fff' : (isTabletop ? '#2b1805' : '#f8fafc')),
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  cursor: isUsed || currPlayer.isAI ? 'not-allowed' : 'pointer',
                  boxShadow: isSelected ? '0 0 14px rgba(245, 158, 11, 0.6)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  opacity: isUsed ? 0.45 : 1
                }}
              >
                <span>{dieVal}</span>
              </button>

              {/* 일꾼 소모 주사위 눈금 ±1 보정 버튼 */}
              {!isUsed && !currPlayer.isAI && isSelected && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <button
                    onClick={() => adjustDieWithWorker(dIdx as 0 | 1, 1)}
                    disabled={currPlayer.workers <= 0}
                    title="일꾼 1개를 소모하여 눈금 +1 (6 다음은 1)"
                    style={{
                      padding: '2px 5px',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      background: currPlayer.workers > 0 ? '#3b82f6' : '#64748b',
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
                    title="일꾼 1개를 소모하여 눈금 -1 (1 다음은 6)"
                    style={{
                      padding: '2px 5px',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      background: currPlayer.workers > 0 ? '#3b82f6' : '#64748b',
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

      {/* 2. 주사위 기본 액션: 일꾼 2개 영입 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          className="btn-secondary"
          onClick={() => takeWorkersAction()}
          disabled={selectedDieIndex === null || currPlayer.usedDice[selectedDieIndex] || currPlayer.isAI}
          style={{
            padding: '8px 14px',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          title="선택한 주사위 1개를 사용하여 일꾼 토큰 2개를 가져옵니다."
        >
          <Users size={14} /> 일꾼 +2 영입
        </button>
      </div>
    </div>
  );
};
