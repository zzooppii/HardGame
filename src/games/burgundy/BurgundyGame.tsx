import React, { useEffect, useState } from 'react';
import { useBurgundyStore } from './store/useBurgundyStore';
import { DuchyBoard } from './components/DuchyBoard';
import { CentralDepotBoard } from './components/CentralDepotBoard';
import { PlayerBottomTray } from './components/PlayerBottomTray';
import { BurgundyGameOverModal } from './components/BurgundyGameOverModal';
import { Volume2, VolumeX, HelpCircle, LogOut } from 'lucide-react';
import { soundManager } from '../../utils/sound';
import { subscribeFeedback } from '../../utils/feedback';

interface BurgundyGameProps {
  onBackToLobby: () => void;
}

interface FeedbackItem {
  id: string;
  text: string;
  x: number;
  y: number;
}

export const BurgundyGame: React.FC<BurgundyGameProps> = ({ onBackToLobby }) => {
  const {
    phase,
    round,
    players,
    currentTurnPlayerIndex,
    logs,
    initGame
  } = useBurgundyStore();

  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [viewingPlayerId, setViewingPlayerId] = useState<string>('p-0');
  const [showRulesModal, setShowRulesModal] = useState(false);

  useEffect(() => {
    initGame(2, true);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeFeedback((item) => {
      setFeedbacks((prev) => [...prev, item]);
      setTimeout(() => {
        setFeedbacks((prev) => prev.filter((f) => f.id !== item.id));
      }, 1200);
    });
    return unsubscribe;
  }, []);

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) soundManager.playCoin();
  };

  const currTurnPlayer = players[currentTurnPlayerIndex];
  const viewedPlayer = players.find(p => p.id === viewingPlayerId) || players[0];
  const aiPlayer = players.find(p => p.isAI) || players[1];

  return (
    <div 
      className="theme-burgundy-masterpiece" 
      style={{ 
        height: '100vh', 
        maxHeight: '100vh',
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '8px 16px', 
        maxWidth: '1680px', 
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}
    >
      
      {/* 1. 컴팩트 상단 헤더 & 스플랜더식 상대방(AI) 현황 바 */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '8px',
        borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
        marginBottom: '10px',
        flexShrink: 0
      }}>
        {/* 좌측: 타이틀 & 페이즈 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.62rem', letterSpacing: '1.5px', color: '#d4af37', fontWeight: 700 }}>
              EURO MASTERPIECES
            </div>
            <h1 className="font-serif" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: 0, lineHeight: 1.1 }}>
              THE CASTLES OF BURGUNDY
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', background: 'rgba(0,0,0,0.35)', padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
            <span className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 900, color: '#facc15' }}>{phase}</span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>/ 5</span>
            <span style={{ fontSize: '0.62rem', letterSpacing: '0.8px', color: '#d4af37', fontWeight: 800, marginLeft: '2px' }}>PHASE</span>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: '6px' }}>라운드 {round}/5</span>
          </div>
        </div>

        {/* 중앙: 스플랜더 상단 벤치마크 - 상대방(AI) 실시간 현황 캡슐 */}
        {aiPlayer && (
          <div 
            onClick={() => {
              soundManager.playClick();
              setViewingPlayerId(viewingPlayerId === aiPlayer.id ? 'p-0' : aiPlayer.id);
            }}
            title={viewingPlayerId === aiPlayer.id ? '내 영지로 돌아가기' : '상대방 영지 맵 구경하기'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: viewingPlayerId === aiPlayer.id ? 'rgba(38, 54, 44, 0.95)' : 'rgba(18, 26, 22, 0.9)',
              border: viewingPlayerId === aiPlayer.id ? '1.5px solid #d4af37' : '1px solid rgba(212, 175, 55, 0.25)',
              padding: '4px 14px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              boxShadow: viewingPlayerId === aiPlayer.id ? '0 0 10px rgba(212, 175, 55, 0.3)' : 'none'
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: aiPlayer.color }} />
            <span style={{ fontWeight: 700, color: '#f8fafc' }}>{aiPlayer.name}</span>
            <span style={{ color: aiPlayer.id === currTurnPlayer?.id ? '#f87171' : '#94a3b8' }}>
              {aiPlayer.id === currTurnPlayer?.id ? '● 생각 중...' : '대기 중'}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
            <span style={{ color: '#facc15' }}>🪙 {aiPlayer.silverlings}</span>
            <span style={{ color: '#60a5fa' }}>👷 {aiPlayer.workers}</span>
            <span style={{ color: '#4ade80' }}>🏆 {aiPlayer.vp} VP</span>
            <span style={{ fontSize: '0.65rem', color: '#d4af37', marginLeft: '4px' }}>
              {viewingPlayerId === aiPlayer.id ? '[내 영지 복귀]' : '[영지 보기]'}
            </span>
          </div>
        )}

        {/* 우측: 유틸리티 버튼 */}
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
              border: '1px solid rgba(212, 175, 55, 0.25)',
              color: '#f8fafc',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <HelpCircle size={13} color="#d4af37" /> 도움말
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

      {/* 2. 메인 1화면 2분할 대시보드 (좌 49% : 우 51% 균형 배분으로 3열 디포 완벽 수용) */}
      <main style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.08fr)',
        gap: '12px',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden'
      }}>
        
        {/* [좌측 54%] 내 영지 벌집 맵 + 바로 아래 일체형 컨트롤 트레이 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%', minHeight: 0 }}>
          <div style={{ flex: 1, minHeight: 0 }}>
            {viewedPlayer && (
              <DuchyBoard 
                player={viewedPlayer} 
                isCurrentPlayer={viewedPlayer.id === currTurnPlayer?.id} 
              />
            )}
          </div>
          
          <div style={{ flexShrink: 0 }}>
            <PlayerBottomTray />
          </div>
        </div>

        {/* [우측] 중앙 디포 & 가이드 & 로그 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%', minHeight: 0, overflow: 'hidden' }}>
          
          {/* 중앙 디포 진열대 & 스플랜더 가이드 배너 & 암시장 (고유 보드 크기 보존) */}
          <div style={{ flexShrink: 0 }}>
            <CentralDepotBoard />
          </div>

          {/* 하단 영지 연대기 로그 (남는 세로 공간을 100% 채워 단단한 균형 유지) */}
          <div className="saboteur-board-panel" style={{ padding: '8px 12px', flex: 1, minHeight: '80px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', flexShrink: 0 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f8fafc' }}>
                📜 영지 연대기 (실시간 게임 로그)
              </span>
              <span style={{ fontSize: '0.65rem', color: '#64748b' }}>최근 행동 실시간 기록</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.72rem' }}>
              {logs.slice(0, 8).map((log, lIdx) => (
                <div 
                  key={lIdx} 
                  style={{ 
                    padding: '3px 6px', 
                    borderRadius: '4px', 
                    background: 'rgba(0,0,0,0.3)', 
                    borderLeft: '2px solid #d4af37',
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

      {/* 게임 종료 모달 */}
      <BurgundyGameOverModal onReturnToLobby={onBackToLobby} />

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
          zIndex: 200,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '640px', maxHeight: '85vh', overflowY: 'auto', padding: '24px', background: '#0e1411', border: '1.5px solid #d4af37' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 className="font-serif text-gold-gradient" style={{ margin: 0, fontSize: '1.3rem' }}>
                버건디의 성 게임 규칙 가이드
              </h3>
              <button className="btn-secondary" onClick={() => setShowRulesModal(false)}>닫기</button>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '10px', lineHeight: 1.45 }}>
              <div>
                <strong style={{ color: '#facc15' }}>1. 주사위 드래프트 액션</strong>
                <p style={{ margin: '2px 0 0 0' }}>
                  매 라운드 2개의 주사위를 굴려 ① 디포 타일 획득, ② 영지 배치, ③ 상품 판매, ④ 일꾼 2개 영입을 수행합니다.
                </p>
              </div>
              <div>
                <strong style={{ color: '#facc15' }}>2. 일꾼 토큰 보정 (±1)</strong>
                <p style={{ margin: '2px 0 0 0' }}>
                  일꾼 1개를 소모하여 주사위 눈금을 ±1 조정할 수 있습니다 (1과 6은 순환 연결).
                </p>
              </div>
              <div>
                <strong style={{ color: '#facc15' }}>3. 영지 배치 인접성</strong>
                <p style={{ margin: '2px 0 0 0' }}>
                  타일은 색상과 주사위 번호가 일치하고 기존 타일과 맞닿아 있는 슬롯에만 놓을 수 있습니다.
                </p>
              </div>
              <div>
                <strong style={{ color: '#facc15' }}>4. 구역 완성 점수</strong>
                <p style={{ margin: '2px 0 0 0' }}>
                  같은 색상 구역을 모두 채우면 구역 크기 점수 + 페이즈 조기 완성 보너스를 대량 획득합니다!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 플로팅 피드백 오버레이 */}
      {feedbacks.map((f) => (
        <div
          key={f.id}
          className="floating-feedback-item font-serif"
          style={{ left: f.x, top: f.y }}
        >
          {f.text}
        </div>
      ))}

    </div>
  );
};
