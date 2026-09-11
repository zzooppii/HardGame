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

  return (
    <div className="theme-burgundy-masterpiece" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '16px 24px', maxWidth: '1680px', margin: '0 auto' }}>
      
      {/* 1. 최상단 사보타지 스타일 글로벌 바 */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '12px',
        borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
        marginBottom: '14px'
      }}>
        <div>
          <div style={{ fontSize: '0.68rem', letterSpacing: '2px', color: '#d4af37', fontWeight: 700, marginBottom: '2px' }}>
            A GAME OF PRINCIPALITIES & COMBOS
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <h1 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '1px', margin: 0 }}>
              THE CASTLES OF BURGUNDY
            </h1>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>버건디의 성</span>
          </div>
        </div>

        {/* 우측 상단 상태 및 제어 버튼 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            방 <strong>BGD-2026</strong>
          </span>
          <span style={{ fontSize: '0.72rem', color: '#4ade80', background: 'rgba(34, 197, 94, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
            솔로 AI 세션
          </span>

          <button 
            onClick={() => {
              soundManager.playClick();
              setShowRulesModal(true);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              color: '#f8fafc',
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <HelpCircle size={14} color="#d4af37" /> 게임 방법
          </button>

          <button
            className={`sound-toggle-btn ${!isMuted ? 'active' : ''}`}
            onClick={handleToggleMute}
            title={isMuted ? '소리 켜기' : '음소거'}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          <button 
            onClick={onBackToLobby}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <LogOut size={14} /> 나가기
          </button>
        </div>
      </header>

      {/* 2. 사보타지 턴 인디케이터 & 캡슐형 플레이어 트랙 */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          {/* 라운드 카운터 & 턴 안내 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span className="font-serif" style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f8fafc' }}>{phase}</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>/ 5</span>
              <span style={{ fontSize: '0.68rem', letterSpacing: '1px', color: '#d4af37', fontWeight: 800, marginLeft: '2px' }}>PHASE</span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: currTurnPlayer?.isAI ? '#f87171' : '#4ade80' }}>
              {currTurnPlayer?.name}님의 차례
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            라운드 <strong>{round} / 5</strong>
          </div>
        </div>

        {/* 플레이어 캡슐 바 (사보타지 상단 캡슐 1:1 벤치마크) */}
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
          {players.map((p, idx) => {
            const isTurn = p.id === currTurnPlayer?.id;
            const isViewing = p.id === viewingPlayerId;

            return (
              <div
                key={p.id}
                className={`saboteur-player-capsule ${isTurn ? 'active-turn' : ''}`}
                onClick={() => {
                  soundManager.playClick();
                  setViewingPlayerId(p.id);
                }}
                style={{
                  cursor: 'pointer',
                  minWidth: '220px',
                  opacity: isViewing ? 1 : 0.75,
                  position: 'relative'
                }}
              >
                {/* 플레이어 번호 */}
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isTurn ? 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)' : 'rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '0.75rem',
                  color: isTurn ? '#fff' : '#94a3b8'
                }}>
                  0{idx + 1}
                </div>

                {/* 플레이어 정보 */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#f8fafc' }}>
                      {p.name}
                    </span>
                    {idx === 0 && (
                      <span style={{ fontSize: '0.65rem', background: '#d97706', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
                        나
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                    🪙 {p.silverlings} · 👷 {p.workers} · 🏆 {p.vp} VP
                  </div>
                </div>

                {/* 영지 슬롯 현황 미니 인디케이터 */}
                <div style={{ fontSize: '1rem', opacity: 0.8 }}>
                  🏰
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 메인 게임 보드 (좌측: 중앙 디포, 중앙: 영지 육각 맵, 우측: 사보타지 사이드 패널) */}
      <main style={{ display: 'grid', gridTemplateColumns: 'minmax(420px, 1fr) minmax(460px, 1.15fr) 280px', gap: '16px', flex: 1, alignItems: 'start' }}>
        
        {/* [A] 중앙 디포 & 암시장 */}
        <CentralDepotBoard />

        {/* [B] 영지 보드 */}
        {viewedPlayer && (
          <DuchyBoard 
            player={viewedPlayer} 
            isCurrentPlayer={viewedPlayer.id === currTurnPlayer?.id} 
          />
        )}

        {/* [C] 사보타지 스타일 사이드 정보 & 로그 패널 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* 사보타지 "ONLY YOU CAN SEE" 스타일 군주 상태창 */}
          <div className="saboteur-board-panel" style={{ padding: '16px', border: '1px solid rgba(212, 175, 55, 0.4)' }}>
            <div style={{ fontSize: '0.65rem', letterSpacing: '1.5px', color: '#d4af37', fontWeight: 800, marginBottom: '8px' }}>
              ONLY YOU CAN SEE
            </div>
            <div style={{
              background: 'rgba(10, 15, 13, 0.8)',
              borderRadius: '8px',
              padding: '12px',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '2px' }}>👑</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc' }}>부르고뉴 통치 군주</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                승점: <strong style={{ color: '#facc15' }}>{currTurnPlayer?.vp} VP</strong> | 순서: 1위
              </div>
            </div>
          </div>

          {/* 사보타지 "광산의 대화" 스타일 영지 연대기 로그 */}
          <div className="saboteur-board-panel" style={{ padding: '16px', flex: 1, maxHeight: '420px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc' }}>
                영지 연대기
              </span>
              <span style={{ fontSize: '0.68rem', color: '#64748b' }}>모두에게 공개</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', paddingRight: '4px' }}>
              {logs.map((log, lIdx) => (
                <div 
                  key={lIdx} 
                  style={{ 
                    padding: '6px 8px', 
                    borderRadius: '6px', 
                    background: 'rgba(0,0,0,0.35)', 
                    borderLeft: '2px solid #d4af37',
                    color: '#cbd5e1',
                    lineHeight: 1.35
                  }}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      {/* 4. 사보타지 '내 손패' 벤치마크: 하단 일체형 트레이 */}
      <PlayerBottomTray />

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
          <div className="glass-panel" style={{ width: '100%', maxWidth: '640px', maxHeight: '85vh', overflowY: 'auto', padding: '28px', background: '#0e1411', border: '1.5px solid #d4af37' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="font-serif text-gold-gradient" style={{ margin: 0, fontSize: '1.4rem' }}>
                버건디의 성 게임 규칙 가이드
              </h3>
              <button className="btn-secondary" onClick={() => setShowRulesModal(false)}>닫기</button>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '12px', lineHeight: 1.5 }}>
              <div>
                <strong style={{ color: '#facc15' }}>1. 주사위 드래프트 액션</strong>
                <p style={{ margin: '4px 0 0 0' }}>
                  매 라운드 2개의 주사위를 굴립니다. 각 주사위로 ① 해당 눈금 디포에서 타일 가져오기, ② 보관소 타일을 영지의 일치하는 눈금 칸에 배치하기, ③ 상품 판매, ④ 일꾼 2개 영입 중 하나를 수행합니다.
                </p>
              </div>
              <div>
                <strong style={{ color: '#facc15' }}>2. 일꾼 토큰 보정 (±1)</strong>
                <p style={{ margin: '4px 0 0 0' }}>
                  일꾼 1개를 소모하여 주사위 눈금을 ±1 조정할 수 있습니다. 1과 6은 서로 순환 연결됩니다.
                </p>
              </div>
              <div>
                <strong style={{ color: '#facc15' }}>3. 영지 배치 인접성</strong>
                <p style={{ margin: '4px 0 0 0' }}>
                  타일은 색상과 주사위 번호가 일치하고, 이미 배치된 기존 타일과 최소 1변 이상 맞닿아 있는 슬롯에만 놓을 수 있습니다.
                </p>
              </div>
              <div>
                <strong style={{ color: '#facc15' }}>4. 구역 완성 점수</strong>
                <p style={{ margin: '4px 0 0 0' }}>
                  같은 색상의 연결된 구역을 타일로 모두 채우면 구역 크기 점수(1~8칸)와 페이즈 조기 완성 보너스(A: 10점 ~ E: 2점)를 대량 획득합니다!
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
