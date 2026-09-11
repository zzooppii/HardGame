import React from 'react';
import type { PlayerDuel } from '../types';
import { getPlayerResourceProduction } from '../engine/gameLogic';
import { Coins, Landmark } from 'lucide-react';

interface PlayerCivilizationMatProps {
  player: PlayerDuel;
  isCurrentTurn: boolean;
  isOpponent?: boolean;
}

export const PlayerCivilizationMat: React.FC<PlayerCivilizationMatProps> = ({
  player,
  isCurrentTurn,
  isOpponent = false
}) => {
  const prod = getPlayerResourceProduction(player);

  // 카드 색상별 그룹화
  const brownCards = player.cards.filter(c => c.color === 'brown');
  const grayCards = player.cards.filter(c => c.color === 'gray');
  const blueCards = player.cards.filter(c => c.color === 'blue');
  const greenCards = player.cards.filter(c => c.color === 'green');
  const yellowCards = player.cards.filter(c => c.color === 'yellow');
  const redCards = player.cards.filter(c => c.color === 'red');
  const purpleCards = player.cards.filter(c => c.color === 'purple');

  return (
    <div style={{
      background: isCurrentTurn 
        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)' 
        : 'rgba(15, 20, 32, 0.75)',
      border: isCurrentTurn ? `1.5px solid ${player.color}` : '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      padding: '10px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      boxShadow: isCurrentTurn ? `0 0 16px ${player.color}44` : 'none',
      transition: 'all 0.3s ease'
    }}>
      {/* 1. 상단 프로필 및 재정/자원 상태 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: player.color }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>
            {player.name}
          </span>
          {isOpponent && (
            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              (상대)
            </span>
          )}
          {isCurrentTurn && (
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              background: `${player.color}22`,
              color: player.color,
              border: `1px solid ${player.color}66`
            }}>
              ● 턴 진행 중
            </span>
          )}
        </div>

        {/* 코인 & 과학 수집 현황 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '6px' }}>
            <Coins size={14} color="#fbbf24" />
            <strong style={{ fontSize: '0.85rem', color: '#fbbf24' }}>{player.coins}</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.75rem' }}>🔬</span>
            <strong style={{ fontSize: '0.82rem', color: '#34d399' }}>
              {new Set(player.scienceSymbols).size} / 6
            </strong>
          </div>
        </div>
      </div>

      {/* 2. 자원 생산 현황 배너 */}
      <div style={{
        display: 'flex',
        gap: '8px',
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '0.72rem',
        color: '#cbd5e1'
      }}>
        <span>자원 생산:</span>
        <span style={{ color: '#d97706' }}>🪵 {prod.wood}</span>
        <span style={{ color: '#ea580c' }}>🧱 {prod.clay}</span>
        <span style={{ color: '#94a3b8' }}>🪨 {prod.stone}</span>
        <span style={{ color: '#38bdf8' }}>🧪 {prod.glass}</span>
        <span style={{ color: '#e2e8f0' }}>📜 {prod.papyrus}</span>
      </div>

      {/* 3. 보유한 4대 불가사의 슬롯 */}
      <div>
        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Landmark size={12} color="#f59e0b" />
          불가사의 ({player.constructedWonders.length} / {player.wonders.length} 완공)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {player.wonders.map(wonder => (
            <div
              key={wonder.id}
              style={{
                background: wonder.isConstructed 
                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.25) 100%)' 
                  : 'rgba(255, 255, 255, 0.04)',
                border: wonder.isConstructed ? '1.5px solid #f59e0b' : '1px dashed rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                padding: '4px 6px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                fontSize: '0.68rem',
                minHeight: '44px'
              }}
              title={`${wonder.name}: ${wonder.effects.victoryPoints}점 ${wonder.effects.extraTurn ? '(추가 턴)' : ''}`}
            >
              <div style={{ fontWeight: 700, color: wonder.isConstructed ? '#fbbf24' : '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {wonder.isConstructed ? '🏛️ ' : '🏗️ '}{wonder.name}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.62rem' }}>
                <span style={{ color: '#60a5fa' }}>+{wonder.effects.victoryPoints}점</span>
                <span>{wonder.isConstructed ? '완공' : '미완'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 건설된 카드 컬렉션 미니 바 */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', fontSize: '0.68rem' }}>
        {brownCards.length > 0 && <span style={{ background: '#78350f', color: '#fef3c7', padding: '2px 6px', borderRadius: '4px' }}>갈색 ({brownCards.length})</span>}
        {grayCards.length > 0 && <span style={{ background: '#475569', color: '#f8fafc', padding: '2px 6px', borderRadius: '4px' }}>회색 ({grayCards.length})</span>}
        {blueCards.length > 0 && <span style={{ background: '#1e40af', color: '#dbeafe', padding: '2px 6px', borderRadius: '4px' }}>파란색 ({blueCards.length})</span>}
        {greenCards.length > 0 && <span style={{ background: '#065f46', color: '#d1fae5', padding: '2px 6px', borderRadius: '4px' }}>초록색 ({greenCards.length})</span>}
        {yellowCards.length > 0 && <span style={{ background: '#854d0e', color: '#fef08a', padding: '2px 6px', borderRadius: '4px' }}>노란색 ({yellowCards.length})</span>}
        {redCards.length > 0 && <span style={{ background: '#991b1b', color: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>빨간색 ({redCards.length})</span>}
        {purpleCards.length > 0 && <span style={{ background: '#6b21a8', color: '#f3e8ff', padding: '2px 6px', borderRadius: '4px' }}>길드 ({purpleCards.length})</span>}
      </div>
    </div>
  );
};
