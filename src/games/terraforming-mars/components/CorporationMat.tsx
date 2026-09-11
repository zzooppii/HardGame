import React from 'react';
import { useTMStore } from '../store/useTMStore';
import { Flame } from 'lucide-react';

export const CorporationMat: React.FC = () => {
  const { 
    players, 
    currentTurnPlayerIndex, 
    convertHeatToTemperatureAction,
    temperature,
    playMode, 
    myPlayerId 
  } = useTMStore();

  const currPlayer = players[currentTurnPlayerIndex];
  const myPlayer = players.find(p => p.id === myPlayerId) || players[0];
  const isMyTurn = playMode === 'online' 
    ? currPlayer?.id === myPlayerId 
    : (currPlayer && !currPlayer.isAI);

  const canHeat = currPlayer && currPlayer.resources.heat >= 8 && temperature < 8;

  return (
    <div style={{
      background: 'rgba(15, 10, 15, 0.95)',
      border: '1.5px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '12px',
      padding: '10px 14px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      gap: '8px'
    }}>
      {/* 1. 기업 헤더 & TR 현황 */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(127, 29, 29, 0.3) 100%)',
        border: '1px solid rgba(239, 68, 68, 0.4)',
        borderRadius: '8px',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: myPlayer?.color }} />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>
              {myPlayer?.corporation.name}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#fca5a5', lineHeight: 1.2 }}>
              {myPlayer?.corporation.specialAbility}
            </div>
          </div>
        </div>

        <div style={{
          background: '#ef4444',
          color: '#ffffff',
          padding: '4px 10px',
          borderRadius: '6px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
        }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 700 }}>TERRAFORM RATING</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>TR {myPlayer?.tr}</div>
        </div>
      </div>

      {/* 2. 6대 자원 및 생산량(Production) 대시보드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '6px',
        flexShrink: 0
      }}>
        {[
          { 
            id: 'megacredits', 
            name: '메가크레딧', 
            unit: 'M€', 
            color: '#fbbf24', 
            icon: '🪙',
            val: myPlayer?.resources.megacredits, 
            prod: myPlayer?.production.megacredits 
          },
          { 
            id: 'steel', 
            name: '강철 (건물 2M€)', 
            unit: '개', 
            color: '#94a3b8', 
            icon: '⚙️',
            val: myPlayer?.resources.steel, 
            prod: myPlayer?.production.steel 
          },
          { 
            id: 'titanium', 
            name: '티타늄 (우주 3M€)', 
            unit: '개', 
            color: '#38bdf8', 
            icon: '⭐',
            val: myPlayer?.resources.titanium, 
            prod: myPlayer?.production.titanium 
          },
          { 
            id: 'plants', 
            name: '식물 (8개 ➔ 녹지)', 
            unit: '개', 
            color: '#22c55e', 
            icon: '🌿',
            val: myPlayer?.resources.plants, 
            prod: myPlayer?.production.plants 
          },
          { 
            id: 'energy', 
            name: '에너지 (열 전환)', 
            unit: '개', 
            color: '#a855f7', 
            icon: '⚡',
            val: myPlayer?.resources.energy, 
            prod: myPlayer?.production.energy 
          },
          { 
            id: 'heat', 
            name: '열 (8개 ➔ 온도+2)', 
            unit: '개', 
            color: '#f97316', 
            icon: '🔥',
            val: myPlayer?.resources.heat, 
            prod: myPlayer?.production.heat 
          }
        ].map(res => (
          <div
            key={res.id}
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: `1px solid ${res.color}44`,
              borderRadius: '8px',
              padding: '6px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem' }}>
              <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{res.icon} {res.name}</span>
              <span style={{
                background: res.prod && res.prod >= 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: res.prod && res.prod >= 0 ? '#4ade80' : '#f87171',
                padding: '1px 5px',
                borderRadius: '4px',
                fontWeight: 800
              }}>
                생산 {res.prod && res.prod > 0 ? `+${res.prod}` : (res.prod || 0)}
              </span>
            </div>

            <div style={{ textAlign: 'center', margin: '4px 0' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: res.color }}>
                {res.val || 0}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: '3px' }}>{res.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. 액션 전환 컨트롤 (열 방출 & 기온 상승) */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '8px',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Flame size={16} color="#f97316" />
          <span style={{ fontSize: '0.72rem', color: '#f8fafc', fontWeight: 600 }}>
            온실가스 방출: 열 8개 ➔ 기온 +2°C (TR +1)
          </span>
        </div>

        <button
          onClick={() => {
            if (isMyTurn && canHeat) {
              convertHeatToTemperatureAction();
            }
          }}
          disabled={!isMyTurn || !canHeat}
          style={{
            padding: '4px 10px',
            background: canHeat && isMyTurn ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : '#334155',
            border: 'none',
            borderRadius: '6px',
            color: '#ffffff',
            fontSize: '0.68rem',
            fontWeight: 800,
            cursor: canHeat && isMyTurn ? 'pointer' : 'not-allowed',
            boxShadow: canHeat && isMyTurn ? '0 2px 8px rgba(249, 115, 22, 0.4)' : 'none'
          }}
        >
          기온 +2°C 상승 실행
        </button>
      </div>

      {/* 플레이 완료한 카드 목록 요약 */}
      <div style={{
        flex: 1,
        minHeight: 0,
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        padding: '6px 10px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
          배치된 활성 프로젝트 ({myPlayer?.playedCards.length}개)
        </div>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', overflowY: 'auto', flex: 1 }}>
          {myPlayer?.playedCards.map(c => (
            <span
              key={c.id}
              style={{
                background: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '0.62rem',
                color: '#e2e8f0'
              }}
            >
              {c.name} {c.victoryPoints > 0 ? `(+${c.victoryPoints}점)` : ''}
            </span>
          ))}
          {myPlayer?.playedCards.length === 0 && (
            <span style={{ fontSize: '0.65rem', color: '#64748b' }}>아직 실행된 프로젝트가 없습니다.</span>
          )}
        </div>
      </div>
    </div>
  );
};
