import React, { useState } from 'react';
import { useBurgundyStore } from '../store/useBurgundyStore';
import { areSlotsAdjacent } from '../data/boardLayout';
import { SkipForward } from 'lucide-react';
import { soundManager } from '../../../utils/sound';
import type { HexTile, DuchySlot, TileCategory } from '../types';

const CATEGORY_COLORS: Record<TileCategory, { bg: string; border: string; text: string; label: string }> = {
  castle: { bg: '#143823', border: '#22c55e', text: '#86efac', label: '성' },
  city: { bg: '#45220a', border: '#d97706', text: '#fde68a', label: '건물' },
  pasture: { bg: '#233910', border: '#84cc16', text: '#d9f99d', label: '목장' },
  ship: { bg: '#083344', border: '#0284c7', text: '#7dd3fc', label: '선박' },
  mine: { bg: '#1e293b', border: '#64748b', text: '#cbd5e1', label: '광산' },
  monastery: { bg: '#422406', border: '#eab308', text: '#fef08a', label: '수도원' }
};

export const BurgundyCastleActionModal: React.FC = () => {
  const {
    pendingCastleAction,
    players,
    currentTurnPlayerIndex,
    myPlayerId,
    playMode,
    resolveCastleAction,
    skipCastleAction,
    setHoveredTile
  } = useBurgundyStore();

  const [selectedKeyIdx, setSelectedKeyIdx] = useState<number | null>(null);

  if (!pendingCastleAction) return null;

  const currPlayer = players[currentTurnPlayerIndex];
  if (!currPlayer || currPlayer.id !== pendingCastleAction.playerId) return null;

  const isMyAction = playMode !== 'online' || currPlayer.id === myPlayerId;

  const keySlotTiles = currPlayer.keySlots
    .map((tile, idx) => ({ tile, idx }))
    .filter(item => item.tile !== null) as { tile: HexTile; idx: number }[];

  const getValidSlotsForTile = (tile: HexTile): DuchySlot[] => {
    return currPlayer.duchy.filter(slot => {
      if (slot.placedTile !== null) return false;
      if (slot.category !== tile.category) return false;
      return currPlayer.duchy.some(o => o.placedTile !== null && areSlotsAdjacent(slot, o));
    });
  };

  const R_MINI = 25;
  const W_MINI = R_MINI * Math.sqrt(3);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(5, 8, 12, 0.88)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 255,
        padding: '16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          background: 'linear-gradient(145deg, #0e1a12 0%, #0d1a10 100%)',
          border: '2px solid #22c55e',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.85), 0 0 30px rgba(34,197,94,0.25)',
          display: 'flex', flexDirection: 'column', gap: '14px',
          color: '#f8fafc',
          maxHeight: '92vh', overflowY: 'auto'
        }}
      >
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(34,197,94,0.3)', paddingBottom: '10px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #143823, #052e10)',
            border: '1.5px solid #22c55e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)', flexShrink: 0,
            fontSize: '1.5rem'
          }}>
            🏰
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.68rem', letterSpacing: '1.5px', color: '#86efac', fontWeight: 800 }}>CASTLE EFFECT</div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#bbf7d0' }}>
              성 건설 효과: 무료 추가 행동 1회
            </h2>
          </div>
        </div>

        {/* 설명 */}
        <div style={{
          background: 'rgba(34,197,94,0.08)', borderLeft: '3px solid #22c55e',
          padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', lineHeight: 1.45, color: '#e2e8f0'
        }}>
          {isMyAction
            ? '🏰 성을 건설했습니다! 주사위 눈금에 상관없이, 보관소의 타일 1개를 영지의 인접한 빈 칸에 무료로 배치할 수 있습니다.'
            : `현재 ${currPlayer.name}님이 성 효과 무료 행동을 선택하고 있습니다...`}
        </div>

        {isMyAction && (
          <>
            {/* 1단계: 타일 선택 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: '#86efac', fontWeight: 700 }}>
                1단계: 보관소에서 배치할 타일 선택
              </span>
              {keySlotTiles.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                  보관소에 배치할 수 있는 타일이 없습니다. 무료 행동을 건너뛰어야 합니다.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {keySlotTiles.map(({ tile, idx }) => {
                    const validSlots = getValidSlotsForTile(tile);
                    const isSelected = selectedKeyIdx === idx;
                    return (
                      <button
                        key={tile.id}
                        onClick={() => setSelectedKeyIdx(isSelected ? null : idx)}
                        onMouseEnter={() => setHoveredTile(tile)}
                        onMouseLeave={() => setHoveredTile(null)}
                        style={{
                          background: isSelected ? '#14532d' : 'rgba(30,41,59,0.8)',
                          border: isSelected ? '2px solid #86efac' : '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '8px', padding: '8px',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                          cursor: 'pointer', color: '#fff',
                          boxShadow: isSelected ? '0 0 14px rgba(134,239,172,0.5)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span style={{ fontSize: '1.3rem' }}>{tile.icon}</span>
                        <span style={{ fontWeight: 800, fontSize: '0.75rem' }}>{tile.name}</span>
                        <span style={{ fontSize: '0.62rem', color: validSlots.length > 0 ? '#86efac' : '#f87171', fontWeight: 700 }}>
                          {validSlots.length > 0 ? `배치 가능 ${validSlots.length}곳` : '배치 칸 없음'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2단계: 영지 배치 */}
            {selectedKeyIdx !== null && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                <span style={{ fontSize: '0.78rem', color: '#86efac', fontWeight: 800 }}>
                  2단계: 아래 영지 지도에서 <span style={{ color: '#fef08a' }}>황금빛 육각 칸을 직접 클릭</span>하여 배치하세요!
                </span>
                {(() => {
                  const selectedTile = currPlayer.keySlots[selectedKeyIdx];
                  if (!selectedTile) return null;
                  const validSlots = getValidSlotsForTile(selectedTile);
                  if (validSlots.length === 0) {
                    return (
                      <div style={{ color: '#f87171', fontSize: '0.75rem', padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: '6px', textAlign: 'center' }}>
                        ⚠️ [{selectedTile.name}]을 배치할 수 있는 인접한 빈 칸이 없습니다.
                      </div>
                    );
                  }
                  return (
                    <div style={{
                      background: 'rgba(0,0,0,0.55)', border: '1.5px solid rgba(34,197,94,0.35)',
                      borderRadius: '12px', padding: '10px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center'
                    }}>
                      <svg viewBox="-190 -160 380 320" style={{ width: '100%', maxHeight: '300px', filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.8))' }}>
                        <defs>
                          <filter id="cstGoldGlow" x="-30%" y="-30%" width="160%" height="160%">
                            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#facc15" floodOpacity="0.95" />
                          </filter>
                          <filter id="cstOccShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.7" />
                          </filter>
                        </defs>
                        {currPlayer.duchy.map(slot => {
                          const x = R_MINI * Math.sqrt(3) * (slot.q + slot.r / 2);
                          const y = R_MINI * (3 / 2) * slot.r;
                          const isOccupied = slot.placedTile !== null;
                          const isValid = validSlots.some(vs => vs.id === slot.id);
                          const catMeta = CATEGORY_COLORS[slot.category] || { bg: '#1e293b', border: '#64748b', text: '#fff' };
                          const points = [
                            [x, y - R_MINI], [x + W_MINI/2, y - R_MINI/2], [x + W_MINI/2, y + R_MINI/2],
                            [x, y + R_MINI], [x - W_MINI/2, y + R_MINI/2], [x - W_MINI/2, y - R_MINI/2]
                          ].map(p => p.join(',')).join(' ');
                          return (
                            <g key={slot.id}
                              onClick={() => { if (isValid) { soundManager.playWoodToken(); resolveCastleAction(slot.id, selectedKeyIdx); } }}
                              style={{ cursor: isValid ? 'pointer' : 'default' }}
                            >
                              <title>{isValid ? `클릭→${selectedTile.name} 배치 (${catMeta.label})` : isOccupied ? slot.placedTile?.name : `${slot.dieNumber}번 칸 (${catMeta.label})`}</title>
                              <polygon points={points}
                                fill={isValid ? '#3b0764' : isOccupied ? catMeta.bg : 'rgba(15,23,42,0.85)'}
                                stroke={isValid ? '#fde047' : isOccupied ? catMeta.border : 'rgba(255,255,255,0.12)'}
                                strokeWidth={isValid ? '2.5' : isOccupied ? '1.5' : '0.8'}
                                strokeDasharray={isValid ? 'none' : !isOccupied ? '2,2' : 'none'}
                                filter={isValid ? 'url(#cstGoldGlow)' : isOccupied ? 'url(#cstOccShadow)' : undefined}
                              />
                              {isOccupied ? (
                                <>
                                  <text x={x} y={y-1} textAnchor="middle" dominantBaseline="middle" fontSize="11">{slot.placedTile?.icon}</text>
                                  <text x={x} y={y+9} textAnchor="middle" dominantBaseline="middle" fontSize="6.5" fontWeight="900" fill="#f8fafc">
                                    {slot.placedTile?.name ? slot.placedTile.name.split(' ')[0] : ''}
                                  </text>
                                </>
                              ) : (
                                <>
                                  <circle cx={x} cy={y} r="8.5"
                                    fill={isValid ? 'rgba(234,179,8,0.3)' : 'rgba(0,0,0,0.6)'}
                                    stroke={isValid ? '#fde047' : catMeta.border} strokeWidth="0.8"
                                  />
                                  <text x={x} y={y+0.5} textAnchor="middle" dominantBaseline="middle" fontSize="8.5" fontWeight="900" fill={isValid ? '#fef08a' : catMeta.text}>
                                    {slot.dieNumber}
                                  </text>
                                  {isValid && <text x={x} y={y+16} textAnchor="middle" dominantBaseline="middle" fontSize="6" fontWeight="900" fill="#fde047">클릭!</text>}
                                </>
                              )}
                            </g>
                          );
                        })}
                      </svg>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>
                        황금 테두리 칸 클릭 시 [{selectedTile.name}]이(가) 즉시 배치됩니다.
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </>
        )}

        {/* 하단 버튼 */}
        {isMyAction && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>성 건설 즉발 효과 — 무료 추가 행동 1회</span>
            <button
              onClick={() => { soundManager.playClick(); skipCastleAction(); }}
              style={{
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.25)',
                color: '#cbd5e1', padding: '6px 14px', borderRadius: '6px',
                fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px'
              }}
            >
              <SkipForward size={13} />
              <span>무료 행동 건너뛰기</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
