import React, { useEffect, useState } from 'react';
import { useBurgundyStore } from '../store/useBurgundyStore';
import { calculateFinalScore } from '../engine/gameLogic';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, Award, Sparkles, Coins, Users as UsersIcon, Package, BookOpen, Crown, FastForward } from 'lucide-react';
import { soundManager } from '../../../utils/sound';
import { usePlatformStore } from '../../../platform/store/usePlatformStore';

interface BurgundyGameOverModalProps {
  onReturnToLobby: () => void;
}

// 부드러운 숫자 롤링 카운터 컴포넌트
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

    const totalSteps = Math.min(25, Math.max(10, end));
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

export const BurgundyGameOverModal: React.FC<BurgundyGameOverModalProps> = ({ onReturnToLobby }) => {
  const { isGameOver, players, initGame, myPlayerId } = useBurgundyStore();

  // 정산 스테이지: 0 (대기) -> 1 (기본 승점) -> 2 (자원 보너스) -> 3 (지식 보너스) -> 4 (최종 랭킹 발표)
  const [stage, setStage] = useState<number>(0);

  useEffect(() => {
    if (isGameOver) {
      setStage(1);
      soundManager.playWoodToken();

      // 전적 및 업적 플랫폼 저장
      const scoredPlayers = players.map(p => ({
        player: p,
        ...calculateFinalScore(p)
      })).sort((a, b) => b.total - a.total);

      const myRank = scoredPlayers.findIndex(sp => sp.player.id === myPlayerId) + 1;
      const myResult = scoredPlayers.find(sp => sp.player.id === myPlayerId) || scoredPlayers[0];
      const isWinner = myRank === 1;

      usePlatformStore.getState().recordGameResult({
        gameId: 'burgundy',
        gameTitle: '버건디의 성',
        isWin: isWinner,
        rank: myRank > 0 ? myRank : 1,
        myScore: myResult.total,
        totalPlayers: players.length,
        maxScore: scoredPlayers[0]?.total || myResult.total
      });

      // 단계별 순차 오픈 타이머
      const t1 = setTimeout(() => {
        setStage(2);
        soundManager.playCoin();
      }, 1200);

      const t2 = setTimeout(() => {
        setStage(3);
        soundManager.playParchment();
      }, 2400);

      const t3 = setTimeout(() => {
        setStage(4);
        soundManager.playGrandFanfare();

        // 3연속 축포 발사
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6, x: 0.3 }, colors: ['#f59e0b', '#10b981', '#3b82f6'] });
        setTimeout(() => {
          confetti({ particleCount: 90, spread: 80, origin: { y: 0.55, x: 0.7 }, colors: ['#eab308', '#d97706', '#ec4899'] });
        }, 350);
        setTimeout(() => {
          confetti({ particleCount: 110, spread: 100, origin: { y: 0.5, x: 0.5 }, colors: ['#ffd700', '#facc15', '#ffffff'] });
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

  // 플레이어별 최종 점수 정산 및 순위 정렬
  const scoredPlayers = players.map(p => {
    const score = calculateFinalScore(p);
    
    // 영지 통계 계산
    const placedTilesCount = p.duchy.filter(s => s.placedTile !== null).length;
    const uniqueRegions = Array.from(new Set(p.duchy.map(s => s.regionId)));
    const completedRegionsCount = uniqueRegions.filter(rid => 
      p.duchy.filter(s => s.regionId === rid).every(s => s.placedTile !== null)
    ).length;

    return {
      player: p,
      score,
      stats: {
        placedTilesCount,
        completedRegionsCount,
        soldGoodsCount: p.soldGoodsCount
      }
    };
  }).sort((a, b) => {
    if (b.score.total !== a.score.total) return b.score.total - a.score.total;
    // 동점일 경우 남은 자원(은화+일꾼+남은상품)이 많은 플레이어 우선
    const resA = a.player.silverlings + a.player.workers + a.player.goods.length;
    const resB = b.player.silverlings + b.player.workers + b.player.goods.length;
    return resB - resA;
  });

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
          background: 'linear-gradient(145deg, #18221b 0%, #0c120f 100%)',
          border: '2px solid rgba(212, 175, 55, 0.45)',
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.95), 0 0 50px rgba(212, 175, 55, 0.25)',
          position: 'relative'
        }}
      >
        {/* 상단 스킵 버튼 */}
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
              gap: '4px',
              transition: 'all 0.2s ease'
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
            background: 'rgba(212, 175, 55, 0.12)', 
            border: '1px solid rgba(212, 175, 55, 0.3)', 
            padding: '4px 14px', 
            borderRadius: '20px', 
            marginBottom: '10px' 
          }}>
            <Sparkles size={14} color="#facc15" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#facc15', letterSpacing: '1px' }}>
              THE CASTLES OF BURGUNDY
            </span>
          </div>

          <h2 className="font-serif text-gold-gradient" style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 6px 0' }}>
            {stage === 4 ? '🏰 대단원의 막: 최종 승점 집계 완료' : '📊 영지 최종 승점 정산 진행 중...'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
            5개 페이즈(A~E)의 대장정이 끝나고 부르고뉴 최고의 번영을 이룬 영주를 발표합니다.
          </p>
        </div>

        {/* 4단계: 1위 우승자 명예의 전당 배너 */}
        {stage === 4 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(202, 138, 4, 0.1) 100%)',
            border: '2px solid #eab308',
            borderRadius: '14px',
            padding: '16px 20px',
            marginBottom: '22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 8px 24px rgba(234, 179, 8, 0.25)',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1a1003',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
              }}>
                <Crown size={28} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#fde047', fontWeight: 700, letterSpacing: '1px' }}>
                  CHAMPION OF BURGUNDY (최고의 군주)
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff' }}>
                  {winner.player.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                  영지 완공 구역 {winner.stats.completedRegionsCount}개 | 타일 {winner.stats.placedTilesCount}개 완성
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>최종 정산 승점</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#facc15', lineHeight: 1 }}>
                <RollingNumber value={winner.score.total} onTick={() => soundManager.playScoreTick()} />
                <span style={{ fontSize: '1rem', marginLeft: '4px', color: '#e2e8f0' }}>VP</span>
              </div>
            </div>
          </div>
        )}

        {/* 플레이어별 상세 정산 카드 목록 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {scoredPlayers.map((item, idx) => {
            const isFirst = idx === 0;
            const b = item.score.breakdown;

            return (
              <div 
                key={item.player.id}
                style={{
                  background: isFirst && stage === 4 
                    ? 'rgba(38, 54, 44, 0.95)' 
                    : 'rgba(20, 29, 24, 0.75)',
                  border: isFirst && stage === 4 
                    ? '1.5px solid #d4af37' 
                    : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                {/* 카드 상단: 플레이어 정보 & 총점 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: isFirst ? 'var(--gold-primary)' : 'rgba(255,255,255,0.1)',
                      color: isFirst ? '#1a1003' : '#fff',
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
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>총 승점:</span>
                    <span style={{ 
                      fontSize: '1.4rem', 
                      fontWeight: 900, 
                      color: isFirst ? '#facc15' : '#f8fafc' 
                    }}>
                      {stage >= 4 ? (
                        <RollingNumber value={item.score.total} onTick={() => soundManager.playScoreTick()} />
                      ) : (
                        b.inGameVp
                      )}
                      <span style={{ fontSize: '0.85rem', marginLeft: '3px' }}>VP</span>
                    </span>
                  </div>
                </div>

                {/* 카드 중단: 5개 정산 카테고리 세부 배지 */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(5, 1fr)', 
                  gap: '8px', 
                  fontSize: '0.75rem' 
                }}>
                  {/* 1) 인게임 영지 점수 */}
                  <div style={{ 
                    background: 'rgba(0,0,0,0.3)', 
                    padding: '8px 10px', 
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    <div style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                      <Award size={12} color="#60a5fa" />
                      인게임 VP
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#60a5fa' }}>
                      {b.inGameVp}점
                    </div>
                  </div>

                  {/* 2) 은화 점수 */}
                  <div style={{ 
                    background: 'rgba(0,0,0,0.3)', 
                    padding: '8px 10px', 
                    borderRadius: '8px',
                    border: stage >= 2 ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid rgba(255,255,255,0.06)',
                    opacity: stage >= 2 ? 1 : 0.4,
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                      <Coins size={12} color="#facc15" />
                      은화 (x1)
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#facc15' }}>
                      +{b.silver}점
                    </div>
                  </div>

                  {/* 3) 일꾼 점수 */}
                  <div style={{ 
                    background: 'rgba(0,0,0,0.3)', 
                    padding: '8px 10px', 
                    borderRadius: '8px',
                    border: stage >= 2 ? '1px solid rgba(96, 165, 250, 0.4)' : '1px solid rgba(255,255,255,0.06)',
                    opacity: stage >= 2 ? 1 : 0.4,
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                      <UsersIcon size={12} color="#93c5fd" />
                      일꾼 (÷2)
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#93c5fd' }}>
                      +{b.workers}점
                    </div>
                  </div>

                  {/* 4) 남은 상품 */}
                  <div style={{ 
                    background: 'rgba(0,0,0,0.3)', 
                    padding: '8px 10px', 
                    borderRadius: '8px',
                    border: stage >= 3 ? '1px solid rgba(249, 115, 22, 0.4)' : '1px solid rgba(255,255,255,0.06)',
                    opacity: stage >= 3 ? 1 : 0.4,
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                      <Package size={12} color="#fb923c" />
                      남은 상품
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fb923c' }}>
                      +{b.goods}점
                    </div>
                  </div>

                  {/* 5) 지식 타일 보너스 */}
                  <div style={{ 
                    background: 'rgba(0,0,0,0.3)', 
                    padding: '8px 10px', 
                    borderRadius: '8px',
                    border: stage >= 3 ? '1px solid rgba(192, 132, 252, 0.4)' : '1px solid rgba(255,255,255,0.06)',
                    opacity: stage >= 3 ? 1 : 0.4,
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                      <BookOpen size={12} color="#c084fc" />
                      지식 타일
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#c084fc' }}>
                      +{b.knowledge}점
                    </div>
                  </div>
                </div>

                {/* 하단 통계 칩 */}
                <div style={{ display: 'flex', gap: '14px', fontSize: '0.72rem', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '6px' }}>
                  <span>🏰 배치된 영지 타일: <strong>{item.stats.placedTilesCount}칸</strong></span>
                  <span>🏆 완성된 영지 구역: <strong>{item.stats.completedRegionsCount}곳</strong></span>
                  <span>📦 판매된 총 상품: <strong>{item.stats.soldGoodsCount}개</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 하단 제어 버튼 */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button 
            className="btn-gold" 
            onClick={() => {
              soundManager.playDiceRoll();
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
