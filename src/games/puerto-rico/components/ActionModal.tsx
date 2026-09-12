import React, { useState } from 'react';
import { usePuertoRicoStore } from '../store/usePuertoRicoStore';
import { BUILDINGS_CATALOG, GOODS_DATA } from '../data/buildings';
import { calculateBuildingCost, calculateProduction, hasBuilding } from '../engine/gameLogic';
import type { GoodType, PlantationType } from '../types';
import { PuertoRicoAI } from '../engine/aiPlayer';
import { Sparkles, Check, Eye, Maximize2 } from 'lucide-react';
import { soundManager } from '../../../utils/sound';
import { showFeedback } from '../../../utils/feedback';

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

  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const player = players[currentTurnPlayerIndex];

  // AI 플레이어이거나 다른 온라인 플레이어의 턴이면 모달을 띄우지 않음
  const isMyAction = playMode !== 'online' || player?.id === myPlayerId;
  if (!player || player.isAI || !isMyAction || currentPhase === 'idle' || currentPhase === 'select_role' || currentPhase === 'game_over') {
    return null;
  }

  const roleCard = roleCards.find(rc => rc.role === currentRole);
  const hasPrivilege = roleCard?.selectedByPlayerId === player.id;

  const handleSettler = (type: PlantationType) => {
    soundManager.playWoodToken();
    showFeedback('+1 🌾 농경지 개척');
    executeSettler(type);
  };

  const handleMayor = (assignment: any) => {
    soundManager.playWoodToken();
    showFeedback('👷 일꾼 배치 완료');
    executeMayor(assignment);
  };

  const handleBuilder = (buildingId: string | null) => {
    if (buildingId) {
      soundManager.playBuild();
      setTimeout(() => soundManager.playCoin(), 120);
      showFeedback('🏠 건물 건설 완료!');
    }
    executeBuilder(buildingId);
  };

  const handleCraftsman = (bonusGood: GoodType | null) => {
    soundManager.playWoodToken();
    showFeedback('📦 상품 생산 완료');
    executeCraftsman(bonusGood || undefined);
  };

  const handleTrader = (goodType: GoodType | null) => {
    if (goodType) {
      soundManager.playCoin();
      showFeedback('+🪙 두블론 판매 수입');
    }
    executeTrader(goodType);
  };

  const handleCaptain = (shipIndex: number | null, goodType: GoodType | null) => {
    if (shipIndex !== null && goodType !== null) {
      soundManager.playShipCargo();
      showFeedback('+🏆 선적 완료 (승점 획득)');
    }
    executeCaptain(shipIndex, goodType);
  };

  const getPhaseTitle = () => {
    switch (currentPhase) {
      case 'settler_action': return '🌱 개척자: 농장 또는 채석장 선택';
      case 'mayor_assign': return '🏛️ 시장: 일꾼 배치 및 재조정';
      case 'builder_action': return '🏗️ 건축가: 식민지 건물 건설';
      case 'craftsman_bonus': return '⚙️ 감독관: 특권 보너스 상품 선택';
      case 'trader_action': return '⚖️ 상인: 상품 판매';
      case 'captain_action': return '⚓ 선장: 상품 선적';
      default: return '행동 수행';
    }
  };

  // 모달을 최소화했을 때: 화면 우측 하단 플로팅 바로 축소하여 실제 보드판을 마음껏 확인 가능
  if (isMinimized) {
    return (
      <div 
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 500,
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          border: '2px solid var(--amber-border-bright)',
          borderRadius: '14px',
          padding: '12px 18px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.8), 0 0 20px rgba(229, 169, 60, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          animation: 'bounceIn 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.6rem' }}>
            {currentPhase === 'builder_action' ? '🏗️' : '📜'}
          </span>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--gold-secondary)', fontWeight: 700 }}>
              {player.name}님의 행동 차례 (보드판 둘러보는 중)
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
              {getPhaseTitle()}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setIsMinimized(false)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#000',
              fontWeight: 800,
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(217, 119, 6, 0.4)'
            }}
          >
            <Maximize2 size={15} /> 액션 창 다시 펴기
          </button>
          {currentPhase === 'builder_action' && (
            <button 
              onClick={() => {
                setIsMinimized(false);
                handleBuilder(null);
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(51, 65, 85, 0.8)',
                color: '#cbd5e1',
                fontWeight: 700,
                fontSize: '0.82rem',
                border: '1px solid rgba(255,255,255,0.15)',
                cursor: 'pointer'
              }}
            >
              건설 패스
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 8, 15, 0.85)',
      backdropFilter: 'blur(8px)',
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
          maxWidth: currentPhase === 'builder_action' ? '920px' : '760px',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '24px 28px',
          background: 'linear-gradient(145deg, #182030 0%, #0d121d 100%)',
          border: '1.5px solid var(--amber-border-bright)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 30px rgba(229, 169, 60, 0.15)'
        }}
      >
        {/* 모달 헤더: 역할 이름, 보드판 둘러보기(최소화) 버튼, 특권 배지 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gold-secondary)', fontWeight: 600 }}>
              {player.name}님의 행동 차례
            </div>
            <h2 className="font-serif" style={{ fontSize: '1.35rem', color: '#f8fafc', margin: '4px 0 0 0' }}>
              {getPhaseTitle()}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* 현재 보드판 확인(최소화) 버튼 */}
            <button
              onClick={() => setIsMinimized(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '20px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid #38bdf8',
                color: '#7dd3fc',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="창을 잠시 내리고 메인 보드판을 확인합니다"
            >
              <Eye size={14} /> 보드판 확인하기 (창 내리기)
            </button>

            {hasPrivilege && (
              <span className="badge badge-gold" style={{ padding: '6px 12px' }}>
                ★ 역할 특권 보유
              </span>
            )}
          </div>
        </div>

        {/* 페이즈별 액션 본문 */}
        {currentPhase === 'settler_action' && (
          <SettlerActionView 
            market={plantationMarket} 
            quarrySupply={quarrySupply} 
            hasPrivilege={hasPrivilege} 
            hasConstHut={hasBuilding(player, 'construction_hut')}
            onSelect={handleSettler}
            onPass={passCurrentAction}
          />
        )}

        {currentPhase === 'mayor_assign' && (
          <MayorActionView 
            player={player}
            onComplete={handleMayor}
          />
        )}

        {currentPhase === 'builder_action' && (
          <BuilderActionView 
            player={player}
            players={players}
            hasPrivilege={hasPrivilege}
            onBuild={handleBuilder}
            onPass={() => handleBuilder(null)}
            onMinimize={() => setIsMinimized(true)}
          />
        )}

        {currentPhase === 'craftsman_bonus' && (
          <CraftsmanBonusView 
            player={player}
            onSelectBonus={handleCraftsman}
          />
        )}

        {currentPhase === 'trader_action' && (
          <TraderActionView 
            player={player}
            hasPrivilege={hasPrivilege}
            tradingHouse={tradingHouse}
            onTrade={handleTrader}
            onPass={() => handleTrader(null)}
          />
        )}

        {currentPhase === 'captain_action' && (
          <CaptainActionView 
            player={player}
            cargoShips={cargoShips}
            onShip={handleCaptain}
            onPass={() => handleCaptain(null, null)}
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

// 3. 건축가 액션 뷰 (내 상태 보드 & 단계별 필터 & 공급량 연동)
const BuilderActionView: React.FC<{
  player: any;
  players: any[];
  hasPrivilege: boolean;
  onBuild: (id: string) => void;
  onPass: () => void;
  onMinimize: () => void;
}> = ({ player, players, hasPrivilege, onBuild, onPass, onMinimize }) => {
  const [selectedTier, setSelectedTier] = useState<number>(0); // 0: 전체, 1~4: 단계별

  // 1. 내 상태 분석
  const activeQuarries = player.plantations.filter((p: any) => p.type === 'quarry' && p.hasColonist).length;
  const totalQuarries = player.plantations.filter((p: any) => p.type === 'quarry').length;
  const occupiedSlots = player.buildings.reduce((sum: number, b: any) => {
    const def = BUILDINGS_CATALOG.find(x => x.id === b.buildingId);
    return sum + (def?.category === 'large' ? 2 : 1);
  }, 0);

  // 농장별 보유량 및 일꾼 배치 상태
  const cropStats: Record<GoodType, { count: number; active: number }> = {
    corn: { count: 0, active: 0 },
    indigo: { count: 0, active: 0 },
    sugar: { count: 0, active: 0 },
    tobacco: { count: 0, active: 0 },
    coffee: { count: 0, active: 0 },
  };
  player.plantations.forEach((p: any) => {
    if (p.type !== 'quarry' && cropStats[p.type as GoodType]) {
      cropStats[p.type as GoodType].count += 1;
      if (p.hasColonist) cropStats[p.type as GoodType].active += 1;
    }
  });

  // 보유 건물 이름 및 일꾼 상태
  const ownedBuildingsMap = new Map<string, any>();
  player.buildings.forEach((b: any) => {
    ownedBuildingsMap.set(b.buildingId, b);
  });

  // 공급처 잔여 재고 계산 (일반 건물 2채, 대형 1채)
  const getRemainingStock = (b: any) => {
    const maxStock = b.category === 'large' ? 1 : 2;
    const builtCount = players.reduce((sum, p) => {
      return sum + (p.buildings.some((pb: any) => pb.buildingId === b.id) ? 1 : 0);
    }, 0);
    return Math.max(0, maxStock - builtCount);
  };

  // 필터링된 건물 목록
  const filteredBuildings = BUILDINGS_CATALOG.filter(b => {
    if (selectedTier === 0) return true;
    return b.quarryDiscountMax === selectedTier;
  });

  // 상대 플레이어 요약
  const opponents = players.filter(p => p.id !== player.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      {/* 1. 내 식민지 상태 보드 (My Status Board) */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1.5px solid #d97706',
        borderRadius: '10px',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxShadow: 'inset 0 0 15px rgba(217, 119, 6, 0.1)'
      }}>
        {/* 상태 상단 헤더 & 바로가기 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.1rem' }}>📋</span>
            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fde047' }}>
              현재 내 식민지 상태 보드 (My Status Board)
            </span>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              건물 구매 전 내 자원과 농장 현황을 반드시 확인하세요
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onMinimize}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(56, 189, 248, 0.2)',
                border: '1px solid #38bdf8',
                color: '#7dd3fc',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              👁️ 메인 보드판 직접 보기
            </button>
            <button
              onClick={onPass}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: '#475569',
                border: 'none',
                color: '#fff',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              건설 안 함 (Pass)
            </button>
          </div>
        </div>

        {/* 핵심 자원 지표 4분할 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {/* 두블론 */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>보유 두블론</div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f59e0b' }}>
              🪙 {player.doubloons} 두블론
            </div>
          </div>

          {/* 채석장 할인 */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>채석장 할인</div>
            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#cbd5e1' }}>
              ⛏️ {activeQuarries}개 활성 <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>(총 {totalQuarries}개)</span>
            </div>
          </div>

          {/* 건축가 특권 */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>건축가 특권</div>
            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: hasPrivilege ? '#38bdf8' : '#64748b' }}>
              {hasPrivilege ? '★ -1두블론 할인' : '특권 없음'}
            </div>
          </div>

          {/* 건물 부지 */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>건물 부지 여유</div>
            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: occupiedSlots >= 12 ? '#ef4444' : '#4ade80' }}>
              🏛️ {occupiedSlots} / 12 칸 <span style={{ fontSize: '0.72rem' }}>({12 - occupiedSlots}칸 남음)</span>
            </div>
          </div>
        </div>

        {/* 내 보유 농장 및 보유 건물 한눈에 보기 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.78rem' }}>
          {/* 좌측: 보유 농장 */}
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '6px' }}>
            <div style={{ fontWeight: 700, color: '#a7f3d0', marginBottom: '4px' }}>
              🌱 내 농장 현황 (생산 건물 결정 참고):
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {(Object.keys(cropStats) as GoodType[]).map(gt => {
                const stat = cropStats[gt];
                const meta = GOODS_DATA[gt];
                return (
                  <span 
                    key={gt} 
                    style={{ 
                      padding: '2px 7px', 
                      borderRadius: '4px', 
                      background: stat.count > 0 ? meta.bgColor : 'rgba(255,255,255,0.05)',
                      color: stat.count > 0 ? '#fff' : '#64748b',
                      border: stat.count > 0 ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                      fontWeight: stat.count > 0 ? 700 : 400
                    }}
                  >
                    {meta.icon} {meta.koreanName} {stat.count}개 (일꾼 {stat.active})
                  </span>
                );
              })}
            </div>
          </div>

          {/* 우측: 이미 지은 건물 목록 */}
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '6px' }}>
            <div style={{ fontWeight: 700, color: '#fde68a', marginBottom: '4px' }}>
              🏛️ 이미 건설한 건물 ({player.buildings.length}채):
            </div>
            {player.buildings.length === 0 ? (
              <span style={{ color: '#94a3b8' }}>아직 건설된 건물이 없습니다.</span>
            ) : (
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {player.buildings.map((pb: any) => {
                  const def = BUILDINGS_CATALOG.find(x => x.id === pb.buildingId);
                  return (
                    <span 
                      key={pb.buildingId}
                      style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'rgba(234, 179, 8, 0.15)',
                        border: '1px solid #ca8a04',
                        color: '#fef08a',
                        fontSize: '0.72rem'
                      }}
                    >
                      {def?.koreanName} ({pb.colonists}/{def?.maxColonists})
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 상대방 상태 짤막 브리핑 */}
        {opponents.length > 0 && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.72rem', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
            <span style={{ fontWeight: 700 }}>👥 상대방 현황:</span>
            {opponents.map(opp => (
              <span key={opp.id} style={{ color: '#cbd5e1' }}>
                <b style={{ color: opp.color }}>{opp.name}</b>: 🪙 {opp.doubloons}두블론 | 건물 {opp.buildings.length}채 | VP칩 {opp.victoryPoints}점
              </span>
            ))}
          </div>
        )}

      </div>

      {/* 2. 단계별 탭 필터 (1단계, 2단계, 3단계, 4단계) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 0, label: '전체 (24종)' },
            { id: 1, label: '1단계 (1채석장 할인)' },
            { id: 2, label: '2단계 (2채석장 할인)' },
            { id: 3, label: '3단계 (3채석장 할인)' },
            { id: 4, label: '4단계 대형 고급' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTier(tab.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: selectedTier === tab.id ? '1.5px solid var(--gold-secondary)' : '1px solid rgba(255,255,255,0.12)',
                background: selectedTier === tab.id ? 'rgba(217, 119, 6, 0.3)' : 'rgba(30, 41, 59, 0.6)',
                color: selectedTier === tab.id ? '#fde047' : '#cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>
          {filteredBuildings.length}개 건물 표시 중
        </div>
      </div>

      {/* 3. 건물 목록 카드 그리드 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
        gap: '10px', 
        maxHeight: '440px', 
        overflowY: 'auto', 
        paddingRight: '4px' 
      }}>
        {filteredBuildings.map(b => {
          const isOwned = ownedBuildingsMap.has(b.id);
          const finalCost = calculateBuildingCost(b, player, hasPrivilege);
          const stock = getRemainingStock(b);
          const isStockOut = stock <= 0;
          const slotsNeeded = b.category === 'large' ? 2 : 1;
          const hasSlot = (12 - occupiedSlots) >= slotsNeeded;
          const canAfford = player.doubloons >= finalCost;
          const canBuild = !isOwned && !isStockOut && hasSlot && canAfford;

          // 채석장 할인 적용액 계산
          const actualQuarryDiscount = Math.min(b.quarryDiscountMax, activeQuarries);
          const privilegeDiscount = hasPrivilege ? 1 : 0;
          const totalDiscount = actualQuarryDiscount + privilegeDiscount;

          return (
            <div
              key={b.id}
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                background: isOwned 
                  ? 'rgba(30, 41, 59, 0.35)' 
                  : canBuild 
                    ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)' 
                    : 'rgba(15, 23, 42, 0.65)',
                border: canBuild 
                  ? '1.5px solid var(--gold-secondary)' 
                  : isOwned 
                    ? '1px solid rgba(255,255,255,0.08)' 
                    : '1px solid rgba(255,255,255,0.1)',
                opacity: isOwned ? 0.6 : isStockOut ? 0.45 : 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: canBuild ? '0 4px 12px rgba(217, 119, 6, 0.2)' : 'none'
              }}
            >
              {/* 상단: 이름 & 점수 & 카테고리 태그 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ 
                      fontWeight: 800, 
                      fontSize: '0.92rem', 
                      color: b.category === 'large' ? '#fde047' : '#f8fafc' 
                    }}>
                      {b.koreanName}
                    </span>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{b.name}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ 
                      fontSize: '0.72rem', 
                      padding: '1px 6px', 
                      borderRadius: '4px',
                      background: 'rgba(234, 179, 8, 0.2)',
                      color: '#facc15',
                      fontWeight: 800 
                    }}>
                      🏆 {b.vp} VP
                    </span>
                    {b.maxColonists > 0 && (
                      <span style={{ 
                        fontSize: '0.72rem', 
                        padding: '1px 6px', 
                        borderRadius: '4px',
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: '#38bdf8',
                        fontWeight: 700 
                      }}>
                        👤 {b.maxColonists}
                      </span>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: '0.73rem', color: '#cbd5e1', margin: '8px 0 4px 0', lineHeight: 1.35 }}>
                  {b.desc}
                </p>
              </div>

              {/* 하단: 비용 계산 및 구매/상태 버튼 */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    원가 {b.cost}원 {totalDiscount > 0 && <span style={{ color: '#38bdf8' }}>(할인 -{totalDiscount}원)</span>}
                    <span style={{ marginLeft: '6px', color: stock === 1 ? '#f59e0b' : '#94a3b8' }}>
                      [재고 {stock}채]
                    </span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.98rem', color: canAfford ? 'var(--gold-secondary)' : '#ef4444' }}>
                    🪙 {finalCost} 두블론
                  </div>
                </div>

                {/* 구매 버튼 또는 상태 배지 */}
                {isOwned ? (
                  <div style={{ textAlign: 'center', padding: '5px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '0.76rem', fontWeight: 700 }}>
                    ✓ 이미 보유 중
                  </div>
                ) : isStockOut ? (
                  <div style={{ textAlign: 'center', padding: '5px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', fontSize: '0.76rem', fontWeight: 700 }}>
                    공급처 품절
                  </div>
                ) : !hasSlot ? (
                  <div style={{ textAlign: 'center', padding: '5px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', fontSize: '0.76rem', fontWeight: 700 }}>
                    건물 부지 부족 (12칸 제한)
                  </div>
                ) : !canAfford ? (
                  <div style={{ textAlign: 'center', padding: '5px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', fontSize: '0.76rem', fontWeight: 700 }}>
                    두블론 부족 ({finalCost - player.doubloons}원 부족)
                  </div>
                ) : (
                  <button
                    onClick={() => onBuild(b.id)}
                    style={{
                      width: '100%',
                      padding: '6px',
                      borderRadius: '6px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: '#000',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 6px rgba(217, 119, 6, 0.4)'
                    }}
                  >
                    🔨 건설하기 ({finalCost}두블론 지불)
                  </button>
                )}
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
