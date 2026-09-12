import React, { useEffect, useState } from 'react';
import { usePuertoRicoStore } from '../store/usePuertoRicoStore';
import { calculateFinalScore } from '../engine/gameLogic';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, ChevronDown, ChevronUp, Award } from 'lucide-react';
import { soundManager } from '../../../utils/sound';
import { usePlatformStore } from '../../../platform/store/usePlatformStore';

export const GameOverModal: React.FC<{ onReturnToLobby: () => void }> = ({ onReturnToLobby }) => {
  const { isGameOver, endReason, players, initGame, myPlayerId, aiDifficulty } = usePuertoRicoStore();
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  useEffect(() => {
    if (isGameOver) {
      // 승리 팡파르 효과음 재생
      soundManager.playFanfare();
      // 콘페티 축하 효과 발사
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      // 전적 및 업적 플랫폼 저장
      const scoredPlayers = players.map(p => ({
        player: p,
        score: calculateFinalScore(p)
      })).sort((a, b) => {
        if (b.score.total !== a.score.total) {
          return b.score.total - a.score.total;
        }
        const tieA = a.player.doubloons + Object.values(a.player.goods).reduce((x, y) => x + y, 0);
        const tieB = b.player.doubloons + Object.values(b.player.goods).reduce((x, y) => x + y, 0);
        return tieB - tieA;
      });

      const myRank = scoredPlayers.findIndex(sp => sp.player.id === myPlayerId) + 1;
      const myResult = scoredPlayers.find(sp => sp.player.id === myPlayerId) || scoredPlayers[0];
      const isWinner = myRank === 1;

      usePlatformStore.getState().recordGameResult({
        gameId: 'puerto-rico',
        gameTitle: '푸에르토리코',
        isWin: isWinner,
        rank: myRank > 0 ? myRank : 1,
        myScore: myResult.score.total,
        totalPlayers: players.length,
        maxScore: scoredPlayers[0]?.score.total || myResult.score.total
      });

      // 기본적으로 1위 플레이어의 상세 점수를 펼쳐둠
      if (scoredPlayers[0]) {
        setExpandedPlayerId(scoredPlayers[0].player.id);
      }
    }
  }, [isGameOver, myPlayerId, players]);

  if (!isGameOver) return null;

  // 플레이어별 최종 점수 정산 및 랭킹 산출
  const scoredPlayers = players.map(p => {
    const score = calculateFinalScore(p);
    return {
      player: p,
      score
    };
  }).sort((a, b) => {
    if (b.score.total !== a.score.total) {
      return b.score.total - a.score.total;
    }
    // 동점인 경우 자원(두블론 + 상품) 합이 많은 사람 우선
    const tieA = a.player.doubloons + Object.values(a.player.goods).reduce((x, y) => x + y, 0);
    const tieB = b.player.doubloons + Object.values(b.player.goods).reduce((x, y) => x + y, 0);
    return tieB - tieA;
  });

  const winner = scoredPlayers[0];
  const myPlayerScored = scoredPlayers.find(sp => sp.player.id === myPlayerId);

  // 모달을 최소화했을 때: 화면 하단 플로팅 바로 축소하여 보드판 전체를 감상할 수 있도록 함
  if (isMinimized) {
    return (
      <div 
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 500,
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          border: '2px solid var(--gold-primary)',
          borderRadius: '14px',
          padding: '12px 20px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.8), 0 0 20px rgba(229, 169, 60, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          animation: 'bounceIn 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.6rem' }}>🏆</span>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--gold-secondary)', fontWeight: 700 }}>
              게임 종료 (보드판 둘러보는 중)
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
              1위: <span style={{ color: winner.player.color }}>{winner.player.name}</span> ({winner.score.total} VP)
              {myPlayerScored && myPlayerScored.player.id !== winner.player.id && (
                <span style={{ fontSize: '0.82rem', color: '#94a3b8', marginLeft: '8px' }}>
                  (나: {myPlayerScored.score.total} VP)
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setIsMinimized(false)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#000',
              fontWeight: 800,
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(217, 119, 6, 0.4)'
            }}
          >
            📊 점수 결과창 다시 열기
          </button>
          <button 
            onClick={onReturnToLobby}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(51, 65, 85, 0.8)',
              color: '#cbd5e1',
              fontWeight: 700,
              fontSize: '0.82rem',
              border: '1px solid rgba(255,255,255,0.15)',
              cursor: 'pointer'
            }}
          >
            로비로
          </button>
        </div>
      </div>
    );
  }

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
      zIndex: 400,
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div 
        className="glass-panel" 
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '28px 26px',
          background: 'linear-gradient(145deg, #1e2538 0%, #0d131f 100%)',
          border: '2px solid var(--gold-secondary)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.9), 0 0 40px rgba(229, 169, 60, 0.3)',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        {/* 상단 우측: 보드판 둘러보기(최소화) 버튼 */}
        <button
          onClick={() => setIsMinimized(true)}
          style={{
            position: 'absolute',
            top: '18px',
            right: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid #38bdf8',
            color: '#7dd3fc',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="결과창을 잠시 내리고 현재 보드판 상태를 확인합니다"
        >
          👁️ 보드판 둘러보기 (창 내리기)
        </button>

        <div style={{ fontSize: '3rem', marginBottom: '4px' }}>🏆</div>
        <h2 className="font-serif text-gold-gradient" style={{ fontSize: '1.9rem', marginBottom: '4px' }}>
          게임 종료!
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#cbd5e1', marginBottom: '20px' }}>
          📌 종료 사유: <b style={{ color: 'var(--gold-secondary)' }}>{endReason}</b>
        </p>

        {/* 1위 우승자 배너 */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(229, 169, 60, 0.22) 0%, rgba(245, 158, 11, 0.08) 100%)',
          border: '1.5px solid var(--gold-primary)',
          borderRadius: '12px',
          padding: '14px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--gold-secondary)', fontWeight: 700 }}>
            최고의 식민지 총독 (1위 우승)
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#fff', margin: '4px 0' }}>
            {winner.player.name}
          </div>
          <div style={{ fontSize: '1.1rem', color: 'var(--gold-primary)', fontWeight: 800 }}>
            총 {winner.score.total} 승점 (VP)
          </div>
        </div>

        {/* 점수 종합 순위표 */}
        <div style={{ marginBottom: '20px', overflowX: 'auto', background: 'rgba(0,0,0,0.25)', borderRadius: '8px', padding: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '8px 6px', textAlign: 'left' }}>순위</th>
                <th style={{ padding: '8px 6px', textAlign: 'left' }}>플레이어</th>
                <th style={{ padding: '8px 6px' }}>VP 칩</th>
                <th style={{ padding: '8px 6px' }}>건물 점수</th>
                <th style={{ padding: '8px 6px' }}>대형 보너스</th>
                <th style={{ padding: '8px 6px', textAlign: 'right' }}>최종 점수</th>
                <th style={{ padding: '8px 6px', textAlign: 'center' }}>상세</th>
              </tr>
            </thead>
            <tbody>
              {scoredPlayers.map((item, idx) => {
                const isExpanded = expandedPlayerId === item.player.id;

                return (
                  <React.Fragment key={item.player.id}>
                    <tr 
                      onClick={() => setExpandedPlayerId(isExpanded ? null : item.player.id)}
                      style={{ 
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        background: idx === 0 ? 'rgba(229, 169, 60, 0.12)' : 'transparent',
                        cursor: 'pointer'
                      }}
                    >
                      <td style={{ padding: '9px 6px', textAlign: 'left', fontWeight: 800, color: idx === 0 ? 'var(--gold-primary)' : 'inherit' }}>
                        #{idx + 1}
                      </td>
                      <td style={{ padding: '9px 6px', textAlign: 'left', fontWeight: 700 }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: item.player.color, marginRight: '6px' }} />
                        {item.player.name}
                      </td>
                      <td style={{ padding: '9px 6px', color: '#38bdf8', fontWeight: 700 }}>{item.score.breakdown.vpChips}점</td>
                      <td style={{ padding: '9px 6px' }}>{item.score.breakdown.buildings}점</td>
                      <td style={{ padding: '9px 6px', color: '#a855f7', fontWeight: 700 }}>+{item.score.breakdown.bonus}점</td>
                      <td style={{ padding: '9px 6px', textAlign: 'right', fontWeight: 900, color: 'var(--gold-secondary)', fontSize: '1rem' }}>
                        {item.score.total} VP
                      </td>
                      <td style={{ padding: '9px 6px', textAlign: 'center', color: 'var(--gold-secondary)' }}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </td>
                    </tr>

                    {/* 펼쳐지는 세부 점수 분석 카드 */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.4)', textAlign: 'left' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
                            
                            {/* 1. 건물별 점수 내역 */}
                            <div>
                              <div style={{ fontWeight: 800, color: '#fde047', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Award size={14} /> 건설한 건물 상세 내역 ({item.score.breakdown.buildingDetails.length}채, 총 {item.score.breakdown.buildings}점):
                              </div>
                              {item.score.breakdown.buildingDetails.length === 0 ? (
                                <div style={{ color: '#94a3b8', paddingLeft: '8px' }}>건설된 건물이 없습니다.</div>
                              ) : (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                  {item.score.breakdown.buildingDetails.map((b, bIdx) => (
                                    <div 
                                      key={bIdx}
                                      style={{
                                        background: 'rgba(255,255,255,0.06)',
                                        border: b.active ? '1px solid #22c55e' : '1px dashed #64748b',
                                        borderRadius: '6px',
                                        padding: '3px 8px',
                                        fontSize: '0.74rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px'
                                      }}
                                    >
                                      <span style={{ color: '#fff', fontWeight: 600 }}>{b.name}</span>
                                      <span style={{ color: '#fde047', fontWeight: 800 }}>({b.vp}점)</span>
                                      <span style={{ fontSize: '0.65rem', color: b.active ? '#86efac' : '#f87171' }}>
                                        {b.active ? `● 가동(${b.colonists})` : '○ 미가동'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* 2. 대형 건물 보너스 점수 상세 내역 */}
                            <div>
                              <div style={{ fontWeight: 800, color: '#c084fc', marginBottom: '6px' }}>
                                🌟 대형 건물 보너스 점수 (+{item.score.breakdown.bonus}점):
                              </div>
                              {item.score.breakdown.bonusDetails.length === 0 ? (
                                <div style={{ color: '#94a3b8', paddingLeft: '8px' }}>대형 건물이 없거나 활성화되지 않았습니다.</div>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  {item.score.breakdown.bonusDetails.map((bon, bonIdx) => (
                                    <div 
                                      key={bonIdx}
                                      style={{
                                        background: 'rgba(168, 85, 247, 0.1)',
                                        border: '1px solid rgba(168, 85, 247, 0.3)',
                                        borderRadius: '6px',
                                        padding: '4px 8px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                      }}
                                    >
                                      <div>
                                        <b style={{ color: '#e9d5ff' }}>{bon.name}</b>
                                        <span style={{ color: '#cbd5e1', marginLeft: '8px' }}>{bon.desc}</span>
                                      </div>
                                      <span style={{ color: '#facc15', fontWeight: 800 }}>+{bon.bonusVp}점</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* 3. 동점 기준 타이브레이커 자산 */}
                            <div style={{ color: '#94a3b8', fontSize: '0.74rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px' }}>
                              ⚖️ 동점 기준 자산: 잔여 {item.score.breakdown.tiebreaker.doubloons} 두블론 + 상품 {item.score.breakdown.tiebreaker.goods}개 = 총 <b>{item.score.breakdown.tiebreaker.total}개</b>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 하단 액션 버튼 */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setIsMinimized(true)}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.2)',
              border: '1.5px solid #38bdf8',
              color: '#7dd3fc',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            👁️ 현재 보드판 둘러보기
          </button>
          <button className="btn-gold" onClick={() => initGame(players.length, true, aiDifficulty)}>
            <RotateCcw size={18} /> 새 게임 시작
          </button>
          <button className="btn-secondary" onClick={onReturnToLobby}>
            <Home size={18} /> 로비로 돌아가기
          </button>
        </div>

      </div>
    </div>
  );
};
