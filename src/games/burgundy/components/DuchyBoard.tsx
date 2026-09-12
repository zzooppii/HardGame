import React from 'react';
import type { PlayerBurgundy, TileCategory } from '../types';
import { useBurgundyStore } from '../store/useBurgundyStore';
import { canPlaceTileOnSlot } from '../engine/gameLogic';
import { Users, Coins, Trophy, Key, Package } from 'lucide-react';

const CATEGORY_COLORS: Record<TileCategory, { bg: string; border: string; text: string; label: string }> = {
  castle: { bg: '#143823', border: '#22c55e', text: '#86efac', label: '성' },
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
  const {
    selectedDieIndex,
    selectedKeySlotIndex,
    placeTileFromStorage,
    selectDie,
    selectKeySlot,
    adjustDieWithWorker,
    setHoveredTile
  } = useBurgundyStore();

  const R = 38;
  const width = R * Math.sqrt(3);

  const selectedTile = (isCurrentPlayer && selectedKeySlotIndex !== null) ? player.keySlots[selectedKeySlotIndex] : null;
  const dieValue = (isCurrentPlayer && selectedDieIndex !== null && !player.usedDice[selectedDieIndex]) ? player.dice[selectedDieIndex] : null;

  // 카테고리별 배치 현황 집계
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
    <div 
      className="saboteur-board-panel" 
      style={{ 
        padding: '10px 12px', 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        boxSizing: 'border-box', 
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #1f1412 0%, #110d0b 100%)',
        border: '2px solid #854d0e',
        boxShadow: '0 8px 30px rgba(0,0,0,0.8), inset 0 0 40px rgba(120, 53, 15, 0.2)'
      }}
    >
      
      {/* 1. 영지 상단 바: 플레이어명 + 자원 스택(은화, 일꾼, VP) + 주사위 거치대 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.45)',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        borderRadius: '8px',
        padding: '5px 10px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: player.color }} />
          <span style={{ fontWeight: 900, fontSize: '0.88rem', color: '#f8fafc', letterSpacing: '0.3px' }}>
            {player.name}의 영지
          </span>
          {isCurrentPlayer && (
            <span style={{ 
              background: 'rgba(212, 175, 55, 0.2)', 
              color: '#facc15', 
              border: '1px solid #d4af37', 
              fontSize: '0.62rem', 
              padding: '1px 5px', 
              borderRadius: '4px',
              fontWeight: 800 
            }}>
              내 영지
            </span>
          )}
        </div>

        {/* 상단 주사위 거치대 (실물 보드게임 좌측 상단 주사위 배치) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#d4af37' }}>주사위:</span>
          {[0, 1].map(dIdx => {
            const dieVal = player.dice[dIdx];
            const isUsed = player.usedDice[dIdx];
            const isSelected = selectedDieIndex === dIdx && !isUsed;

            return (
              <div key={dIdx} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <div
                  className={`die-cube-3d ${isSelected ? 'selected' : ''} ${isUsed ? 'used' : ''}`}
                  onClick={() => !isUsed && isCurrentPlayer && !player.isAI && selectDie(dIdx as 0 | 1)}
                  style={{ width: '32px', height: '32px', fontSize: '1.05rem', cursor: isUsed ? 'default' : 'pointer' }}
                  title={isUsed ? '사용한 주사위' : `주사위 [${dieVal}] 선택`}
                >
                  {dieVal}
                </div>

                {!isUsed && isCurrentPlayer && !player.isAI && isSelected && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        adjustDieWithWorker(dIdx as 0 | 1, 1);
                      }}
                      disabled={player.workers <= 0}
                      title="일꾼 1개를 소모하여 주사위 눈금 +1"
                      style={{
                        padding: '0 3px',
                        fontSize: '0.58rem',
                        lineHeight: '1.1',
                        borderRadius: '2px',
                        background: player.workers > 0 ? '#3b82f6' : '#334155',
                        color: '#fff',
                        border: 'none',
                        cursor: player.workers > 0 ? 'pointer' : 'not-allowed'
                      }}
                    >
                      +1
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        adjustDieWithWorker(dIdx as 0 | 1, -1);
                      }}
                      disabled={player.workers <= 0}
                      title="일꾼 1개를 소모하여 주사위 눈금 -1"
                      style={{
                        padding: '0 3px',
                        fontSize: '0.58rem',
                        lineHeight: '1.1',
                        borderRadius: '2px',
                        background: player.workers > 0 ? '#3b82f6' : '#334155',
                        color: '#fff',
                        border: 'none',
                        cursor: player.workers > 0 ? 'pointer' : 'not-allowed'
                      }}
                    >
                      -1
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 자원 스택: 은화, 일꾼, VP */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <span style={{ 
            background: 'rgba(212, 175, 55, 0.15)', 
            color: '#facc15', 
            border: '1px solid rgba(212, 175, 55, 0.3)', 
            padding: '2px 6px', 
            borderRadius: '4px', 
            fontSize: '0.7rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            <Coins size={12} /> {player.silverlings}
          </span>
          <span style={{ 
            background: 'rgba(59, 130, 246, 0.15)', 
            color: '#60a5fa', 
            border: '1px solid rgba(59, 130, 246, 0.3)', 
            padding: '2px 6px', 
            borderRadius: '4px', 
            fontSize: '0.7rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            <Users size={12} /> {player.workers}
          </span>
          <span style={{ 
            background: 'rgba(34, 197, 94, 0.15)', 
            color: '#4ade80', 
            border: '1px solid rgba(34, 197, 94, 0.3)', 
            padding: '2px 6px', 
            borderRadius: '4px', 
            fontSize: '0.7rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            <Trophy size={12} /> {player.vp}
          </span>
        </div>
      </div>

      {/* 2. 중앙 37칸 육각 벌집 영지 보드 (실물 보드게임과 동일한 시각화) */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, padding: '4px 0', width: '100%', height: '100%', overflow: 'hidden' }}>
        <svg 
          viewBox="-250 -230 500 460" 
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
                onMouseEnter={() => {
                  if (isOccupied) setHoveredTile(slot.placedTile);
                }}
                onMouseLeave={() => setHoveredTile(null)}
                style={{ cursor: canPlace ? 'pointer' : (isOccupied ? 'pointer' : 'default') }}
              >
                {/* 육각 슬롯 배경 */}
                <polygon
                  points={points}
                  fill={isOccupied ? categoryMeta.bg : '#151c17'}
                  stroke={canPlace ? '#fbbf24' : (isOccupied ? categoryMeta.border : 'rgba(212, 175, 55, 0.25)')}
                  strokeWidth={canPlace ? '3' : (isOccupied ? '2' : '1.2')}
                  strokeDasharray={!isOccupied ? '3, 2' : 'none'}
                  filter={isOccupied ? 'url(#tileShadow)' : (canPlace ? 'url(#goldGlow)' : undefined)}
                />

                {/* 슬롯 내부 렌더링 */}
                {isOccupied ? (
                  <>
                    <polygon
                      points={points}
                      fill="none"
                      stroke="rgba(255,255,255,0.25)"
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
                      fontWeight="900"
                      fill="#f8fafc"
                      letterSpacing="0.3px"
                    >
                      {slot.placedTile?.name.split(' ')[0]}
                    </text>
                  </>
                ) : (
                  <>
                    {/* 주사위 눈금 뱃지 (실물 보드게임의 도트 감성) */}
                    <circle
                      cx={x}
                      cy={y}
                      r="13"
                      fill="rgba(0, 0, 0, 0.65)"
                      stroke={categoryMeta.border}
                      strokeWidth="1.2"
                      opacity="0.95"
                    />
                    <text
                      x={x}
                      y={y + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="12"
                      fontWeight="900"
                      fill={canPlace ? '#fef08a' : categoryMeta.text}
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

      {/* 3. 실물 개인 보드 하단 트레이: 좌측 [열쇠 타일 보관소 3칸] & 우측 [상품 보관함 3칸] */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        flexShrink: 0,
        background: 'rgba(0,0,0,0.5)',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        borderRadius: '8px',
        padding: '6px 10px'
      }}>
        {/* [좌측] 타일 보관소 (Key Slots 3칸) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 800, color: '#facc15' }}>
            <Key size={12} />
            <span>타일 임시 보관소 (최대 3개)</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
            {[0, 1, 2].map(kIdx => {
              const tile = player.keySlots[kIdx];
              const isSelected = selectedKeySlotIndex === kIdx && isCurrentPlayer;

              if (!tile) {
                return (
                  <div
                    key={kIdx}
                    style={{
                      height: '42px',
                      borderRadius: '5px',
                      border: '1.5px dashed rgba(255, 255, 255, 0.15)',
                      background: 'rgba(0, 0, 0, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b',
                      fontSize: '0.62rem'
                    }}
                  >
                    [ 빈 보관소 ]
                  </div>
                );
              }

              return (
                <button
                  key={tile.id}
                  onClick={() => isCurrentPlayer && !player.isAI && selectKeySlot(isSelected ? null : kIdx)}
                  onMouseEnter={() => setHoveredTile(tile)}
                  onMouseLeave={() => setHoveredTile(null)}
                  style={{
                    height: '42px',
                    padding: '2px 4px',
                    borderRadius: '5px',
                    background: isSelected ? '#ca8a04' : tile.color,
                    border: isSelected ? '2px solid #fef08a' : '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isCurrentPlayer ? 'pointer' : 'default',
                    boxShadow: isSelected ? '0 0 10px rgba(250, 204, 21, 0.6)' : '0 2px 4px rgba(0,0,0,0.5)',
                    transition: 'all 0.15s ease'
                  }}
                  title="클릭하여 영지에 배치할 타일로 선택"
                >
                  <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>{tile.icon}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                    {tile.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* [우측] 상품 보관함 (Goods Crates 3칸) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 800, color: '#93c5fd' }}>
            <Package size={12} />
            <span>상품 보관함 (최대 3슬롯)</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
            {[0, 1, 2].map(gIdx => {
              const goodsItem = player.goods[gIdx];

              if (!goodsItem) {
                return (
                  <div
                    key={gIdx}
                    style={{
                      height: '42px',
                      borderRadius: '5px',
                      border: '1.5px dashed rgba(255, 255, 255, 0.12)',
                      background: 'rgba(0, 0, 0, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b',
                      fontSize: '0.62rem'
                    }}
                  >
                    [ 빈 상자 ]
                  </div>
                );
              }

              const canSell = dieValue === goodsItem.dieNumber && isCurrentPlayer && !player.isAI;

              return (
                <button
                  key={goodsItem.id}
                  onClick={() => {
                    if (canSell) {
                      useBurgundyStore.getState().sellGoodsAction(goodsItem.dieNumber);
                    }
                  }}
                  disabled={!canSell}
                  title={`[${goodsItem.dieNumber}번 주사위] ${goodsItem.name} (판매 시 은화 +1, VP 획득)`}
                  style={{
                    height: '42px',
                    padding: '2px 4px',
                    borderRadius: '5px',
                    background: canSell ? '#2563eb' : 'rgba(30, 41, 59, 0.8)',
                    border: canSell ? '2px solid #93c5fd' : '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: canSell ? 'pointer' : 'default',
                    boxShadow: canSell ? '0 0 10px rgba(59, 130, 246, 0.6)' : 'none',
                    opacity: canSell ? 1 : 0.75
                  }}
                >
                  <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>📦</span>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800 }}>{goodsItem.dieNumber}번 상품</span>
                  {canSell && <span style={{ fontSize: '0.55rem', color: '#fef08a' }}>판매가능</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};
