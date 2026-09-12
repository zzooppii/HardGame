import React, { useState } from 'react';
import { usePuertoRicoStore } from '../store/usePuertoRicoStore';
import { BUILDINGS_CATALOG, GOODS_DATA } from '../data/buildings';
import type { GoodType, RoleType } from '../types';
import { soundManager } from '../../../utils/sound';

const ROLE_SUMMARY: { role: RoleType; name: string; icon: string; action: string; privilege: string }[] = [
  { role: 'settler', name: '개척자', icon: '🌾', action: '공개된 농장 타일 1개 획득', privilege: '채석장(Quarry) 선택 가능' },
  { role: 'mayor', name: '시장', icon: '👥', action: '이주민선 일꾼을 순서대로 분배', privilege: '공급처에서 추가 일꾼 +1명' },
  { role: 'builder', name: '건축가', icon: '🔨', action: '도시 빈 부지에 건물 1개 건설', privilege: '건설 비용 1 두블론 할인' },
  { role: 'craftsman', name: '생산자', icon: '⚙️', action: '일꾼이 배치된 생산시설 상품 생산', privilege: '생산된 상품 중 보너스 1개' },
  { role: 'trader', name: '상인', icon: '⚖️', action: '상점에 상품 1개 판매', privilege: '판매 가격 +1 두블론 보너스' },
  { role: 'captain', name: '선장', icon: '⚓', action: '화물선에 상품 선적 (1개당 1 VP)', privilege: '첫 선적 시 보너스 +1 VP' },
  { role: 'prospector', name: '금광부', icon: '⛏️', action: '다른 플레이어는 행동 없음', privilege: '단독으로 1 두블론 획득' }
];

export const PlayerMat: React.FC = () => {
  const { players, governorIndex, currentTurnPlayerIndex, currentRole, uiTheme } = usePuertoRicoStore();
  const [activeTabPlayerId, setActiveTabPlayerId] = useState<string>(players[0]?.id || 'p-0');

  const isTabletop = uiTheme === 'tabletop';
  const selectedPlayer = players.find(p => p.id === activeTabPlayerId) || players[0];
  if (!selectedPlayer) return null;

  const isGovernor = players[governorIndex]?.id === selectedPlayer.id;
  const isTurn = players[currentTurnPlayerIndex]?.id === selectedPlayer.id;

  return (
    <div className="player-mat-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      
      {/* 1. 상단 플레이어 탭 바 */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {players.map(p => {
          const isSelected = p.id === selectedPlayer.id;
          const isThisTurn = players[currentTurnPlayerIndex]?.id === p.id;
          const isThisGov = players[governorIndex]?.id === p.id;

          return (
            <button
              key={p.id}
              onClick={() => {
                soundManager.playClick();
                setActiveTabPlayerId(p.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 14px',
                borderRadius: '8px',
                background: isSelected 
                  ? (isTabletop ? 'linear-gradient(180deg, #dfcfac 0%, #cfbd93 100%)' : 'rgba(30, 41, 59, 0.95)') 
                  : (isTabletop ? 'linear-gradient(180deg, #f7eed7 0%, #ebdcb8 100%)' : 'rgba(15, 23, 42, 0.6)'),
                border: isSelected 
                  ? (isTabletop ? '2px solid #5a3812' : `2px solid ${p.color}`) 
                  : (isTabletop ? '1px solid #c4a77d' : '1px solid var(--border-subtle)'),
                color: isTabletop ? '#2b1805' : (isSelected ? '#f8fafc' : 'var(--text-muted)'),
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: isSelected ? 800 : 600,
                boxShadow: isSelected && isTabletop ? '0 3px 6px rgba(0,0,0,0.2)' : 'none'
              }}
            >
              <div 
                style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  background: p.color,
                  border: '1.5px solid #fff',
                  boxShadow: isThisTurn ? `0 0 10px ${p.color}` : '0 1px 2px rgba(0,0,0,0.4)'
                }} 
              />
              <span style={{ fontSize: '0.85rem' }}>
                {p.name}
              </span>
              {isThisGov && <span title="총독 (Governor)">👑</span>}
              {isThisTurn && (
                <span style={{ fontSize: '0.7rem', color: isTabletop ? '#9a3412' : 'var(--gold-secondary)', fontWeight: 800 }}>
                  [차례]
                </span>
              )}
              <div style={{ display: 'flex', gap: '6px', fontSize: '0.75rem', marginLeft: '6px' }}>
                <span>💰{p.doubloons}</span>
                <span>🏆{p.vpChips}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. 개인 보드판 메인 영역 (스크린샷 2번 원목 보드판 레이아웃) */}
      <div 
        style={{ 
          position: 'relative',
          background: isTabletop 
            ? 'linear-gradient(180deg, #ecd6b2 0%, #dfc399 50%, #d4b584 100%)' 
            : 'linear-gradient(180deg, #1b2330 0%, #111827 100%)',
          borderRadius: '12px',
          border: isTabletop ? '4px solid #6b4317' : `2px solid ${selectedPlayer.color}`,
          boxShadow: isTabletop 
            ? 'inset 0 0 18px rgba(90, 50, 10, 0.45), 0 8px 24px rgba(0,0,0,0.35)' 
            : '0 8px 24px rgba(0,0,0,0.4)',
          padding: '16px 18px',
          overflow: 'hidden'
        }}
      >
        {/* 상단: 플레이어 타이틀 & 자원 요약 바 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: selectedPlayer.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 900,
                fontSize: '0.9rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                border: '2px solid #fff'
              }}
            >
              {selectedPlayer.name.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 className="font-serif" style={{ fontSize: '1.2rem', color: isTabletop ? '#351906' : '#f8fafc', margin: 0, fontWeight: 900, letterSpacing: '-0.02em' }}>
                  {selectedPlayer.name}의 카리브 영지
                </h3>
                {isGovernor && (
                  <span style={{ background: '#b45309', color: '#fef08a', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 800, border: '1px solid #fde047' }}>
                    👑 총독 (Governor)
                  </span>
                )}
                {isTurn && (
                  <span style={{ background: '#0284c7', color: '#fff', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                    ⚡ 현재 차례
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: isTabletop ? '#78350f' : 'var(--text-muted)' }}>
                카리브해 푸에르토리코 섬 식민지 플랜테이션 & 산후안 시가지
              </p>
            </div>
          </div>

          {/* 자산 현황 뱃지들: 두블론 주조 코인, VP 승점 칩, 원목 일꾼 디스크 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* 두블론 금화 더미 */}
            <div 
              title="보유 두블론 (건설 및 거래 자금)"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                background: isTabletop ? 'linear-gradient(180deg, #fef3c7 0%, #fde68a 100%)' : 'rgba(0,0,0,0.4)', 
                padding: '4px 10px', 
                borderRadius: '8px',
                border: isTabletop ? '1.5px solid #d97706' : '1px solid var(--border-subtle)',
                boxShadow: isTabletop ? '0 2px 4px rgba(0,0,0,0.15)' : 'none'
              }}
            >
              <div className="tabletop-coin tabletop-coin-gold" style={{ width: '22px', height: '22px', fontSize: '0.75rem' }}>
                $
              </div>
              <div>
                <div style={{ fontSize: '0.62rem', color: isTabletop ? '#92400e' : 'var(--text-muted)', lineHeight: 1 }}>두블론</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 900, color: isTabletop ? '#78350f' : '#facc15' }}>
                  {selectedPlayer.doubloons}
                </div>
              </div>
            </div>

            {/* VP 승점 육각 칩 */}
            <div 
              title="비공개 승점 칩 (선적 및 건물 승점)"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                background: isTabletop ? 'linear-gradient(180deg, #e0f2fe 0%, #bae6fd 100%)' : 'rgba(0,0,0,0.4)', 
                padding: '4px 10px', 
                borderRadius: '8px',
                border: isTabletop ? '1.5px solid #0284c7' : '1px solid var(--border-subtle)',
                boxShadow: isTabletop ? '0 2px 4px rgba(0,0,0,0.15)' : 'none'
              }}
            >
              <div 
                style={{ 
                  width: '22px', 
                  height: '22px', 
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '0.7rem',
                  border: '1px solid #7dd3fc',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                }}
              >
                VP
              </div>
              <div>
                <div style={{ fontSize: '0.62rem', color: isTabletop ? '#0369a1' : 'var(--text-muted)', lineHeight: 1 }}>승점 칩</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 900, color: isTabletop ? '#075985' : '#38bdf8' }}>
                  {selectedPlayer.vpChips}
                </div>
              </div>
            </div>

            {/* 원목 일꾼 디스크 (San Juan Quarters) */}
            <div 
              title="배치 대기 중인 원주민/식민지 일꾼 (시장 행동 시 농장/건물에 배치 가능)"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                background: isTabletop ? 'linear-gradient(180deg, #faeed4 0%, #ebd7b3 100%)' : 'rgba(0,0,0,0.4)', 
                padding: '4px 10px', 
                borderRadius: '8px',
                border: isTabletop ? '1.5px solid #8c5b2b' : '1px solid var(--border-subtle)',
                boxShadow: isTabletop ? '0 2px 4px rgba(0,0,0,0.15)' : 'none'
              }}
            >
              <div className="wooden-colonist-disk" style={{ width: '22px', height: '22px' }} />
              <div>
                <div style={{ fontSize: '0.62rem', color: isTabletop ? '#7c2d12' : 'var(--text-muted)', lineHeight: 1 }}>대기 일꾼</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 900, color: isTabletop ? '#582109' : '#d8b4fe' }}>
                  {selectedPlayer.unassignedColonists}명
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. 영지 보드 본체 그리드: [좌: 12칸 섬 농경지] | [중앙: 12칸 산후안 시가지] | [우측: 농부 초상화 & 7대 직업 족자] */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '1.25fr 1.35fr 1.15fr', 
            gap: '14px',
            alignItems: 'stretch'
          }}
        >
          {/* =========================================================
              3-1. 좌측: 12칸 섬 농경지 (Island Plantation Zone)
              - 굽이치는 푸른 강줄기(River) & 에메랄드빛 카리브 농경지 감성
             ========================================================= */}
          <div 
            style={{ 
              position: 'relative',
              background: isTabletop 
                ? 'linear-gradient(160deg, #7da564 0%, #5d8a43 55%, #466f2f 100%)' 
                : 'rgba(15, 23, 42, 0.65)',
              borderRadius: '10px',
              padding: '12px 14px',
              border: isTabletop ? '2px solid #365314' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: isTabletop ? 'inset 0 0 12px rgba(0,0,0,0.35)' : 'none',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* 굽이치는 강물 일러스트 배경 (스크린샷 2번 실물 디테일) */}
            {isTabletop && (
              <svg 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.22, pointerEvents: 'none' }}
                preserveAspectRatio="none" 
                viewBox="0 0 200 300"
              >
                <path d="M 0,40 Q 60,60 90,140 T 200,240 L 200,300 L 0,300 Z" fill="#38bdf8" />
                <path d="M 0,20 Q 70,50 100,130 T 200,220" stroke="#bae6fd" strokeWidth="6" fill="none" strokeDasharray="6 4" />
                {/* 산등성이 실루엣 */}
                <polygon points="120,0 150,45 90,45" fill="#2d4a1d" opacity="0.6" />
                <polygon points="160,0 190,55 130,55" fill="#223e16" opacity="0.6" />
              </svg>
            )}

            {/* 농경지 헤더 */}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.05rem' }}>🌴</span>
                <span style={{ fontWeight: 900, fontSize: '0.88rem', color: isTabletop ? '#fef08a' : '#86efac', textShadow: isTabletop ? '0 1px 3px rgba(0,0,0,0.8)' : undefined }}>
                  섬 농경지 ({selectedPlayer.plantations.length}/12)
                </span>
              </div>
              <span style={{ fontSize: '0.68rem', color: isTabletop ? '#f0fdf4' : 'var(--text-muted)', textShadow: isTabletop ? '0 1px 2px rgba(0,0,0,0.6)' : undefined }}>
                일꾼(●) 배치 시 가동
              </span>
            </div>

            {/* 12칸 농장 타일 그리드 (3행 x 4열) */}
            <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', flex: 1 }}>
              {Array.from({ length: 12 }).map((_, idx) => {
                const tile = selectedPlayer.plantations[idx];

                if (!tile) {
                  return (
                    <div
                      key={idx}
                      style={{
                        minHeight: '62px',
                        borderRadius: '6px',
                        border: isTabletop ? '1.5px dashed rgba(254, 240, 138, 0.45)' : '1px dashed rgba(255, 255, 255, 0.12)',
                        background: isTabletop ? 'rgba(0, 0, 0, 0.18)' : 'transparent',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isTabletop ? 'rgba(254, 240, 138, 0.55)' : 'rgba(255, 255, 255, 0.25)',
                        fontSize: '0.66rem',
                        fontWeight: 600
                      }}
                    >
                      <span>슬롯 {idx + 1}</span>
                      <span style={{ fontSize: '0.55rem', opacity: 0.7 }}>농경지</span>
                    </div>
                  );
                }

                const isQuarry = tile.type === 'quarry';
                const goodMeta = !isQuarry ? GOODS_DATA[tile.type as GoodType] : null;

                return (
                  <div
                    key={tile.id}
                    title={`${isQuarry ? '채석장 (건축가 할인)' : goodMeta?.koreanName} - ${tile.hasColonist ? '일꾼 배치됨 (생산 가능)' : '일꾼 없음'}`}
                    style={{
                      minHeight: '62px',
                      borderRadius: '6px',
                      padding: '5px 6px',
                      background: isQuarry 
                        ? (isTabletop ? 'linear-gradient(135deg, #64748b 0%, #475569 100%)' : '#334155') 
                        : (goodMeta?.bgColor || '#1e293b'),
                      border: tile.hasColonist 
                        ? (isTabletop ? '2px solid #fef08a' : '2px solid #22c55e') 
                        : '1.5px solid rgba(255, 255, 255, 0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      boxShadow: isTabletop 
                        ? (tile.hasColonist ? '0 3px 0 #2e431a, 0 4px 8px rgba(0,0,0,0.45)' : '0 2px 0 rgba(0,0,0,0.3)') 
                        : (tile.hasColonist ? '0 0 8px rgba(34, 197, 94, 0.3)' : 'none'),
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1rem', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))' }}>
                        {isQuarry ? '⛏️' : goodMeta?.icon}
                      </span>
                      {tile.hasColonist ? (
                        <span 
                          title="목재 일꾼 디스크 배치됨"
                          className="wooden-colonist-disk"
                          style={{ width: '16px', height: '16px' }}
                        />
                      ) : (
                        <span 
                          style={{ 
                            fontSize: '0.58rem', 
                            color: '#e2e8f0',
                            background: 'rgba(0,0,0,0.45)',
                            padding: '1px 4px',
                            borderRadius: '3px',
                            fontWeight: 600
                          }}
                        >
                          미가동
                        </span>
                      )}
                    </div>

                    <div style={{ 
                      fontSize: '0.7rem', 
                      fontWeight: 800, 
                      color: '#ffffff',
                      textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                      lineHeight: 1.1,
                      marginTop: '2px'
                    }}>
                      {isQuarry ? '채석장' : goodMeta?.koreanName}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* =========================================================
              3-2. 중앙: 12칸 산후안 시가지 (San Juan City Zone)
              - 붉은 테라코타 기와 지붕과 황금 모래 부지 감성
             ========================================================= */}
          <div 
            style={{ 
              position: 'relative',
              background: isTabletop 
                ? 'linear-gradient(160deg, #d8bf9a 0%, #c9ab81 50%, #b8986c 100%)' 
                : 'rgba(15, 23, 42, 0.65)',
              borderRadius: '10px',
              padding: '12px 14px',
              border: isTabletop ? '2px solid #855223' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: isTabletop ? 'inset 0 0 12px rgba(90, 50, 10, 0.3)' : 'none',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* 시가지 헤더 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.05rem' }}>🏛️</span>
                <span style={{ fontWeight: 900, fontSize: '0.88rem', color: isTabletop ? '#451a03' : '#fcd34d' }}>
                  산후안 시가지 ({selectedPlayer.buildings.length}/12)
                </span>
              </div>
              <span style={{ fontSize: '0.68rem', color: isTabletop ? '#78350f' : 'var(--text-muted)' }}>
                12채 완공 시 게임 종료
              </span>
            </div>

            {/* 12칸 건물 부지 그리드 (4행 x 3열) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', flex: 1 }}>
              {Array.from({ length: 12 }).map((_, idx) => {
                const playerBldg = selectedPlayer.buildings[idx];

                if (!playerBldg) {
                  return (
                    <div
                      key={idx}
                      style={{
                        minHeight: '62px',
                        borderRadius: '6px',
                        border: isTabletop ? '1.5px dashed #a48259' : '1px dashed rgba(255, 255, 255, 0.12)',
                        background: isTabletop ? 'rgba(255, 255, 255, 0.4)' : 'transparent',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isTabletop ? '#7c5832' : 'rgba(255, 255, 255, 0.25)',
                        fontSize: '0.66rem',
                        fontWeight: 600
                      }}
                    >
                      <span>부지 {idx + 1}</span>
                      <span style={{ fontSize: '0.55rem', opacity: 0.8 }}>건축 가능</span>
                    </div>
                  );
                }

                const bDef = BUILDINGS_CATALOG.find(b => b.id === playerBldg.buildingId);
                const isActive = playerBldg.colonists > 0;

                return (
                  <div
                    key={idx}
                    className="building-card-tooltip"
                    style={{
                      minHeight: '62px',
                      borderRadius: '6px',
                      padding: '5px 7px',
                      background: bDef?.category === 'large' 
                        ? 'linear-gradient(135deg, #78350f 0%, #451a03 100%)' 
                        : bDef?.category === 'violet' 
                          ? 'linear-gradient(135deg, #6b21a8 0%, #4c1d95 100%)' 
                          : 'linear-gradient(135deg, #1e40af 0%, #172554 100%)',
                      border: isActive 
                        ? (isTabletop ? '2px solid #facc15' : '2px solid #a3e635') 
                        : '1.5px solid rgba(255, 255, 255, 0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: isTabletop ? '0 2px 0 rgba(0,0,0,0.35)' : (isActive ? '0 0 8px rgba(250, 204, 21, 0.25)' : 'none'),
                      cursor: 'help',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ 
                        fontSize: '0.72rem', 
                        fontWeight: 800, 
                        color: '#fff', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        maxWidth: '75%',
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                      }}>
                        {bDef?.koreanName}
                      </span>
                      <span style={{ 
                        fontSize: '0.68rem', 
                        color: '#fef08a', 
                        fontWeight: 900,
                        background: 'rgba(0,0,0,0.3)',
                        padding: '1px 4px',
                        borderRadius: '3px'
                      }}>
                        {bDef?.vp} VP
                      </span>
                    </div>

                    {/* 일꾼 배치 슬롯: 갈색 목재 디스크 시각화 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {Array.from({ length: bDef?.maxColonists || 1 }).map((_, cIdx) => (
                          <div
                            key={cIdx}
                            className={cIdx < playerBldg.colonists ? 'wooden-colonist-disk' : undefined}
                            style={{
                              width: '15px',
                              height: '15px',
                              borderRadius: '50%',
                              background: cIdx < playerBldg.colonists ? undefined : 'rgba(0,0,0,0.45)',
                              border: cIdx < playerBldg.colonists ? undefined : '1px dashed rgba(255,255,255,0.4)'
                            }}
                          />
                        ))}
                      </div>
                      <span style={{ 
                        fontSize: '0.6rem', 
                        fontWeight: 700,
                        color: isActive ? '#a3e635' : '#fca5a5' 
                      }}>
                        {isActive ? '작동' : '대기'}
                      </span>
                    </div>

                    {/* 마우스 호버 상세 툴팁 */}
                    <div className="tooltip-content" style={{ zIndex: 100 }}>
                      <div style={{ fontWeight: 800, color: '#fcd34d', marginBottom: '4px', fontSize: '0.85rem' }}>
                        {bDef?.koreanName} ({bDef?.vp}점)
                      </div>
                      <div style={{ color: '#e2e8f0', marginBottom: '6px', fontSize: '0.78rem', lineHeight: 1.3 }}>
                        {bDef?.desc}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: isActive ? '#86efac' : '#f87171', fontWeight: 700 }}>
                        {isActive ? '● 일꾼 배치됨 - 특수 효과 정상 발동 중' : '○ 일꾼 없음 - 시장 행동에서 일꾼 배치 필요'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* =========================================================
              3-3. 우측: 농부 초상화 & 7대 직업 요약 족자 (스크린샷 2번 실물)
              - 밀짚모자 카리브 농부 초상화
              - 양피지 직업 요약 족자 (Parchment Role Scroll)
              - 원주민 대기 움막 (Native Quarters)
             ========================================================= */}
          <div 
            style={{ 
              position: 'relative',
              background: isTabletop 
                ? 'linear-gradient(180deg, #fbf2db 0%, #f4e3be 100%)' 
                : 'rgba(15, 23, 42, 0.75)',
              borderRadius: '10px',
              padding: '12px',
              border: isTabletop ? '2px solid #946029' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: isTabletop ? 'inset 0 0 10px rgba(120, 60, 15, 0.25), 0 3px 8px rgba(0,0,0,0.15)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            {/* 상단: 밀짚모자 농부 초상화 & 원주민 움막 */}
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                background: isTabletop ? 'rgba(139, 69, 19, 0.08)' : 'rgba(0,0,0,0.3)',
                padding: '8px 10px',
                borderRadius: '8px',
                border: isTabletop ? '1px solid #d4b584' : '1px solid rgba(255,255,255,0.05)'
              }}
            >
              {/* 밀짚모자 농부 초상화 벡터 그래픽 */}
              <div 
                style={{ 
                  width: '46px', 
                  height: '46px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  border: '2px solid #b45309',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                  flexShrink: 0
                }}
              >
                <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
                  {/* 밀짚모자 챙 */}
                  <ellipse cx="18" cy="14" rx="15" ry="4.5" fill="#d97706" />
                  <ellipse cx="18" cy="12.5" rx="9" ry="4" fill="#b45309" />
                  <ellipse cx="18" cy="11" rx="8" ry="3.5" fill="#f59e0b" />
                  {/* 얼굴 */}
                  <circle cx="18" cy="18" r="7" fill="#fcd34d" />
                  {/* 눈 & 미소 */}
                  <circle cx="15.5" cy="17" r="1" fill="#78350f" />
                  <circle cx="20.5" cy="17" r="1" fill="#78350f" />
                  <path d="M 15.5,20.5 Q 18,22.5 20.5,20.5" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                  {/* 셔츠와 목깃 */}
                  <path d="M 11,25 L 25,25 L 27,34 L 9,34 Z" fill="#fff" />
                  <polygon points="18,25 15,29 21,29" fill="#dc2626" />
                </svg>
              </div>

              {/* 플레이어 칭호 & 움막 상태 */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 900, color: isTabletop ? '#3c1803' : '#f8fafc', lineHeight: 1.2 }}>
                  {selectedPlayer.name} 농장주
                </div>
                <div style={{ fontSize: '0.68rem', color: isTabletop ? '#854d0e' : '#cbd5e1', marginTop: '2px' }}>
                  ⛺ 원주민 대기 움막: <b>{selectedPlayer.unassignedColonists}명</b>
                </div>
              </div>
            </div>

            {/* 7대 직업 요약 양피지 족자 (Parchment Role Scroll) */}
            <div 
              style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                background: isTabletop ? '#f8eed2' : 'rgba(0,0,0,0.35)', 
                borderRadius: '8px', 
                padding: '8px 10px',
                border: isTabletop ? '1px solid #cbb186' : '1px solid rgba(255,255,255,0.06)',
                overflowY: 'auto',
                maxHeight: '220px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', borderBottom: isTabletop ? '1px solid #d8bf9a' : '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 900, color: isTabletop ? '#652d08' : '#fbbf24' }}>
                  📜 7대 직업 및 특권 요약표
                </span>
                {currentRole && (
                  <span style={{ fontSize: '0.65rem', background: '#eab308', color: '#000', fontWeight: 800, padding: '1px 5px', borderRadius: '4px' }}>
                    진행: {currentRole.toUpperCase()}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {ROLE_SUMMARY.map(r => {
                  const isCurrent = currentRole === r.role;

                  return (
                    <div 
                      key={r.role}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: '3px 6px',
                        borderRadius: '4px',
                        background: isCurrent 
                          ? (isTabletop ? '#eed19a' : 'rgba(234, 179, 8, 0.2)') 
                          : 'transparent',
                        border: isCurrent ? '1px solid #d97706' : 'none',
                        fontSize: '0.67rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: '65px' }}>
                        <span>{r.icon}</span>
                        <span style={{ fontWeight: 800, color: isTabletop ? (isCurrent ? '#854d0e' : '#451a03') : (isCurrent ? '#facc15' : '#f1f5f9') }}>
                          {r.name}
                        </span>
                      </div>
                      <div style={{ flex: 1, textAlign: 'right', color: isTabletop ? '#78350f' : '#cbd5e1' }}>
                        <span style={{ color: isTabletop ? '#9a3412' : '#fde047', fontWeight: 700 }}>
                          ★ {r.privilege}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* 4. 하단 창고 & 5가지 보유 작물 바 (원목 배럴 시각화) */}
        <div 
          style={{ 
            marginTop: '12px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            background: isTabletop ? 'linear-gradient(180deg, #dfc399 0%, #d4b584 100%)' : 'rgba(0,0,0,0.3)', 
            padding: '8px 14px', 
            borderRadius: '8px',
            border: isTabletop ? '1.5px solid #8c5b2b' : '1px solid rgba(255,255,255,0.06)',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.1rem' }}>📦</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: isTabletop ? '#451a03' : 'var(--text-main)' }}>
              개인 창고 보관 상품:
            </span>
            <span style={{ fontSize: '0.7rem', color: isTabletop ? '#78350f' : 'var(--text-muted)' }}>
              (선장 단계 종료 시 창고 없으면 1개만 보관 가능)
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(Object.keys(selectedPlayer.goods) as GoodType[]).map(g => {
              const count = selectedPlayer.goods[g];
              const hasAny = count > 0;

              return (
                <div 
                  key={g} 
                  title={`${GOODS_DATA[g].koreanName} - 보유량: ${count}개`}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    background: hasAny ? GOODS_DATA[g].bgColor : 'transparent',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    border: hasAny 
                      ? (isTabletop ? '1.5px solid #ffffff' : '1px solid rgba(255,255,255,0.25)') 
                      : (isTabletop ? '1px dashed #b8986c' : '1px dashed rgba(255,255,255,0.1)'),
                    opacity: hasAny ? 1 : 0.45,
                    boxShadow: hasAny && isTabletop ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
                  }}
                >
                  <span style={{ fontSize: '0.95rem' }}>{GOODS_DATA[g].icon}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: hasAny ? '#ffffff' : (isTabletop ? '#78350f' : '#94a3b8') }}>
                    {GOODS_DATA[g].koreanName}: {count}개
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
