import React from 'react';
import { useDuelStore } from '../store/useDuelStore';
import { Sparkles } from 'lucide-react';

export const PantheonBoard: React.FC = () => {
  const { pantheonBoard, players, currentTurnPlayerIndex, activateGodAction, playMode, myPlayerId } = useDuelStore();

  if (!pantheonBoard) return null;

  const currPlayer = players[currentTurnPlayerIndex];
  const isMyTurn = playMode === 'online'
    ? currPlayer?.id === myPlayerId
    : (currPlayer && !currPlayer.isAI);

  const getMythologyColor = (mythology: string) => {
    switch (mythology) {
      case 'greek': return '#38bdf8';
      case 'roman': return '#ef4444';
      case 'egyptian': return '#f59e0b';
      case 'mesopotamian': return '#10b981';
      case 'phoenician': return '#c084fc';
      default: return '#94a3b8';
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.8) 0%, rgba(15, 10, 30, 0.9) 100%)',
      border: '1.5px solid rgba(192, 132, 252, 0.4)',
      borderRadius: '12px',
      padding: '10px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={16} color="#c084fc" />
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#e9d5ff', letterSpacing: '0.5px' }}>
            판테온 신들의 제단 (PANTHEON EXPANSION)
          </span>
        </div>
        <span style={{ fontSize: '0.7rem', color: '#a855f7' }}>
          카드 대신 동전을 바치고 신의 기적을 발동할 수 있습니다
        </span>
      </div>

      {/* 5대 신화 슬롯 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
        {pantheonBoard.slots.map((slot, idx) => {
          const god = slot.godCard;
          if (!god) return null;
          const mythColor = getMythologyColor(slot.mythology);
          const canAfford = currPlayer && currPlayer.coins >= god.costInCoins;

          return (
            <div
              key={idx}
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: `1.5px solid ${mythColor}66`,
                borderRadius: '8px',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '6px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: mythColor, textTransform: 'uppercase' }}>
                    {slot.mythology}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: '#fbbf24', fontWeight: 700 }}>
                    🪙 {god.costInCoins}원
                  </span>
                </div>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#ffffff' }}>
                  {god.name}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#cbd5e1', lineHeight: 1.3, marginTop: '2px' }}>
                  {god.description}
                </div>
              </div>

              <button
                disabled={!isMyTurn || !canAfford}
                onClick={() => activateGodAction(god.id)}
                style={{
                  padding: '5px 8px',
                  borderRadius: '6px',
                  background: canAfford ? `linear-gradient(135deg, ${mythColor} 0%, #4c1d95 100%)` : 'rgba(255,255,255,0.05)',
                  color: canAfford ? '#ffffff' : '#64748b',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: canAfford ? 'pointer' : 'not-allowed',
                  boxShadow: canAfford ? `0 0 10px ${mythColor}44` : 'none'
                }}
              >
                기적 발동
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
