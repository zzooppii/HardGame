import React, { useState } from 'react';
import { usePuertoRicoStore } from '../store/usePuertoRicoStore';
import { BUILDINGS_CATALOG, GOODS_DATA } from '../data/buildings';
import { calculateBuildingCost, calculateProduction, hasBuilding } from '../engine/gameLogic';
import type { GoodType, PlantationType } from '../types';
import { PuertoRicoAI } from '../engine/aiPlayer';
import { Sparkles, Check } from 'lucide-react';

export const ActionModal: React.FC = () => {
  const { 
    currentPhase, 
    currentTurnPlayerIndex, 
    players, 
    roleCards, 
    currentRole,
    plantationMarket,
    quarrySupply,
    executeSettler,
    executeMayor,
    executeBuilder,
    executeCraftsman,
    executeTrader,
    executeCaptain,
    passCurrentAction,
    cargoShips,
    tradingHouse,
    playMode,
    myPlayerId
  } = usePuertoRicoStore();

  const player = players[currentTurnPlayerIndex];

  // AI 플레이어이거나 다른 온라인 플레이어의 턴이면 모달을 띄우지 않음
  const isMyAction = playMode !== 'online' || player?.id === myPlayerId;
  if (!player || player.isAI || !isMyAction || currentPhase === 'idle' || currentPhase === 'select_role' || currentPhase === 'game_over') {
    return null;
  }

  const roleCard = roleCards.find(rc => rc.role === currentRole);
  const hasPrivilege = roleCard?.selectedByPlayerId === player.id;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 8, 15, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div 
        className="glass-panel" 
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          background: 'linear-gradient(145deg, #1a2233 0%, #0f1624 100%)',
          border: '1.5px solid var(--amber-border-bright)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 30px rgba(229, 169, 60, 0.2)'
        }}
      >
        {/* 모달 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '14px', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gold-secondary)', fontWeight: 600 }}>
              {player.name}님의 행동 차례
            </div>
            <h2 className="font-serif" style={{ fontSize: '1.4rem', color: '#f8fafc', margin: '4px 0 0 0' }}>
              {currentPhase === 'settler_action' && '🌱 개척자: 농장 또는 채석장 선택'}
              {currentPhase === 'mayor_assign' && '🏛️ 시장: 일꾼 배치 및 재조정'}
              {currentPhase === 'builder_action' && '🏗️ 건축가: 식민지 건물 건설'}
              {currentPhase === 'craftsman_bonus' && '⚙️ 감독관: 특권 보너스 상품 선택'}
              {currentPhase === 'trader_action' && '⚖️ 상인: 상품 판매'}
              {currentPhase === 'captain_action' && '⚓ 선장: 상품 선적'}
            </h2>
          </div>

          {hasPrivilege && (
            <span className="badge badge-gold" style={{ padding: '6px 12px' }}>
              ★ 역할 특권 보유
            </span>
          )}
        </div>

        {/* 페이즈별 액션 본문 */}
        {currentPhase === 'settler_action' && (
          <SettlerActionView 
            market={plantationMarket} 
            quarrySupply={quarrySupply} 
            hasPrivilege={hasPrivilege} 
            hasConstHut={hasBuilding(player, 'construction_hut')}
            onSelect={executeSettler}
            onPass={passCurrentAction}
          />
        )}

        {currentPhase === 'mayor_assign' && (
          <MayorActionView 
            player={player}
            onComplete={executeMayor}
          />
        )}

        {currentPhase === 'builder_action' && (
          <BuilderActionView 
            player={player}
            hasPrivilege={hasPrivilege}
            onBuild={executeBuilder}
            onPass={() => executeBuilder(null)}
          />
        )}

        {currentPhase === 'craftsman_bonus' && (
          <CraftsmanBonusView 
            player={player}
            onSelectBonus={executeCraftsman}
          />
        )}

        {currentPhase === 'trader_action' && (
          <TraderActionView 
            player={player}
            hasPrivilege={hasPrivilege}
            tradingHouse={tradingHouse}
            onTrade={executeTrader}
            onPass={() => executeTrader(null)}
          />
        )}

        {currentPhase === 'captain_action' && (
          <CaptainActionView 
            player={player}
            cargoShips={cargoShips}
            onShip={executeCaptain}
            onPass={() => executeCaptain(null, null)}
          />
        )}

      </div>
    </div>
  );
};

// 1. 개척자 액션 뷰
const SettlerActionView: React.FC<{
  market: PlantationType[];
  quarrySupply: number;
  hasPrivilege: boolean;
  hasConstHut: boolean;
  onSelect: (type: PlantationType) => void;
  onPass: () => void;
}> = ({ market, quarrySupply, hasPrivilege, hasConstHut, onSelect, onPass }) => {
  const canTakeQuarry = (hasPrivilege || hasConstHut) && quarrySupply > 0;

  return (
    <div>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        자신의 영지에 배치할 농장 타일을 1개 선택하세요.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {market.map((pType, idx) => {
          const good = GOODS_DATA[pType as GoodType];
          if (!good) return null;
          return (
            <button
              key={idx}
              onClick={() => onSelect(pType)}
              style={{
                padding: '16px 12px',
                borderRadius: '8px',
                background: good.bgColor,
                border: '1.5px solid rgba(255,255,255,0.2)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{ fontSize: '2rem' }}>{good.icon}</span>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{good.koreanName} 농장</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>기본 판매가: {good.basePrice}두블론</span>
            </button>
          );
        })}

        {/* 채석장 선택 (특권 또는 건설소 있을 때) */}
        {canTakeQuarry && (
          <button
            onClick={() => onSelect('quarry')}
            style={{
              padding: '16px 12px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)',
              border: '2px solid var(--gold-secondary)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(229, 169, 60, 0.3)'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={{ fontSize: '2rem' }}>⛏️</span>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--gold-secondary)' }}>
              채석장 (Quarry)
            </span>
            <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>
              건물 건설 비용 -1두블론 할인
            </span>
          </button>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-secondary" onClick={onPass}>
          패스 (타일 가져오지 않음)
        </button>
      </div>
    </div>
  );
};

// 2. 시장 액션 뷰 (일꾼 배치)
const MayorActionView: React.FC<{
  player: any;
  onComplete: (assignment: any) => void;
}> = ({ player, onComplete }) => {
  // 현재 일꾼 상태 복사
  const [plantations, setPlantations] = useState(
    player.plantations.map((p: any) => ({ id: p.id, type: p.type, hasColonist: p.hasColonist }))
  );
  const [buildings, setBuildings] = useState(
    player.buildings.map((b: any) => ({ buildingId: b.buildingId, colonists: b.colonists }))
  );
  const [unassigned, setUnassigned] = useState(player.unassignedColonists);

  const togglePlantation = (id: string) => {
    const target = plantations.find((p: any) => p.id === id);
    if (!target) return;

    if (target.hasColonist) {
      setPlantations(plantations.map((p: any) => p.id === id ? { ...p, hasColonist: false } : p));
      setUnassigned(unassigned + 1);
    } else if (unassigned > 0) {
      setPlantations(plantations.map((p: any) => p.id === id ? { ...p, hasColonist: true } : p));
      setUnassigned(unassigned - 1);
    }
  };

  const adjustBuildingColonist = (buildingId: string, delta: number) => {
    const target = buildings.find((b: any) => b.buildingId === buildingId);
    if (!target) return;
    const def = BUILDINGS_CATALOG.find(x => x.id === buildingId);
    const max = def?.maxColonists || 1;

    if (delta > 0 && unassigned > 0 && target.colonists < max) {
      setBuildings(buildings.map((b: any) => b.buildingId === buildingId ? { ...b, colonists: b.colonists + 1 } : b));
      setUnassigned(unassigned - 1);
    } else if (delta < 0 && target.colonists > 0) {
      setBuildings(buildings.map((b: any) => b.buildingId === buildingId ? { ...b, colonists: b.colonists - 1 } : b));
      setUnassigned(unassigned + 1);
    }
  };

  const handleAutoAssign = () => {
    const optimal = PuertoRicoAI.autoAssignColonists(player);
    setPlantations(player.plantations.map((p: any) => {
      const found = optimal.plantations.find(a => a.id === p.id);
      return { id: p.id, type: p.type, hasColonist: found ? found.hasColonist : false };
    }));
    setBuildings(player.buildings.map((b: any) => {
      const found = optimal.buildings.find(a => a.buildingId === b.buildingId);
      return { buildingId: b.buildingId, colonists: found ? found.colonists : 0 };
    }));
    setUnassigned(optimal.unassigned);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '8px' }}>
        <div>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>현재 대기 중인 일꾼: </span>
          <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gold-secondary)' }}>
            👤 {unassigned}명
          </span>
        </div>
        <button 
          onClick={handleAutoAssign}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: '#fff',
            border: 'none',
            padding: '8px 14px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          <Sparkles size={16} /> 최적 자동 배치
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        {/* 농장 일꾼 배치 */}
        <div>
          <h4 style={{ fontSize: '0.9rem', color: '#86efac', marginBottom: '8px' }}>🌴 농장 / 채석장 (클릭 시 토글)</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {plantations.map((p: any) => {
              const isQ = p.type === 'quarry';
              const name = isQ ? '채석장' : GOODS_DATA[p.type as GoodType]?.koreanName;
              return (
                <div 
                  key={p.id}
                  onClick={() => togglePlantation(p.id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: p.hasColonist ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.05)',
                    border: p.hasColonist ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {isQ ? '⛏️' : GOODS_DATA[p.type as GoodType]?.icon} {name}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: p.hasColonist ? '#4ade80' : '#94a3b8' }}>
                    {p.hasColonist ? '👤 배치됨' : '비어있음 (클릭)'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 건물 일꾼 배치 */}
        <div>
          <h4 style={{ fontSize: '0.9rem', color: '#fcd34d', marginBottom: '8px' }}>🏛️ 건물 (+ / - 조절)</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {buildings.map((b: any) => {
              const def = BUILDINGS_CATALOG.find(x => x.id === b.buildingId);
              return (
                <div 
                  key={b.buildingId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: b.colonists > 0 ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255,255,255,0.05)',
                    border: b.colonists > 0 ? '1px solid #eab308' : '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{def?.koreanName}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      onClick={() => adjustBuildingColonist(b.buildingId, -1)}
                      disabled={b.colonists <= 0}
                      style={{ padding: '2px 8px', borderRadius: '4px', background: '#334155', border: 'none', color: '#fff', cursor: 'pointer' }}
                    >
                      -
                    </button>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                      {b.colonists} / {def?.maxColonists}
                    </span>
                    <button 
                      onClick={() => adjustBuildingColonist(b.buildingId, 1)}
                      disabled={unassigned <= 0 || b.colonists >= (def?.maxColonists || 1)}
                      style={{ padding: '2px 8px', borderRadius: '4px', background: '#334155', border: 'none', color: '#fff', cursor: 'pointer' }}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button 
          className="btn-gold" 
          onClick={() => onComplete({ plantations, buildings, unassigned })}
        >
          <Check size={18} /> 배치 완료 확인
        </button>
      </div>
    </div>
  );
};

// 3. 건축가 액션 뷰
const BuilderActionView: React.FC<{
  player: any;
  hasPrivilege: boolean;
  onBuild: (id: string) => void;
  onPass: () => void;
}> = ({ player, hasPrivilege, onBuild, onPass }) => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
          보유 두블론: <strong style={{ color: 'var(--gold-secondary)' }}>{player.doubloons}두블론</strong>
          {hasPrivilege && <span style={{ marginLeft: '8px', color: '#38bdf8' }}>(건축가 특권: -1두블론 할인 적용됨)</span>}
        </p>
        <button className="btn-secondary" onClick={onPass}>
          건설 안 함 (Pass)
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
        {BUILDINGS_CATALOG.map(b => {
          const isOwned = player.buildings.some((pb: any) => pb.buildingId === b.id);
          const finalCost = calculateBuildingCost(b, player, hasPrivilege);
          const canAfford = player.doubloons >= finalCost && !isOwned && player.buildings.length < 12;

          return (
            <div
              key={b.id}
              onClick={() => canAfford && onBuild(b.id)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                background: isOwned 
                  ? 'rgba(30, 41, 59, 0.4)' 
                  : canAfford 
                    ? 'rgba(30, 41, 59, 0.9)' 
                    : 'rgba(15, 23, 42, 0.6)',
                border: canAfford ? '1.5px solid var(--gold-secondary)' : '1px solid rgba(255,255,255,0.08)',
                cursor: canAfford ? 'pointer' : 'default',
                opacity: isOwned || !canAfford ? 0.5 : 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                if (canAfford) e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                if (canAfford) e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>
                    {b.koreanName}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#fcd34d', fontWeight: 600 }}>
                    {b.vp} VP
                  </span>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '6px 0' }}>
                  {b.desc}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px', marginTop: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  원가: {b.cost}원
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: canAfford ? 'var(--gold-secondary)' : '#ef4444' }}>
                  {isOwned ? '보유 중' : `${finalCost} 두블론`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 4. 감독관 보너스 뷰
const CraftsmanBonusView: React.FC<{
  player: any;
  onSelectBonus: (good: GoodType) => void;
}> = ({ player, onSelectBonus }) => {
  const prod = calculateProduction(player);
  const producedGoods = (['coffee', 'tobacco', 'sugar', 'indigo', 'corn'] as GoodType[])
    .filter(g => prod[g] > 0);

  return (
    <div>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        감독관 특권: 이번에 생산한 작물 중 <strong>1개를 보너스로 추가 획득</strong>할 수 있습니다.
      </p>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        {producedGoods.map(g => (
          <button
            key={g}
            className="btn-gold"
            onClick={() => onSelectBonus(g)}
            style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}
          >
            <span style={{ fontSize: '1.5rem' }}>{GOODS_DATA[g].icon}</span>
            <span>{GOODS_DATA[g].koreanName} +1개 받기</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// 5. 상인 액션 뷰
const TraderActionView: React.FC<{
  player: any;
  hasPrivilege: boolean;
  tradingHouse: GoodType[];
  onTrade: (good: GoodType) => void;
  onPass: () => void;
}> = ({ player, hasPrivilege, tradingHouse, onTrade, onPass }) => {
  const officeActive = hasBuilding(player, 'office');
  const availableGoods = (Object.keys(player.goods) as GoodType[]).filter(g => player.goods[g] > 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
          상점(Trading House)에 판매할 상품을 선택하세요. (상점에 중복 판매 불가, 사무소 보유 시 예외)
        </p>
        <button className="btn-secondary" onClick={onPass}>
          판매 안 함 (Pass)
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        {availableGoods.map(g => {
          const alreadyInShop = tradingHouse.includes(g);
          const canSell = !alreadyInShop || officeActive;
          let sellPrice = GOODS_DATA[g].basePrice;
          if (hasPrivilege) sellPrice += 1;
          if (hasBuilding(player, 'small_market')) sellPrice += 1;
          if (hasBuilding(player, 'large_market')) sellPrice += 2;

          return (
            <button
              key={g}
              disabled={!canSell}
              onClick={() => onTrade(g)}
              style={{
                padding: '16px',
                borderRadius: '8px',
                background: GOODS_DATA[g].bgColor,
                border: canSell ? '1.5px solid var(--gold-secondary)' : '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                cursor: canSell ? 'pointer' : 'not-allowed',
                opacity: canSell ? 1 : 0.4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '2rem' }}>{GOODS_DATA[g].icon}</span>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{GOODS_DATA[g].koreanName}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--gold-secondary)', fontWeight: 700 }}>
                판매가: {sellPrice} 두블론
              </span>
              {alreadyInShop && !officeActive && (
                <span style={{ fontSize: '0.68rem', color: '#f87171' }}>상점에 이미 존재</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// 6. 선장 액션 뷰
const CaptainActionView: React.FC<{
  player: any;
  cargoShips: any[];
  onShip: (shipIdx: number, good: GoodType) => void;
  onPass: () => void;
}> = ({ player, cargoShips, onShip, onPass }) => {
  const ownedGoods = (Object.keys(player.goods) as GoodType[]).filter(g => player.goods[g] > 0);

  // 선적 가능한 조합 찾기
  const validOptions: { shipIdx: number; good: GoodType; amount: number }[] = [];

  ownedGoods.forEach(good => {
    cargoShips.forEach((ship, sIdx) => {
      const remaining = ship.capacity - ship.loaded;
      const canShip = 
        (ship.goodType === good && remaining > 0) ||
        (ship.goodType === null && remaining > 0 && !cargoShips.some(s => s.goodType === good));

      if (canShip) {
        validOptions.push({
          shipIdx: sIdx,
          good,
          amount: Math.min(player.goods[good], remaining)
        });
      }
    });
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
          화물선에 선적할 상품과 배를 선택하세요. (1개 선적당 1 VP)
        </p>
        <button className="btn-secondary" onClick={onPass}>
          선적 패스
        </button>
      </div>

      {validOptions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
          현재 화물선 규격에 맞춰 선적할 수 있는 상품이 없습니다.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {validOptions.map((opt, idx) => {
            const ship = cargoShips[opt.shipIdx];
            const good = GOODS_DATA[opt.good];

            return (
              <button
                key={idx}
                onClick={() => onShip(opt.shipIdx, opt.good)}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1.5px solid #38bdf8',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '1.4rem' }}>{good.icon}</span>
                  <span style={{ fontWeight: 700 }}>{good.koreanName}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  화물선 #{opt.shipIdx + 1} ({ship.capacity}칸 배)
                </div>
                <div style={{ 
                  background: 'rgba(56, 189, 248, 0.2)', 
                  color: '#38bdf8', 
                  padding: '4px 10px', 
                  borderRadius: '12px', 
                  fontSize: '0.75rem', 
                  fontWeight: 700 
                }}>
                  +{opt.amount}개 선적 (+{opt.amount} VP)
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
