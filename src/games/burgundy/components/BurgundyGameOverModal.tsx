import React, { useEffect } from 'react';
import { useBurgundyStore } from '../store/useBurgundyStore';
import { calculateFinalScore } from '../engine/gameLogic';
import confetti from 'canvas-confetti';
import { RotateCcw, Home } from 'lucide-react';
import { soundManager } from '../../../utils/sound';

export const BurgundyGameOverModal: React.FC<{ onReturnToLobby: () => void }> = ({ onReturnToLobby }) => {
  const { isGameOver, players, initGame } = useBurgundyStore();

  useEffect(() => {
    if (isGameOver) {
      soundManager.playFanfare();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [isGameOver]);

  if (!isGameOver) return null;

  // 플레이어별 최종 점수 정산 및 순위 정렬
  const scoredPlayers = players.map(p => {
    const score = calculateFinalScore(p);
    return {
      player: p,
      score
    };
  }).sort((a, b) => b.score.total - a.score.total);

  const winner = scoredPlayers[0];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 8, 15, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '20px'
    }}>
      <div 
        className="glass-panel" 
        style={{
          width: '100%',
          maxWidth: '680px',
          padding: '36px',
          background: 'linear-gradient(145deg, #1e2538 0%, #0d131f 100%)',
          border: '2px solid var(--gold-secondary)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.9), 0 0 40px rgba(229, 169, 60, 0.3)',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>🏰</div>
        <h2 className="font-serif text-gold-gradient" style={{ fontSize: '2rem', marginBottom: '6px' }}>
          버건디의 성 게임 종료!
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          5개 페이즈(A~E)가 모두 완료되어 최종 점수를 정산합니다.
        </p>

        {/* 1위 우승자 배너 */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(229, 169, 60, 0.2) 0%, rgba(245, 158, 11, 0.05) 100%)',
          border: '1.5px solid var(--gold-primary)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--gold-secondary)', fontWeight: 600 }}>
            부르고뉴 최고의 영주 (1위 우승)
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>
            {winner.player.name}
          </div>
          <div style={{ fontSize: '1.1rem', color: 'var(--gold-primary)', fontWeight: 700 }}>
            총 {winner.score.total} 승점 (VP)
          </div>
        </div>

        {/* 점수 종합표 */}
        <div style={{ marginBottom: '28px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>순위</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>플레이어</th>
                <th style={{ padding: '8px' }}>인게임 VP</th>
                <th style={{ padding: '8px' }}>은화</th>
                <th style={{ padding: '8px' }}>일꾼</th>
                <th style={{ padding: '8px' }}>남은 상품</th>
                <th style={{ padding: '8px' }}>지식 보너스</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>최종 점수</th>
              </tr>
            </thead>
            <tbody>
              {scoredPlayers.map((item, idx) => (
                <tr 
                  key={item.player.id}
                  style={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    background: idx === 0 ? 'rgba(229, 169, 60, 0.1)' : 'transparent'
                  }}
                >
                  <td style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 700, color: idx === 0 ? 'var(--gold-primary)' : 'inherit' }}>
                    #{idx + 1}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 600 }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: item.player.color, marginRight: '6px' }} />
                    {item.player.name}
                  </td>
                  <td style={{ padding: '10px 8px' }}>{item.score.breakdown.inGameVp}점</td>
                  <td style={{ padding: '10px 8px' }}>+{item.score.breakdown.silver}점</td>
                  <td style={{ padding: '10px 8px' }}>+{item.score.breakdown.workers}점</td>
                  <td style={{ padding: '10px 8px' }}>+{item.score.breakdown.goods}점</td>
                  <td style={{ padding: '10px 8px' }}>+{item.score.breakdown.knowledge}점</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 800, color: 'var(--gold-secondary)', fontSize: '1.05rem' }}>
                    {item.score.total} VP
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 하단 액션 버튼 */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button 
            className="btn-gold" 
            onClick={() => initGame(players.length, true)}
          >
            <RotateCcw size={18} /> 새 게임 시작
          </button>
          <button 
            className="btn-secondary" 
            onClick={onReturnToLobby}
          >
            <Home size={18} /> 로비로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};
