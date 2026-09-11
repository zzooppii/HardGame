import React, { useEffect, useState } from 'react';
import { useCavernaStore } from '../store/useCavernaStore';
import { calculateCavernaScore } from '../engine/gameLogic';
import { Trophy, Crown, RotateCcw, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../../utils/sound';
import { usePlatformStore } from '../../../platform/store/usePlatformStore';

interface CavernaGameOverModalProps {
  onReturnToLobby: () => void;
}

export const CavernaGameOverModal: React.FC<CavernaGameOverModalProps> = ({ onReturnToLobby }) => {
  const { isGameOver, players, availableFurnishings, initGame, myPlayerId } = useCavernaStore();
  const [stage, setStage] = useState<number>(1);

  useEffect(() => {
    if (!isGameOver) {
      setStage(1);
      return;
    }

    // 전적 및 업적 플랫폼 저장
    const scoredPlayers = players.map(p => ({
      player: p,
      ...calculateCavernaScore(p, availableFurnishings)
    })).sort((a, b) => b.total - a.total);

    const myRank = scoredPlayers.findIndex(sp => sp.player.id === myPlayerId) + 1;
    const myResult = scoredPlayers.find(sp => sp.player.id === myPlayerId) || scoredPlayers[0];
    const isWinner = myRank === 1;

    usePlatformStore.getState().recordGameResult({
      gameId: 'caverna',
      gameTitle: '카베르나: 동굴 농부들',
      isWin: isWinner,
      rank: myRank > 0 ? myRank : 1,
      myScore: myResult.total,
      totalPlayers: players.length,
      maxScore: scoredPlayers[0]?.total || myResult.total
    });

    // 4단계 순차 공개 애니메이션
    const timer1 = setTimeout(() => {
      setStage(2);
      soundManager.playWoodToken();
    }, 1200);

    const timer2 = setTimeout(() => {
      setStage(3);
      soundManager.playCoin();
    }, 2400);

    const timer3 = setTimeout(() => {
      setStage(4);
      soundManager.playGrandFanfare();

      // 화려한 금빛 축포
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#f97316', '#eab308']
      });
    }, 3600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isGameOver]);

  if (!isGameOver || players.length === 0) return null;

  // 전체 플레이어 점수 계산 및 랭킹 정렬
  const scoredPlayers = players.map(p => {
    const score = calculateCavernaScore(p, availableFurnishings);
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
      backgroundColor: 'rgba(5, 8, 15, 0.9)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 600,
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(180deg, #1c130c 0%, #0a0604 100%)',
        border: '2px solid rgba(249, 115, 22, 0.6)',
        width: '100%',
        maxWidth: '820px',
        maxHeight: '90vh',
        borderRadius: '20px',
        boxShadow: '0 25px 70px rgba(0, 0, 0, 0.95), 0 0 40px rgba(249, 115, 22, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: '#f8fafc'
      }}>
        {/* 헤더 배너 */}
        <div style={{
          padding: '20px 24px',
          background: 'linear-gradient(90deg, rgba(249, 115, 22, 0.2) 0%, rgba(234, 179, 8, 0.15) 100%)',
          borderBottom: '1px solid rgba(249, 115, 22, 0.3)',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 14px',
            borderRadius: '20px',
            background: 'rgba(249, 115, 22, 0.2)',
            border: '1px solid rgba(249, 115, 22, 0.5)',
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#fb923c',
            marginBottom: '8px'
          }}>
            <Trophy size={14} /> 카베르나 일족 번영도 최종 정산
          </div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#f8fafc' }}>
            산속 동굴 왕국의 최종 챔피언
          </h2>
        </div>

        {/* 1위 우승자 카드 */}
        <div style={{ padding: '16px 24px 0', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            padding: '12px 28px',
            borderRadius: '12px',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(234, 179, 8, 0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Crown size={20} color="#facc15" />
              <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#facc15' }}>
                {winner.player.name}
              </span>
              <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#f8fafc', marginLeft: '8px' }}>
                {stage >= 4 ? `${winner.score.total} 점` : '계산 중...'}
              </span>
            </div>
          </div>
        </div>

        {/* 플레이어별 세부 스코어 카드 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {scoredPlayers.map(({ player, score }, idx) => (
            <div
              key={player.id}
              style={{
                borderRadius: '12px',
                padding: '12px 16px',
                background: idx === 0 ? 'rgba(249, 115, 22, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                border: idx === 0 ? '1.5px solid rgba(249, 115, 22, 0.5)' : '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: player.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 900
                  }}>
                    {idx + 1}
                  </span>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#f8fafc' }}>
                    {player.name}
                  </span>
                </div>

                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: idx === 0 ? '#facc15' : '#94a3b8' }}>
                  {stage >= 4 ? `${score.total} 점` : '집계 중...'}
                </span>
              </div>

              {/* 브레이크다운 칩들 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', fontSize: '0.7rem', textAlign: 'center' }}>
                <div style={{ padding: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                  <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.62rem' }}>드워프 가족</span>
                  <strong style={{ color: '#38bdf8' }}>{stage >= 1 ? `+${score.dwarfScore}` : '-'}</strong>
                </div>
                <div style={{ padding: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                  <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.62rem' }}>목축 가축</span>
                  <strong style={{ color: '#4ade80' }}>{stage >= 2 ? `${score.livestockScore}` : '-'}</strong>
                </div>
                <div style={{ padding: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                  <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.62rem' }}>농작물</span>
                  <strong style={{ color: '#fde047' }}>{stage >= 3 ? `+${score.cropScore}` : '-'}</strong>
                </div>
                <div style={{ padding: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                  <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.62rem' }}>방 타일</span>
                  <strong style={{ color: '#fb923c' }}>{stage >= 3 ? `+${score.furnishingScore}` : '-'}</strong>
                </div>
                <div style={{ padding: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                  <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.62rem' }}>금화 & 루비</span>
                  <strong style={{ color: '#f43f5e' }}>{stage >= 4 ? `+${score.goldScore + score.rubyScore}` : '-'}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 푸터 액션 버튼 */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(20, 13, 8, 0.9)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setStage(4)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '0.72rem',
              cursor: 'pointer'
            }}
          >
            결과 즉시 보기 ▶
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                soundManager.playDiceRoll();
                initGame(2, true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#f8fafc',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={14} /> 다시 하기
            </button>

            <button
              onClick={onReturnToLobby}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                borderRadius: '8px',
                background: '#ea580c',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              <Home size={14} /> 로비로 이동
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
