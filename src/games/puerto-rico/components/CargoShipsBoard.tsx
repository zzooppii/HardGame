import React from 'react';
import { usePuertoRicoStore } from '../store/usePuertoRicoStore';
import { GOODS_DATA } from '../data/buildings';
import type { GoodType } from '../types';

export const CargoShipsBoard: React.FC = () => {
  const { cargoShips, tradingHouse } = usePuertoRicoStore();

  // 상품 기본 판매 가격표 (옥수수 0, 인디고 1, 설탕 2, 담배 3, 커피 4)
  const PRICE_LIST: { type: GoodType; price: number; badgeColor: string; textColor: string }[] = [
    { type: 'corn', price: 0, badgeColor: '#eab308', textColor: '#000' },
    { type: 'indigo', price: 1, badgeColor: '#22c55e', textColor: '#fff' },
    { type: 'sugar', price: 2, badgeColor: '#f8fafc', textColor: '#0f172a' },
    { type: 'tobacco', price: 3, badgeColor: '#854d0e', textColor: '#fff' },
    { type: 'coffee', price: 4, badgeColor: '#1e1b18', textColor: '#fff' }
  ];

  return (
    <div 
      className="saboteur-board-panel"
      style={{
        padding: '14px 16px',
        borderRadius: '12px',
        background: 'linear-gradient(180deg, #102d4a 0%, #081726 100%)',
        border: '2px solid #38bdf8',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.8), inset 0 0 40px rgba(56, 189, 248, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxSizing: 'border-box'
      }}
    >
      {/* 상단 타이틀 바 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(56, 189, 248, 0.3)', paddingBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>⚓</span>
          <span style={{ fontWeight: 900, fontSize: '0.98rem', color: '#f8fafc', letterSpacing: '0.5px' }}>
            산후안 항구 (수송선 {cargoShips.length}척 & 무역 상점)
          </span>
        </div>
        <div style={{ fontSize: '0.72rem', color: '#93c5fd' }}>
          선장: 상품 의무 선적 | 상인: 1개 판매 (중복 불가)
        </div>
      </div>

      {/* 실물 스크린샷 1번 메인 레이아웃: 좌측 카리브 수송선 & 우측 원목 상점 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '14px', alignItems: 'stretch' }}>
        
        {/* [좌측] 카리브 수송선 {cargoShips.length}척 (실제 범선 모양) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          background: 'linear-gradient(180deg, #094067 0%, #03233b 100%)',
          borderRadius: '10px',
          padding: '10px',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* 바다 파도 텍스처 오버레이 */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.12) 0%, transparent 80%)',
            pointerEvents: 'none'
          }} />

          {cargoShips.map((ship, sIdx) => {
            const goodMeta = ship.goodType ? GOODS_DATA[ship.goodType] : null;
            const isFull = ship.loaded >= ship.capacity;

            return (
              <div
                key={sIdx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'linear-gradient(180deg, #422006 0%, #291203 100%)',
                  borderRadius: '24px 24px 16px 16px',
                  border: isFull ? '2px solid #ef4444' : '2px solid #d4af37',
                  boxShadow: isFull ? '0 0 16px rgba(239, 68, 68, 0.4)' : '0 8px 20px rgba(0,0,0,0.6)',
                  padding: '10px 8px 12px 8px',
                  position: 'relative',
                  zIndex: 1,
                  minHeight: '210px',
                  justifyContent: 'space-between'
                }}
              >
                {/* 1. 선수 (선박 머리) & 선박 깃발 라벨 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', width: '100%' }}>
                  <div style={{
                    width: '32px',
                    height: '24px',
                    borderRadius: '50% 50% 0 0',
                    background: '#78350f',
                    border: '1px solid #d4af37',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    color: '#fef08a',
                    fontWeight: 900
                  }}>
                    {sIdx + 1}
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fde047', textAlign: 'center' }}>
                    수송선 #{sIdx + 1}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: goodMeta ? goodMeta.color : '#cbd5e1', fontWeight: 700 }}>
                    {goodMeta ? `${goodMeta.koreanName} 전용` : `[${ship.capacity}칸 빈 배]`}
                  </span>
                </div>

                {/* 2. 팔각형 선적 슬롯 (스크린샷 1번처럼 수직 정렬) */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  padding: '6px 0'
                }}>
                  {Array.from({ length: ship.capacity }).map((_, slotIdx) => {
                    const isLoaded = slotIdx < ship.loaded;

                    return (
                      <div
                        key={slotIdx}
                        style={{
                          width: '36px',
                          height: '32px',
                          clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                          background: isLoaded
                            ? (goodMeta?.bgColor || '#3b82f6')
                            : 'rgba(255, 255, 255, 0.12)',
                          border: isLoaded ? '1px solid #fff' : '1px solid rgba(255, 255, 255, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                          boxShadow: isLoaded ? '0 2px 6px rgba(0,0,0,0.6)' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                        title={isLoaded ? `${goodMeta?.koreanName} 선적됨` : '선적 대기 슬롯'}
                      >
                        {isLoaded && (goodMeta?.icon || '📦')}
                      </div>
                    );
                  })}
                </div>

                {/* 3. 선미 & 적재 상태 요약 */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: isFull ? '#f87171' : '#86efac',
                  border: isFull ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)'
                }}>
                  {isFull ? '만선 (출항 예정)' : `${ship.loaded} / ${ship.capacity}칸`}
                </div>
              </div>
            );
          })}
        </div>

        {/* [우측] 무역 상점 (Trading House - 스크린샷 1번 원목 스타일 완벽 이식) */}
        <div style={{
          background: 'linear-gradient(180deg, #4a2d11 0%, #2f1a07 100%)',
          borderRadius: '10px',
          border: '2px solid #b45309',
          boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          {/* 1. 상점 원목 간판 */}
          <div style={{
            background: 'linear-gradient(180deg, #854d0e 0%, #5c3206 100%)',
            border: '2px solid #d4af37',
            borderRadius: '6px',
            padding: '4px 12px',
            textAlign: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
            marginBottom: '10px'
          }}>
            <span className="font-serif" style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fef08a', letterSpacing: '2px' }}>
              상 점
            </span>
          </div>

          {/* 2. 4개 팔각형 슬롯 (2x2 그리드) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            justifyItems: 'center',
            padding: '8px 0'
          }}>
            {[0, 1, 2, 3].map(slotIdx => {
              const good = tradingHouse[slotIdx];
              const goodMeta = good ? GOODS_DATA[good] : null;

              return (
                <div
                  key={slotIdx}
                  style={{
                    width: '46px',
                    height: '42px',
                    clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                    background: goodMeta ? goodMeta.bgColor : 'rgba(255, 255, 255, 0.15)',
                    border: goodMeta ? '2px solid #d4af37' : '1px dashed rgba(255, 255, 255, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: goodMeta ? '0 4px 10px rgba(0,0,0,0.6)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                  title={goodMeta ? `${goodMeta.koreanName} 판매됨` : '빈 판매 슬롯'}
                >
                  {goodMeta ? (
                    <>
                      <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{goodMeta.icon}</span>
                    </>
                  ) : (
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                      빈 칸
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* 3. 우측 하단 두블론 주조 코인 더미 장식 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', paddingRight: '4px' }}>
            <span style={{ fontSize: '1.1rem' }}>🪙</span>
            <span style={{ fontSize: '0.72rem', color: '#facc15', fontWeight: 800 }}>
              상점 잔여: {4 - tradingHouse.length}칸
            </span>
          </div>

          {/* 4. 하단 판매 가격 표 (옥수수 0, 인디고 1, 설탕 2, 담배 3, 커피 4 팔각형 뱃지) */}
          <div style={{
            marginTop: '8px',
            background: 'rgba(0, 0, 0, 0.45)',
            borderRadius: '6px',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            padding: '6px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#e2e8f0', textAlign: 'center' }}>
              판매 가격 (기본 매입가)
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {PRICE_LIST.map(p => (
                <div
                  key={p.type}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1px'
                  }}
                  title={`${GOODS_DATA[p.type].koreanName}: ${p.price} 두블론`}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                    background: p.badgeColor,
                    color: p.textColor,
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                  }}>
                    {p.price}
                  </div>
                  <span style={{ fontSize: '0.55rem', color: '#cbd5e1' }}>
                    {GOODS_DATA[p.type].icon}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
