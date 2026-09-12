import React from 'react';
import type { HexTile, TileCategory } from '../types';

interface BurgundyTileTooltipProps {
  tile: HexTile | null;
  position?: { x: number; y: number } | null;
  visible?: boolean;
}

const CATEGORY_NAMES: Record<TileCategory, { name: string; color: string; border: string; bg: string; guide: string }> = {
  castle: { 
    name: '성 (Castle)', 
    color: '#86efac', 
    border: '#22c55e', 
    bg: 'rgba(34, 197, 94, 0.15)',
    guide: '배치 즉시 주사위 눈금과 상관없이 원하는 무료 행동 1회를 추가로 수행합니다.' 
  },
  city: { 
    name: '도시 건물 (Building)', 
    color: '#fed7aa', 
    border: '#f97316', 
    bg: 'rgba(249, 115, 22, 0.15)',
    guide: '배치 시 타일 고유의 강력한 즉발 효과를 발동합니다. 같은 구역에는 중복 건물을 지을 수 없습니다.' 
  },
  pasture: { 
    name: '목장 가축 (Pasture)', 
    color: '#bef264', 
    border: '#84cc16', 
    bg: 'rgba(132, 204, 22, 0.15)',
    guide: '배치 시 동물 마리 수만큼 점수를 얻으며, 동일한 목장 구역에 이미 있는 같은 동물 마리 수까지 합산되어 점수가 폭발적으로 증가합니다.' 
  },
  ship: { 
    name: '선박 (Ship)', 
    color: '#7dd3fc', 
    border: '#0284c7', 
    bg: 'rgba(2, 132, 199, 0.15)',
    guide: '배치 시 턴 순서 트랙을 1칸 전진하여 선 플레이어 우선권을 획득하고, 원하는 디포(1~6)의 모든 상품 타일을 내 보관소로 가져옵니다.' 
  },
  mine: { 
    name: '광산 (Mine)', 
    color: '#e2e8f0', 
    border: '#94a3b8', 
    bg: 'rgba(148, 163, 184, 0.15)',
    guide: '매 페이즈(A~E)가 끝날 때마다 내가 배치한 광산 1개당 은화(Silverling) 1개를 지속적으로 채굴합니다.' 
  },
  monastery: { 
    name: '수도원/지식 (Monastery)', 
    color: '#fef08a', 
    border: '#eab308', 
    bg: 'rgba(234, 179, 8, 0.15)',
    guide: '게임 내내 지속되는 패시브 혜택을 부여하거나, 게임 종료 시 추가 승점(VP)을 계산해 주는 핵심 테크 타일입니다.' 
  }
};

export const BurgundyTileTooltip: React.FC<BurgundyTileTooltipProps> = ({ tile, position, visible = true }) => {
  if (!tile || !visible) return null;

  const catMeta = CATEGORY_NAMES[tile.category] || {
    name: '기타 타일',
    color: '#f8fafc',
    border: '#d4af37',
    bg: 'rgba(212, 175, 55, 0.15)',
    guide: ''
  };

  const style: React.CSSProperties = position ? {
    position: 'fixed',
    left: `${Math.min(Math.max(position.x + 15, 10), window.innerWidth - 320)}px`,
    top: `${Math.min(Math.max(position.y - 40, 10), window.innerHeight - 260)}px`,
    zIndex: 9999,
    pointerEvents: 'none'
  } : {};

  return (
    <div 
      className="saboteur-board-panel"
      style={{
        ...style,
        width: '300px',
        padding: '12px 14px',
        borderRadius: '10px',
        background: 'linear-gradient(145deg, #18221b 0%, #0c120f 100%)',
        border: `2px solid ${catMeta.border}`,
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.85), 0 0 16px ${catMeta.border}44`,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        animation: 'fadeIn 0.15s ease-out',
        color: '#f8fafc'
      }}
    >
      {/* 헤더: 아이콘 + 타일명 + 카테고리 뱃지 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.12)', paddingBottom: '6px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: catMeta.bg,
          border: `1.5px solid ${catMeta.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
          flexShrink: 0
        }}>
          {tile.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {tile.name}
            </span>
            <span style={{ 
              fontSize: '0.62rem', 
              color: catMeta.color, 
              background: catMeta.bg,
              border: `1px solid ${catMeta.border}66`,
              padding: '1px 5px',
              borderRadius: '4px',
              fontWeight: 700,
              whiteSpace: 'nowrap'
            }}>
              {catMeta.name.split(' ')[0]}
            </span>
          </div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '1px' }}>
            버건디의 성 육각 영지 타일
          </div>
        </div>
      </div>

      {/* 본문: 100% 전문 효과 설명 (절대 자르지 않음!) */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.4)',
        padding: '8px 10px',
        borderRadius: '6px',
        borderLeft: `3px solid ${catMeta.border}`
      }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#facc15', marginBottom: '3px' }}>
          ⚡ 타일 효과 (100% 전체 설명)
        </div>
        <div style={{ fontSize: '0.78rem', lineHeight: '1.45', color: '#f1f5f9', fontWeight: 500 }}>
          {tile.desc}
        </div>
      </div>

      {/* 카테고리별 규칙 가이드 팁 */}
      {catMeta.guide && (
        <div style={{ fontSize: '0.66rem', color: '#94a3b8', lineHeight: '1.35', background: 'rgba(255,255,255,0.03)', padding: '5px 8px', borderRadius: '4px' }}>
          💡 <strong style={{ color: catMeta.color }}>{catMeta.name.split(' ')[0]} 룰:</strong> {catMeta.guide}
        </div>
      )}

      {/* 배치 조건 안내 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderTop: '1px solid rgba(255, 255, 255, 0.08)', 
        paddingTop: '6px', 
        fontSize: '0.65rem', 
        color: '#64748b' 
      }}>
        <span>영지 배치: 일치하는 주사위 눈금 칸</span>
        <span style={{ color: '#d4af37', fontWeight: 700 }}>보관소 경유 필수</span>
      </div>
    </div>
  );
};
