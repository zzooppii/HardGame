import React, { useState } from 'react';
import { usePuertoRicoStore } from '../store/usePuertoRicoStore';
import { BUILDINGS_CATALOG, GOODS_DATA } from '../data/buildings';
import type { GoodType } from '../types';
import { Coins, Trophy, Users } from 'lucide-react';

export const PlayerMat: React.FC = () => {
  const { players, governorIndex, currentTurnPlayerIndex } = usePuertoRicoStore();
  const [activeTabPlayerId, setActiveTabPlayerId] = useState<string>(players[0]?.id || 'p-0');

  const selectedPlayer = players.find(p => p.id === activeTabPlayerId) || players[0];
  if (!selectedPlayer) return null;

  const isGovernor = players[governorIndex]?.id === selectedPlayer.id;
  const isTurn = players[currentTurnPlayerIndex]?.id === selectedPlayer.id;

  return (
    <div className="player-mat-container" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      {/* 1. 플레이어 탭 바 (모든 플레이어의 요약 정보와 전환 버튼) */}
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
                  ? 'rgba(30, 41, 59, 0.95)' 
                  : 'rgba(15, 23, 42, 0.6)',
                border: isSelected 
                  ? `2px solid ${p.color}` 
                  : isThisTurn 
                    ? '1px dashed var(--amber-border-bright)' 
                    : '1px solid var(--border-subtle)',
                color: isSelected ? '#f8fafc' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
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
              <span style={{ fontWeight: isSelected ? 700 : 500, fontSize: '0.85rem' }}>
                {p.name}
              </span>
              {isThisGov && <span title="총독">👑</span>}
              {isThisTurn && (
                <span style={{ fontSize: '0.7rem', color: 'var(--gold-secondary)', fontWeight: 600 }}>
                  [턴]
                </span>
              )}
              <div style={{ display: 'flex', gap: '6px', fontSize: '0.75rem', marginLeft: '4px' }}>
                <span style={{ color: 'var(--gold-primary)' }}>💰{p.doubloons}</span>
                <span style={{ color: '#38bdf8' }}>🏆{p.vpChips}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. 개인 보드판 메인 영역 */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '20px', 
          borderTop: `3px solid ${selectedPlayer.color}`,
          background: 'linear-gradient(180deg, rgba(22, 27, 34, 0.9) 0%, rgba(13, 17, 23, 0.95) 100%)'
        }}
      >
        {/* 플레이어 상태 헤더 */}
        <div className="player-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h3 className="font-serif" style={{ fontSize: '1.1rem', color: '#f8fafc', margin: 0 }}>
              {selectedPlayer.name}의 식민 영지
            </h3>
            {isGovernor && (
              <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>👑 총독</span>
            )}
            {isTurn && (
              <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid #38bdf8', fontSize: '0.72rem' }}>
                진행 중
              </span>
            )}
          </div>

          {/* 자원 요약 바 */}
          <div className="player-stats-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: '6px' }}>
              <Coins size={14} color="var(--gold-primary)" />
              <span style={{ fontWeight: 700, color: 'var(--gold-primary)', fontSize: '0.82rem' }}>
                {selectedPlayer.doubloons} 두블론
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: '6px' }}>
              <Trophy size={14} color="#38bdf8" />
              <span style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.82rem' }}>
                {selectedPlayer.vpChips} VP
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: '6px' }}>
              <Users size={14} color="#a855f7" />
              <span style={{ fontWeight: 700, color: '#d8b4fe', fontSize: '0.82rem' }}>
                대기 일꾼: {selectedPlayer.unassignedColonists}명
              </span>
            </div>
          </div>
        </div>

        {/* 3. 영지 보드 그리드 (좌: 섬 구역 12칸 / 우: 도시 구역 12칸) */}
        <div className="player-mat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '16px' }}>
          
          {/* 3-1. 섬 구역 (농장 & 채석장 12칸) */}
          <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#86efac' }}>
                🌴 섬 구역 (농장 & 채석장: {selectedPlayer.plantations.length}/12)
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                일꾼이 있어야 작물 생산/할인 작동
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
                        border: '1px dashed rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(255, 255, 255, 0.2)',
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
                      background: isQuarry ? '#334155' : (goodMeta?.bgColor || '#1e293b'),
                      border: tile.hasColonist ? '1.5px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      boxShadow: tile.hasColonist ? '0 0 8px rgba(34, 197, 94, 0.2)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1rem' }}>
                        {isQuarry ? '⛏️' : goodMeta?.icon}
                      </span>
                      {tile.hasColonist ? (
                        <span 
                          title="일꾼 배치됨 (작동 중)"
                          style={{ 
                            fontSize: '0.75rem', 
                            background: '#22c55e', 
                            color: '#000', 
                            borderRadius: '50%', 
                            width: '18px', 
                            height: '18px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontWeight: 'bold'
                          }}
                        >
                          👤
                        </span>
                      ) : (
                        <span 
                          title="일꾼 없음 (비활성)"
                          style={{ 
                            fontSize: '0.65rem', 
                            color: 'rgba(255,255,255,0.4)',
                            background: 'rgba(0,0,0,0.3)',
                            padding: '1px 4px',
                            borderRadius: '4px'
                          }}
                        >
                          빈칸
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#f8fafc' }}>
                      {isQuarry ? '채석장' : goodMeta?.koreanName}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3-2. 도시 구역 (건물 12칸) */}
          <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fcd34d' }}>
                🏛️ 도시 구역 (건물: {selectedPlayer.buildings.length}/12)
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                12채를 채우면 라운드 종료 후 게임이 끝납니다
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
                        border: '1px dashed rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(255, 255, 255, 0.2)',
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
                      border: isActive ? '1.5px solid #facc15' : '1px solid rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: isActive ? '0 0 8px rgba(250, 204, 21, 0.2)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>
                        {bDef?.koreanName}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#fcd34d', fontWeight: 600 }}>
                        {bDef?.vp}점
                      </span>
                    </div>

                    {/* 일꾼 배치 슬롯 표시 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {Array.from({ length: bDef?.maxColonists || 1 }).map((_, cIdx) => (
                          <div
                            key={cIdx}
                            style={{
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              background: cIdx < playerBldg.colonists ? '#facc15' : 'rgba(0,0,0,0.5)',
                              border: '1px solid rgba(255,255,255,0.4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.55rem',
                              color: '#000',
                              fontWeight: 'bold'
                            }}
                          >
                            {cIdx < playerBldg.colonists ? '👤' : ''}
                          </div>
                        ))}
                      </div>
                      <span style={{ fontSize: '0.65rem', color: isActive ? '#a3e635' : '#94a3b8' }}>
                        {isActive ? '활성' : '비활성'}
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
