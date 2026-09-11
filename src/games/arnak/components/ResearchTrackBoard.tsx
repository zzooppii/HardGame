import React from 'react';
import { useArnakStore } from '../store/useArnakStore';
import { RESEARCH_TRACK, TEMPLE_BONUS_TILES } from '../data/research';
import { canAdvanceResearch } from '../engine/gameLogic';
import { Search, Book, Trophy } from 'lucide-react';

export const ResearchTrackBoard: React.FC = () => {
  const { 
    players, 
    currentTurnPlayerIndex, 
    advanceResearchAction, 
    playMode, 
    myPlayerId 
  } = useArnakStore();

  const currPlayer = players[currentTurnPlayerIndex];
  const isMyTurn = playMode === 'online' 
    ? currPlayer?.id === myPlayerId 
    : (currPlayer && !currPlayer.isAI);

  const canGlass = currPlayer ? canAdvanceResearch(currPlayer, 'glass') : { canAdvance: false };
  const canBook = currPlayer ? canAdvanceResearch(currPlayer, 'book') : { canAdvance: false };

  return (
    <div style={{
      background: 'rgba(8, 20, 18, 0.95)',
      border: '1.5px solid rgba(16, 185, 129, 0.35)',
      borderRadius: '12px',
      padding: '10px 14px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      position: 'relative'
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
        borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
        paddingBottom: '6px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🏛️</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
              잃어버린 사원 연구 트랙
            </h3>
            <span style={{ fontSize: '0.65rem', color: '#6ee7b7' }}>RESEARCH TRACK (돋보기 🔍 & 수첩 📖)</span>
          </div>
        </div>

        {/* 연구 액션 버튼 */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => {
              if (isMyTurn && canGlass.canAdvance) {
                advanceResearchAction('glass');
              }
            }}
            disabled={!isMyTurn || !canGlass.canAdvance}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: canGlass.canAdvance ? '1px solid #10b981' : '1px solid #334155',
              background: canGlass.canAdvance ? 'linear-gradient(135deg, #065f46 0%, #047857 100%)' : '#1e293b',
              color: canGlass.canAdvance ? '#ecfdf5' : '#64748b',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: canGlass.canAdvance && isMyTurn ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: canGlass.canAdvance ? '0 2px 8px rgba(16,185,129,0.3)' : 'none'
            }}
            title={canGlass.reason || '돋보기 전진'}
          >
            <Search size={12} />
            <span>돋보기 전진</span>
          </button>

          <button
            onClick={() => {
              if (isMyTurn && canBook.canAdvance) {
                advanceResearchAction('book');
              }
            }}
            disabled={!isMyTurn || !canBook.canAdvance}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: canBook.canAdvance ? '1px solid #f59e0b' : '1px solid #334155',
              background: canBook.canAdvance ? 'linear-gradient(135deg, #78350f 0%, #b45309 100%)' : '#1e293b',
              color: canBook.canAdvance ? '#fffbeb' : '#64748b',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: canBook.canAdvance && isMyTurn ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: canBook.canAdvance ? '0 2px 8px rgba(245,158,11,0.3)' : 'none'
            }}
            title={canBook.reason || '수첩 전진'}
          >
            <Book size={12} />
            <span>수첩 전진</span>
          </button>
        </div>
      </div>

      {/* 잃어버린 사원 보너스 타일 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(6, 78, 59, 0.4)',
        border: '1px dashed #10b981',
        borderRadius: '8px',
        padding: '4px 10px',
        marginBottom: '8px',
        fontSize: '0.7rem',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#6ee7b7' }}>
          <Trophy size={13} color="#facc15" />
          <span style={{ fontWeight: 700 }}>사원 최상층 보너스 타일:</span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {TEMPLE_BONUS_TILES.map((pts, i) => (
            <span
              key={i}
              style={{
                background: '#f59e0b',
                color: '#022c22',
                padding: '1px 6px',
                borderRadius: '4px',
                fontWeight: 900,
                fontSize: '0.7rem'
              }}
            >
              +{pts}점
            </span>
          ))}
        </div>
      </div>

      {/* 5단계 연구 트랙 목록 (5단계 -> 0단계 역순 렌더링) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        overflowY: 'auto',
        flex: 1,
        paddingRight: '4px'
      }}>
        {[...RESEARCH_TRACK].reverse().map((step) => {
          const playersAtGlass = players.filter(p => p.glassStep === step.step);
          const playersAtBook = players.filter(p => p.bookStep === step.step);

          return (
            <div
              key={step.step}
              style={{
                background: step.step === 5 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.75)',
                border: step.step === 5 ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '6px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: step.step === 5 ? '#f59e0b' : '#334155',
                    color: step.step === 5 ? '#0f172a' : '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.65rem'
                  }}>
                    {step.step}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>
                    {step.name}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '6px', fontSize: '0.7rem' }}>
                  <span style={{ color: '#34d399', fontWeight: 800 }}>🔍 {step.glassPoints}점</span>
                  <span style={{ color: '#fbbf24', fontWeight: 800 }}>📖 {step.bookPoints}점</span>
                </div>
              </div>

              {/* 비용 및 보너스 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94a3b8' }}>
                <div>{step.bonusDesc}</div>
                {step.step > 0 && (
                  <div style={{ color: '#cbd5e1' }}>
                    비용: {Object.entries(step.glassCost).map(([k, v]) => `${k} ${v}`).join(', ')}
                  </div>
                )}
              </div>

              {/* 해당 단계에 위치한 플레이어 토큰들 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                {playersAtGlass.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span style={{ fontSize: '0.65rem' }}>🔍:</span>
                    {playersAtGlass.map(p => (
                      <span
                        key={p.id}
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: p.color,
                          display: 'inline-block',
                          border: '1.5px solid #ffffff'
                        }}
                        title={`${p.name} 돋보기`}
                      />
                    ))}
                  </div>
                )}

                {playersAtBook.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span style={{ fontSize: '0.65rem' }}>📖:</span>
                    {playersAtBook.map(p => (
                      <span
                        key={p.id}
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '2px',
                          backgroundColor: p.color,
                          display: 'inline-block',
                          border: '1.5px solid #ffffff'
                        }}
                        title={`${p.name} 연구 수첩`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
