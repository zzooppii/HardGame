import React from 'react';
import { useTMStore } from '../store/useTMStore';
import { canPlayCard } from '../engine/gameLogic';

export const ProjectCardsPanel: React.FC = () => {
  const { 
    players, 
    currentTurnPlayerIndex, 
    temperature, 
    oxygen, 
    oceansPlaced, 
    cardMarket, 
    playCardAction, 
    executeStandardProjectAction, 
    buyCardFromMarket, 
    passTurnAction,
    playMode, 
    myPlayerId 
  } = useTMStore();

  const currPlayer = players[currentTurnPlayerIndex];
  const myPlayer = players.find(p => p.id === myPlayerId) || players[0];
  const isMyTurn = playMode === 'online' 
    ? currPlayer?.id === myPlayerId 
    : (currPlayer && !currPlayer.isAI);

  const getTagBadge = (tag: string) => {
    switch (tag) {
      case 'space': return <span style={{ color: '#38bdf8' }}>🚀 우주</span>;
      case 'building': return <span style={{ color: '#94a3b8' }}>🏗️ 건물</span>;
      case 'plant': return <span style={{ color: '#22c55e' }}>🌱 식물</span>;
      case 'power': return <span style={{ color: '#a855f7' }}>⚡ 전력</span>;
      case 'city': return <span style={{ color: '#e879f9' }}>🏙️ 도시</span>;
      default: return <span style={{ color: '#cbd5e1' }}>🏷️ {tag}</span>;
    }
  };

  return (
    <div style={{
      background: 'rgba(15, 10, 15, 0.95)',
      border: '1.5px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '12px',
      padding: '10px 14px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      gap: '8px'
    }}>
      {/* 1. 표준 프로젝트 패널 */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '8px',
        padding: '6px 10px',
        flexShrink: 0
      }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#fca5a5', marginBottom: '4px' }}>
          표준 프로젝트 (STANDARD PROJECTS)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
          {[
            { type: 'power', label: '발전소', cost: 11, desc: '에너지+1' },
            { type: 'asteroid', label: '소행성', cost: 14, desc: '온도+2' },
            { type: 'ocean', label: '대양', cost: 18, desc: '해양타일' },
            { type: 'greenery', label: '녹지', cost: 23, desc: '산소+1' },
            { type: 'city', label: '도시', cost: 25, desc: 'M€생산+1' }
          ].map(p => {
            const canAfford = currPlayer && currPlayer.resources.megacredits >= p.cost;
            return (
              <button
                key={p.type}
                onClick={() => {
                  if (isMyTurn && canAfford) {
                    executeStandardProjectAction(p.type as any);
                  }
                }}
                disabled={!isMyTurn || !canAfford}
                style={{
                  background: canAfford && isMyTurn ? 'rgba(239, 68, 68, 0.2)' : '#1e293b',
                  border: canAfford && isMyTurn ? '1px solid #ef4444' : '1px solid #334155',
                  borderRadius: '6px',
                  padding: '4px 2px',
                  color: '#ffffff',
                  fontSize: '0.62rem',
                  cursor: canAfford && isMyTurn ? 'pointer' : 'not-allowed',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontWeight: 800 }}>{p.label}</div>
                <div style={{ color: '#fbbf24', fontSize: '0.58rem' }}>{p.cost} M€</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. 카드 연구 마켓 */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '8px',
        padding: '6px 10px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#38bdf8' }}>
            신규 특허 연구 마켓 (개당 3 M€)
          </span>
          <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>남은 연구: {cardMarket.length}개</span>
        </div>

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {cardMarket.map(card => {
            const canAfford = currPlayer && currPlayer.resources.megacredits >= 3;
            return (
              <div
                key={card.id}
                style={{
                  minWidth: '120px',
                  maxWidth: '130px',
                  background: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  padding: '5px',
                  fontSize: '0.62rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  flexShrink: 0
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#f8fafc', lineHeight: 1.2 }}>{card.name}</div>
                  <div style={{ color: '#fbbf24', margin: '2px 0' }}>실행비용: {card.cost} M€</div>
                </div>
                <button
                  onClick={() => buyCardFromMarket(card.id)}
                  disabled={!isMyTurn || !canAfford}
                  style={{
                    marginTop: '3px',
                    padding: '2px',
                    background: canAfford && isMyTurn ? '#0284c7' : '#334155',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#ffffff',
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    cursor: canAfford && isMyTurn ? 'pointer' : 'not-allowed'
                  }}
                >
                  연구 구매 (3 M€)
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 내 핸드 프로젝트 카드 리스트 */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '8px',
        padding: '8px',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fca5a5' }}>
            보유 프로젝트 핸드 ({myPlayer?.hand.length}장)
          </span>

          {isMyTurn && (
            <button
              onClick={() => passTurnAction()}
              style={{
                padding: '3px 8px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid #ef4444',
                borderRadius: '4px',
                color: '#fca5a5',
                fontSize: '0.65rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              세대 턴 패스 (Pass)
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '6px', overflowY: 'auto', flex: 1, paddingRight: '2px' }}>
          {myPlayer?.hand.map(card => {
            const check = currPlayer ? canPlayCard(currPlayer, card, { temperature, oxygen, oceansPlaced }) : { canPlay: false };
            return (
              <div
                key={card.id}
                style={{
                  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
                  border: check.canPlay ? '1.5px solid #ef4444' : '1px solid #475569',
                  borderRadius: '6px',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  fontSize: '0.65rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, color: '#f8fafc' }}>
                    <span>{card.name}</span>
                    <span style={{ background: '#ef444422', color: '#f87171', padding: '1px 4px', borderRadius: '4px' }}>
                      {card.cost} M€
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', margin: '3px 0' }}>
                    {card.tags.map((tag, idx) => (
                      <span key={idx} style={{ fontSize: '0.58rem' }}>{getTagBadge(tag)}</span>
                    ))}
                  </div>

                  <div style={{ fontSize: '0.6rem', color: '#94a3b8', lineHeight: 1.2 }}>
                    {card.description}
                  </div>
                </div>

                <button
                  onClick={() => playCardAction(card.id)}
                  disabled={!isMyTurn || !check.canPlay}
                  style={{
                    marginTop: '4px',
                    padding: '3px 6px',
                    background: check.canPlay && isMyTurn ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : '#334155',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#ffffff',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    cursor: check.canPlay && isMyTurn ? 'pointer' : 'not-allowed',
                    boxShadow: check.canPlay && isMyTurn ? '0 2px 6px rgba(239, 68, 68, 0.4)' : 'none'
                  }}
                  title={check.reason || '프로젝트 실행'}
                >
                  {check.canPlay ? '프로젝트 실행' : (check.reason || '조건 미충족')}
                </button>
              </div>
            );
          })}

          {myPlayer?.hand.length === 0 && (
            <div style={{ fontSize: '0.68rem', color: '#64748b', textAlign: 'center', padding: '14px', width: '100%' }}>
              보유한 프로젝트 카드가 없습니다. 상단 마켓에서 특허 카드를 연구하세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
