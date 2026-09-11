import React, { useEffect, useState } from 'react';
import { useLeHavreStore } from '../store/useLeHavreStore';
import { calculateFinalScoreLeHavre } from '../engine/gameLogic';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, Sparkles, Crown, Coins, Building2, Ship, AlertTriangle, FastForward } from 'lucide-react';
import { soundManager } from '../../../utils/sound';
import { usePlatformStore } from '../../../platform/store/usePlatformStore';

interface LeHavreGameOverModalProps {
  onReturnToLobby: () => void;
}

// 롤링 숫자 카운터 컴포넌트
const RollingNumber: React.FC<{ value: number; duration?: number; onTick?: () => void }> = ({
  value,
  duration = 800,
  onTick
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const totalSteps = Math.min(25, Math.max(10, Math.abs(end)));
    const stepTime = duration / totalSteps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / totalSteps;
      const current = Math.round(start + (end - start) * progress);
      setDisplayValue(current);
      if (onTick && currentStep % 2 === 0) {
        onTick();
      }

      if (currentStep >= totalSteps) {
        setDisplayValue(end);
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, duration, onTick]);

  return <span>{displayValue}</span>;
};

export const LeHavreGameOverModal: React.FC<LeHavreGameOverModalProps> = ({ onReturnToLobby }) => {
  const { isGameOver, players, buildings, ships, initGame, myPlayerId } = useLeHavreStore();

  const [stage, setStage] = useState<number>(0);

  useEffect(() => {
    if (isGameOver) {
      setStage(1);
      soundManager.playCoin();

      // 전적 및 업적 플랫폼 저장
      const scoredPlayers = players.map(p => ({
        player: p,
        ...calculateFinalScoreLeHavre(p, buildings, ships)
      })).sort((a, b) => b.total - a.total);

      const myRank = scoredPlayers.findIndex(sp => sp.player.id === myPlayerId) + 1;
      const myResult = scoredPlayers.find(sp => sp.player.id === myPlayerId) || scoredPlayers[0];
      const isWinner = myRank === 1;

      usePlatformStore.getState().recordGameResult({
        gameId: 'le-havre',
        gameTitle: '르아브르',
        isWin: isWinner,
        rank: myRank > 0 ? myRank : 1,
        myScore: myResult.total,
        totalPlayers: players.length,
        maxScore: scoredPlayers[0]?.total || myResult.total
      });

      const t1 = setTimeout(() => {
        setStage(2);
        soundManager.playBuild();
      }, 1200);

      const t2 = setTimeout(() => {
        setStage(3);
        soundManager.playShipCargo();
      }, 2400);

      const t3 = setTimeout(() => {
        setStage(4);
        soundManager.playGrandFanfare();

        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6, x: 0.3 }, colors: ['#38bdf8', '#34d399', '#f59e0b'] });
        setTimeout(() => {
          confetti({ particleCount: 90, spread: 80, origin: { y: 0.55, x: 0.7 }, colors: ['#ffd700', '#facc15', '#ffffff'] });
        }, 350);
        setTimeout(() => {
          confetti({ particleCount: 110, spread: 100, origin: { y: 0.5, x: 0.5 }, colors: ['#0284c7', '#059669', '#d97706'] });
        }, 700);
      }, 3600);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      setStage(0);
    }
  }, [isGameOver]);

  if (!isGameOver) return null;

  // 플레이어별 순자산 집계
  const scoredPlayers = players.map(p => {
    const score = calculateFinalScoreLeHavre(p, buildings, ships);
    return {
      player: p,
      score
    };
  }).sort((a, b) => b.score.total - a.score.total);

  const winner = scoredPlayers[0];

  const handleSkipAnimation = () => {
    setStage(4);
    soundManager.playGrandFanfare();
    confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 8, 15, 0.88)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 250,
      padding: '16px'
    }}>
      <div 
        className="glass-panel" 
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '94vh',
          overflowY: 'auto',
          padding: '28px 32px',
          background: 'linear-gradient(145deg, #091a2e 0%, #040c17 100%)',
          border: '2px solid rgba(56, 189, 248, 0.45)',
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.95), 0 0 50px rgba(56, 189, 248, 0.25)',
          position: 'relative'
        }}
      >
        {/* 스킵 버튼 */}
        {stage < 4 && (
          <button
            onClick={handleSkipAnimation}
            style={{
              position: 'absolute',
              top: '20px',
              right: '24px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <FastForward size={14} /> 즉시 결과 보기
          </button>
        )}

        {/* 상단 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(56, 189, 248, 0.12)', 
            border: '1px solid rgba(56, 189, 248, 0.3)', 
            padding: '4px 14px', 
            borderRadius: '20px', 
            marginBottom: '10px' 
          }}>
            <Sparkles size={14} color="#38bdf8" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '1px' }}>
              LE HAVRE: MASTER OF TRADE
            </span>
          </div>

          <h2 className="font-serif text-gold-gradient" style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 6px 0' }}>
            {stage === 4 ? '⚓ 르아브르 무역 제국: 최종 결산 완료' : '📊 항구 최종 자산 집계 중...'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
            7개 라운드가 끝나고 르아브르 항구 최고의 거물을 가립니다.
          </p>
        </div>

        {/* 4단계: 1위 우승자 챔피언 배너 */}
        {stage === 4 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(2, 132, 199, 0.1) 100%)',
            border: '2px solid #38bdf8',
            borderRadius: '14px',
            padding: '16px 20px',
            marginBottom: '22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 8px 24px rgba(56, 189, 248, 0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0f172a',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
              }}>
                <Crown size={28} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#7dd3fc', fontWeight: 700, letterSpacing: '1px' }}>
                  TYCOON OF LE HAVRE (최고의 해운 거물)
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff' }}>
                  {winner.player.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                  보유 건물 {winner.player.buildingsOwned.length}채 | 선박 함대 {winner.player.shipsOwned.length}척
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>최종 총자산</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#38bdf8', lineHeight: 1 }}>
                <RollingNumber value={winner.score.total} onTick={() => soundManager.playScoreTick()} />
                <span style={{ fontSize: '1rem', marginLeft: '4px', color: '#e2e8f0' }}>프랑</span>
              </div>
            </div>
          </div>
        )}

        {/* 플레이어별 상세 결산 카드 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {scoredPlayers.map((item, idx) => {
            const isFirst = idx === 0;
            const b = item.score.breakdown;

            return (
              <div 
                key={item.player.id}
                style={{
                  background: isFirst && stage === 4 
                    ? 'rgba(15, 35, 60, 0.95)' 
                    : 'rgba(10, 20, 35, 0.75)',
                  border: isFirst && stage === 4 
                    ? '1.5px solid #38bdf8' 
                    : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: isFirst ? '#38bdf8' : 'rgba(255,255,255,0.1)',
                      color: isFirst ? '#0f172a' : '#fff',
                      fontWeight: 800,
                      fontSize: '0.85rem'
                    }}>
                      {idx + 1}
                    </span>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.player.color }} />
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f8fafc' }}>
                      {item.player.name}
                    </span>
                    {item.player.isAI && (
                      <span className="badge badge-silver" style={{ fontSize: '0.65rem' }}>AI</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>총 자산:</span>
                    <span style={{ 
                      fontSize: '1.4rem', 
                      fontWeight: 900, 
                      color: isFirst ? '#38bdf8' : '#f8fafc' 
                    }}>
                      {stage >= 4 ? (
                        <RollingNumber value={item.score.total} onTick={() => soundManager.playScoreTick()} />
                      ) : (
                        b.cash
                      )}
                      <span style={{ fontSize: '0.85rem', marginLeft: '3px' }}>프랑</span>
                    </span>
                  </div>
                </div>

                {/* 4대 결산 카테고리 (현금, 건물 가치, 선박 가치, 대출 감점) */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(4, 1fr)', 
                  gap: '8px', 
                  fontSize: '0.75rem' 
                }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '8px' }}>
                    <div style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                      <Coins size={12} color="#facc15" /> 보유 현금
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#facc15' }}>
                      {b.cash} 프랑
                    </div>
                  </div>

                  <div style={{ 
                    background: 'rgba(0,0,0,0.3)', 
                    padding: '8px 10px', 
                    borderRadius: '8px',
                    opacity: stage >= 2 ? 1 : 0.4 
                  }}>
                    <div style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                      <Building2 size={12} color="#4ade80" /> 건물 가치
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#4ade80' }}>
                      +{b.buildingValue} VP
                    </div>
                  </div>

                  <div style={{ 
                    background: 'rgba(0,0,0,0.3)', 
                    padding: '8px 10px', 
                    borderRadius: '8px',
                    opacity: stage >= 3 ? 1 : 0.4 
                  }}>
                    <div style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                      <Ship size={12} color="#38bdf8" /> 선박 가치
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#38bdf8' }}>
                      +{b.shipValue} VP
                    </div>
                  </div>

                  <div style={{ 
                    background: 'rgba(0,0,0,0.3)', 
                    padding: '8px 10px', 
                    borderRadius: '8px',
                    opacity: stage >= 4 ? 1 : 0.4 
                  }}>
                    <div style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                      <AlertTriangle size={12} color="#f87171" /> 대출 감점
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: b.loanPenalty > 0 ? '#f87171' : '#94a3b8' }}>
                      -{b.loanPenalty} VP
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 하단 버튼 */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button 
            className="btn-gold" 
            onClick={() => {
              soundManager.playShipCargo();
              initGame(players.length, true);
            }}
            style={{ padding: '12px 24px', fontSize: '0.95rem' }}
          >
            <RotateCcw size={18} /> 새 게임 다시하기
          </button>
          <button 
            className="btn-secondary" 
            onClick={onReturnToLobby}
            style={{ padding: '12px 24px', fontSize: '0.95rem' }}
          >
            <Home size={18} /> 컬렉션 로비로 복귀
          </button>
        </div>
      </div>
    </div>
  );
};
