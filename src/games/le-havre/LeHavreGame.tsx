import React, { useEffect, useState } from 'react';
import { useLeHavreStore } from './store/useLeHavreStore';
import { PortDocksBoard } from './components/PortDocksBoard';
import { TownBuildingsGrid } from './components/TownBuildingsGrid';
import { PlayerWarehouseTray } from './components/PlayerWarehouseTray';
import { BuildingActionModal } from './components/BuildingActionModal';
import { LeHavreGameOverModal } from './components/LeHavreGameOverModal';
import { Volume2, VolumeX, HelpCircle, LogOut } from 'lucide-react';
import { soundManager } from '../../utils/sound';
import { subscribeFeedback } from '../../utils/feedback';

interface LeHavreGameProps {
  onBackToLobby: () => void;
}

interface FeedbackItem {
  id: string;
  text: string;
  x: number;
  y: number;
}

export const LeHavreGame: React.FC<LeHavreGameProps> = ({ onBackToLobby }) => {
  const {
    round,
    turnInRound,
    players,
    currentTurnPlayerIndex,
    logs,
    initGame
  } = useLeHavreStore();

  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [showRulesModal, setShowRulesModal] = useState(false);

  useEffect(() => {
    if (players.length === 0) {
      initGame(2, true);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeFeedback((item) => {
      setFeedbacks((prev) => [...prev, item]);
      setTimeout(() => {
        setFeedbacks((prev) => prev.filter((f) => f.id !== item.id));
      }, 1200);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'G' && e.shiftKey) {
        useLeHavreStore.setState({ isGameOver: true });
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) soundManager.playCoin();
  };

  const currTurnPlayer = players[currentTurnPlayerIndex];
  const aiPlayer = players.find(p => p.isAI) || players[1];
  const isMyTurn = currTurnPlayer && !currTurnPlayer.isAI;

  return (
    <div 
      className="theme-lehavre-masterpiece" 
      style={{ 
        height: '100vh', 
        maxHeight: '100vh',
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '8px 16px', 
        maxWidth: '1720px', 
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
        background: '#07101b'
      }}
    >
      {/* 1. 상단 글로벌 헤더 & 상대방 현황 바 */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '8px',
        borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
        marginBottom: '8px',
        flexShrink: 0
      }}>
        {/* 좌측: 타이틀 & 라운드 정보 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.62rem', letterSpacing: '1.5px', color: '#38bdf8', fontWeight: 700 }}>
              EURO MASTERPIECES 03
            </div>
            <h1 className="font-serif" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: 0, lineHeight: 1.1 }}>
              LE HAVRE (르아브르)
            </h1>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'baseline', 
            gap: '6px', 
            background: 'rgba(10, 25, 47, 0.7)', 
            padding: '4px 12px', 
            borderRadius: '6px', 
            border: '1px solid rgba(56, 189, 248, 0.3)' 
          }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>라운드</span>
            <span className="font-serif" style={{ fontSize: '1.15rem', fontWeight: 900, color: '#38bdf8' }}>{round}</span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>/ 7</span>
            <span style={{ fontSize: '0.68rem', color: '#64748b', marginLeft: '4px' }}>(보급 단계: {turnInRound + 1}/7)</span>
          </div>
        </div>

        {/* 중앙: 상대방(AI) 실시간 현황 캡슐 */}
        {aiPlayer && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            padding: '4px 14px',
            borderRadius: '20px',
            fontSize: '0.75rem'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: aiPlayer.color }} />
            <span style={{ fontWeight: 700, color: '#f8fafc' }}>{aiPlayer.name}</span>
            <span style={{ color: aiPlayer.id === currTurnPlayer?.id ? '#f87171' : '#94a3b8' }}>
              {aiPlayer.id === currTurnPlayer?.id ? '● 행동 중...' : '대기 중'}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
            <span style={{ color: '#facc15' }}>🪙 {aiPlayer.francs} F</span>
            <span style={{ color: '#38bdf8' }}>🚢 선박 {aiPlayer.shipsOwned.length}척</span>
            <span style={{ color: '#4ade80' }}>🏛️ 건물 {aiPlayer.buildingsOwned.length}채</span>
          </div>
        )}

        {/* 우측 유틸리티 버튼 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={() => {
              soundManager.playClick();
              setShowRulesModal(true);
            }}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              color: '#f8fafc',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <HelpCircle size={13} color="#38bdf8" /> 규칙 가이드
          </button>

          <button
            className={`sound-toggle-btn ${!isMuted ? 'active' : ''}`}
            onClick={handleToggleMute}
            style={{ width: '30px', height: '30px' }}
            title={isMuted ? '소리 켜기' : '음소거'}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>

          <button 
            onClick={onBackToLobby}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <LogOut size={13} /> 나가기
          </button>
        </div>
      </header>

      {/* 상대방 플레이어 턴일 때 안내 배너 */}
      {!isMyTurn && (
        <div style={{
          background: 'rgba(56, 189, 248, 0.15)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          color: '#7dd3fc',
          padding: '5px 14px',
          borderRadius: '8px',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '6px',
          flexShrink: 0
        }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', animation: 'pulse 1.5s infinite' }} />
          <span>상대 플레이어(<strong>{currTurnPlayer?.name}</strong>)가 항구에서 행동 중입니다...</span>
        </div>
      )}

      {/* 2. 100vh 완결형 2분할 메인 대시보드 (좌 48% : 우 52%) */}
      <main style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.15fr)',
        gap: '12px',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        pointerEvents: isMyTurn ? 'auto' : 'none',
        opacity: isMyTurn ? 1 : 0.92,
        transition: 'opacity 0.2s ease'
      }}>
        {/* [좌측 영역] 7개 공급 도크 + 내 선창 창고 트레이 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%', minHeight: 0 }}>
          {/* 상단: 7대 도크 공급대 */}
          <div style={{ flex: '0 0 auto', maxHeight: '180px' }}>
            <PortDocksBoard />
          </div>

          {/* 하단: 내 창고 및 자산 트레이 */}
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            <PlayerWarehouseTray />
          </div>
        </div>

        {/* [우측 영역] 마을 건물 거리 + 하단 실시간 항구 일지 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%', minHeight: 0, overflow: 'hidden' }}>
          {/* 상단: 건물 거리 그리드 */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <TownBuildingsGrid />
          </div>

          {/* 하단: 항구 일지 로그 */}
          <div className="saboteur-board-panel" style={{
            padding: '8px 12px',
            flex: '0 0 110px',
            background: 'rgba(10, 16, 26, 0.95)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', flexShrink: 0 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f8fafc' }}>
                📜 르아브르 항구 연대기 (Log)
              </span>
              <span style={{ fontSize: '0.65rem', color: '#64748b' }}>실시간 물류 & 건설 기록</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.72rem' }}>
              {logs.slice(0, 10).map((log, lIdx) => (
                <div 
                  key={lIdx} 
                  style={{ 
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    background: 'rgba(0,0,0,0.3)', 
                    borderLeft: '2px solid #38bdf8',
                    color: '#cbd5e1',
                    lineHeight: 1.3
                  }}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* 모달 컴포넌트들 */}
      <BuildingActionModal />
      <LeHavreGameOverModal onReturnToLobby={onBackToLobby} />

      {/* 규칙 모달 */}
      {showRulesModal && (
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
          zIndex: 300,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '640px', maxHeight: '85vh', overflowY: 'auto', padding: '24px', background: '#091524', border: '1.5px solid #38bdf8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 className="font-serif text-gold-gradient" style={{ margin: 0, fontSize: '1.3rem' }}>
                르아브르 (Le Havre) 게임 가이드
              </h3>
              <button className="btn-secondary" onClick={() => setShowRulesModal(false)}>닫기</button>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '10px', lineHeight: 1.45 }}>
              <div>
                <strong style={{ color: '#38bdf8' }}>1. 턴 액션 (둘 중 하나 택일)</strong>
                <p style={{ margin: '2px 0 0 0' }}>
                  ① 도크의 상품 전량 가져오기, 또는 ② 비어 있는 건물로 일꾼을 이동하여 고유 가공/건설 기능 실행.
                </p>
              </div>
              <div>
                <strong style={{ color: '#38bdf8' }}>2. 원자재와 가공품</strong>
                <p style={{ margin: '2px 0 0 0' }}>
                  어획➔훈제어(2식량), 곡물➔빵(2식량), 가축➔고기(3식량)+원피, 목재➔숯(3연료), 점토➔벽돌, 철➔강철(8VP).
                </p>
              </div>
              <div>
                <strong style={{ color: '#38bdf8' }}>3. 선박 건조와 식량 절감</strong>
                <p style={{ margin: '2px 0 0 0' }}>
                  부두(Wharf)에서 선박(목선, 철선, 강철선)을 건조하면 매 라운드 종료 시 영구적으로 식량 요구치가 차감됩니다.
                </p>
              </div>
              <div>
                <strong style={{ color: '#38bdf8' }}>4. 밥 먹이기와 대출</strong>
                <p style={{ margin: '2px 0 0 0' }}>
                  라운드 종료 시 요구 식량이 부족하면 4프랑 긴급 대출이 강제 발행됩니다 (미상환 시 최종 -7점).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 플로팅 피드백 */}
      {feedbacks.map((f) => (
        <div
          key={f.id}
          className="floating-feedback-item font-serif"
          style={{ left: f.x, top: f.y, color: '#38bdf8' }}
        >
          {f.text}
        </div>
      ))}
    </div>
  );
};
