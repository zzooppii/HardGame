import React, { useEffect, useState } from 'react';
import { useCavernaStore } from './store/useCavernaStore';
import { CaveBoard } from './components/CaveBoard';
import { FieldBoard } from './components/FieldBoard';
import { ActionBoard } from './components/ActionBoard';
import { FurnishingMarketModal } from './components/FurnishingMarketModal';
import { CavernaGameOverModal } from './components/CavernaGameOverModal';
import { Volume2, VolumeX, LogOut } from 'lucide-react';
import { soundManager } from '../../utils/sound';
import { subscribeFeedback } from '../../utils/feedback';

interface CavernaGameProps {
  onBackToLobby: () => void;
}

interface FeedbackItem {
  id: string;
  text: string;
  x: number;
  y: number;
}

export const CavernaGame: React.FC<CavernaGameProps> = ({ onBackToLobby }) => {
  const {
    round,
    players,
    currentTurnPlayerIndex,
    logs,
    initGame
  } = useCavernaStore();

  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);

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
        useCavernaStore.setState({ isGameOver: true });
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

  const currPlayer = players[currentTurnPlayerIndex];
  const myPlayer = players[0];
  const aiPlayer = players[1];
  const isMyTurn = currPlayer && !currPlayer.isAI;

  return (
    <div style={{
      height: '100vh',
      maxHeight: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      padding: '8px 16px',
      maxWidth: '1840px',
      width: '100%',
      margin: '0 auto',
      boxSizing: 'border-box',
      background: '#090d16'
    }}>
      {/* 1. 상단 글로벌 헤더 */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '8px',
        borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
        marginBottom: '8px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.62rem', letterSpacing: '1.5px', color: '#f59e0b', fontWeight: 700 }}>
              EURO MASTERPIECES 04
            </div>
            <h1 className="font-serif" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: 0, lineHeight: 1.1 }}>
              CAVERNA (카베르나: 동굴 농부들)
            </h1>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '6px',
            background: 'rgba(20, 13, 8, 0.7)',
            padding: '4px 12px',
            borderRadius: '6px',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>라운드</span>
            <span className="font-serif" style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f59e0b' }}>{round}</span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>/ 8</span>
          </div>
        </div>

        {/* 중앙: 상대방(AI) 현황 바 */}
        {aiPlayer && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            padding: '4px 14px',
            borderRadius: '20px',
            fontSize: '0.75rem'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: aiPlayer.color }} />
            <span style={{ fontWeight: 700, color: '#f8fafc' }}>{aiPlayer.name}</span>
            <span style={{ color: aiPlayer.id === currPlayer?.id ? '#f87171' : '#94a3b8' }}>
              {aiPlayer.id === currPlayer?.id ? '● 행동 중...' : '대기 중'}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
            <span style={{ color: '#facc15' }}>식량 {aiPlayer.resources.food}</span>
            <span style={{ color: '#f43f5e' }}>💎 루비 {aiPlayer.resources.ruby}</span>
            <span style={{ color: '#4ade80' }}>드워프 {aiPlayer.dwarfs.length}명</span>
          </div>
        )}

        {/* 우측 유틸리티 버튼 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

      {/* 상대방 턴 안내 배너 */}
      {!isMyTurn && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          color: '#fde047',
          padding: '4px 14px',
          borderRadius: '8px',
          fontSize: '0.78rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '6px',
          flexShrink: 0
        }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', animation: 'pulse 1.5s infinite' }} />
          <span>상대 드워프 일족(<strong>{currPlayer?.name}</strong>)이 행동을 수행하고 있습니다...</span>
        </div>
      )}

      {/* 2. 100vh 3분할 메인 대시보드 (동굴 30% : 행동판 38% : 농경 32%) */}
      <main style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr) minmax(0, 1fr)',
        gap: '12px',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        pointerEvents: isMyTurn ? 'auto' : 'none',
        opacity: isMyTurn ? 1 : 0.94
      }}>
        {/* [좌측] 동굴 구역 */}
        <div style={{ height: '100%', minHeight: 0 }}>
          <CaveBoard />
        </div>

        {/* [중앙] 일꾼 놓기 행동 판 */}
        <div style={{ height: '100%', minHeight: 0 }}>
          <ActionBoard />
        </div>

        {/* [우측] 숲/농경 보드 + 하단 인벤토리 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%', minHeight: 0 }}>
          <div style={{ flex: 1, minHeight: 0 }}>
            <FieldBoard />
          </div>

          {/* 내 자원 인벤토리 & 드워프 현황 */}
          {myPlayer && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '8px 12px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              {/* 자원 바 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
                <span style={{ color: '#cbd5e1' }}>🪵 {myPlayer.resources.wood}</span>
                <span style={{ color: '#cbd5e1' }}>🪨 {myPlayer.resources.stone}</span>
                <span style={{ color: '#38bdf8' }}>⛓️ {myPlayer.resources.ore}</span>
                <span style={{ color: '#f43f5e', fontWeight: 800 }}>💎 {myPlayer.resources.ruby}</span>
                <span style={{ color: '#fde047' }}>🌾 {myPlayer.resources.grain}</span>
                <span style={{ color: '#fb923c' }}>🎃 {myPlayer.resources.pumpkin}</span>
                <span style={{ color: '#4ade80', fontWeight: 800 }}>🍞 {myPlayer.resources.food}</span>
              </div>

              {/* 드워프 일꾼 상태 */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
                {myPlayer.dwarfs.map((dwarf) => (
                  <div
                    key={dwarf.id}
                    style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: dwarf.hasActedThisRound ? 'rgba(0,0,0,0.3)' : 'rgba(56, 189, 248, 0.15)',
                      border: dwarf.hasActedThisRound ? '1px solid rgba(255,255,255,0.06)' : '1px solid #38bdf8',
                      fontSize: '0.65rem',
                      color: dwarf.hasActedThisRound ? '#64748b' : '#38bdf8',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>🧔</span>
                    <span>{dwarf.name}</span>
                    {dwarf.weaponLevel > 0 && (
                      <span style={{ color: '#facc15', fontWeight: 800 }}>
                        (⚔️ Lv.{dwarf.weaponLevel})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 연대기 로그 */}
          <div style={{
            height: '80px',
            background: 'rgba(10, 16, 26, 0.95)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '6px 10px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            fontSize: '0.68rem',
            color: '#94a3b8',
            flexShrink: 0
          }}>
            {logs.slice(0, 8).map((log, idx) => (
              <div key={idx} style={{ lineHeight: 1.3 }}>
                • {log}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 모달 */}
      <FurnishingMarketModal />
      <CavernaGameOverModal onReturnToLobby={onBackToLobby} />

      {/* 플로팅 피드백 */}
      {feedbacks.map((f) => (
        <div
          key={f.id}
          className="floating-feedback-item font-serif"
          style={{ left: f.x, top: f.y, color: '#f59e0b' }}
        >
          {f.text}
        </div>
      ))}
    </div>
  );
};
