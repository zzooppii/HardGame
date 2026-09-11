import React, { useState } from 'react';
import { useLeHavreStore } from '../store/useLeHavreStore';
import type { ResourceType } from '../types';
import { GOODS_DEFINITIONS } from '../data/goods';
import { X, Play } from 'lucide-react';
import { soundManager } from '../../../utils/sound';

export const BuildingActionModal: React.FC = () => {
  const { 
    selectedBuildingForDetail, 
    selectBuildingForDetail,
    enterBuildingAction,
    buildings,
    ships,
    players,
    currentTurnPlayerIndex,
    isGameOver
  } = useLeHavreStore();

  const [selectedTargetBuildingId, setSelectedTargetBuildingId] = useState<string>('');
  const [selectedTargetShipId, setSelectedTargetShipId] = useState<string>('');

  if (!selectedBuildingForDetail) return null;

  const b = selectedBuildingForDetail;
  const currPlayer = players[currentTurnPlayerIndex];
  const isMyTurn = currPlayer && !currPlayer.isAI && !isGameOver;

  const isBuilder = b.actionType === 'build_firm' || b.actionType === 'construction';
  const isShipyard = b.actionType === 'wharf';

  // 건설 가능한 타운 미소유 건물 목록
  const buildableTownBuildings = buildings.filter(item => item.ownerId === 'town');
  // 건조 가능한 미소유 선박 목록
  const buildableShips = ships.filter(item => item.ownerId === null);

  const handleExecute = () => {
    soundManager.playClick();
    const actionDetail: any = {};
    if (isBuilder) {
      actionDetail.targetBuildingToBuildId = selectedTargetBuildingId;
    }
    if (isShipyard) {
      actionDetail.targetShipToBuildId = selectedTargetShipId;
    }

    const success = enterBuildingAction(b.id, actionDetail);
    if (success) {
      selectBuildingForDetail(null);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 8, 15, 0.85)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '16px'
    }}>
      <div 
        className="glass-panel" 
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'linear-gradient(145deg, #131c2b 0%, #090f18 100%)',
          border: '1.5px solid rgba(212, 175, 55, 0.4)',
          borderRadius: '14px',
          padding: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.9)',
          position: 'relative'
        }}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={() => selectBuildingForDetail(null)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* 상단 건물 타이틀 */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--gold-secondary)', fontWeight: 700 }}>
            {b.nameEn}
          </div>
          <h3 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: '2px 0' }}>
            {b.name}
          </h3>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
            입장료: {b.entryCost.food > 0 ? `음식 ${b.entryCost.food}개` : (b.entryCost.franc > 0 ? `${b.entryCost.franc}프랑` : '무료')} | 
            승점 가치: <strong style={{ color: '#facc15' }}>{b.value} VP</strong>
          </div>
        </div>

        {/* 건물 기능 설명 박스 */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px',
          padding: '12px 14px',
          fontSize: '0.85rem',
          color: '#e2e8f0',
          lineHeight: 1.45,
          marginBottom: '18px'
        }}>
          {b.description}
        </div>

        {/* 특수 건물 분기: 시공사일 때 건설할 건물 선택 */}
        {isBuilder && (
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gold-secondary)', fontWeight: 700, marginBottom: '6px' }}>
              🏗️ 건설할 신규 건물 선택:
            </label>
            <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {buildableTownBuildings.map((tb) => {
                const isSelected = selectedTargetBuildingId === tb.id;
                const costText = Object.entries(tb.buildCost)
                  .map(([res, cnt]) => `${GOODS_DEFINITIONS[res as ResourceType]?.name} ${cnt}개`)
                  .join(', ') || '무료';

                return (
                  <div
                    key={tb.id}
                    onClick={() => setSelectedTargetBuildingId(tb.id)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: isSelected ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255,255,255,0.04)',
                      border: isSelected ? '1px solid #facc15' : '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      fontSize: '0.78rem'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 800, color: '#f8fafc' }}>{tb.name}</span>
                      <span style={{ color: '#94a3b8', marginLeft: '6px' }}>(가치: {tb.value}VP)</span>
                    </div>
                    <span style={{ color: '#fb923c' }}>비용: {costText}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 특수 건물 분기: 부두일 때 건조할 선박 선택 */}
        {isShipyard && (
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700, marginBottom: '6px' }}>
              🚢 건조할 선박 선택:
            </label>
            <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {buildableShips.map((ship) => {
                const isSelected = selectedTargetShipId === ship.id;
                const costText = Object.entries(ship.buildCost)
                  .map(([res, cnt]) => `${GOODS_DEFINITIONS[res as ResourceType]?.name} ${cnt}개`)
                  .join(', ');

                return (
                  <div
                    key={ship.id}
                    onClick={() => setSelectedTargetShipId(ship.id)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.04)',
                      border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      fontSize: '0.78rem'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 800, color: '#f8fafc' }}>{ship.name}</span>
                      <span style={{ color: '#4ade80', marginLeft: '6px' }}>(식량 -{ship.foodProvided})</span>
                    </div>
                    <span style={{ color: '#38bdf8' }}>비용: {costText} + 연료 {ship.costEnergy}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 하단 버튼 */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button 
            className="btn-secondary" 
            onClick={() => selectBuildingForDetail(null)}
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
            닫기
          </button>
          <button 
            className="btn-gold" 
            onClick={handleExecute}
            disabled={!isMyTurn || b.workerOnBuilding !== null}
            style={{ 
              padding: '8px 20px', 
              fontSize: '0.85rem',
              opacity: isMyTurn && b.workerOnBuilding === null ? 1 : 0.5,
              cursor: isMyTurn && b.workerOnBuilding === null ? 'pointer' : 'default'
            }}
          >
            <Play size={14} fill="#1a1003" /> 일꾼 이동 및 기능 실행
          </button>
        </div>
      </div>
    </div>
  );
};
