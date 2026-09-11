import React, { useEffect, useState } from 'react';
import { useArnakStore } from './store/useArnakStore';
import { ResearchTrackBoard } from './components/ResearchTrackBoard';
import { DigSiteBoard } from './components/DigSiteBoard';
import { MarketAndHandBoard } from './components/MarketAndHandBoard';
import { ArnakGameOverModal } from './components/ArnakGameOverModal';
import { ArnakRuleGuideModal } from './components/ArnakRuleGuideModal';
import { Volume2, VolumeX, LogOut, BookOpen, Globe, Copy, Check } from 'lucide-react';
import { soundManager } from '../../utils/sound';
import { subscribeFeedback, showFeedback } from '../../utils/feedback';

interface ArnakGameProps {
  onBackToLobby: () => void;
}

interface FeedbackItem {
  id: string;
  text: string;
  x: number;
  y: number;
}

export const ArnakGame: React.FC<ArnakGameProps> = ({ onBackToLobby }) => {
  const {
    round,
    players,
    currentTurnPlayerIndex,
    logs,
    initGame,
    playMode,
    roomCode,
    myPlayerId
  } = useArnakStore();

  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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
        useArnakStore.setState({ isGameOver: true });
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

  const handleCopyInviteLink = () => {
    if (!roomCode) return;
    let host = window.location.host;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      host = `192.168.0.18:${window.location.port || '5173'}`;
    }
    const url = `${window.location.protocol}//${host}${window.location.pathname}?room=${roomCode}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showFeedback('초대 링크가 복사되었습니다!');
    soundManager.playCoin();
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const currPlayer = players[currentTurnPlayerIndex];
  const isMyTurn = playMode === 'online' 
    ? currPlayer?.id === myPlayerId 
    : (currPlayer && !currPlayer.isAI);
  const myPlayer = players.find(p => p.id === myPlayerId) || players[0];
  const opponentPlayer = players.find(p => p.id !== myPlayer?.id) || players[1];

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
      background: '#040d0a'
    }}>
      {/* 1. 상단 글로벌 헤더 */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '8px',
        borderBottom: '1px solid rgba(16, 185, 129, 0.3)',
        marginBottom: '8px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.62rem', letterSpacing: '1.5px', color: '#10b981', fontWeight: 700 }}>
              EURO MASTERPIECES 05
            </div>
            <h1 className="font-serif" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: 0, lineHeight: 1.1 }}>
              LOST RUINS OF ARNAK (아르낙의 잊혀진 유적)
            </h1>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '6px',
            background: 'rgba(6, 78, 59, 0.4)',
            padding: '4px 12px',
            borderRadius: '6px',
            border: '1px solid rgba(16, 185, 129, 0.4)'
          }}>
            <span style={{ fontSize: '0.72rem', color: '#a7f3d0' }}>라운드</span>
            <span className="font-serif" style={{ fontSize: '1.15rem', fontWeight: 900, color: '#34d399' }}>{round}</span>
            <span style={{ fontSize: '0.7rem', color: '#a7f3d0' }}>/ 5</span>
          </div>
        </div>

        {/* 중앙: 상대방 현황 바 */}
        {opponentPlayer && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '4px 14px',
            borderRadius: '20px',
            fontSize: '0.75rem'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: opponentPlayer.color }} />
            <span style={{ fontWeight: 700, color: '#f8fafc' }}>{opponentPlayer.name}</span>
            <span style={{ color: opponentPlayer.id === currPlayer?.id ? '#34d399' : '#94a3b8' }}>
              {opponentPlayer.id === currPlayer?.id ? '● 탐험 중...' : '대기 중'}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
            <span style={{ color: '#fbbf24' }}>🪙 {opponentPlayer.resources.coins}</span>
            <span style={{ color: '#38bdf8' }}>🧭 {opponentPlayer.resources.compasses}</span>
            <span style={{ color: '#f43f5e' }}>💎 {opponentPlayer.resources.rubies}</span>
            <span style={{ color: '#34d399' }}>🔍 Lv {opponentPlayer.glassStep}</span>
          </div>
        )}

        {/* 우측 유틸리티 버튼 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* 온라인 모드 방 코드 & 초대 링크 */}
          {playMode === 'online' && roomCode && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid #10b981',
              borderRadius: '8px',
              padding: '2px 8px'
            }}>
              <Globe size={13} style={{ color: '#34d399' }} />
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>방:</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#34d399', letterSpacing: '1px' }}>{roomCode}</span>
              <button
                onClick={handleCopyInviteLink}
                style={{
                  background: copiedLink ? '#10b981' : '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  color: '#f8fafc',
                  fontSize: '0.68rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
                title="초대 링크 복사"
              >
                {copiedLink ? <Check size={11} /> : <Copy size={11} />}
                <span>{copiedLink ? '복사됨' : '초대'}</span>
              </button>
            </div>
          )}

          {/* 규칙 가이드 버튼 */}
          <button
            onClick={() => {
              soundManager.playClick();
              setIsRuleModalOpen(true);
            }}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <BookOpen size={13} /> 공식 규칙
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

      {/* 상대방 턴 안내 배너 */}
      {!isMyTurn && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#6ee7b7',
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
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite' }} />
          <span>상대 탐험가(<strong>{currPlayer?.name}</strong>)가 행동을 수행하고 있습니다...</span>
        </div>
      )}

      {/* 2. 100vh 3분할 메인 대시보드 (연구트랙 28% : 발굴지 42% : 장비/핸드 30%) */}
      <main style={{
        display: 'grid',
        gridTemplateColumns: '28% 42% 30%',
        gap: '10px',
        flex: 1,
        minHeight: 0,
        marginBottom: '6px'
      }}>
        {/* 좌측: 사원 연구 트랙 */}
        <section style={{ height: '100%', minHeight: 0, overflow: 'hidden' }}>
          <ResearchTrackBoard />
        </section>

        {/* 중앙: 발굴지 & 수호자 */}
        <section style={{ height: '100%', minHeight: 0, overflow: 'hidden' }}>
          <DigSiteBoard />
        </section>

        {/* 우측: 장비 마켓, 핸드 카드, 자원 */}
        <section style={{ height: '100%', minHeight: 0, overflow: 'hidden' }}>
          <MarketAndHandBoard />
        </section>
      </main>

      {/* 하단 연대기 로그 */}
      <div style={{
        height: '65px',
        background: 'rgba(10, 16, 26, 0.95)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
        padding: '6px 12px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        fontSize: '0.68rem',
        color: '#94a3b8',
        flexShrink: 0
      }}>
        {logs.slice(0, 6).map((log, idx) => (
          <div key={idx} style={{ lineHeight: 1.3 }}>
            • {log}
          </div>
        ))}
      </div>

      {/* 모달 */}
      <ArnakRuleGuideModal isOpen={isRuleModalOpen} onClose={() => setIsRuleModalOpen(false)} />
      <ArnakGameOverModal onReturnToLobby={onBackToLobby} />

      {/* 플로팅 피드백 */}
      {feedbacks.map((f) => (
        <div
          key={f.id}
          className="floating-feedback-item font-serif"
          style={{ left: f.x, top: f.y, color: '#34d399' }}
        >
          {f.text}
        </div>
      ))}
    </div>
  );
};
