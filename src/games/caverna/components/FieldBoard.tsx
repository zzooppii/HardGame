import React from 'react';
import { useCavernaStore } from '../store/useCavernaStore';
import { Trees, Sprout, Fence } from 'lucide-react';

export const FieldBoard: React.FC = () => {
  const { players, currentTurnPlayerIndex } = useCavernaStore();
  const player = players[currentTurnPlayerIndex] || players[0];

  if (!player) return null;

  const fieldGrid = player.fieldBoard;

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.95)',
      border: '1.5px solid rgba(34, 197, 94, 0.3)',
      borderRadius: '12px',
      padding: '10px 12px',
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
            background: 'rgba(34, 197, 94, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#22c55e'
          }}>
            <Trees size={14} />
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>
            숲 & 농경 구역 (Field Side - 4x3)
          </span>
        </div>

        {/* 가축 요약 뱃지 */}
        <div style={{ display: 'flex', gap: '8px', fontSize: '0.7rem' }}>
          <span style={{ color: '#f8fafc' }}>🐑 {player.livestock.sheep}</span>
          <span style={{ color: '#f8fafc' }}>🐗 {player.livestock.boar}</span>
          <span style={{ color: '#f8fafc' }}>🐂 {player.livestock.cattle}</span>
          <span style={{ color: '#f8fafc' }}>🫏 {player.livestock.donkey}</span>
        </div>
      </div>

      {/* 4 x 3 필드 그리드 */}
      <div style={{
        flex: 1,
        minHeight: 0,
        display: 'grid',
        gridTemplateRows: 'repeat(4, 1fr)',
        gap: '6px'
      }}>
        {fieldGrid.map((row, rIdx) => (
          <div key={rIdx} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {row.map((slot, cIdx) => {
              const isForest = slot.type === 'deep_forest';
              const isMeadow = slot.type === 'cleared_meadow';
              const isField = slot.type === 'field_empty';
              const isGrainField = slot.type === 'field_grain';
              const isPumpkinField = slot.type === 'field_pumpkin';
              const isPasture = slot.type === 'pasture';

              return (
                <div
                  key={cIdx}
                  style={{
                    borderRadius: '8px',
                    padding: '6px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: isForest
                      ? '1px dashed rgba(34, 197, 94, 0.25)'
                      : (isPasture ? '1.5px solid #22c55e' : '1px solid rgba(234, 179, 8, 0.3)'),
                    background: isForest
                      ? 'linear-gradient(135deg, #062e16 0%, #031c0d 100%)'
                      : (isPasture 
                          ? 'linear-gradient(135deg, #14532d 0%, #052e16 100%)' 
                          : (isField || isGrainField || isPumpkinField
                              ? 'linear-gradient(135deg, #3f2e14 0%, #20170a 100%)'
                              : 'linear-gradient(135deg, #1e3a1f 0%, #0c1a0c 100%)')),
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.62rem', color: '#64748b' }}>
                      ({rIdx+1}, {cIdx+1})
                    </span>
                    {(isGrainField || isPumpkinField) && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#facc15' }}>
                        작물 {slot.cropCount}개 남음
                      </span>
                    )}
                  </div>

                  <div style={{ textAlign: 'center', margin: 'auto 0' }}>
                    {isForest && (
                      <div style={{ color: '#22c55e', fontSize: '0.68rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <Trees size={14} />
                        <span>깊은 숲 (화전 가능)</span>
                      </div>
                    )}
                    {isMeadow && (
                      <div style={{ color: '#86efac', fontSize: '0.68rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <span>🌱</span>
                        <span>개간된 초원 (울타리 가능)</span>
                      </div>
                    )}
                    {isField && (
                      <div style={{ color: '#facc15', fontSize: '0.68rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <Sprout size={14} />
                        <span style={{ fontWeight: 700 }}>빈 밭 (파종 대기)</span>
                      </div>
                    )}
                    {isGrainField && (
                      <div style={{ color: '#fde047', fontSize: '0.72rem', fontWeight: 800 }}>
                        🌾 황금 곡물밭 (x{slot.cropCount})
                      </div>
                    )}
                    {isPumpkinField && (
                      <div style={{ color: '#fb923c', fontSize: '0.72rem', fontWeight: 800 }}>
                        🎃 탐스러운 호박밭 (x{slot.cropCount})
                      </div>
                    )}
                    {isPasture && (
                      <div style={{ color: '#4ade80', fontSize: '0.68rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <Fence size={14} />
                        <span style={{ fontWeight: 800 }}>울타리 목초지</span>
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
