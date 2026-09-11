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

  const R = 34; // 육각 반지름
  const width = R * Math.sqrt(3);
  const centerX = 230;
  const centerY = 200;

  const selectedTile = (isCurrentPlayer && selectedKeySlotIndex !== null) ? player.keySlots[selectedKeySlotIndex] : null;
  const dieValue = (isCurrentPlayer && selectedDieIndex !== null && !player.usedDice[selectedDieIndex]) ? player.dice[selectedDieIndex] : null;

  return (
    <div className="saboteur-board-panel" style={{ padding: '16px', position: 'relative' }}>
      {/* 1. 상단 사보타지 스타일 타이틀 바 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(212, 175, 55, 0.15)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#d4af37', fontSize: '0.85rem' }}>●</span>
          <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#f8fafc', letterSpacing: '0.5px' }}>
            {player.name}의 영지 보드 (DUCHY)
          </span>
          {isCurrentPlayer && (
            <span style={{ 
              background: 'rgba(212, 175, 55, 0.15)', 
              color: '#facc15', 
              border: '1px solid #d4af37', 
              fontSize: '0.7rem', 
              padding: '2px 8px', 
              borderRadius: '4px',
              fontWeight: 700 
            }}>
              내 영지
            </span>
          )}
        </div>

        {/* 사보타지식 줌/보기 컨트롤 배지 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ 
            background: 'rgba(0,0,0,0.4)', 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '4px', 
            padding: '2px 8px', 
            fontSize: '0.72rem', 
            color: '#94a3b8' 
          }}>
            100%
          </span>
          <span style={{ 
            background: 'rgba(0,0,0,0.4)', 
            border: '1px solid rgba(212, 175, 55, 0.3)', 
            borderRadius: '4px', 
            padding: '2px 8px', 
            fontSize: '0.72rem', 
            color: '#facc15',
            fontWeight: 700
          }}>
            🏆 {player.vp} VP
          </span>
        </div>
      </div>

      {/* 2. SVG 37칸 육각 벌집 맵 (사보타지 보드 질감 & 입체 펀칭 타일) */}
      <div style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto', padding: '6px 0' }}>
        <svg width="460" height="400" viewBox="0 0 460 400" style={{ maxWidth: '100%', height: 'auto' }}>
          <defs>
            {/* 3D 펀칭 타일 드롭 섀도우 */}
            <filter id="tileShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.8" />
            </filter>
            {/* 골드 하이라이트 글로우 */}
            <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#facc15" floodOpacity="0.8" />
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
                  fill={isOccupied ? categoryMeta.bg : '#121815'}
                  stroke={canPlace ? '#fbbf24' : (isOccupied ? categoryMeta.border : 'rgba(212, 175, 55, 0.22)')}
                  strokeWidth={canPlace ? '3' : (isOccupied ? '2' : '1')}
                  strokeDasharray={!isOccupied ? '3, 2' : 'none'}
                  filter={isOccupied ? 'url(#tileShadow)' : (canPlace ? 'url(#goldGlow)' : undefined)}
                  style={{ transition: 'all 0.2s ease' }}
                />

                {/* 슬롯 내부 렌더링 */}
                {isOccupied ? (
                  <>
                    {/* 상단 2.5D 내부 하이라이트 림 */}
                    <polygon
                      points={points}
                      fill="none"
                      stroke="rgba(255,255,255,0.25)"
                      strokeWidth="1"
                      transform={`translate(${x}, ${y}) scale(0.92) translate(${-x}, ${-y})`}
                    />
                    <text
                      x={x}
                      y={y - 3}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="14"
                    >
                      {slot.placedTile?.icon}
                    </text>
                    <text
                      x={x}
                      y={y + 12}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="8"
                      fontWeight="800"
                      fill="#f8fafc"
                      letterSpacing="0.3px"
                    >
                      {slot.placedTile?.name.split(' ')[0]}
                    </text>
                  </>
                ) : (
                  <>
                    {/* 음각 홈 주사위 넘버 원형 마크 */}
                    <circle
                      cx={x}
                      cy={y}
                      r="10"
                      fill="rgba(0, 0, 0, 0.5)"
                      stroke={categoryMeta.border}
                      strokeWidth="1"
                      opacity="0.6"
                    />
                    <text
                      x={x}
                      y={y + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="9"
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

      {isCurrentPlayer && selectedTile && (
        <div style={{
          marginTop: '8px',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: '#fbbf24',
          fontWeight: 700,
          background: 'rgba(212, 175, 55, 0.1)',
          padding: '6px',
          borderRadius: '6px',
          border: '1px dashed #d4af37'
        }}>
          ✨ [황금빛으로 빛나는 슬롯]을 클릭하여 [{selectedTile.name}]을(를) 영지에 건설하세요.
        </div>
      )}
    </div>
  );
};
