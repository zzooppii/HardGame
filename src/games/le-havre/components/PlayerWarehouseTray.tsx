import React from 'react';
import { useLeHavreStore } from '../store/useLeHavreStore';
import { GOODS_DEFINITIONS } from '../data/goods';
import type { ResourceType } from '../types';
import { calculateAvailableFood, calculateAvailableFuel } from '../engine/gameLogic';
import { Coins, AlertTriangle, Utensils, Flame, Ship, Building, ShieldCheck } from 'lucide-react';

export const PlayerWarehouseTray: React.FC = () => {
  const { 
    players, 
    ships, 
    buildings, 
    repayLoanAction
  } = useLeHavreStore();

  const myPlayer = players.find(p => !p.isAI) || players[0];
  if (!myPlayer) return null;

  const totalFood = calculateAvailableFood(myPlayer);
  const totalFuel = calculateAvailableFuel(myPlayer);

  // 내 소유 선박들
  const myShips = ships.filter(s => s.ownerId === myPlayer.id);
  const shipShieldTotal = myShips.reduce((sum, s) => sum + s.foodProvided, 0);

  // 내 소유 건물들
  const myBuildings = buildings.filter(b => b.ownerId === myPlayer.id);

  // 원자재 8종 & 가공품 8종 목록
  const rawList: ResourceType[] = ['fish', 'wood', 'clay', 'iron', 'grain', 'cattle', 'hide', 'coal'];
  const procList: ResourceType[] = ['smoked_fish', 'charcoal', 'brick', 'steel', 'bread', 'meat', 'leather', 'coke'];

  return (
    <div className="saboteur-board-panel" style={{
      padding: '12px 14px',
      background: 'linear-gradient(180deg, rgba(13, 20, 31, 0.95) 0%, rgba(8, 12, 20, 0.95) 100%)',
      border: '1.5px solid rgba(229, 169, 60, 0.35)',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      boxSizing: 'border-box'
    }}>
      
      {/* 1. 상단: 내 자산 대시보드 (현금, 대출, 식량, 연료, 선박 보호) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '8px',
        background: 'rgba(0, 0, 0, 0.35)',
        padding: '8px 10px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        {/* 프랑 (현금) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: 'rgba(250, 204, 21, 0.15)', padding: '6px', borderRadius: '6px' }}>
            <Coins size={16} color="#facc15" />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>보유 현금</div>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#facc15' }}>
              {myPlayer.francs} <span style={{ fontSize: '0.7rem' }}>프랑</span>
            </div>
          </div>
        </div>

        {/* 대출 증서 (Loan) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ background: myPlayer.loans > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '6px' }}>
              <AlertTriangle size={16} color={myPlayer.loans > 0 ? '#ef4444' : '#64748b'} />
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>대출 부채</div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: myPlayer.loans > 0 ? '#f87171' : '#cbd5e1' }}>
                {myPlayer.loans} <span style={{ fontSize: '0.7rem' }}>건</span>
              </div>
            </div>
          </div>

          {myPlayer.loans > 0 && (
            <button
              onClick={() => repayLoanAction()}
              disabled={myPlayer.francs < 5}
              style={{
                padding: '3px 6px',
                fontSize: '0.65rem',
                fontWeight: 700,
                borderRadius: '4px',
                background: myPlayer.francs >= 5 ? '#ef4444' : 'rgba(255,255,255,0.08)',
                color: '#fff',
                border: 'none',
                cursor: myPlayer.francs >= 5 ? 'pointer' : 'default',
                opacity: myPlayer.francs >= 5 ? 1 : 0.5
              }}
              title="5프랑으로 대출 1건 상환"
            >
              상환(5F)
            </button>
          )}
        </div>

        {/* 보유 식량 환산치 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '6px', borderRadius: '6px' }}>
            <Utensils size={16} color="#38bdf8" />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>환산 식량</div>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#38bdf8' }}>
              {totalFood} <span style={{ fontSize: '0.7rem' }}>식량</span>
            </div>
          </div>
        </div>

        {/* 보유 연료 환산치 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: 'rgba(249, 115, 22, 0.15)', padding: '6px', borderRadius: '6px' }}>
            <Flame size={16} color="#f97316" />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>환산 연료</div>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#f97316' }}>
              {totalFuel} <span style={{ fontSize: '0.7rem' }}>에너지</span>
            </div>
          </div>
        </div>

        {/* 선박 식량 보호막 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: 'rgba(74, 222, 128, 0.15)', padding: '6px', borderRadius: '6px' }}>
            <ShieldCheck size={16} color="#4ade80" />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>선박 식량 지원</div>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#4ade80' }}>
              -{shipShieldTotal} <span style={{ fontSize: '0.7rem' }}>식량</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 중단: 원자재 & 가공품 창고 (2단 수량 칩 그리드) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#e2e8f0' }}>
            📦 내 선창 창고 (Warehouse Inventory)
          </span>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
            원자재 ➔ 공장에서 가공품으로 변환
          </span>
        </div>

        {/* 원자재 8종 행 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px', marginBottom: '6px' }}>
          {rawList.map((res) => {
            const def = GOODS_DEFINITIONS[res];
            const count = myPlayer.inventory[res] || 0;
            return (
              <div
                key={res}
                style={{
                  background: count > 0 ? 'rgba(30, 41, 59, 0.7)' : 'rgba(15, 23, 42, 0.3)',
                  border: count > 0 ? `1px solid ${def.color}` : '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '6px',
                  padding: '4px 6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem'
                }}
                title={`${def.name} (원자재)`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span>{def.icon}</span>
                  <span style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>{def.name}</span>
                </div>
                <span style={{ fontWeight: 800, color: count > 0 ? '#f8fafc' : '#64748b' }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* 가공품 8종 행 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px' }}>
          {procList.map((res) => {
            const def = GOODS_DEFINITIONS[res];
            const count = myPlayer.inventory[res] || 0;
            return (
              <div
                key={res}
                style={{
                  background: count > 0 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.3)',
                  border: count > 0 ? `1px solid ${def.color}` : '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '6px',
                  padding: '4px 6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem'
                }}
                title={`${def.name} (고급 가공품)`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span>{def.icon}</span>
                  <span style={{ fontSize: '0.68rem', color: '#7dd3fc', fontWeight: 700 }}>{def.name}</span>
                </div>
                <span style={{ fontWeight: 800, color: count > 0 ? '#38bdf8' : '#64748b' }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 하단: 보유 선박 & 보유 건물 요약 칩 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingTop: '6px',
        fontSize: '0.75rem',
        color: '#cbd5e1'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Ship size={14} color="#38bdf8" />
            <span>보유 선박: <strong>{myShips.length}척</strong> ({myShips.map(s => s.name).join(', ') || '없음'})</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Building size={14} color="#facc15" />
            <span>보유 건물: <strong>{myBuildings.length}채</strong> ({myBuildings.map(b => b.name).join(', ') || '없음'})</span>
          </div>
        </div>

        <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>
          💡 건물/선박의 가치는 최종 승점으로 직결됩니다
        </span>
      </div>

    </div>
  );
};
