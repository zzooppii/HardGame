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

  // 큰 화면에서도 꽉 차고 웅장하게 보이도록 육각 크기 및 반응형 정밀 핏
  const R = 40;
  const width = R * Math.sqrt(3);

  const selectedTile = (isCurrentPlayer && selectedKeySlotIndex !== null) ? player.keySlots[selectedKeySlotIndex] : null;
  const dieValue = (isCurrentPlayer && selectedDieIndex !== null && !player.usedDice[selectedDieIndex]) ? player.dice[selectedDieIndex] : null;

  // 카테고리별 배치 현황 집계 (성, 건물, 목장, 선박, 광산, 수도원)
  const categoryStats: Record<TileCategory, { placed: number; total: number }> = {
    castle: { placed: 0, total: 0 },
    city: { placed: 0, total: 0 },
    pasture: { placed: 0, total: 0 },
    ship: { placed: 0, total: 0 },
    mine: { placed: 0, total: 0 },
    monastery: { placed: 0, total: 0 }
  };

  player.duchy.forEach(slot => {
    if (categoryStats[slot.category]) {
      categoryStats[slot.category].total++;
      if (slot.placedTile) categoryStats[slot.category].placed++;
    }
  });

  return (
    <div className="saboteur-board-panel" style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
      
      {/* 1. 영지 헤더 바 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212, 175, 55, 0.15)', paddingBottom: '6px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#d4af37', fontSize: '0.8rem' }}>●</span>
          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#f8fafc', letterSpacing: '0.5px' }}>
            {player.name}의 영지 (DUCHY)
          </span>
          {isCurrentPlayer && (
            <span style={{ 
              background: 'rgba(212, 175, 55, 0.15)', 
              color: '#facc15', 
              border: '1px solid #d4af37', 
              fontSize: '0.65rem', 
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

      {/* 2. 대형 반응형 37칸 육각 벌집 맵 + 좌우 보드게임 날개 정보 패널 */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', minHeight: 0, padding: '2px 0', width: '100%', height: '100%', overflow: 'hidden' }}>
        
        {/* [좌측 날개]: 영지 건설 현황 요약 패널 */}
        <div style={{
          width: '74px',
          flexShrink: 0,
          background: 'rgba(10, 15, 12, 0.75)',
          border: '1px solid rgba(212, 175, 55, 0.18)',
          borderRadius: '6px',
          padding: '6px 4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.6)'
        }}>
          <div style={{ fontSize: '0.58rem', fontWeight: 800, color: '#d4af37', textAlign: 'center', letterSpacing: '0.3px', borderBottom: '1px solid rgba(212,175,55,0.15)', paddingBottom: '3px' }}>
            건설 현황
          </div>
          {(Object.keys(CATEGORY_COLORS) as TileCategory[]).map(cat => {
            const meta = CATEGORY_COLORS[cat];
            const stat = categoryStats[cat];
            return (
              <div 
                key={cat}
                title={`${meta.label}: ${stat.placed}/${stat.total} 배치됨`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: meta.bg,
                  border: `1px solid ${meta.border}55`,
                  borderRadius: '3px',
                  padding: '2px 4px',
                  fontSize: '0.62rem'
                }}
              >
                <span style={{ color: meta.text, fontWeight: 700 }}>{meta.label}</span>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.65rem' }}>
                  {stat.placed}/{stat.total}
                </span>
              </div>
            );
          })}
        </div>

        {/* [중앙]: 37칸 육각 벌집 맵 */}
        <div style={{ flex: 1, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: 0 }}>
          <svg 
            viewBox="-250 -235 500 470" 
            preserveAspectRatio="xMidYMid meet" 
            style={{ width: '100%', height: '100%', maxHeight: '100%', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.75))' }}
          >
            <defs>
              <filter id="tileShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.85" />
              </filter>
              <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#facc15" floodOpacity="0.9" />
              </filter>
            </defs>

          {player.duchy.map((slot) => {
            const x = R * Math.sqrt(3) * (slot.q + slot.r / 2);
            const y = R * (3 / 2) * slot.r;

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
                      fontSize="16"
                    >
                      {slot.placedTile?.icon}
                    </text>
                    <text
                      x={x}
                      y={y + 13}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="9.5"
                      fontWeight="800"
                      fill="#f8fafc"
                      letterSpacing="0.3px"
                    >
                      {slot.placedTile?.name.split(' ')[0]}
                    </text>
                  </>
                ) : (
                  <>
                    <circle
                      cx={x}
                      cy={y}
                      r="12.5"
                      fill="rgba(0, 0, 0, 0.6)"
                      stroke={categoryMeta.border}
                      strokeWidth="1.2"
                      opacity="0.9"
                    />
                    <text
                      x={x}
                      y={y + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="12"
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

        {/* [우측 날개]: 구역 완성 점수표 패널 */}
        <div style={{
          width: '74px',
          flexShrink: 0,
          background: 'rgba(10, 15, 12, 0.75)',
          border: '1px solid rgba(212, 175, 55, 0.18)',
          borderRadius: '6px',
          padding: '6px 4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.6)'
        }}>
          <div style={{ fontSize: '0.58rem', fontWeight: 800, color: '#d4af37', textAlign: 'center', letterSpacing: '0.3px', borderBottom: '1px solid rgba(212,175,55,0.15)', paddingBottom: '3px' }}>
            구역 점수
          </div>
          {[
            { size: 1, vp: 1 },
            { size: 2, vp: 3 },
            { size: 3, vp: 6 },
            { size: 4, vp: 10 },
            { size: 5, vp: 15 },
            { size: 8, vp: 36 }
          ].map(row => (
            <div 
              key={row.size}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '3px',
                padding: '2px 4px',
                fontSize: '0.62rem'
              }}
            >
              <span style={{ color: '#94a3b8' }}>{row.size}칸</span>
              <span style={{ color: '#facc15', fontWeight: 800, fontSize: '0.65rem' }}>+{row.vp} VP</span>
            </div>
          ))}
        </div>

      </div>

      {/* 영지 안내 한 줄 */}
      <div style={{ textAlign: 'center', fontSize: '0.7rem', color: selectedTile ? '#facc15' : '#94a3b8', flexShrink: 0, paddingTop: '2px' }}>
        {selectedTile 
          ? `👉 [${selectedTile.name}] 배치: 위 육각 맵의 노란색 슬롯을 클릭하세요.`
          : '성, 건물, 목장, 선박, 광산, 수도원을 조화롭게 배치하여 영지를 발전시키세요.'}
      </div>

    </div>
  );
};
