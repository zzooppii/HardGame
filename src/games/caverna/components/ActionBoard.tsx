import React from 'react';
import { useCavernaStore } from '../store/useCavernaStore';
import type { ActionSpace } from '../types';
import { Axe, Hammer, Sparkles, Sprout, Pickaxe, Flame, Shield, Users } from 'lucide-react';
import { soundManager } from '../../../utils/sound';

export const ActionBoard: React.FC = () => {
  const { 
    actionSpaces, 
    round, 
    performAction, 
    players, 
    currentTurnPlayerIndex 
  } = useCavernaStore();

  const currPlayer = players[currentTurnPlayerIndex];
  const isMyTurn = currPlayer && !currPlayer.isAI;

  const getActionIcon = (actionType: ActionSpace['actionType']) => {
    switch (actionType) {
      case 'logging': return <Axe size={14} color="#f59e0b" />;
      case 'quarry': return <Pickaxe size={14} color="#94a3b8" />;
      case 'ore_mining': return <Hammer size={14} color="#38bdf8" />;
      case 'ruby_mining': return <Sparkles size={14} color="#f43f5e" />;
      case 'slash_and_burn': return <Flame size={14} color="#ea580c" />;
      case 'sow_crops': return <Sprout size={14} color="#22c55e" />;
      case 'blacksmith': return <Shield size={14} color="#fbbf24" />;
      default: return <Users size={14} color="#cbd5e1" />;
    }
  };

  const visibleActions = actionSpaces.filter(a => a.roundAppeared <= round);

  return (
    <div style={{
      background: 'rgba(10, 16, 26, 0.95)',
      border: '1.5px solid rgba(245, 158, 11, 0.3)',
      borderRadius: '12px',
      padding: '10px 14px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            background: 'rgba(245, 158, 11, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f59e0b'
          }}>
            <Axe size={14} />
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>
            중앙 행동 칸 (Action Spaces - 일꾼 놓기)
          </span>
        </div>
        <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
          총 {visibleActions.length}개 행동 활성화
        </span>
      </div>

      {/* 행동 카드 그리드 (스크롤) */}
      <div style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '8px',
        paddingRight: '4px'
      }}>
        {visibleActions.map((action) => {
          const isOccupied = action.occupiedByPlayerId !== null;
          const occupant = isOccupied ? players.find(p => p.id === action.occupiedByPlayerId) : null;
          const canClick = isMyTurn && !isOccupied;

          return (
            <div
              key={action.id}
              onClick={() => {
                if (canClick) {
                  soundManager.playWoodToken();
                  performAction(action.id);
                }
              }}
              style={{
                borderRadius: '8px',
                padding: '8px 10px',
                background: isOccupied 
                  ? 'rgba(30, 41, 59, 0.5)' 
                  : 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
                border: isOccupied 
                  ? '1px solid rgba(255,255,255,0.06)' 
                  : (canClick ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255,255,255,0.08)'),
                cursor: canClick ? 'pointer' : 'default',
                opacity: isOccupied ? 0.65 : 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '6px',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
            >
              {/* 상단: 아이콘 & 이름 & 누적 자원 뱃지 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {getActionIcon(action.actionType)}
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isOccupied ? '#94a3b8' : '#f8fafc' }}>
                    {action.name.split('(')[0]}
                  </span>
                </div>

                {action.accumulatesResource && (
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '10px',
                    background: 'rgba(245, 158, 11, 0.2)',
                    border: '1px solid rgba(245, 158, 11, 0.5)',
                    color: '#facc15',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap'
                  }}>
                    +{action.accumulatedCount}
                  </span>
                )}
              </div>

              {/* 행동 설명 */}
              <p style={{
                margin: 0,
                fontSize: '0.66rem',
                color: '#94a3b8',
                lineHeight: 1.3
              }}>
                {action.description}
              </p>

              {/* 하단: 점유 상태 칩 or 클릭 유도 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', minHeight: '18px' }}>
                {isOccupied && occupant && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(0,0,0,0.4)',
                    fontSize: '0.62rem'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: occupant.color }} />
                    <span style={{ color: '#cbd5e1' }}>{occupant.name.split(' ')[0]}</span>
                  </div>
                )}
                {!isOccupied && canClick && (
                  <span style={{ fontSize: '0.62rem', color: '#f59e0b', fontWeight: 700 }}>
                    일꾼 배치 ▶
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
