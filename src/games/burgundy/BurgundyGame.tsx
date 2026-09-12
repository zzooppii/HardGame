import React, { useEffect, useState } from 'react';
import { useBurgundyStore } from './store/useBurgundyStore';
import { DuchyBoard } from './components/DuchyBoard';
import { CentralDepotBoard } from './components/CentralDepotBoard';
import { BurgundyActionGuideHUD } from './components/BurgundyActionGuideHUD';
import { DiceRollBanner } from './components/DiceRollBanner';
import { BurgundyTileTooltip } from './components/BurgundyTileTooltip';
import { BurgundyGameOverModal } from './components/BurgundyGameOverModal';
import { Volume2, VolumeX, HelpCircle, LogOut, Globe, Copy, Check } from 'lucide-react';
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
    playMode,
    roomCode,
    myPlayerId,
    phase,
    round,
    players,
    currentTurnPlayerIndex,
    logs,
    hoveredTile,
    initGame
  } = useBurgundyStore();

  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());
  const [copied, setCopied] = useState(false);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [viewingPlayerId, setViewingPlayerId] = useState<string>('p-0');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (players.length === 0) {
      initGame(2, true);
    }
  }, []);

  useEffect(() => {
    // 온라인 모드일 때 내 플레이어 id로 기본 보기 설정
    if (playMode === 'online' && myPlayerId) {
      setViewingPlayerId(myPlayerId);
    }
  }, [playMode, myPlayerId]);

  useEffect(() => {
    const unsubscribe = subscribeFeedback((item) => {
      setFeedbacks((prev) => [...prev, item]);
      setTimeout(() => {
        setFeedbacks((prev) => prev.filter((f) => f.id !== item.id));
      }, 1200);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'G' && e.shiftKey) {
        useBurgundyStore.setState({ isGameOver: true });
      }
    };
    const handleGameOverEvent = () => {
      useBurgundyStore.setState({ isGameOver: true });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('test-gameover', handleGameOverEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('test-gameover', handleGameOverEvent);
    };
  }, []);

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) soundManager.playCoin();
  };

  const handleCopyInvite = () => {
    if (!roomCode) return;
    let host = window.location.host;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      host = `192.168.0.18:${window.location.port || '5173'}`;
    }
    const url = `${window.location.protocol}//${host}${window.location.pathname}?room=${roomCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currTurnPlayer = players[currentTurnPlayerIndex];
  const viewedPlayer = players.find(p => p.id === viewingPlayerId) || players[0];
  const otherPlayer = players.find(p => p.id !== (playMode === 'online' ? myPlayerId : 'p-0')) || players[1];
  const isMyTurn = playMode !== 'online' || currTurnPlayer?.id === myPlayerId;

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
      
      {/* 1. 컴팩트 상단 헤더 & 스플랜더식 상대방 현황 바 */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '8px',
        borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
        marginBottom: '8px',
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

          {/* 온라인 모드 방 코드 배지 */}
          {playMode === 'online' && roomCode && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(168, 85, 247, 0.15)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              borderRadius: '8px',
              padding: '3px 10px'
            }}>
              <Globe size={13} color="#c084fc" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e9d5ff' }}>방: {roomCode}</span>
              <button
                onClick={handleCopyInvite}
                style={{
                  padding: '2px 8px',
                  fontSize: '0.7rem',
                  borderRadius: '4px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {copied ? <Check size={11} color="#4ade80" /> : <Copy size={11} />}
                {copied ? '복사됨' : '초대 링크'}
              </button>
            </div>
          )}
        </div>

        {/* 중앙: 스플랜더 상단 벤치마크 - 상대방 실시간 현황 캡슐 */}
        {otherPlayer && (
          <div 
            onClick={() => {
              soundManager.playClick();
              const myId = playMode === 'online' ? myPlayerId : 'p-0';
              setViewingPlayerId(viewingPlayerId === otherPlayer.id ? myId : otherPlayer.id);
            }}
            title={viewingPlayerId === otherPlayer.id ? '내 영지로 돌아가기' : '상대방 영지 맵 구경하기'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: viewingPlayerId === otherPlayer.id ? 'rgba(38, 54, 44, 0.95)' : 'rgba(18, 26, 22, 0.9)',
              border: viewingPlayerId === otherPlayer.id ? '1.5px solid #d4af37' : '1px solid rgba(212, 175, 55, 0.25)',
              padding: '4px 14px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              boxShadow: viewingPlayerId === otherPlayer.id ? '0 0 10px rgba(212, 175, 55, 0.3)' : 'none'
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: otherPlayer.color }} />
            <span style={{ fontWeight: 700, color: '#f8fafc' }}>{otherPlayer.name}</span>
            <span style={{ color: otherPlayer.id === currTurnPlayer?.id ? '#f87171' : '#94a3b8' }}>
              {otherPlayer.id === currTurnPlayer?.id ? '● 행동 중...' : '대기 중'}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
            <span style={{ color: '#facc15' }}>🪙 {otherPlayer.silverlings}</span>
            <span style={{ color: '#60a5fa' }}>👷 {otherPlayer.workers}</span>
            <span style={{ color: '#4ade80' }}>🏆 {otherPlayer.vp} VP</span>
            <span style={{ fontSize: '0.65rem', color: '#d4af37', marginLeft: '4px' }}>
              {viewingPlayerId === otherPlayer.id ? '[내 영지 복귀]' : '[영지 보기]'}
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

      {/* 온라인 모드: 상대방 턴일 때 안내 배너 */}
      {playMode === 'online' && !isMyTurn && (
        <div style={{
          background: 'rgba(234, 179, 8, 0.15)',
          border: '1px solid rgba(234, 179, 8, 0.4)',
          color: '#fef08a',
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
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#eab308', animation: 'pulse 1.5s infinite' }} />
          <span>상대 플레이어(<strong>{currTurnPlayer?.name}</strong>)의 턴을 기다리고 있습니다...</span>
        </div>
      )}

      {/* 2. 메인 1화면 2분할 대시보드 (좌 49% : 우 51% 균형 배분으로 3열 디포 완벽 수용) */}
      <main style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.08fr)',
        gap: '12px',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        pointerEvents: isMyTurn ? 'auto' : 'none',
        opacity: isMyTurn ? 1 : 0.92,
        transition: 'opacity 0.2s ease'
      }}>
        
        {/* [좌측 50%] 내 영지 보드 (실물 보드게임 영지 매트) + 4대 행동 실시간 가이드 HUD */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%', minHeight: 0 }}>
          <div style={{ flex: 1, minHeight: 0 }}>
            {viewedPlayer && (
              <DuchyBoard 
                player={viewedPlayer} 
                isCurrentPlayer={viewedPlayer.id === currTurnPlayer?.id} 
              />
            )}
          </div>
          
          {/* 버건디 4대 행동 안내 및 일꾼 영입 즉시 실행 HUD */}
          <div style={{ flexShrink: 0 }}>
            <BurgundyActionGuideHUD />
          </div>
        </div>

        {/* [우측 50%] 중앙 메인 보드 (1~100 VP 트랙, 페이즈 보너스, 1~6 디포, 암시장) & 연대기 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%', minHeight: 0, overflow: 'hidden' }}>
          
          {/* 중앙 디포 진열대 (인원수별 슬롯 2~4개 동적 완벽 반영) */}
          <div style={{ flexShrink: 0 }}>
            <CentralDepotBoard />
          </div>

          {/* 하단 영지 연대기 로그 */}
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

      {/* 1. 주사위 굴리기 상호작용 배너 */}
      <DiceRollBanner />

      {/* 2. 타일 상세 설명 100% 전문 플로팅 툴팁 */}
      <BurgundyTileTooltip tile={hoveredTile} position={mousePos} visible={!!hoveredTile} />

      {/* 3. 게임 종료 모달 */}
      <BurgundyGameOverModal onReturnToLobby={onBackToLobby} />

      {/* 4. 친절한 상세 규칙 모달 (유튜브 룰 가이드 완벽 반영) */}
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
          <div className="glass-panel" style={{ width: '100%', maxWidth: '680px', maxHeight: '88vh', overflowY: 'auto', padding: '24px', background: '#0e1411', border: '1.5px solid #d4af37', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(212,175,55,0.3)', paddingBottom: '8px' }}>
              <h3 className="font-serif text-gold-gradient" style={{ margin: 0, fontSize: '1.3rem' }}>
                🏰 버건디의 성 완벽 가이드 & 규칙
              </h3>
              <button className="btn-secondary" onClick={() => setShowRulesModal(false)}>닫기</button>
            </div>
            
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '12px', lineHeight: 1.5 }}>
              
              <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '8px 12px', borderRadius: '6px', borderLeft: '3px solid #d4af37' }}>
                <strong style={{ color: '#facc15' }}>📌 인원수별 보드면 세팅</strong>
                <p style={{ margin: '3px 0 0 0' }}>
                  • <strong>2인 플레이</strong>: 디포당 2개 타일 슬롯 배치 (총 12개 + 암시장 4개)<br/>
                  • <strong>3인 플레이</strong>: 디포당 3개 타일 슬롯 배치 (3+ 슬롯 추가, 암시장 6개)<br/>
                  • <strong>4인 플레이</strong>: 디포당 4개 타일 슬롯 배치 (4인 슬롯 추가, 암시장 8개)
                </p>
              </div>

              <div>
                <strong style={{ color: '#facc15' }}>🎲 주사위 굴리기 & 턴 진행 순환</strong>
                <p style={{ margin: '3px 0 0 0' }}>
                  매 라운드 시작 시 플레이어는 자신의 <strong>개인 주사위 2개</strong>를 직접 굴립니다.
                  또한 선 플레이어는 <strong>공용 흰색 주사위</strong>를 함께 굴려 해당 번호 디포에 라운드 상품을 배치합니다.
                  각 턴마다 주사위 2개를 소모하여 아래의 4가지 행동 중 원하는 것을 2회 수행합니다 (같은 행동 중복 가능).
                </p>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.35)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <strong style={{ color: '#86efac' }}>⚡ 버건디의 4대 핵심 주사위 행동</strong>
                <ol style={{ margin: '6px 0 0 18px', padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li><strong>디포 타일 가져오기</strong>: 주사위 눈금과 번호가 같은 디포(1~6)에서 타일 1개를 가져와 내 [임시 보관소(3칸)]에 저장합니다.</li>
                  <li><strong>영지에 타일 배치</strong>: 내 임시 보관소에 있는 타일을 선택하고, 주사위 눈금과 일치하는 인접한 영지 빈 칸에 배치하여 즉시 고유 효과를 발동합니다.</li>
                  <li><strong>상품 판매</strong>: 주사위 눈금 번호와 일치하는 상품을 판매하여 은화 1개와 인원수당 승점(VP)을 획득합니다.</li>
                  <li><strong>일꾼 2명 받기</strong>: 주사위 눈금과 상관없이 주사위를 소모하여 일꾼 토큰 2개를 즉시 영입합니다.</li>
                </ol>
                <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#fde047' }}>
                  🪙 <strong>중앙 암시장 구매</strong>: 주사위 소모 없이 은화 2개를 지불하여 암시장 타일을 보관소로 즉시 가져옵니다 (턴당 1회).
                </div>
              </div>

              <div>
                <strong style={{ color: '#60a5fa' }}>👷 일꾼 토큰의 위력 (주사위 눈금 ±1 보정)</strong>
                <p style={{ margin: '3px 0 0 0' }}>
                  일꾼 토큰 1개를 소모할 때마다 주사위 눈금을 +1 또는 -1 원하는 대로 조정할 수 있습니다. 1에서 -1하면 6이 되고, 6에서 +1하면 1이 되는 순환 룰이 적용됩니다!
                </p>
              </div>

              <div>
                <strong style={{ color: '#f472b6' }}>🏆 6대 타일 종류 및 영지 완성 점수</strong>
                <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
                  <li><strong>성 (다크그린)</strong>: 배치 즉시 무료 추가 행동 1회 획득</li>
                  <li><strong>도시 건물 8종 (베이지)</strong>: 시청(무료배치), 교회(특수타일획득), 여관(일꾼4개), 은행(은화2개) 등 강력한 즉발 효과</li>
                  <li><strong>목장 가축 (연두)</strong>: 동물 마리 수 점수 + 같은 목장 내 기존 동물 점수까지 누적 복리 획득</li>
                  <li><strong>선박 (파랑)</strong>: 턴 순서 트랙 1칸 전진 + 디포의 상품 타일 독점 획득</li>
                  <li><strong>광산 (회색)</strong>: 매 페이즈 종료 시마다 지속적으로 은화 채굴</li>
                  <li><strong>수도원/지식 (노랑)</strong>: 게임 내내 적용되는 패시브 및 게임 종료 보너스 점수</li>
                </ul>
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
