import React from 'react';
import { usePuertoRicoStore } from '../store/usePuertoRicoStore';
import { ROLES_DATA } from '../data/roles';
import { GOODS_DATA } from '../data/buildings';
import type { GoodType } from '../types';
import { Coins, Anchor, Store, ShieldCheck } from 'lucide-react';

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
    myPlayerId
  } = usePuertoRicoStore();

  const currentPlayer = players[currentTurnPlayerIndex];
  const isMyTurn = playMode !== 'online' || currentPlayer?.id === myPlayerId;
  const isMyRoleSelection = currentPhase === 'select_role' && !currentPlayer?.isAI && isMyTurn;

  return (
    <div className="game-board-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. 상단: 역할 선택 구역 */}
      <div className="glass-panel" style={{ padding: '18px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.25rem' }}>📜</span>
            <h3 className="font-serif" style={{ fontSize: '1.15rem', color: 'var(--gold-primary)', margin: 0 }}>
              역할 선택 (Roles)
            </h3>
            {currentPhase === 'select_role' && (
              <span className="badge badge-gold" style={{ animation: 'pulse 2s infinite' }}>
                {currentPlayer?.name} 선택 중
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            라운드마다 선택되지 않은 역할에는 +1 두블론이 누적됩니다
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
          gap: '12px' 
        }}>
          {roleCards.map(rc => {
            const roleDef = ROLES_DATA[rc.role];
            const isSelected = rc.selectedByPlayerId !== null;
            const selector = isSelected ? players.find(p => p.id === rc.selectedByPlayerId) : null;
            const canSelect = isMyRoleSelection && !isSelected;

            return (
              <div
                key={rc.role}
                onClick={() => canSelect && selectRole(rc.role)}
                style={{
                  position: 'relative',
                  padding: '12px',
                  borderRadius: '10px',
                  background: isSelected 
                    ? 'rgba(15, 23, 42, 0.6)' 
                    : canSelect 
                      ? 'rgba(30, 41, 59, 0.9)' 
                      : 'rgba(20, 27, 39, 0.7)',
                  border: isSelected
                    ? '1px solid rgba(255, 255, 255, 0.05)'
                    : canSelect
                      ? '1px solid var(--amber-border-bright)'
                      : '1px solid var(--border-subtle)',
                  cursor: canSelect ? 'pointer' : 'default',
                  opacity: isSelected ? 0.45 : 1,
                  transform: canSelect ? 'translateY(0)' : 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: canSelect ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '130px'
                }}
                onMouseEnter={e => {
                  if (canSelect) {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = 'var(--gold-secondary)';
                    e.currentTarget.style.boxShadow = '0 8px 20px var(--gold-glow)';
                  }
                }}
                onMouseLeave={e => {
                  if (canSelect) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--amber-border-bright)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                  }
                }}
              >
                {/* 상단: 아이콘 & 이름 & 누적 돈 */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.4rem' }}>{roleDef.icon}</span>
                    {rc.doubloons > 0 && !isSelected && (
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '3px',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
                        color: '#fff',
                        padding: '2px 7px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 6px rgba(245, 158, 11, 0.4)'
                      }}>
                        <Coins size={12} /> +{rc.doubloons}
                      </span>
                    )}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '6px', color: '#f8fafc' }}>
                    {roleDef.koreanName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {roleDef.name}
                  </div>
                </div>

                {/* 하단: 특권 설명 또는 선택자 표시 */}
                <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
                  {isSelected ? (
                    <span style={{ fontSize: '0.75rem', color: selector?.color || '#94a3b8', fontWeight: 600 }}>
                      ✓ {selector?.name} 선택
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-gold)', lineHeight: 1.2, display: 'block' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.9fr 1.1fr', gap: '16px' }}>
        
        {/* 2-1. 항구 (화물선 3척) */}
        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Anchor size={18} color="var(--caribbean-teal)" />
            <h4 className="font-serif" style={{ fontSize: '1rem', color: '#f8fafc', margin: 0 }}>
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
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: isFull ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.1rem' }}>⛵</span>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>
                        화물선 #{idx + 1} ({ship.capacity}칸)
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
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
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            border: '1px dashed rgba(255,255,255,0.2)',
                            background: isOccupied ? (goodMeta?.bgColor || '#3b82f6') : 'transparent',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            boxShadow: isOccupied ? '0 1px 4px rgba(0,0,0,0.4)' : 'none'
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
        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Store size={18} color="var(--gold-primary)" />
            <h4 className="font-serif" style={{ fontSize: '1rem', color: '#f8fafc', margin: 0 }}>
              상점 (Trading House)
            </h4>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            4칸 한정, 중복 상품 판매 불가 (가득 차면 비워짐)
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
                    borderRadius: '8px',
                    border: '1px dashed rgba(229, 169, 60, 0.3)',
                    background: goodMeta ? goodMeta.bgColor : 'rgba(15, 23, 42, 0.5)',
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
                      <span style={{ fontSize: '0.68rem', fontWeight: 600, color: goodMeta.color }}>
                        {goodMeta.koreanName}
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>빈 칸</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2-3. 공용 공급처 자원 (Supply & Market) */}
        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <ShieldCheck size={18} color="#a855f7" />
            <h4 className="font-serif" style={{ fontSize: '1rem', color: '#f8fafc', margin: 0 }}>
              공용 공급처 (Supply)
            </h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
            <div style={{ background: 'rgba(15,23,42,0.6)', padding: '6px 8px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>이주민 배</div>
              <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.95rem' }}>👥 {colonistShip}명</div>
            </div>
            <div style={{ background: 'rgba(15,23,42,0.6)', padding: '6px 8px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>이주민 공급처</div>
              <div style={{ fontWeight: 700, color: '#94a3b8', fontSize: '0.95rem' }}>{colonistSupply}명</div>
            </div>
            <div style={{ background: 'rgba(15,23,42,0.6)', padding: '6px 8px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>남은 VP 칩</div>
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
      <div className="glass-panel" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.2rem' }}>🌱</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>
              오픈된 농장 시장 (Plantation Market)
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              개척자 페이즈 시 선택 가능한 타일입니다
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
