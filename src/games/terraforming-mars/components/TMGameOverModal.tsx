import React, { useEffect, useState } from 'react';
import { useTMStore } from '../store/useTMStore';
import { calculateTotalScore } from '../engine/gameLogic';
import { RotateCcw } from 'lucide-react';
import { soundManager } from '../../../utils/sound';
import { usePlatformStore } from '../../../platform/store/usePlatformStore';

interface TMGameOverModalProps {
  onReturnToLobby: () => void;
}

export const TMGameOverModal: React.FC<TMGameOverModalProps> = ({ onReturnToLobby }) => {
  const { isGameOver, players, mapSlots, initGame, myPlayerId } = useTMStore();
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    if (isGameOver) {
      soundManager.playGrandFanfare();

      // 전적 및 업적 플랫폼 저장
      const playerScores = players.map(p => ({
        player: p,
        ...calculateTotalScore(p, mapSlots)
      })).sort((a, b) => b.totalScore - a.totalScore);

      const myRank = playerScores.findIndex(ps => ps.player.id === myPlayerId) + 1;
      const myResult = playerScores.find(ps => ps.player.id === myPlayerId) || playerScores[0];
      const isWinner = myRank === 1;

      usePlatformStore.getState().recordGameResult({
        gameId: 'terraforming-mars',
        gameTitle: '테라포밍 마스',
        isWin: isWinner,
        rank: myRank > 0 ? myRank : 1,
        myScore: myResult.totalScore,
        totalPlayers: players.length,
        maxScore: playerScores[0]?.totalScore || myResult.totalScore
      });

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
  }, [isGameOver, myPlayerId, players, mapSlots]);

  if (!isGameOver) return null;

  const playerScores = players.map(p => {
    const scores = calculateTotalScore(p, mapSlots);
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
      backgroundColor: 'rgba(5, 5, 10, 0.85)',
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
        border: '2px solid #ef4444',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.4)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        color: '#f8fafc'
      }}>
        {/* 상단 타이틀 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '4px' }}>🏆</div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            화성 테라포밍 프로젝트 완수!
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#fca5a5' }}>
            붉은 행성이 인류의 새로운 녹색 오아시스로 변모했습니다.
          </p>
        </div>

        {/* 1위 우승 기업 배너 */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(185, 28, 28, 0.35) 100%)',
          border: '1.5px solid #ef4444',
          borderRadius: '12px',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: winner?.player.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '18px',
              color: '#ffffff',
              boxShadow: '0 0 12px rgba(239, 68, 68, 0.6)'
            }}>
              1
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#fca5a5' }}>화성 최고 기여 기업</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                {winner?.player.name} ({winner?.player.corporation.name})
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#fca5a5' }}>최종 테라포밍 승점</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#facc15' }}>
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
                <th style={{ padding: '8px 12px' }}>순위 & 기업</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>TR 점수</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>녹지 타일</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>도시 인접 녹지</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>카드 승점</th>
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
                  <td style={{ padding: '8px', textAlign: 'center', color: '#f87171', fontWeight: 700 }}>
                    {animationStep >= 1 ? `${ps.trScore}점` : '...'}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center', color: '#10b981', fontWeight: 700 }}>
                    {animationStep >= 2 ? `+${ps.greeneryScore}점` : '...'}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center', color: '#c084fc', fontWeight: 700 }}>
                    {animationStep >= 3 ? `+${ps.cityScore}점` : '...'}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center', color: '#fbbf24', fontWeight: 700 }}>
                    {animationStep >= 4 ? `+${ps.cardScore}점` : '...'}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 900, color: '#facc15', fontSize: '0.95rem' }}>
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
              backgroundColor: '#ef4444',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
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
