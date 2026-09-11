import React, { useEffect, useState } from 'react';
import { useArnakStore } from '../store/useArnakStore';
import { calculateTotalScore } from '../engine/gameLogic';
import { RotateCcw } from 'lucide-react';
import { soundManager } from '../../../utils/sound';

interface ArnakGameOverModalProps {
  onReturnToLobby: () => void;
}

export const ArnakGameOverModal: React.FC<ArnakGameOverModalProps> = ({ onReturnToLobby }) => {
  const { isGameOver, players, initGame } = useArnakStore();
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    if (isGameOver) {
      soundManager.playGrandFanfare();
      const timer1 = setTimeout(() => setAnimationStep(1), 500);
      const timer2 = setTimeout(() => setAnimationStep(2), 1200);
      const timer3 = setTimeout(() => setAnimationStep(3), 1900);
      const timer4 = setTimeout(() => setAnimationStep(4), 2600);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    } else {
      setAnimationStep(0);
    }
  }, [isGameOver]);

  if (!isGameOver) return null;

  // 전체 플레이어 최종 점수 계산 및 랭킹 정렬
  const playerScores = players.map(p => {
    const scores = calculateTotalScore(p);
    return {
      player: p,
      ...scores
    };
  }).sort((a, b) => b.totalScore - a.totalScore);

  const winner = playerScores[0];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 15, 12, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '720px',
        backgroundColor: '#0f172a',
        border: '2px solid #10b981',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.4)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        color: '#f8fafc'
      }}>
        {/* 상단 승리 타이틀 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '4px' }}>🏆</div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            아르낙의 잊혀진 유적 탐험 완료!
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#34d399' }}>
            5대 라운드의 정글 탐험과 고대 사원 연구가 마침내 끝났습니다.
          </p>
        </div>

        {/* 1위 우승자 배너 */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.3) 100%)',
          border: '1.5px solid #10b981',
          borderRadius: '12px',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: winner?.player.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '18px',
              color: '#ffffff',
              boxShadow: '0 0 12px rgba(16, 185, 129, 0.6)'
            }}>
              1
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#a7f3d0' }}>최고의 수석 고고학자</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                {winner?.player.name}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#a7f3d0' }}>최종 탐험 승점</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#facc15' }}>
              {winner?.totalScore} VP
            </div>
          </div>
        </div>

        {/* 4단계 순차 점수 집계표 */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid #334155',
          borderRadius: '10px',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                <th style={{ padding: '8px 12px' }}>순위 & 플레이어</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>연구 트랙</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>사원 보너스</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>수호자 제압</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>카드 - 공포</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>총점</th>
              </tr>
            </thead>
            <tbody>
              {playerScores.map((ps, idx) => (
                <tr key={ps.player.id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, color: idx === 0 ? '#fbbf24' : '#94a3b8' }}>{idx + 1}위</span>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: ps.player.color }} />
                    <span style={{ fontWeight: 700 }}>{ps.player.name}</span>
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center', color: '#34d399', fontWeight: 700 }}>
                    {animationStep >= 1 ? `+${ps.researchPoints}점` : '...'}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center', color: '#fbbf24', fontWeight: 700 }}>
                    {animationStep >= 2 ? `+${ps.templePoints}점` : '...'}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center', color: '#f43f5e', fontWeight: 700 }}>
                    {animationStep >= 3 ? `+${ps.guardianPoints}점` : '...'}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center', color: '#cbd5e1' }}>
                    {animationStep >= 4 ? `+${ps.cardPoints} - ${ps.fearPenalty}` : '...'}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 900, color: '#facc15', fontSize: '0.9rem' }}>
                    {animationStep >= 4 ? `${ps.totalScore}점` : '...'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 액션 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
          <button
            onClick={() => {
              soundManager.playClick();
              initGame(players.length, true);
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={14} /> 다시 플레이
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onReturnToLobby();
            }}
            style={{
              padding: '8px 20px',
              backgroundColor: '#10b981',
              border: 'none',
              borderRadius: '8px',
              color: '#022c22',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            로비로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};
