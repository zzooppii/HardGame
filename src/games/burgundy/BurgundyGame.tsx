import React, { useEffect, useState } from 'react';
import { useBurgundyStore } from './store/useBurgundyStore';
import { DuchyBoard } from './components/DuchyBoard';
import { CentralDepotBoard } from './components/CentralDepotBoard';
import { DiceControls } from './components/DiceControls';
import { PlayerStorage } from './components/PlayerStorage';
import { BurgundyGameOverModal } from './components/BurgundyGameOverModal';
import { ArrowLeft, RotateCcw, Volume2, VolumeX, HelpCircle } from 'lucide-react';
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
    initGame,
    uiTheme,
    toggleUITheme
  } = useBurgundyStore();

  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [viewingPlayerId, setViewingPlayerId] = useState<string>('p-0');
  const [showRulesModal, setShowRulesModal] = useState(false);

  // 게임 초기화
  useEffect(() => {
    initGame(2, true);
  }, []);

  // 플로팅 인터랙션 피드백 구독
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

  const isTabletop = uiTheme === 'tabletop';
  const currTurnPlayer = players[currentTurnPlayerIndex];
  const viewedPlayer = players.find(p => p.id === viewingPlayerId) || players[0];

  return (
    <div 
      className={isTabletop ? 'theme-tabletop' : 'theme-modern'} 
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 14px',
        maxWidth: '1600px',
        margin: '0 auto',
        transition: 'all 0.3s ease'
      }}
    >
      {/* 1. 상단 제어 헤더 바 */}
      <header className="game-header-bar" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 18px',
        borderRadius: '12px',
        background: isTabletop ? 'rgba(15, 38, 70, 0.92)' : 'rgba(22, 27, 34, 0.85)',
        backdropFilter: 'blur(12px)',
        border: isTabletop ? '2px solid #d4af37' : '1px solid var(--amber-border)',
        boxShadow: isTabletop ? '0 6px 20px rgba(0,0,0,0.5)' : 'none',
        marginBottom: '16px'
      }}>
        {/* 좌측: 로비 버튼 & 게임 제목 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            className="btn-secondary" 
            onClick={onBackToLobby}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <ArrowLeft size={15} /> 로비
          </button>
          <div>
            <h1 className="font-serif text-gold-gradient" style={{ fontSize: '1.2rem', margin: 0 }}>
              {isTabletop ? '🎲 버건디의 성 (Tabletop)' : '버건디의 성'}
            </h1>
          </div>
        </div>

        {/* 우측: 페이즈, 라운드, 턴 배지, 테마 전환, 규칙, 사운드, 재시작 */}
        <div className="header-controls-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="badge badge-gold" style={{ fontSize: '0.82rem', padding: '4px 10px' }}>
            페이즈 {phase} - 라운드 {round}/5
          </div>

          <span className="badge" style={{ 
            background: currTurnPlayer?.isAI ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)', 
            color: currTurnPlayer?.isAI ? '#f87171' : '#4ade80', 
            border: `1px solid ${currTurnPlayer?.isAI ? '#f87171' : '#4ade80'}`, 
            fontSize: '0.78rem' 
          }}>
            {currTurnPlayer?.isAI ? `🤖 ${currTurnPlayer?.name} 생각 중` : `👑 ${currTurnPlayer?.name} 차례`}
          </span>

          {/* 테마 토글 */}
          <button
            onClick={toggleUITheme}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: isTabletop ? 'linear-gradient(135deg, #f5ecd5 0%, #dfcfac 100%)' : 'rgba(255,255,255,0.08)',
              color: isTabletop ? '#2b1805' : 'var(--gold-secondary)',
              border: isTabletop ? '1.5px solid #8a6534' : '1px solid var(--amber-border)',
              transition: 'all 0.2s ease'
            }}
          >
            {isTabletop ? '🎲 실물 모드' : '🌙 다크 모드'}
          </button>

          {/* 규칙 도감 */}
          <button 
            className="btn-secondary" 
            onClick={() => {
              soundManager.playClick();
              setShowRulesModal(true);
            }}
            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
          >
            <HelpCircle size={14} color="var(--gold-secondary)" /> 규칙
          </button>

          {/* 재시작 */}
          <button 
            className="btn-secondary" 
            onClick={() => {
              soundManager.playClick();
              initGame(players.length, true);
            }}
            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
          >
            <RotateCcw size={14} /> 재시작
          </button>

          {/* 사운드 토글 */}
          <button
            className={`sound-toggle-btn ${!isMuted ? 'active' : ''}`}
            onClick={handleToggleMute}
            title={isMuted ? '소리 켜기' : '음소거'}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      </header>

      {/* 2. 플레이어 선택 탭 바 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', overflowX: 'auto' }}>
        {players.map(p => {
          const isSelected = p.id === viewingPlayerId;
          const isTurn = p.id === currTurnPlayer?.id;

          return (
            <button
              key={p.id}
              onClick={() => {
                soundManager.playClick();
                setViewingPlayerId(p.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: isSelected 
                  ? (isTabletop ? '#dfcfac' : 'rgba(30, 41, 59, 0.95)') 
                  : (isTabletop ? '#fdf6e2' : 'rgba(15, 23, 42, 0.6)'),
                border: isSelected 
                  ? (isTabletop ? '2px solid #6b441a' : `2px solid ${p.color}`) 
                  : (isTabletop ? '1px solid #c4a77d' : '1px solid var(--border-subtle)'),
                color: isTabletop ? '#2b1805' : (isSelected ? '#f8fafc' : 'var(--text-muted)'),
                cursor: 'pointer',
                fontWeight: isSelected ? 800 : 500
              }}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: p.color }} />
              <span style={{ fontSize: '0.85rem' }}>{p.name}</span>
              {isTurn && <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 800 }}>[현재 턴]</span>}
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>🏆{p.vp} VP</span>
            </button>
          );
        })}
      </div>

      {/* 3. 본문 게임 레이아웃 */}
      <main style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) minmax(480px, 1fr) 280px', gap: '16px', alignItems: 'start' }}>
        
        {/* 1열: 주사위 컨트롤 & 중앙 주사위 디포 보드 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <DiceControls />
          <CentralDepotBoard />
        </div>

        {/* 2열: 영지 육각 맵 & 개인 타일 보관소 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {viewedPlayer && (
            <DuchyBoard 
              player={viewedPlayer} 
              isCurrentPlayer={viewedPlayer.id === currTurnPlayer?.id} 
            />
          )}
          <PlayerStorage />
        </div>

        {/* 3열: 게임 로그 패널 */}
        <div style={{
          background: isTabletop ? '#fdf6e2' : 'rgba(15, 23, 42, 0.75)',
          borderRadius: '12px',
          padding: '14px',
          border: isTabletop ? '2px solid #8a6534' : '1px solid var(--border-subtle)',
          maxHeight: '750px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '0.88rem', color: isTabletop ? '#2b1805' : 'var(--gold-secondary)' }}>
            📜 게임 진행 로그
          </h4>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
            {logs.map((log, lIdx) => (
              <div 
                key={lIdx} 
                style={{ 
                  padding: '6px 8px', 
                  borderRadius: '6px', 
                  background: isTabletop ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
                  color: isTabletop ? '#42280d' : '#cbd5e1',
                  lineHeight: 1.35
                }}
              >
                {log}
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* 4. 게임 종료 모달 */}
      <BurgundyGameOverModal onReturnToLobby={onBackToLobby} />

      {/* 5. 규칙 안내 모달 */}
      {showRulesModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(5, 8, 15, 0.8)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '640px', maxHeight: '85vh', overflowY: 'auto', padding: '28px', background: '#0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="font-serif text-gold-gradient" style={{ margin: 0, fontSize: '1.4rem' }}>
                버건디의 성 게임 규칙 가이드
              </h3>
              <button className="btn-secondary" onClick={() => setShowRulesModal(false)}>닫기</button>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '12px', lineHeight: 1.5 }}>
              <div>
                <strong style={{ color: '#facc15' }}>1. 주사위 액션 (Dice Actions)</strong>
                <p style={{ margin: '4px 0 0 0' }}>
                  매 라운드 2개의 주사위를 굴립니다. 각 주사위로 ① 해당 눈금 디포에서 타일 가져오기, ② 보관소 타일을 영지의 일치하는 눈금 칸에 배치하기, ③ 상품 판매, ④ 일꾼 2개 영입 중 하나를 수행합니다.
                </p>
              </div>
              <div>
                <strong style={{ color: '#facc15' }}>2. 일꾼 토큰 (Workers)</strong>
                <p style={{ margin: '4px 0 0 0' }}>
                  일꾼 1개를 소모하여 주사위 눈금을 ±1 조정할 수 있습니다. 1과 6은 서로 순환 연결됩니다.
                </p>
              </div>
              <div>
                <strong style={{ color: '#facc15' }}>3. 타일 배치 규칙 & 인접성</strong>
                <p style={{ margin: '4px 0 0 0' }}>
                  타일은 색상과 주사위 번호가 일치하고, 이미 배치된 기존 타일과 최소 1변 이상 맞닿아 있는 슬롯에만 놓을 수 있습니다.
                </p>
              </div>
              <div>
                <strong style={{ color: '#facc15' }}>4. 구역 완성 보너스</strong>
                <p style={{ margin: '4px 0 0 0' }}>
                  같은 색상의 연결된 구역을 타일로 모두 채우면 구역 크기 점수(1~8칸)와 페이즈 조기 완성 보너스(A: 10점 ~ E: 2점)를 대량 획득합니다!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. 플로팅 피드백 오버레이 */}
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
