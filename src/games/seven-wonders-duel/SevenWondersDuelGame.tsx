import React, { useState } from 'react';
import { useDuelStore } from './store/useDuelStore';
import { MilitaryTrackBoard } from './components/MilitaryTrackBoard';
import { CardPyramidBoard } from './components/CardPyramidBoard';
import { PlayerCivilizationMat } from './components/PlayerCivilizationMat';
import { PantheonBoard } from './components/PantheonBoard';
import { DuelRuleGuideModal } from './components/DuelRuleGuideModal';
import { DuelGameOverModal } from './components/DuelGameOverModal';
import type { WonderCard } from './types';

interface SevenWondersDuelGameProps {
  onBackToLobby?: () => void;
}

export const SevenWondersDuelGame: React.FC<SevenWondersDuelGameProps> = ({ onBackToLobby }) => {
  const { 
    age, 
    currentTurnPlayerIndex, 
    players, 
    expansionMode, 
    wonderDraftPool, 
    isWonderDraftPhase,
    wonderDraftStep, 
    pickWonderInDraft,
    logs
  } = useDuelStore();
  
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showPantheonTab, setShowPantheonTab] = useState(false);

  const activePlayer = players[currentTurnPlayerIndex];
  const isMyTurn = !activePlayer?.isAI;

  // 드래프트 순서: 0(P0), 1(P1), 2(P1), 3(P0) | 4(P1), 5(P0), 6(P0), 7(P1)
  const draftTurnOrder = [0, 1, 1, 0, 1, 0, 0, 1];
  const currentDraftPlayerIdx = draftTurnOrder[wonderDraftStep] ?? 0;
  const draftPlayer = players[currentDraftPlayerIdx];
  const isDraftMyTurn = !draftPlayer?.isAI;

  const lastLog = logs && logs.length > 0 ? logs[0] : '';

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'radial-gradient(ellipse at 50% 20%, #1e1b2e 0%, #0c0a14 100%)',
      color: '#f8fafc',
      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      userSelect: 'none'
    }}>
      {/* 1. 상단 글로벌 헤더 바 */}
      <header style={{
        height: '52px',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {onBackToLobby && (
            <button
              onClick={onBackToLobby}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '6px 12px',
                color: '#cbd5e1',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
            >
              ← 로비
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🏛️</span>
            <span style={{
              fontWeight: '900',
              fontSize: '15px',
              letterSpacing: '1px',
              background: 'linear-gradient(90deg, #fde047, #f59e0b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              7 WONDERS DUEL
            </span>
            <span style={{
              fontSize: '10px',
              padding: '2px 8px',
              borderRadius: '999px',
              background: expansionMode === 'pantheon' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(59, 130, 246, 0.2)',
              border: `1px solid ${expansionMode === 'pantheon' ? '#c084fc' : '#60a5fa'}`,
              color: expansionMode === 'pantheon' ? '#e9d5ff' : '#93c5fd',
              fontWeight: '700'
            }}>
              {expansionMode === 'pantheon' ? '⚡ 판테온 확장판' : '🏛️ 일반판'}
            </span>
          </div>

          <div style={{
            fontSize: '12px',
            color: '#94a3b8',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '4px 10px',
            borderRadius: '6px'
          }}>
            제 <b style={{ color: '#fbbf24' }}>{age}</b> 시대 (Age {age})
          </div>
        </div>

        {/* 중앙: 턴 알림 & 마지막 액션 로그 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 14px',
            borderRadius: '20px',
            background: isMyTurn ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${isMyTurn ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isMyTurn ? '#22c55e' : '#ef4444',
              boxShadow: `0 0 8px ${isMyTurn ? '#22c55e' : '#ef4444'}`
            }} />
            <span style={{
              fontSize: '12px',
              fontWeight: '700',
              color: isMyTurn ? '#4ade80' : '#f87171'
            }}>
              {isMyTurn ? '내 차례 (카드 선택)' : `${activePlayer?.name} 차례 생각 중...`}
            </span>
          </div>

          {lastLog && (
            <div style={{
              fontSize: '11px',
              color: '#94a3b8',
              maxWidth: '300px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontStyle: 'italic'
            }}>
              📜 {lastLog}
            </div>
          )}
        </div>

        {/* 우측: 판테온 탭 (확장판일 때) & 규칙 버튼 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {expansionMode === 'pantheon' && (
            <button
              onClick={() => setShowPantheonTab(!showPantheonTab)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                background: showPantheonTab ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${showPantheonTab ? '#a855f7' : 'rgba(255, 255, 255, 0.12)'}`,
                color: showPantheonTab ? '#f3e8ff' : '#cbd5e1',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              ⚡ 신들의 판테온 {showPantheonTab ? '▲' : '▼'}
            </button>
          )}

          <button
            onClick={() => setShowRuleModal(true)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(234, 179, 8, 0.12)',
              border: '1px solid rgba(234, 179, 8, 0.35)',
              color: '#fef08a',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            📖 룰북 가이드
          </button>
        </div>
      </header>

      {/* 2. 불가사의 드래프트 오버레이 (게임 시작 시 4장씩 2회 드래프트) */}
      {isWonderDraftPhase && wonderDraftPool.length > 0 && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 800,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #1e1b2e 0%, #110e1f 100%)',
            border: '2px solid rgba(234, 179, 8, 0.4)',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9)',
            borderRadius: '24px',
            padding: '30px 40px',
            maxWidth: '850px',
            width: '100%',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>🏛️</div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '900',
              color: '#fde047',
              margin: '0 0 6px 0'
            }}>
              불가사의 드래프트 (Wonder Draft)
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 20px 0' }}>
              현재 선택 차례: <b style={{ color: isDraftMyTurn ? '#4ade80' : '#f87171' }}>{draftPlayer?.name}</b> 
              {isDraftMyTurn ? ' (원하는 불가사의 1개를 클릭하세요)' : ' (AI가 선택 중입니다...)'}
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              marginBottom: '20px'
            }}>
              {(wonderDraftStep < 4 ? wonderDraftPool.slice(0, 4) : wonderDraftPool).map((w: WonderCard) => {
                const canPick = isDraftMyTurn;
                return (
                  <div
                    key={w.id}
                    onClick={() => canPick && pickWonderInDraft(w.id)}
                    style={{
                      background: 'rgba(15, 23, 42, 0.85)',
                      border: '1px solid rgba(234, 179, 8, 0.3)',
                      borderRadius: '14px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      cursor: canPick ? 'pointer' : 'default',
                      transition: 'transform 0.15s, border-color 0.15s',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
                    }}
                    onMouseEnter={e => {
                      if (canPick) {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = '#facc15';
                      }
                    }}
                    onMouseLeave={e => {
                      if (canPick) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.3)';
                      }
                    }}
                  >
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#fef08a' }}>
                      {w.name}
                    </div>
                    
                    <div style={{
                      fontSize: '11px',
                      color: '#cbd5e1',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '6px',
                      padding: '6px 8px',
                      minHeight: '36px'
                    }}>
                      효과: <b>{w.effects.victoryPoints ? `${w.effects.victoryPoints}점` : ''} {w.effects.coins ? `+${w.effects.coins}원` : ''} {w.effects.militaryShields ? `방패 ${w.effects.militaryShields}개` : ''} {w.effects.extraTurn ? '추가 턴' : ''}</b>
                    </div>

                    <div style={{
                      fontSize: '10px',
                      color: '#a1a1aa',
                      marginTop: 'auto',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      paddingTop: '6px'
                    }}>
                      건설 비용: {w.cost ? Object.entries(w.cost).map(([k, v]) => `${k} x${v}`).join(', ') : '무료'}
                    </div>

                    {canPick && (
                      <button
                        style={{
                          marginTop: '6px',
                          padding: '6px 0',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                          color: '#0f172a',
                          fontSize: '12px',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        선택하기
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. 게임 메인 보드 대시보드 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* 상단 1: 군사 트랙 & 과학 진보 토큰 */}
        <div style={{
          padding: '8px 16px 0 16px',
          flexShrink: 0
        }}>
          <MilitaryTrackBoard />
        </div>

        {/* 상단 2: 확장판 판테온 보드 (열려있을 때 상단 오버레이 또는 아코디언 형태로 노출) */}
        {expansionMode === 'pantheon' && showPantheonTab && (
          <div style={{
            padding: '4px 16px',
            flexShrink: 0,
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <PantheonBoard />
          </div>
        )}

        {/* 중앙: 3단 레이아웃 (상대방 문명 / 중앙 피라미드 보드 / 내 문명) */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '320px 1fr 340px',
          gap: '12px',
          padding: '8px 16px 12px 16px',
          overflow: 'hidden',
          minHeight: 0
        }}>
          {/* 좌측: 상대 문명 (AI 또는 P2) */}
          <div style={{
            overflowY: 'auto',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            background: 'rgba(15, 23, 42, 0.4)'
          }}>
            {players[1] && (
              <PlayerCivilizationMat 
                player={players[1]} 
                isCurrentTurn={currentTurnPlayerIndex === 1} 
                isOpponent={true} 
              />
            )}
          </div>

          {/* 중앙: 피라미드 카드 드래프트 보드 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(15, 23, 42, 0.5)'
          }}>
            <CardPyramidBoard />
          </div>

          {/* 우측: 내 문명 (Player 1) */}
          <div style={{
            overflowY: 'auto',
            borderRadius: '16px',
            border: '1px solid rgba(234, 179, 8, 0.2)',
            background: 'rgba(15, 23, 42, 0.5)'
          }}>
            {players[0] && (
              <PlayerCivilizationMat 
                player={players[0]} 
                isCurrentTurn={currentTurnPlayerIndex === 0} 
                isOpponent={false} 
              />
            )}
          </div>
        </div>
      </div>

      {/* 모달 창들 */}
      <DuelRuleGuideModal isOpen={showRuleModal} onClose={() => setShowRuleModal(false)} />
      <DuelGameOverModal onBackToLobby={onBackToLobby} />
    </div>
  );
};
