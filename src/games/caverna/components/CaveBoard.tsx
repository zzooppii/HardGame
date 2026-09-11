import React from 'react';
import { useCavernaStore } from '../store/useCavernaStore';
import { INITIAL_FURNISHINGS } from '../data/furnishings';
import { Pickaxe, Home } from 'lucide-react';

export const CaveBoard: React.FC = () => {
  const { players, currentTurnPlayerIndex, openFurnishingModal } = useCavernaStore();
  const player = players[currentTurnPlayerIndex] || players[0];

  if (!player) return null;

  const caveGrid = player.caveBoard;

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.95)',
      border: '1.5px solid rgba(249, 115, 22, 0.3)',
      borderRadius: '12px',
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
    }}>
      {/* 타이틀 및 현황 */}
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
            background: 'rgba(249, 115, 22, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f97316'
          }}>
            <Pickaxe size={14} />
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>
            산속 동굴 구역 (Cave Side - 4x3)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={openFurnishingModal}
            style={{
              padding: '3px 8px',
              fontSize: '0.68rem',
              fontWeight: 700,
              background: 'rgba(249, 115, 22, 0.15)',
              border: '1px solid rgba(249, 115, 22, 0.4)',
              color: '#fb923c',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Home size={12} /> 방 타일 도감
          </button>
        </div>
      </div>

      {/* 4 x 3 동굴 그리드 */}
      <div style={{
        flex: 1,
        minHeight: 0,
        display: 'grid',
        gridTemplateRows: 'repeat(4, 1fr)',
        gap: '6px'
      }}>
        {caveGrid.map((row, rIdx) => (
          <div key={rIdx} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {row.map((slot, cIdx) => {
              const furnishing = slot.tileId 
                ? INITIAL_FURNISHINGS.find(f => f.id === slot.tileId)
                : null;

              const isSolid = slot.type === 'solid_rock';
              const isEmptyCavern = slot.type === 'cavern_empty';
              const isDwelling = slot.type === 'dwelling';

              return (
                <div
                  key={cIdx}
                  style={{
                    borderRadius: '8px',
                    padding: '6px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: isSolid
                      ? '1px dashed rgba(255,255,255,0.15)'
                      : (isEmptyCavern ? '1px dashed #38bdf8' : '1px solid rgba(249, 115, 22, 0.5)'),
                    background: isSolid
                      ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                      : (isEmptyCavern ? 'rgba(56, 189, 248, 0.08)' : 'linear-gradient(135deg, #2a1b10 0%, #170e08 100%)'),
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.62rem', color: '#64748b' }}>
                      ({rIdx+1}, {cIdx+1})
                    </span>
                    {furnishing && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#facc15' }}>
                        +{furnishing.vp} VP
                      </span>
                    )}
                  </div>

                  <div style={{ textAlign: 'center', margin: 'auto 0' }}>
                    {isSolid && (
                      <div style={{ color: '#64748b', fontSize: '0.68rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <span>🪨</span>
                        <span>단단한 암석</span>
                      </div>
                    )}
                    {isEmptyCavern && (
                      <div style={{ color: '#38bdf8', fontSize: '0.68rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <Pickaxe size={14} />
                        <span style={{ fontWeight: 700 }}>빈 동굴 (방 건설 가능)</span>
                      </div>
                    )}
                    {furnishing && (
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: isDwelling ? '#fb923c' : '#f8fafc' }}>
                          {isDwelling ? '🏠' : '🏛️'} {furnishing.name.split('(')[0]}
                        </div>
                        <div style={{ fontSize: '0.62rem', color: '#cbd5e1', marginTop: '2px', lineHeight: 1.2 }}>
                          {furnishing.description.slice(0, 22)}...
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ height: '4px' }} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
