import React from 'react';
import { useArnakStore } from '../store/useArnakStore';
import { ShoppingCart, Play, Skull } from 'lucide-react';

export const MarketAndHandBoard: React.FC = () => {
  const { 
    players, 
    currentTurnPlayerIndex, 
    itemMarket, 
    artifactMarket, 
    buyCardAction, 
    playCardAction, 
    passTurnAction,
    playMode, 
    myPlayerId 
  } = useArnakStore();

  const currPlayer = players[currentTurnPlayerIndex];
  const isMyTurn = playMode === 'online' 
    ? currPlayer?.id === myPlayerId 
    : (currPlayer && !currPlayer.isAI);

  const myPlayer = players.find(p => p.id === myPlayerId) || players[0];

  return (
    <div style={{
      background: 'rgba(10, 16, 26, 0.95)',
      border: '1.5px solid rgba(16, 185, 129, 0.3)',
      borderRadius: '12px',
      padding: '10px 14px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      gap: '8px'
    }}>
      {/* 1. 내 자원 대시보드 */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '8px',
        padding: '8px 12px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f8fafc' }}>
            {myPlayer?.name}의 탐험 배낭
          </span>
          <div style={{ display: 'flex', gap: '8px', fontSize: '0.68rem' }}>
            <span style={{ color: '#34d399', fontWeight: 700 }}>
              제압 수호자: {myPlayer?.defeatedGuardians.length}체
            </span>
            <span style={{ color: '#f87171', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
              <Skull size={11} /> 공포: {myPlayer?.fearCardsCount}장
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
          {[
            { id: 'coins', label: '코인', icon: '🪙', color: '#fbbf24', val: myPlayer?.resources.coins },
            { id: 'compasses', label: '나침반', icon: '🧭', color: '#38bdf8', val: myPlayer?.resources.compasses },
            { id: 'tablets', label: '석판', icon: '📜', color: '#a78bfa', val: myPlayer?.resources.tablets },
            { id: 'arrowheads', label: '화살촉', icon: '🏹', color: '#f97316', val: myPlayer?.resources.arrowheads },
            { id: 'rubies', label: '보석', icon: '💎', color: '#f43f5e', val: myPlayer?.resources.rubies }
          ].map(r => (
            <div
              key={r.id}
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: `1px solid ${r.color}44`,
                borderRadius: '6px',
                padding: '4px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '14px' }}>{r.icon}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 900, color: r.color }}>{r.val}</div>
              <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{r.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. 아이템 & 고대 유물 마켓 */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '8px',
        padding: '8px',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShoppingCart size={12} /> 탐험 장비 & 고대 유물 마켓
          </span>
          <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>장비: 코인 🪙 | 유물: 나침반 🧭</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '6px', overflowY: 'auto', flex: 1, paddingRight: '2px' }}>
          {/* 아이템 카드 (골드 앰버 스타일) */}
          {itemMarket.map(item => {
            const canAfford = currPlayer && currPlayer.resources.coins >= (item.costCoins || 0);
            return (
              <div
                key={item.id}
                style={{
                  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
                  border: '1.5px solid rgba(245, 158, 11, 0.45)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  borderRadius: '8px',
                  padding: '7px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  fontSize: '0.68rem',
                  transition: 'transform 0.2s',
                  cursor: 'default'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, color: '#f8fafc' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ fontSize: '11px' }}>⚙️</span>
                      <span>{item.name}</span>
                    </span>
                    <span style={{ background: '#f59e0b22', color: '#fbbf24', padding: '1px 5px', borderRadius: '4px', fontWeight: 900 }}>+{item.victoryPoints}점</span>
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#38bdf8', margin: '3px 0', fontWeight: 700 }}>
                    비용: 🪙 코인 {item.costCoins}개
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#94a3b8', lineHeight: 1.3 }}>
                    {item.description}
                  </div>
                </div>

                <button
                  onClick={() => buyCardAction(item.id, 'item')}
                  disabled={!isMyTurn || !canAfford}
                  style={{
                    marginTop: '5px',
                    padding: '3px 6px',
                    background: canAfford && isMyTurn ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' : '#334155',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#ffffff',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    cursor: canAfford && isMyTurn ? 'pointer' : 'not-allowed',
                    boxShadow: canAfford && isMyTurn ? '0 2px 6px rgba(217, 119, 6, 0.4)' : 'none'
                  }}
                >
                  {canAfford ? '장비 구매' : '코인 부족'}
                </button>
              </div>
            );
          })}

          {/* 유물 카드 (신비로운 보라색 네온 글로우) */}
          {artifactMarket.map(art => {
            const canAfford = currPlayer && currPlayer.resources.compasses >= (art.costCompasses || 0);
            return (
              <div
                key={art.id}
                style={{
                  background: 'linear-gradient(145deg, rgba(88, 28, 135, 0.4) 0%, rgba(46, 16, 101, 0.6) 100%)',
                  border: '1.5px solid #a855f7',
                  boxShadow: '0 0 14px rgba(168, 85, 247, 0.35)',
                  borderRadius: '8px',
                  padding: '7px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  fontSize: '0.68rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, color: '#f8fafc' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ fontSize: '11px' }}>🔮</span>
                      <span>{art.name}</span>
                    </span>
                    <span style={{ background: '#a855f733', color: '#e879f9', padding: '1px 5px', borderRadius: '4px', fontWeight: 900 }}>+{art.victoryPoints}점</span>
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#c084fc', margin: '3px 0', fontWeight: 700 }}>
                    비용: 🧭 나침반 {art.costCompasses}개
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#cbd5e1', lineHeight: 1.3 }}>
                    {art.description}
                  </div>
                </div>

                <button
                  onClick={() => buyCardAction(art.id, 'artifact')}
                  disabled={!isMyTurn || !canAfford}
                  style={{
                    marginTop: '5px',
                    padding: '3px 6px',
                    background: canAfford && isMyTurn ? 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)' : '#334155',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#ffffff',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    cursor: canAfford && isMyTurn ? 'pointer' : 'not-allowed',
                    boxShadow: canAfford && isMyTurn ? '0 2px 8px rgba(147, 51, 234, 0.5)' : 'none'
                  }}
                >
                  {canAfford ? '유물 발굴 (즉시발동)' : '나침반 부족'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 내 핸드 카드 슬롯 및 턴 패스 컨트롤 */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.9)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '8px',
        padding: '8px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#34d399' }}>
            내 핸드 카드 ({myPlayer?.hand.length}장 / 덱: {myPlayer?.deck.length}장 / 버린 덱: {myPlayer?.discard.length}장)
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
                fontSize: '0.68rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              라운드 턴 패스 (Pass)
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {myPlayer?.hand.map(card => (
            <div
              key={card.id}
              style={{
                minWidth: '115px',
                maxWidth: '125px',
                background: card.type === 'fear' 
                  ? 'linear-gradient(135deg, rgba(127, 29, 29, 0.4) 0%, rgba(69, 10, 10, 0.7) 100%)' 
                  : (card.type === 'artifact' ? 'rgba(88, 28, 135, 0.3)' : 'rgba(30, 41, 59, 0.9)'),
                border: card.type === 'fear' 
                  ? '1.5px solid #ef4444' 
                  : (card.type === 'artifact' ? '1.5px solid #c084fc' : '1px solid #64748b'),
                boxShadow: card.type === 'fear' ? '0 0 10px rgba(239, 68, 68, 0.3)' : 'none',
                borderRadius: '8px',
                padding: '7px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                flexShrink: 0
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: card.type === 'fear' ? '#fca5a5' : '#f8fafc', lineHeight: 1.2 }}>
                    {card.name}
                  </span>
                  {card.victoryPoints !== 0 && (
                    <span style={{ fontSize: '0.62rem', fontWeight: 900, color: card.type === 'fear' ? '#ef4444' : '#fbbf24' }}>
                      {card.victoryPoints > 0 ? `+${card.victoryPoints}` : card.victoryPoints}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.62rem', color: '#94a3b8', margin: '4px 0', lineHeight: 1.3 }}>
                  {card.description}
                </div>
              </div>

              {card.type !== 'fear' && isMyTurn && (
                <button
                  onClick={() => playCardAction(card.id)}
                  style={{
                    marginTop: '4px',
                    padding: '3px 6px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#022c22',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px',
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <Play size={10} /> 사용하기
                </button>
              )}
            </div>
          ))}

          {myPlayer?.hand.length === 0 && (
            <div style={{ fontSize: '0.7rem', color: '#64748b', padding: '10px', textAlign: 'center', width: '100%' }}>
              핸드 카드가 모두 소진되었습니다. 다음 라운드에 새 핸드를 드로우합니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
