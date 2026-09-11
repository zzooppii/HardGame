import React, { useEffect } from 'react';
import { useDuelStore } from '../store/useDuelStore';
import { usePlatformStore } from '../../../platform/store/usePlatformStore';
import { calculateCivilianScore } from '../engine/gameLogic';

interface DuelGameOverModalProps {
  onBackToLobby?: () => void;
}

export const DuelGameOverModal: React.FC<DuelGameOverModalProps> = ({ onBackToLobby }) => {
  const { 
    isGameOver, 
    winnerPlayerId, 
    victoryReason, 
    players, 
    militaryPosition,
    expansionMode,
    initGame 
  } = useDuelStore();
  const { recordGameResult } = usePlatformStore();

  const p0 = players[0];
  const p1 = players[1];
  const winner = players.find(p => p.id === winnerPlayerId);

  const p0Score = p0 ? calculateCivilianScore(p0, p1, true, militaryPosition).total : 0;
  const p1Score = p1 ? calculateCivilianScore(p1, p0, false, militaryPosition).total : 0;

  useEffect(() => {
    if (isGameOver && winnerPlayerId && p0 && p1) {
      const isP0Win = winnerPlayerId === p0.id;
      recordGameResult({
        gameId: 'seven-wonders-duel',
        gameTitle: `세븐 원더스 듀얼 (${expansionMode === 'pantheon' ? '판테온' : '일반판'})`,
        isWin: isP0Win,
        rank: isP0Win ? 1 : 2,
        myScore: p0Score,
        totalPlayers: 2,
        maxScore: Math.max(p0Score, p1Score),
        extraMeta: {
          victoryReason,
          expansionMode
        }
      });
    }
  }, [isGameOver, winnerPlayerId]);

  if (!isGameOver || !winner) return null;

  const getWinReasonTitle = () => {
    switch (victoryReason) {
      case 'military':
        return '⚔️ 군사적 압도 승리 (Military Supremacy)';
      case 'science':
        return '🔬 과학적 패권 승리 (Scientific Supremacy)';
      case 'civilian':
      default:
        return '🏛️ 문명 승점 판정승 (Civilian Victory)';
    }
  };

  const getWinReasonDesc = () => {
    switch (victoryReason) {
      case 'military':
        return `${winner.name}의 군대가 상대 수도를 완전히 점령하여 즉시 승리를 거두었습니다!`;
      case 'science':
        return `${winner.name}이 6종류의 서로 다른 과학 발전 심볼을 모두 정복하여 기술적 우위를 달성했습니다!`;
      case 'civilian':
      default:
        return `3세대가 모두 끝나고 민간 건물, 불가사의, 과학 토큰, 재화를 종합 합산하여 승리했습니다.`;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #1e1b2e 0%, #110e1f 100%)',
        border: '2px solid rgba(234, 179, 8, 0.4)',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(234, 179, 8, 0.2)',
        borderRadius: '24px',
        padding: '32px 40px',
        maxWidth: '560px',
        width: '90%',
        color: '#f8fafc',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '52px', marginBottom: '12px' }}>
          {winner.id === 'player1' ? '👑' : '🤖'}
        </div>

        <div style={{
          display: 'inline-block',
          padding: '4px 14px',
          borderRadius: '999px',
          background: 'rgba(234, 179, 8, 0.15)',
          border: '1px solid rgba(234, 179, 8, 0.3)',
          color: '#fbbf24',
          fontSize: '12px',
          fontWeight: '700',
          letterSpacing: '1px',
          marginBottom: '10px'
        }}>
          {expansionMode === 'pantheon' ? '⚡ 판테온 확장판' : '🏛️ 일반판 (Base)'}
        </div>

        <h2 style={{
          fontSize: '28px',
          fontWeight: '800',
          color: '#fde047',
          margin: '0 0 6px 0',
          textShadow: '0 0 20px rgba(253, 224, 71, 0.3)'
        }}>
          {winner.name} 승리!
        </h2>

        <div style={{
          fontSize: '16px',
          fontWeight: '700',
          color: '#e2e8f0',
          marginBottom: '8px'
        }}>
          {getWinReasonTitle()}
        </div>

        <p style={{
          fontSize: '13px',
          color: '#94a3b8',
          margin: '0 0 24px 0',
          lineHeight: '1.5'
        }}>
          {getWinReasonDesc()}
        </p>

        {/* 점수 정산 표 */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '16px 20px',
          marginBottom: '28px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            textAlign: 'center'
          }}>
            {players.map((p, idx) => {
              const isWin = p.id === winnerPlayerId;
              const pScore = idx === 0 ? p0Score : p1Score;
              return (
                <div
                  key={p.id}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    background: isWin ? 'rgba(234, 179, 8, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: isWin ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: isWin ? '#fef08a' : '#94a3b8',
                    marginBottom: '4px'
                  }}>
                    {p.name} {p.id === 'player1' ? '(나)' : '(상대)'}
                  </div>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: '900',
                    color: isWin ? '#fbbf24' : '#cbd5e1'
                  }}>
                    {victoryReason === 'civilian' ? `${pScore}점` : (isWin ? '승리' : '패배')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    불가사의 {p.constructedWonders.length}/4개 완성
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => initGame(p1.isAI, expansionMode)}
            style={{
              flex: 1,
              padding: '14px 20px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
              color: '#0f172a',
              fontSize: '15px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(234, 179, 8, 0.3)',
              transition: 'transform 0.1s'
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            🔄 다시 대결하기
          </button>
          {onBackToLobby && (
            <button
              onClick={onBackToLobby}
              style={{
                flex: 1,
                padding: '14px 20px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: 'rgba(255, 255, 255, 0.06)',
                color: '#f8fafc',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
            >
              🏛️ 로비로 돌아가기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
