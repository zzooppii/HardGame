import React from 'react';
import { useBurgundyStore } from '../store/useBurgundyStore';
import { Dices, Sparkles } from 'lucide-react';

export const DiceRollBanner: React.FC = () => {
  const {
    players,
    currentTurnPlayerIndex,
    myPlayerId,
    playMode,
    isRollingDice,
    whiteDie,
    rollMyDice
  } = useBurgundyStore();

  const currPlayer = players[currentTurnPlayerIndex];
  if (!currPlayer) return null;

  const isMyTurn = playMode !== 'online' || currPlayer.id === myPlayerId;
  const showRollPrompt = isMyTurn && !currPlayer.isAI && !currPlayer.hasRolledDice;

  if (!showRollPrompt && !isRollingDice) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 10, 8, 0.72)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 150,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div 
        className="saboteur-board-panel"
        style={{
          width: '460px',
          maxWidth: '90vw',
          padding: '24px 28px',
          borderRadius: '16px',
          background: 'linear-gradient(145deg, #1b281f 0%, #0d1511 100%)',
          border: '2px solid #d4af37',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(212, 175, 55, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#facc15' }}>
          <Sparkles size={20} />
          <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
            The Castles of Burgundy
          </span>
          <Sparkles size={20} />
        </div>

        <h2 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f8fafc', margin: 0 }}>
          {isRollingDice ? '주사위를 힘차게 굴리는 중...' : `${currPlayer.name}님의 차례입니다!`}
        </h2>

        <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
          {isRollingDice 
            ? '나만의 전략을 펼칠 주사위 눈금을 기다립니다.' 
            : '2개의 개인 주사위와 1개의 공용 흰색 주사위(상품 디포 결정)를 굴려 행동을 시작하세요!'}
        </p>

        {/* 3D 텀블링 주사위 애니메이션 뷰 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '15px 0' }}>
          {/* 내 주사위 1 */}
          <div 
            className={`die-cube-3d ${isRollingDice ? 'rolling-animation' : ''}`}
            style={{
              width: '56px',
              height: '56px',
              fontSize: '1.8rem',
              background: 'linear-gradient(145deg, #facc15 0%, #ca8a04 100%)',
              color: '#000',
              fontWeight: 900,
              boxShadow: '0 8px 20px rgba(0,0,0,0.6), 0 0 15px rgba(250, 204, 21, 0.5)'
            }}
          >
            {isRollingDice ? '?' : currPlayer.dice[0]}
          </div>

          {/* 내 주사위 2 */}
          <div 
            className={`die-cube-3d ${isRollingDice ? 'rolling-animation' : ''}`}
            style={{
              width: '56px',
              height: '56px',
              fontSize: '1.8rem',
              background: 'linear-gradient(145deg, #facc15 0%, #ca8a04 100%)',
              color: '#000',
              fontWeight: 900,
              boxShadow: '0 8px 20px rgba(0,0,0,0.6), 0 0 15px rgba(250, 204, 21, 0.5)'
            }}
          >
            {isRollingDice ? '?' : currPlayer.dice[1]}
          </div>

          <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.15)' }} />

          {/* 공용 흰색 주사위 (상품 타일 위치 결정) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div 
              className={`die-cube-3d ${isRollingDice ? 'rolling-animation' : ''}`}
              style={{
                width: '46px',
                height: '46px',
                fontSize: '1.5rem',
                background: 'linear-gradient(145deg, #ffffff 0%, #e2e8f0 100%)',
                color: '#0f172a',
                fontWeight: 900,
                border: '2px solid #94a3b8',
                boxShadow: '0 4px 14px rgba(0,0,0,0.5)'
              }}
              title="공용 흰색 주사위 (디포 상품 배치 번호)"
            >
              {isRollingDice ? '?' : whiteDie}
            </div>
            <span style={{ fontSize: '0.65rem', color: '#cbd5e1', fontWeight: 700 }}>
              흰색 주사위
            </span>
          </div>
        </div>

        {/* 굴리기 버튼 */}
        {!isRollingDice && (
          <button
            onClick={() => rollMyDice()}
            style={{
              width: '100%',
              padding: '12px 24px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
              border: '2px solid #fef08a',
              color: '#000',
              fontWeight: 900,
              fontSize: '1.05rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 6px 20px rgba(202, 138, 4, 0.5)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Dices size={22} />
            <span>🎲 주사위 굴리기 (Roll Dice)</span>
          </button>
        )}
      </div>
    </div>
  );
};
