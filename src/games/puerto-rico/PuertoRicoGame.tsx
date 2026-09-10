import React, { useState } from 'react';
import { usePuertoRicoStore } from './store/usePuertoRicoStore';
import { GameBoard } from './components/GameBoard';
import { PlayerMat } from './components/PlayerMat';
import { GameLog } from './components/GameLog';
import { ActionModal } from './components/ActionModal';
import { GameOverModal } from './components/GameOverModal';
import { ArrowLeft, RotateCcw, HelpCircle } from 'lucide-react';

interface PuertoRicoGameProps {
  onBackToLobby: () => void;
}

export const PuertoRicoGame: React.FC<PuertoRicoGameProps> = ({ onBackToLobby }) => {
  const { round, playMode, roomCode, myPlayerId, players, currentTurnPlayerIndex, initGame } = usePuertoRicoStore();
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const currTurnPlayer = players[currentTurnPlayerIndex];
  const isMyTurn = playMode !== 'online' || currTurnPlayer?.id === myPlayerId;

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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '12px 14px', maxWidth: '1600px', margin: '0 auto' }}>
      
      {/* 상단 네비게이션 & 제어 바 */}
      <header className="game-header-bar" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 18px',
        borderRadius: '12px',
        background: 'rgba(22, 27, 34, 0.85)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--amber-border)',
        marginBottom: '16px'
      }}>
        {/* 1열/좌측: 로비 나가기 & 게임 제목 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              className="btn-secondary" 
              onClick={onBackToLobby}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <ArrowLeft size={15} /> 로비
            </button>
            
            <div>
              <h1 className="font-serif text-gold-gradient" style={{ fontSize: '1.15rem', margin: 0 }}>
                푸에르토리코
              </h1>
            </div>
          </div>

          {/* 모바일에서 방 코드 배지 */}
          {playMode === 'online' && roomCode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid #c084fc', fontSize: '0.78rem' }}>
                방: {roomCode}
              </span>
              <button 
                className="btn-secondary" 
                onClick={handleCopyInvite}
                style={{ padding: '3px 8px', fontSize: '0.72rem' }}
              >
                {copied ? '✓' : '초대'}
              </button>
            </div>
          )}
        </div>

        {/* 2열/중앙 및 우측: 라운드, 턴 상태, 규칙 & 다시시작 */}
        <div className="header-controls-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="badge badge-gold" style={{ fontSize: '0.82rem', padding: '4px 10px' }}>
            라운드 {round}
          </div>

          {playMode === 'online' && !isMyTurn && (
            <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid #f87171', fontSize: '0.78rem' }}>
              ⏳ {currTurnPlayer?.name} 행동 중
            </span>
          )}

          <button 
            className="btn-secondary" 
            onClick={() => setShowRulesModal(true)}
            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
          >
            <HelpCircle size={14} color="var(--gold-secondary)" /> 규칙
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => initGame(3, true)}
            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
          >
            <RotateCcw size={14} /> 재시작
          </button>
        </div>
      </header>

      {/* 본문 게임 인터페이스 */}
      <main className="game-layout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px', flex: 1, alignItems: 'start' }}>
        
        {/* 좌측 메인 보드 + 개인 영지판 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <GameBoard />
          <PlayerMat />
        </div>

        {/* 우측 패널: 로그 및 게임 요약 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '20px' }}>
          <GameLog />

          {/* 건물 도감 퀵 레퍼런스 */}
          <div className="glass-panel" style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--gold-primary)', marginBottom: '8px' }}>
              💡 핵심 플레이 팁
            </div>
            <ul style={{ fontSize: '0.78rem', color: 'var(--text-muted)', paddingLeft: '16px', lineHeight: 1.6 }}>
              <li><strong>옥수수</strong>는 생산 공장 없이 농장 일꾼만으로 즉시 생산됩니다.</li>
              <li><strong>채석장</strong>을 확보하면 건물을 지을 때마다 영구 할인을 받습니다.</li>
              <li><strong>화물선</strong>은 1종류의 상품만 실을 수 있으므로 상대방의 선적을 견제할 수 있습니다.</li>
              <li>선장 페이즈 후 창고가 없으면 상품은 <strong>단 1개만</strong> 남고 모두 폐기됩니다!</li>
            </ul>
          </div>
        </div>

      </main>

      {/* 액션 인터랙션 모달 (턴 플레이어) */}
      <ActionModal />

      {/* 게임 오버 승점 정산 모달 */}
      <GameOverModal onReturnToLobby={onBackToLobby} />

      {/* 규칙 설명 모달 */}
      {showRulesModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(5, 8, 15, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 300,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', maxHeight: '85vh', overflowY: 'auto', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h2 className="font-serif text-gold-gradient" style={{ margin: 0, fontSize: '1.4rem' }}>
                푸에르토리코 게임 규칙 요약 가이드
              </h2>
              <button 
                className="btn-secondary" 
                onClick={() => setShowRulesModal(false)}
                style={{ padding: '4px 10px' }}
              >
                닫기 ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.86rem', lineHeight: 1.6 }}>
              <div>
                <h4 style={{ color: 'var(--gold-secondary)', marginBottom: '4px' }}>1. 게임의 목표</h4>
                <p style={{ color: 'var(--text-muted)' }}>
                  카리브해의 지사가 되어 작물을 재배하고, 도시를 번영시키며, 화물선에 상품을 실어 유럽으로 보내 가장 많은 <strong>승점(VP)</strong>을 획득하는 사람이 승리합니다.
                </p>
              </div>

              <div>
                <h4 style={{ color: 'var(--gold-secondary)', marginBottom: '4px' }}>2. 역할(Role) 선택과 특권</h4>
                <p style={{ color: 'var(--text-muted)' }}>
                  총독부터 시계방향으로 역할을 하나씩 선택합니다. 역할을 선택한 플레이어는 고유의 <strong>특권(Privilege)</strong>을 얻고, 모든 플레이어가 해당 행동을 순서대로 수행합니다. 선택되지 않은 역할에는 라운드마다 1두블론이 쌓입니다.
                </p>
              </div>

              <div>
                <h4 style={{ color: 'var(--gold-secondary)', marginBottom: '4px' }}>3. 작물 생산 체계</h4>
                <p style={{ color: 'var(--text-muted)' }}>
                  옥수수는 가공 시설이 필요 없지만(0원), 인디고, 설탕, 담배, 커피는 농장과 가공 공장 모두에 일꾼이 배치되어야 생산할 수 있습니다.
                </p>
              </div>

              <div>
                <h4 style={{ color: 'var(--gold-secondary)', marginBottom: '4px' }}>4. 게임 종료 조건</h4>
                <p style={{ color: 'var(--text-muted)' }}>
                  ① 이주민 공급처 고갈, ② 승점 칩 고갈, ③ 한 플레이어가 12채의 건물을 모두 건설함 중 하나가 만족되면 해당 라운드를 끝마치고 최종 점수를 정산합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
