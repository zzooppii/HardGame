import React from 'react';
import { usePuertoRicoStore } from '../store/usePuertoRicoStore';
import { ROLES_DATA } from '../data/roles';
import { GOODS_DATA } from '../data/buildings';
import type { GoodType } from '../types';
import { Anchor, Store, ShieldCheck } from 'lucide-react';

export const GameBoard: React.FC = () => {
  const { 
    roleCards, 
    currentPhase, 
    currentTurnPlayerIndex, 
    players, 
    selectRole,
    cargoShips,
    tradingHouse,
    colonistShip,
    colonistSupply,
    vpSupply,
    quarrySupply,
    goodsSupply,
    plantationMarket,
    playMode,
    myPlayerId,
    uiTheme
  } = usePuertoRicoStore();

  const isTabletop = uiTheme === 'tabletop';
  const currentPlayer = players[currentTurnPlayerIndex];
  const isMyTurn = playMode !== 'online' || currentPlayer?.id === myPlayerId;
  const isMyRoleSelection = currentPhase === 'select_role' && !currentPlayer?.isAI && isMyTurn;

  return (
    <div className="game-board-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* 1. 상단: 역할 선택 구역 */}
      <div 
        className={isTabletop ? 'tabletop-central-board' : 'glass-panel'} 
        style={{ 
          padding: '18px 22px',
          background: isTabletop 
            ? 'linear-gradient(180deg, #163d6e 0%, #0d2748 100%)' 
            : undefined 
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.3rem' }}>📜</span>
            <h3 className="font-serif" style={{ fontSize: '1.15rem', color: isTabletop ? '#fde047' : 'var(--gold-primary)', margin: 0 }}>
              역할 선택 (Role Tiles)
            </h3>
            {currentPhase === 'select_role' && (
              <span className="badge badge-gold" style={{ animation: 'pulse 2s infinite' }}>
                {currentPlayer?.name} 선택 중
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.82rem', color: isTabletop ? '#cbd5e1' : 'var(--text-muted)' }}>
            선택되지 않은 역할 타일에는 +1 두블론이 누적됩니다
          </div>
        </div>

        <div 
          className="role-cards-grid"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '10px' 
          }}
        >
          {roleCards.map(rc => {
            const roleDef = ROLES_DATA[rc.role];
            const isSelected = rc.selectedByPlayerId !== null;
            const selector = isSelected ? players.find(p => p.id === rc.selectedByPlayerId) : null;
            const canSelect = isMyRoleSelection && !isSelected;

            return (
              <div
                key={rc.role}
                onClick={() => canSelect && selectRole(rc.role)}
                className={isTabletop && !isSelected ? 'tabletop-role-tile' : undefined}
                style={{
                  position: 'relative',
                  padding: '12px',
                  borderRadius: isTabletop ? '6px' : '10px',
                  background: isTabletop
                    ? (isSelected ? 'rgba(30, 41, 59, 0.45)' : undefined)
                    : (isSelected 
                        ? 'rgba(15, 23, 42, 0.6)' 
                        : canSelect 
                          ? 'rgba(30, 41, 59, 0.9)' 
                          : 'rgba(20, 27, 39, 0.7)'),
                  border: isTabletop
                    ? (isSelected ? '1px solid rgba(255,255,255,0.1)' : undefined)
                    : (isSelected
                        ? '1px solid rgba(255, 255, 255, 0.05)'
                        : canSelect
                          ? '1px solid var(--amber-border-bright)'
                          : '1px solid var(--border-subtle)'),
                  cursor: canSelect ? 'pointer' : 'default',
                  opacity: isSelected ? 0.45 : 1,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '135px'
                }}
              >
                {/* 상단: 아이콘 & 이름 & 누적 돈 */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.4rem' }}>{roleDef.icon}</span>
                    {rc.doubloons > 0 && !isSelected && (
                      <span 
                        className={isTabletop ? 'tabletop-coin tabletop-coin-gold' : undefined}
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '2px',
                          padding: isTabletop ? '3px 8px' : '2px 7px',
                          fontSize: '0.78rem',
                          borderRadius: '14px',
                          background: isTabletop ? undefined : 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
                          color: isTabletop ? '#3b2403' : '#fff'
                        }}
                      >
                        🪙 +{rc.doubloons}
                      </span>
                    )}
                  </div>
                  <div style={{ 
                    fontWeight: 800, 
                    fontSize: '1rem', 
                    marginTop: '6px', 
                    color: isTabletop ? '#2b1805' : '#f8fafc',
                    fontFamily: isTabletop ? 'var(--font-serif)' : 'inherit'
                  }}>
                    {roleDef.koreanName}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: isTabletop ? '#664d30' : 'var(--text-muted)' }}>
                    {roleDef.name}
                  </div>
                </div>

                {/* 하단: 특권 설명 또는 선택자 표시 */}
                <div style={{ marginTop: '8px', borderTop: isTabletop ? '1px solid #d4c19c' : '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
                  {isSelected ? (
                    <span style={{ fontSize: '0.75rem', color: selector?.color || '#94a3b8', fontWeight: 700 }}>
                      ✓ {selector?.name} 선택
                    </span>
                  ) : (
                    <span style={{ 
                      fontSize: '0.72rem', 
                      color: isTabletop ? '#78350f' : 'var(--text-gold)', 
                      lineHeight: 1.25, 
                      display: 'block',
                      fontWeight: isTabletop ? 600 : 400
                    }}>
                      ★ {roleDef.privilegeDesc}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. 중단: 항구(화물선 3척) & 상점 & 공급처 */}
      <div className="mid-board-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.9fr 1.1fr', gap: '14px' }}>
        
        {/* 2-1. 항구 (화물선 3척) */}
        <div className={isTabletop ? 'tabletop-central-board' : 'glass-panel'} style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Anchor size={18} color={isTabletop ? '#38bdf8' : 'var(--caribbean-teal)'} />
            <h4 className="font-serif" style={{ fontSize: '1rem', color: isTabletop ? '#fde047' : '#f8fafc', margin: 0 }}>
              카리브 화물선 (Cargo Ships)
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {cargoShips.map((ship, idx) => {
              const goodMeta = ship.goodType ? GOODS_DATA[ship.goodType] : null;
              const isFull = ship.loaded >= ship.capacity;

              return (
                <div 
                  key={idx} 
                  className={isTabletop ? 'tabletop-ship-card' : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: isTabletop 
                      ? undefined 
                      : 'rgba(15, 23, 42, 0.7)',
                    border: isTabletop 
                      ? undefined 
                      : (isFull ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)')
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>⛵</span>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isTabletop ? '#2b1805' : '#f1f5f9' }}>
                        화물선 #{idx + 1} ({ship.capacity}칸)
                      </div>
                      <div style={{ fontSize: '0.72rem', color: isTabletop ? '#78350f' : 'var(--text-muted)' }}>
                        {goodMeta ? `${goodMeta.koreanName} 전용` : '모든 상품 적재 가능'}
                      </div>
                    </div>
                  </div>

                  {/* 적재 슬롯 시각화 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {Array.from({ length: ship.capacity }).map((_, slotIdx) => {
                      const isOccupied = slotIdx < ship.loaded;
                      return (
                        <div
                          key={slotIdx}
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '4px',
                            border: isTabletop ? '1.5px solid #8a6534' : '1px dashed rgba(255,255,255,0.2)',
                            background: isOccupied ? (goodMeta?.bgColor || '#3b82f6') : (isTabletop ? 'rgba(0,0,0,0.06)' : 'transparent'),
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            boxShadow: isOccupied ? '0 2px 4px rgba(0,0,0,0.4)' : 'none'
                          }}
                        >
                          {isOccupied && (goodMeta?.icon || '📦')}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2-2. 상점 (Trading House) */}
        <div className={isTabletop ? 'tabletop-central-board' : 'glass-panel'} style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Store size={18} color={isTabletop ? '#fde047' : 'var(--gold-primary)'} />
            <h4 className="font-serif" style={{ fontSize: '1rem', color: isTabletop ? '#fde047' : '#f8fafc', margin: 0 }}>
              무역 상점 (Trading House)
            </h4>
          </div>

          <div style={{ fontSize: '0.75rem', color: isTabletop ? '#cbd5e1' : 'var(--text-muted)', marginBottom: '10px' }}>
            4칸 한정, 중복 상품 판매 불가 (만선 시 비워짐)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {[0, 1, 2, 3].map(slotIdx => {
              const good = tradingHouse[slotIdx];
              const goodMeta = good ? GOODS_DATA[good] : null;

              return (
                <div
                  key={slotIdx}
                  style={{
                    height: '58px',
                    borderRadius: '6px',
                    border: isTabletop ? '1.5px solid #c4a470' : '1px dashed rgba(229, 169, 60, 0.3)',
                    background: goodMeta ? goodMeta.bgColor : (isTabletop ? 'rgba(0,0,0,0.2)' : 'rgba(15, 23, 42, 0.5)'),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px'
                  }}
                >
                  {goodMeta ? (
                    <>
                      <span style={{ fontSize: '1.2rem' }}>{goodMeta.icon}</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: goodMeta.color }}>
                        {goodMeta.koreanName}
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: '0.7rem', color: isTabletop ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)' }}>빈 칸</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2-3. 공용 공급처 자원 (Supply & Market) */}
        <div className={isTabletop ? 'tabletop-central-board' : 'glass-panel'} style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <ShieldCheck size={18} color="#c084fc" />
            <h4 className="font-serif" style={{ fontSize: '1rem', color: isTabletop ? '#fde047' : '#f8fafc', margin: 0 }}>
              공용 공급처 (Supply)
            </h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
            <div style={{ background: isTabletop ? 'rgba(0,0,0,0.25)' : 'rgba(15,23,42,0.6)', padding: '6px 8px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: isTabletop ? '#cbd5e1' : 'var(--text-muted)' }}>이주민 배</div>
              <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.95rem' }}>👥 {colonistShip}명</div>
            </div>
            <div style={{ background: isTabletop ? 'rgba(0,0,0,0.25)' : 'rgba(15,23,42,0.6)', padding: '6px 8px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: isTabletop ? '#cbd5e1' : 'var(--text-muted)' }}>이주민 풀</div>
              <div style={{ fontWeight: 700, color: '#cbd5e1', fontSize: '0.95rem' }}>{colonistSupply}명</div>
            </div>
            <div style={{ background: isTabletop ? 'rgba(0,0,0,0.25)' : 'rgba(15,23,42,0.6)', padding: '6px 8px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: isTabletop ? '#cbd5e1' : 'var(--text-muted)' }}>남은 VP</div>
              <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.95rem' }}>🏆 {vpSupply}</div>
            </div>
          </div>

          {/* 작물 재고 공급처 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '6px' }}>
            {(Object.keys(goodsSupply) as GoodType[]).map(g => (
              <div key={g} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem' }}>{GOODS_DATA[g].icon}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: GOODS_DATA[g].color }}>
                  {goodsSupply[g]}
                </div>
              </div>
            ))}
            <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '8px' }}>
              <div style={{ fontSize: '0.85rem' }}>⛏️</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#cbd5e1' }}>
                {quarrySupply}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. 하단: 개척자 오픈 농장 마켓 (오픈된 타일들) */}
      <div className="glass-panel" style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.1rem' }}>🌱</span>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#f8fafc' }}>
              오픈된 농장 시장 (Plantation Market)
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            개척자 선택 가능 타일
          </div>
        </div>

        <div className="market-scroll-row" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {plantationMarket.map((pType, idx) => {
            const isQuarry = pType === 'quarry';
            const meta = !isQuarry ? GOODS_DATA[pType as GoodType] : null;

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  background: isQuarry ? '#334155' : (meta?.bgColor || '#1e293b'),
                  border: '1px solid rgba(255,255,255,0.15)',
                  fontSize: '0.82rem',
                  color: '#f8fafc',
                  fontWeight: 600
                }}
              >
                <span>{isQuarry ? '⛏️' : meta?.icon}</span>
                <span>{isQuarry ? '채석장' : meta?.koreanName}</span>
              </div>
            );
          })}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            borderRadius: '6px',
            background: '#334155',
            border: '1px dashed #94a3b8',
            fontSize: '0.82rem',
            color: '#cbd5e1',
            fontWeight: 600
          }}>
            <span>⛏️</span>
            <span>채석장 ({quarrySupply})</span>
          </div>
        </div>
      </div>

    </div>
  );
};
