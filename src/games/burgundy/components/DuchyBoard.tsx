import React from 'react';
import type { PlayerBurgundy, TileCategory } from '../types';
import { useBurgundyStore } from '../store/useBurgundyStore';
import { canPlaceTileOnSlot } from '../engine/gameLogic';

const CATEGORY_COLORS: Record<TileCategory, { bg: string; border: string; text: string }> = {
  castle: { bg: '#14532d', border: '#22c55e', text: '#86efac' },
  city: { bg: '#78350f', border: '#d97706', text: '#fde68a' },
  pasture: { bg: '#365314', border: '#84cc16', text: '#d9f99d' },
  ship: { bg: '#0c4a6e', border: '#0284c7', text: '#7dd3fc' },
  mine: { bg: '#334155', border: '#64748b', text: '#cbd5e1' },
  monastery: { bg: '#713f12', border: '#eab308', text: '#fef08a' }
};

interface DuchyBoardProps {
  player: PlayerBurgundy;
  isCurrentPlayer: boolean;
}

export const DuchyBoard: React.FC<DuchyBoardProps> = ({ player, isCurrentPlayer }) => {
  const { selectedDieIndex, selectedKeySlotIndex, placeTileFromStorage, uiTheme } = useBurgundyStore();
  const isTabletop = uiTheme === 'tabletop';

  // 육각 변환 공식 파라미터
  const R = 34; // 육각 외접원 반지름
  const width = R * Math.sqrt(3);
  const centerX = 230;
  const centerY = 200;

  // 선택된 타일이 있는 경우 배치 가능 여부 사전 계산
  const selectedTile = (isCurrentPlayer && selectedKeySlotIndex !== null) ? player.keySlots[selectedKeySlotIndex] : null;
  const dieValue = (isCurrentPlayer && selectedDieIndex !== null && !player.usedDice[selectedDieIndex]) ? player.dice[selectedDieIndex] : null;

  return (
    <div style={{
      background: isTabletop ? 'linear-gradient(145deg, #f7efe1 0%, #e2d2b5 100%)' : 'rgba(15, 23, 42, 0.75)',
      borderRadius: '14px',
      padding: '16px',
      border: isTabletop ? '2px solid #8a6534' : '1px solid var(--border-subtle)',
      boxShadow: isTabletop ? '0 8px 24px rgba(0,0,0,0.3)' : 'none'
    }}>
      {/* 플레이어 영지 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: player.color }} />
          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: isTabletop ? '#2b1805' : '#f8fafc' }}>
            {player.name}의 영지 (Duchy)
          </span>
          {isCurrentPlayer && (
            <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>내 영지</span>
          )}
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isTabletop ? '#6b441a' : 'var(--gold-primary)' }}>
          🏆 {player.vp} VP
        </div>
      </div>

      {/* SVG 37칸 육각 맵 */}
      <div style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto' }}>
        <svg width="460" height="400" viewBox="0 0 460 400" style={{ maxWidth: '100%', height: 'auto' }}>
          {player.duchy.map((slot) => {
            // Axial to Pixel 변환
            const x = centerX + R * Math.sqrt(3) * (slot.q + slot.r / 2);
            const y = centerY + R * (3 / 2) * slot.r;

            const isOccupied = slot.placedTile !== null;
            const categoryMeta = CATEGORY_COLORS[slot.category];

            // 배치 가능 여부 체크
            let canPlace = false;
            if (isCurrentPlayer && selectedTile && dieValue !== null && !isOccupied) {
              const check = canPlaceTileOnSlot(player, selectedTile, slot, dieValue, player.workers);
              canPlace = check.valid;
            }

            // 정육각 폴리곤 포인트 계산
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
                  if (canPlace) {
                    placeTileFromStorage(slot.id);
                  }
                }}
                style={{ cursor: canPlace ? 'pointer' : 'default', transition: 'all 0.2s ease' }}
              >
                {/* 육각 슬롯 바탕 */}
                <polygon
                  points={points}
                  fill={isOccupied ? (slot.placedTile?.color || categoryMeta.bg) : categoryMeta.bg}
                  stroke={canPlace ? '#fbbf24' : (isOccupied ? '#fef08a' : categoryMeta.border)}
                  strokeWidth={canPlace ? '3.5' : (isOccupied ? '2' : '1.2')}
                  style={{
                    filter: canPlace ? 'drop-shadow(0 0 6px #f59e0b)' : 'none',
                    opacity: isOccupied ? 1 : 0.65
                  }}
                />

                {/* 슬롯 내용물: 타일 아이콘 또는 주사위 눈금 */}
                {isOccupied ? (
                  <>
                    <text
                      x={x}
                      y={y - 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="14"
                    >
                      {slot.placedTile?.icon}
                    </text>
                    <text
                      x={x}
                      y={y + 13}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="8"
                      fontWeight="700"
                      fill="#fff"
                    >
                      {slot.placedTile?.name.split(' ')[0]}
                    </text>
                  </>
                ) : (
                  <>
                    <circle
                      cx={x}
                      cy={y}
                      r="10"
                      fill="rgba(0,0,0,0.3)"
                    />
                    <text
                      x={x}
                      y={y + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="10"
                      fontWeight="800"
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
          marginTop: '10px',
          textAlign: 'center',
          fontSize: '0.82rem',
          color: isTabletop ? '#6b441a' : 'var(--gold-secondary)',
          fontWeight: 600
        }}>
          ✨ [노란색으로 반짝이는 슬롯]을 클릭하면 타일이 배치됩니다.
        </div>
      )}
    </div>
  );
};
