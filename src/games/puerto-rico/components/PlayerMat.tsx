import React, { useState } from 'react';
import { usePuertoRicoStore } from '../store/usePuertoRicoStore';
import { BUILDINGS_CATALOG, GOODS_DATA } from '../data/buildings';
import type { GoodType } from '../types';

export const PlayerMat: React.FC = () => {
  const { players, governorIndex, currentTurnPlayerIndex, uiTheme } = usePuertoRicoStore();
  const [activeTabPlayerId, setActiveTabPlayerId] = useState<string>(players[0]?.id || 'p-0');

  const isTabletop = uiTheme === 'tabletop';
  const selectedPlayer = players.find(p => p.id === activeTabPlayerId) || players[0];
  if (!selectedPlayer) return null;

  const isGovernor = players[governorIndex]?.id === selectedPlayer.id;
  const isTurn = players[currentTurnPlayerIndex]?.id === selectedPlayer.id;

  return (
    <div className="player-mat-container" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      {/* 1. 플레이어 탭 바 */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {players.map(p => {
          const isSelected = p.id === selectedPlayer.id;
          const isThisTurn = players[currentTurnPlayerIndex]?.id === p.id;
          const isThisGov = players[governorIndex]?.id === p.id;

          return (
            <button
              key={p.id}
              onClick={() => setActiveTabPlayerId(p.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: isSelected 
                  ? (isTabletop ? '#dfcfac' : 'rgba(30, 41, 59, 0.95)') 
                  : (isTabletop ? '#fdf6e2' : 'rgba(15, 23, 42, 0.6)'),
                border: isSelected 
                  ? (isTabletop ? '2px solid #6b441a' : `2px solid ${p.color}`) 
                  : (isTabletop ? '1px solid #c4a77d' : '1px solid var(--border-subtle)'),
                color: isTabletop ? '#2b1805' : (isSelected ? '#f8fafc' : 'var(--text-muted)'),
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: isSelected ? 800 : 500
              }}
            >
              <div 
                style={{ 
                  width: '10px', 
                  height: '10px', 
                  borderRadius: '50%', 
                  background: p.color,
                  boxShadow: isThisTurn ? `0 0 8px ${p.color}` : 'none'
                }} 
              />
              <span style={{ fontSize: '0.85rem' }}>
                {p.name}
              </span>
              {isThisGov && <span title="총독">👑</span>}
              {isThisTurn && (
                <span style={{ fontSize: '0.7rem', color: isTabletop ? '#854d0e' : 'var(--gold-secondary)', fontWeight: 700 }}>
                  [턴]
                </span>
              )}
              <div style={{ display: 'flex', gap: '6px', fontSize: '0.75rem', marginLeft: '4px' }}>
                <span>💰{p.doubloons}</span>
                <span>🏆{p.vpChips}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. 개인 보드판 메인 영역 (실물 사진 기반 지도 레이아웃) */}
      <div 
        className={isTabletop ? 'tabletop-island-mat' : 'glass-panel'} 
        style={{ 
          padding: '18px 20px', 
          borderTop: isTabletop ? '4px solid #5a3d1c' : `3px solid ${selectedPlayer.color}`,
          background: isTabletop 
            ? 'linear-gradient(180deg, #f2ead6 0%, #e2d3b3 100%)' 
            : 'linear-gradient(180deg, rgba(22, 27, 34, 0.9) 0%, rgba(13, 17, 23, 0.95) 100%)'
        }}
      >
        {/* 플레이어 상태 헤더 */}
        <div className="player-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h3 className="font-serif" style={{ fontSize: '1.15rem', color: isTabletop ? '#2b1805' : '#f8fafc', margin: 0, fontWeight: 800 }}>
              {selectedPlayer.name}의 영지 보드판
            </h3>
            {isGovernor && (
              <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>👑 총독</span>
            )}
            {isTurn && (
              <span className="badge" style={{ background: isTabletop ? '#eab308' : 'rgba(56, 189, 248, 0.2)', color: isTabletop ? '#000' : '#38bdf8', border: '1px solid #38bdf8', fontSize: '0.72rem' }}>
                행동 진행 중
              </span>
            )}
          </div>

          {/* 자원 요약 바 (입체 목재 디스크 및 주조 코인) */}
          <div className="player-stats-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: isTabletop ? '#eeddbb' : 'rgba(0,0,0,0.4)', 
              padding: '4px 10px', 
              borderRadius: '6px',
              border: isTabletop ? '1px solid #c4a77d' : undefined
            }}>
              <span className={isTabletop ? 'tabletop-coin tabletop-coin-gold' : undefined} style={{ width: '18px', height: '18px', fontSize: '0.7rem' }}>
                💰
              </span>
              <span style={{ fontWeight: 800, color: isTabletop ? '#5c3808' : 'var(--gold-primary)', fontSize: '0.85rem' }}>
                {selectedPlayer.doubloons} 두블론
              </span>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: isTabletop ? '#eeddbb' : 'rgba(0,0,0,0.4)', 
              padding: '4px 10px', 
              borderRadius: '6px',
              border: isTabletop ? '1px solid #c4a77d' : undefined
            }}>
              <span className={isTabletop ? 'tabletop-coin tabletop-coin-silver' : undefined} style={{ width: '18px', height: '18px', fontSize: '0.7rem' }}>
                🏆
              </span>
              <span style={{ fontWeight: 800, color: isTabletop ? '#1e3a8a' : '#38bdf8', fontSize: '0.85rem' }}>
                {selectedPlayer.vpChips} VP
              </span>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: isTabletop ? '#eeddbb' : 'rgba(0,0,0,0.4)', 
              padding: '4px 10px', 
              borderRadius: '6px',
              border: isTabletop ? '1px solid #c4a77d' : undefined
            }}>
              <span className="wooden-colonist-disk" style={{ width: '18px', height: '18px' }} />
              <span style={{ fontWeight: 800, color: isTabletop ? '#612c09' : '#d8b4fe', fontSize: '0.85rem' }}>
                대기 일꾼: {selectedPlayer.unassignedColonists}명
              </span>
            </div>
          </div>
        </div>

        {/* 3. 영지 보드 그리드 (좌: 섬 구역 12칸 / 우: 도시 구역 12칸) */}
        <div className="player-mat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '16px' }}>
          
          {/* 3-1. 섬 구역 (농장 & 채석장 12칸) - 실물 초록 잔디밭 감성 */}
          <div 
            className={isTabletop ? 'tabletop-plantation-zone' : undefined}
            style={{ 
              background: isTabletop ? undefined : 'rgba(15, 23, 42, 0.5)', 
              padding: '14px', 
              borderRadius: '10px', 
              border: isTabletop ? undefined : '1px solid rgba(255,255,255,0.06)' 
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.88rem', color: isTabletop ? '#fde047' : '#86efac', textShadow: isTabletop ? '0 1px 2px rgba(0,0,0,0.6)' : undefined }}>
                🌴 섬 농경지 ({selectedPlayer.plantations.length}/12)
              </span>
              <span style={{ fontSize: '0.72rem', color: isTabletop ? '#e2e8f0' : 'var(--text-muted)' }}>
                일꾼 디스크가 있어야 작동
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {Array.from({ length: 12 }).map((_, idx) => {
                const tile = selectedPlayer.plantations[idx];

                if (!tile) {
                  return (
                    <div
                      key={idx}
                      style={{
                        height: '68px',
                        borderRadius: '6px',
                        border: isTabletop ? '1.5px dashed rgba(255, 255, 255, 0.3)' : '1px dashed rgba(255, 255, 255, 0.1)',
                        background: isTabletop ? 'rgba(0, 0, 0, 0.15)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isTabletop ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.2)',
                        fontSize: '0.7rem'
                      }}
                    >
                      빈 슬롯
                    </div>
                  );
                }

                const isQuarry = tile.type === 'quarry';
                const goodMeta = !isQuarry ? GOODS_DATA[tile.type as GoodType] : null;

                return (
                  <div
                    key={tile.id}
                    style={{
                      height: '68px',
                      borderRadius: '6px',
                      padding: '6px',
                      background: isQuarry 
                        ? (isTabletop ? '#525b68' : '#334155') 
                        : (goodMeta?.bgColor || '#1e293b'),
                      border: tile.hasColonist 
                        ? (isTabletop ? '2px solid #fde047' : '1.5px solid #22c55e') 
                        : '1px solid rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      boxShadow: isTabletop 
                        ? '0 3px 0 rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.3)' 
                        : (tile.hasColonist ? '0 0 8px rgba(34, 197, 94, 0.2)' : 'none')
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1rem' }}>
                        {isQuarry ? '⛏️' : goodMeta?.icon}
                      </span>
                      {tile.hasColonist ? (
                        <span 
                          title="목재 일꾼 디스크 배치됨"
                          className="wooden-colonist-disk"
                        >
                          ●
                        </span>
                      ) : (
                        <span 
                          title="일꾼 없음"
                          style={{ 
                            fontSize: '0.65rem', 
                            color: 'rgba(255,255,255,0.6)',
                            background: 'rgba(0,0,0,0.3)',
                            padding: '1px 4px',
                            borderRadius: '4px'
                          }}
                        >
                          빈칸
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f8fafc' }}>
                      {isQuarry ? '채석장' : goodMeta?.koreanName}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3-2. 도시 구역 (건물 12칸) - 실물 건축 도면 감성 */}
          <div 
            className={isTabletop ? 'tabletop-city-zone' : undefined}
            style={{ 
              background: isTabletop ? undefined : 'rgba(15, 23, 42, 0.5)', 
              padding: '14px', 
              borderRadius: '10px', 
              border: isTabletop ? undefined : '1px solid rgba(255,255,255,0.06)' 
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.88rem', color: isTabletop ? '#5a3d1c' : '#fcd34d' }}>
                🏛️ 산후안 도시 ({selectedPlayer.buildings.length}/12)
              </span>
              <span style={{ fontSize: '0.72rem', color: isTabletop ? '#785b34' : 'var(--text-muted)' }}>
                12채를 채우면 게임 종료
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {Array.from({ length: 12 }).map((_, idx) => {
                const playerBldg = selectedPlayer.buildings[idx];

                if (!playerBldg) {
                  return (
                    <div
                      key={idx}
                      style={{
                        height: '68px',
                        borderRadius: '6px',
                        border: isTabletop ? '1.5px dashed #b89d74' : '1px dashed rgba(255, 255, 255, 0.1)',
                        background: isTabletop ? 'rgba(255,255,255,0.4)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isTabletop ? '#8a6c42' : 'rgba(255, 255, 255, 0.2)',
                        fontSize: '0.7rem'
                      }}
                    >
                      부지 {idx + 1}
                    </div>
                  );
                }

                const bDef = BUILDINGS_CATALOG.find(b => b.id === playerBldg.buildingId);
                const isActive = playerBldg.colonists > 0;

                return (
                  <div
                    key={idx}
                    title={bDef?.desc}
                    style={{
                      height: '68px',
                      borderRadius: '6px',
                      padding: '6px 8px',
                      background: bDef?.category === 'large' 
                        ? 'linear-gradient(135deg, #78350f 0%, #451a03 100%)' 
                        : bDef?.category === 'violet' 
                          ? '#581c87' 
                          : '#1e3a8a',
                      border: isActive ? '2px solid #facc15' : '1px solid rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: isTabletop ? '0 3px 0 rgba(0,0,0,0.3)' : (isActive ? '0 0 8px rgba(250, 204, 21, 0.2)' : 'none')
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>
                        {bDef?.koreanName}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#fcd34d', fontWeight: 800 }}>
                        {bDef?.vp}점
                      </span>
                    </div>

                    {/* 일꾼 배치 슬롯: 목재 디스크 시각화 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {Array.from({ length: bDef?.maxColonists || 1 }).map((_, cIdx) => (
                          <div
                            key={cIdx}
                            className={cIdx < playerBldg.colonists ? 'wooden-colonist-disk' : undefined}
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              background: cIdx < playerBldg.colonists ? undefined : 'rgba(0,0,0,0.4)',
                              border: cIdx < playerBldg.colonists ? undefined : '1px dashed rgba(255,255,255,0.4)'
                            }}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.65rem', color: isActive ? '#a3e635' : '#cbd5e1' }}>
                        {isActive ? '작동' : '정지'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* 4. 창고 & 보유 작물 바 */}
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '10px 16px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1rem' }}>📦</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
              개인 창고 보관 상품:
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(Object.keys(selectedPlayer.goods) as GoodType[]).map(g => (
              <div 
                key={g} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  background: selectedPlayer.goods[g] > 0 ? GOODS_DATA[g].bgColor : 'transparent',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: selectedPlayer.goods[g] > 0 ? '1px solid rgba(255,255,255,0.2)' : '1px dashed rgba(255,255,255,0.1)',
                  opacity: selectedPlayer.goods[g] > 0 ? 1 : 0.4
                }}
              >
                <span>{GOODS_DATA[g].icon}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: GOODS_DATA[g].color }}>
                  {GOODS_DATA[g].koreanName}: {selectedPlayer.goods[g]}개
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
