import React from 'react';
import type { PlayerBurgundy, TileCategory } from '../types';
import { useBurgundyStore } from '../store/useBurgundyStore';
import { canPlaceTileOnSlot } from '../engine/gameLogic';

const CATEGORY_COLORS: Record<TileCategory, { bg: string; border: string; text: string; label: string }> = {
  castle: { bg: '#133522', border: '#22c55e', text: '#86efac', label: '성' },
  city: { bg: '#45220a', border: '#d97706', text: '#fde68a', label: '건물' },
  pasture: { bg: '#233910', border: '#84cc16', text: '#d9f99d', label: '목장' },
  ship: { bg: '#083344', border: '#0284c7', text: '#7dd3fc', label: '선박' },
  mine: { bg: '#1e293b', border: '#64748b', text: '#cbd5e1', label: '광산' },
  monastery: { bg: '#422406', border: '#eab308', text: '#fef08a', label: '수도원' }
};

interface DuchyBoardProps {
  player: PlayerBurgundy;
  isCurrentPlayer: boolean;
}

export const DuchyBoard: React.FC<DuchyBoardProps> = ({ player, isCurrentPlayer }) => {
  const { selectedDieIndex, selectedKeySlotIndex, placeTileFromStorage } = useBurgundyStore();

  // 1화면 무스크롤을 위한 최적화된 육각 그리드 반지름 (R=28)
  const R = 28;
  const width = R * Math.sqrt(3);
  const centerX = 200;
  const centerY = 165;

  const selectedTile = (isCurrentPlayer && selectedKeySlotIndex !== null) ? player.keySlots[selectedKeySlotIndex] : null;
  const dieValue = (isCurrentPlayer && selectedDieIndex !== null && !player.usedDice[selectedDieIndex]) ? player.dice[selectedDieIndex] : null;

  return (
    <div className="saboteur-board-panel" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
      
      {/* 1. 영지 헤더 바 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212, 175, 55, 0.15)', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#d4af37', fontSize: '0.8rem' }}>●</span>
          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#f8fafc', letterSpacing: '0.5px' }}>
            {player.name}의 영지 (DUCHY)
          </span>
          {isCurrentPlayer && (
            <span style={{ 
              background: 'rgba(212, 175, 55, 0.15)', 
              color: '#facc15', 
              border: '1px solid #d4af37', 
              fontSize: '0.68rem', 
              padding: '1px 6px', 
              borderRadius: '4px',
              fontWeight: 700 
            }}>
              내 영지
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ 
            background: 'rgba(0,0,0,0.4)', 
            border: '1px solid rgba(212, 175, 55, 0.3)', 
            borderRadius: '4px', 
            padding: '2px 8px', 
            fontSize: '0.72rem', 
            color: '#facc15',
            fontWeight: 800
          }}>
            🏆 {player.vp} VP
          </span>
        </div>
      </div>

      {/* 2. 컴팩트 37칸 육각 벌집 맵 */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2px 0' }}>
        <svg width="400" height="330" viewBox="0 0 400 330" style={{ maxWidth: '100%', height: 'auto' }}>
          <defs>
            <filter id="tileShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.8" />
            </filter>
            <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#facc15" floodOpacity="0.85" />
            </filter>
          </defs>

          {player.duchy.map((slot) => {
            const x = centerX + R * Math.sqrt(3) * (slot.q + slot.r / 2);
            const y = centerY + R * (3 / 2) * slot.r;

            const isOccupied = slot.placedTile !== null;
            const categoryMeta = CATEGORY_COLORS[slot.category];

            let canPlace = false;
            if (isCurrentPlayer && selectedTile && dieValue !== null && !isOccupied) {
              const check = canPlaceTileOnSlot(player, selectedTile, slot, dieValue, player.workers);
              canPlace = check.valid;
            }

            const points = [
              [x, y - R],
              [x + width / 2, y - R / 2],
              [x + width / 2, y + R / 2],
              [x, y + R],
              [x - width / 2, y + R / 2],
              [x - width / 2, y - R / 2]
            ].map(p => p.join(',')).join(' ');

            return (
              <g 
                key={slot.id}
                onClick={() => {
                  if (canPlace) placeTileFromStorage(slot.id);
                }}
                style={{ cursor: canPlace ? 'pointer' : 'default' }}
              >
                {/* 육각 슬롯 배경 */}
                <polygon
                  points={points}
                  fill={isOccupied ? categoryMeta.bg : '#111714'}
                  stroke={canPlace ? '#fbbf24' : (isOccupied ? categoryMeta.border : 'rgba(212, 175, 55, 0.22)')}
                  strokeWidth={canPlace ? '2.5' : (isOccupied ? '1.8' : '1')}
                  strokeDasharray={!isOccupied ? '2.5, 2' : 'none'}
                  filter={isOccupied ? 'url(#tileShadow)' : (canPlace ? 'url(#goldGlow)' : undefined)}
                />

                {/* 슬롯 내부 렌더링 */}
                {isOccupied ? (
                  <>
                    <polygon
                      points={points}
                      fill="none"
                      stroke="rgba(255,255,255,0.22)"
                      strokeWidth="0.8"
                      transform={`translate(${x}, ${y}) scale(0.9) translate(${-x}, ${-y})`}
                    />
                    <text
                      x={x}
                      y={y - 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="12"
                    >
                      {slot.placedTile?.icon}
                    </text>
                    <text
                      x={x}
                      y={y + 10}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="7.5"
                      fontWeight="800"
                      fill="#f8fafc"
                      letterSpacing="0.2px"
                    >
                      {slot.placedTile?.name.split(' ')[0]}
                    </text>
                  </>
                ) : (
                  <>
                    <circle
                      cx={x}
                      cy={y}
                      r="8.5"
                      fill="rgba(0, 0, 0, 0.5)"
                      stroke={categoryMeta.border}
                      strokeWidth="0.8"
                      opacity="0.6"
                    />
                    <text
                      x={x}
                      y={y + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="8.5"
                      fontWeight="900"
                      fill={categoryMeta.text}
                    >
                      {slot.dieNumber}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* 영지 안내 한 줄 */}
      <div style={{ textAlign: 'center', fontSize: '0.72rem', color: selectedTile ? '#facc15' : '#94a3b8' }}>
        {selectedTile 
          ? `👉 [${selectedTile.name}] 배치: 위 육각 맵의 노란색 슬롯을 클릭하세요.`
          : '성, 건물, 목장, 선박, 광산, 수도원을 조화롭게 배치하여 영지를 발전시키세요.'}
      </div>

    </div>
  );
};
