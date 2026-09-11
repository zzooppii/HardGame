import React from 'react';
import { useTMStore } from '../store/useTMStore';
import type { HexSlot } from '../types';
import { Thermometer, Wind, Droplets } from 'lucide-react';

export const MarsMapBoard: React.FC = () => {
  const { 
    mapSlots, 
    temperature, 
    oxygen, 
    oceansPlaced, 
    players, 
    convertPlantsToGreeneryAction,
    currentTurnPlayerIndex,
    playMode,
    myPlayerId
  } = useTMStore();

  const currPlayer = players[currentTurnPlayerIndex];
  const isMyTurn = playMode === 'online' 
    ? currPlayer?.id === myPlayerId 
    : (currPlayer && !currPlayer.isAI);

  const plantReq = currPlayer?.corporation.id === 'corp_ecoline' ? 7 : 8;
  const canGreenery = currPlayer && currPlayer.resources.plants >= plantReq;

  // 헥사곤 axial (q, r) -> SVG pixel (x, y) 변환
  const hexRadius = 38;
  const originX = 180;
  const originY = 175;

  const getHexCoords = (q: number, r: number) => {
    const x = originX + hexRadius * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
    const y = originY + hexRadius * (3 / 2 * r);
    return { x, y };
  };

  const getHexPoints = (cx: number, cy: number, r: number) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i - 30);
      points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
    }
    return points.join(' ');
  };

  const getTileFill = (slot: HexSlot) => {
    if (slot.tileType === 'ocean') return '#0284c7'; // 파란 해양
    if (slot.tileType === 'greenery') return '#16a34a'; // 초록 녹지
    if (slot.tileType === 'city') return '#9333ea'; // 보라 도시
    if (slot.isOceanSlot) return '#0f2942'; // 미배치 해양 슬롯
    return '#3d1c14'; // 기본 붉은 화성 토양
  };

  return (
    <div style={{
      background: 'rgba(15, 10, 15, 0.95)',
      border: '1.5px solid rgba(239, 68, 68, 0.35)',
      borderRadius: '12px',
      padding: '10px 14px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
    }}>
      {/* 1. 3대 글로벌 파라미터 트랙 게이지 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '6px',
        marginBottom: '10px',
        flexShrink: 0
      }}>
        {/* 온도 (-30°C ~ +8°C) */}
        <div style={{
          background: 'rgba(127, 29, 29, 0.25)',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '6px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Thermometer size={18} color="#ef4444" />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#fca5a5' }}>
              <span>기온</span>
              <span style={{ fontWeight: 800 }}>{temperature}°C / +8°C</span>
            </div>
            <div style={{ width: '100%', height: '5px', background: '#334155', borderRadius: '3px', marginTop: '3px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, Math.max(0, ((temperature + 30) / 38) * 100))}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #3b82f6 0%, #ef4444 100%)'
              }} />
            </div>
          </div>
        </div>

        {/* 산소 농도 (0% ~ 14%) */}
        <div style={{
          background: 'rgba(6, 78, 59, 0.25)',
          border: '1px solid #10b981',
          borderRadius: '8px',
          padding: '6px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Wind size={18} color="#10b981" />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#6ee7b7' }}>
              <span>산소 농도</span>
              <span style={{ fontWeight: 800 }}>{oxygen}% / 14%</span>
            </div>
            <div style={{ width: '100%', height: '5px', background: '#334155', borderRadius: '3px', marginTop: '3px', overflow: 'hidden' }}>
              <div style={{
                width: `${(oxygen / 14) * 100}%`,
                height: '100%',
                background: '#10b981'
              }} />
            </div>
          </div>
        </div>

        {/* 해양 타일 (0 ~ 9개) */}
        <div style={{
          background: 'rgba(14, 116, 144, 0.25)',
          border: '1px solid #06b6d4',
          borderRadius: '8px',
          padding: '6px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Droplets size={18} color="#06b6d4" />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#67e8f9' }}>
              <span>해양 타일</span>
              <span style={{ fontWeight: 800 }}>{oceansPlaced} / 9개</span>
            </div>
            <div style={{ width: '100%', height: '5px', background: '#334155', borderRadius: '3px', marginTop: '3px', overflow: 'hidden' }}>
              <div style={{
                width: `${(oceansPlaced / 9) * 100}%`,
                height: '100%',
                background: '#06b6d4'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. 19개 헥사곤 화성 지도 SVG 렌더링 */}
      <div style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <svg
          viewBox="0 0 360 350"
          style={{ width: '100%', height: '100%', maxHeight: '340px' }}
        >
          {mapSlots.map((slot) => {
            const { x, y } = getHexCoords(slot.q, slot.r);
            const fill = getTileFill(slot);
            const owner = players.find(p => p.id === slot.ownerPlayerId);

            return (
              <g
                key={slot.id}
                onClick={() => {
                  if (isMyTurn && canGreenery && slot.tileType === 'empty' && !slot.isOceanSlot) {
                    convertPlantsToGreeneryAction(slot.id);
                  }
                }}
                style={{
                  cursor: (isMyTurn && canGreenery && slot.tileType === 'empty' && !slot.isOceanSlot) ? 'pointer' : 'default',
                  transition: 'all 0.2s'
                }}
              >
                {/* 헥사곤 다각형 */}
                <polygon
                  points={getHexPoints(x, y, hexRadius - 2)}
                  fill={fill}
                  stroke={slot.isOceanSlot ? '#0284c7' : '#7f1d1d'}
                  strokeWidth={slot.tileType !== 'empty' ? '2.5' : '1.5'}
                />

                {/* 타일 상태 아이콘 */}
                {slot.tileType === 'greenery' && (
                  <text x={x} y={y + 5} textAnchor="middle" fontSize="16" fill="#ffffff">🌲</text>
                )}
                {slot.tileType === 'city' && (
                  <text x={x} y={y + 5} textAnchor="middle" fontSize="16" fill="#ffffff">🏙️</text>
                )}
                {slot.tileType === 'ocean' && (
                  <text x={x} y={y + 5} textAnchor="middle" fontSize="16" fill="#ffffff">🌊</text>
                )}

                {/* 지표면 초기 보너스 텍스트 */}
                {slot.tileType === 'empty' && slot.bonus && (
                  <text x={x} y={y + 3} textAnchor="middle" fontSize="10" fill="#f8fafc" opacity="0.8" fontWeight="bold">
                    {slot.bonus.plants ? `🌿${slot.bonus.plants}` : (slot.bonus.steel ? `⚙️${slot.bonus.steel}` : (slot.bonus.titanium ? `⭐${slot.bonus.titanium}` : `🪙${slot.bonus.megacredits}`))}
                  </text>
                )}

                {/* 소유 플레이어 인디케이터 점 */}
                {owner && slot.tileType !== 'ocean' && (
                  <circle
                    cx={x}
                    cy={y + 18}
                    r="4.5"
                    fill={owner.color}
                    stroke="#ffffff"
                    strokeWidth="1.2"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* 안내 문구 */}
      <div style={{
        marginTop: '6px',
        textAlign: 'center',
        fontSize: '0.68rem',
        color: canGreenery ? '#34d399' : '#94a3b8',
        fontWeight: canGreenery ? 700 : 400
      }}>
        {canGreenery 
          ? `💡 식물 ${plantReq}개 보유 중! 빈 화성 슬롯을 클릭하여 녹지 타일을 조성하세요.` 
          : '화성 표면 타일: 녹지(🌲 산소/점수) | 도시(🏙️ 인접 녹지 점수) | 해양(🌊 2M€ 보너스)'}
      </div>
    </div>
  );
};
