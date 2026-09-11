import React from 'react';
import { useCavernaStore } from '../store/useCavernaStore';
import { X, Home, Check } from 'lucide-react';
import { soundManager } from '../../../utils/sound';
import type { CavernaResource } from '../types';

export const FurnishingMarketModal: React.FC = () => {
  const { 
    selectedFurnishingForBuild, 
    closeFurnishingModal, 
    availableFurnishings, 
    buildFurnishingAction,
    players,
    currentTurnPlayerIndex
  } = useCavernaStore();

  if (!selectedFurnishingForBuild) return null;

  const curr = players[currentTurnPlayerIndex];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(3, 7, 18, 0.88)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 500,
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(180deg, #1c130c 0%, #0c0805 100%)',
        border: '1.5px solid rgba(249, 115, 22, 0.5)',
        width: '100%',
        maxWidth: '780px',
        maxHeight: '85vh',
        borderRadius: '16px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 30px rgba(249, 115, 22, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: '#f8fafc'
      }}>
        {/* 헤더 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 20px',
          borderBottom: '1px solid rgba(249, 115, 22, 0.3)',
          background: 'rgba(30, 20, 15, 0.8)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(249, 115, 22, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f97316'
            }}>
              <Home size={16} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                동굴 방 타일 건축 마켓 (Furnishings)
              </h3>
              <span style={{ fontSize: '0.68rem', color: '#fed7aa' }}>
                발굴된 빈 동굴 공간에 방을 짓고 영구적인 혜택과 점수를 획득하세요.
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              closeFurnishingModal();
            }}
            style={{
              padding: '6px',
              color: '#94a3b8',
              background: 'none',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 방 타일 목록 그리드 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '10px'
        }}>
          {availableFurnishings.map((furnishing) => {
            const isAlreadyBuilt = curr.builtFurnishings.includes(furnishing.id);

            // 자원 충분 여부 체크
            let canAfford = true;
            for (const [res, cost] of Object.entries(furnishing.cost)) {
              if ((curr.resources[res as CavernaResource] || 0) < (cost || 0)) {
                canAfford = false;
                break;
              }
            }

            const costString = Object.entries(furnishing.cost)
              .map(([res, cost]) => `${res} ${cost}`)
              .join(', ');

            return (
              <div
                key={furnishing.id}
                style={{
                  borderRadius: '10px',
                  padding: '10px 12px',
                  background: isAlreadyBuilt 
                    ? 'rgba(30, 41, 59, 0.4)' 
                    : 'linear-gradient(135deg, rgba(42, 27, 16, 0.9) 0%, rgba(20, 13, 8, 0.95) 100%)',
                  border: isAlreadyBuilt 
                    ? '1px solid rgba(255,255,255,0.08)' 
                    : (canAfford ? '1px solid rgba(249, 115, 22, 0.6)' : '1px solid rgba(255,255,255,0.1)'),
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '8px',
                  opacity: isAlreadyBuilt ? 0.6 : 1
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fb923c' }}>
                      {furnishing.name.split('(')[0]}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#facc15' }}>
                      +{furnishing.vp} VP
                    </span>
                  </div>

                  <p style={{ margin: '6px 0 0 0', fontSize: '0.68rem', color: '#fed7aa', lineHeight: 1.35 }}>
                    {furnishing.description}
                  </p>
                </div>

                <div>
                  <div style={{ fontSize: '0.65rem', color: '#fdba74', marginBottom: '6px' }}>
                    비용: {costString || '무료'}
                  </div>

                  {isAlreadyBuilt ? (
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={12} /> 이미 보유 중
                    </div>
                  ) : (
                    <button
                      disabled={!canAfford}
                      onClick={() => {
                        buildFurnishingAction(furnishing.id);
                      }}
                      style={{
                        width: '100%',
                        padding: '6px',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                        background: canAfford ? '#ea580c' : 'rgba(255,255,255,0.1)',
                        color: canAfford ? '#ffffff' : '#64748b',
                        border: 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {canAfford ? '이 방 완공하기' : '자원 부족'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
