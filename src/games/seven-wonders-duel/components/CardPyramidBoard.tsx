import React, { useState } from 'react';
import { useDuelStore } from '../store/useDuelStore';
import type { PyramidNode } from '../types';
import { calculateCardCost, calculateWonderCost, calculateDiscardGain } from '../engine/gameLogic';
import { Hammer, Coins, X } from 'lucide-react';
import { soundManager } from '../../../utils/sound';

export const CardPyramidBoard: React.FC = () => {
  const { 
    pyramid, 
    age, 
    players, 
    currentTurnPlayerIndex, 
    buildCardAction, 
    discardCardAction, 
    buildWonderAction, 
    playMode, 
    myPlayerId 
  } = useDuelStore();

  const [selectedNode, setSelectedNode] = useState<PyramidNode | null>(null);

  const currPlayer = players[currentTurnPlayerIndex];
  const opponent = players[currentTurnPlayerIndex === 0 ? 1 : 0];
  const isMyTurn = playMode === 'online'
    ? currPlayer?.id === myPlayerId
    : (currPlayer && !currPlayer.isAI);

  // 카드 색상별 배경 및 테두리 스타일
  const getCardColorStyle = (color: string) => {
    switch (color) {
      case 'brown': return { bg: 'linear-gradient(135deg, #78350f 0%, #451a03 100%)', border: '#b45309', text: '#fde68a' };
      case 'gray': return { bg: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)', border: '#94a3b8', text: '#f1f5f9' };
      case 'blue': return { bg: 'linear-gradient(135deg, #1e40af 0%, #172554 100%)', border: '#3b82f6', text: '#93c5fd' };
      case 'green': return { bg: 'linear-gradient(135deg, #065f46 0%, #022c22 100%)', border: '#10b981', text: '#6ee7b7' };
      case 'yellow': return { bg: 'linear-gradient(135deg, #854d0e 0%, #422006 100%)', border: '#eab308', text: '#fef08a' };
      case 'red': return { bg: 'linear-gradient(135deg, #991b1b 0%, #450a0a 100%)', border: '#ef4444', text: '#fca5a5' };
      case 'purple': return { bg: 'linear-gradient(135deg, #6b21a8 0%, #3b0764 100%)', border: '#a855f7', text: '#e9d5ff' };
      default: return { bg: '#1e293b', border: '#64748b', text: '#f8fafc' };
    }
  };

  // 피라미드 행별 그룹핑
  const maxRow = Math.max(...pyramid.map(n => n.row), 0);
  const rows = Array.from({ length: maxRow + 1 }, (_, r) => pyramid.filter(n => n.row === r));

  const handleCardClick = (node: PyramidNode) => {
    if (!node.isAvailable || node.isTaken) return;
    soundManager.playClick();
    setSelectedNode(node);
  };

  return (
    <div style={{
      background: 'rgba(10, 15, 26, 0.95)',
      border: '1.5px solid rgba(245, 158, 11, 0.3)',
      borderRadius: '12px',
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 8px 30px rgba(0,0,0,0.6)'
    }}>
      {/* 상단 시대 정보 배너 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.74rem', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            🏛️ 피라미드 구조 (제{age}시대)
          </span>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
            가려지지 않은 앞면 카드만 드래프트할 수 있습니다
          </span>
        </div>
      </div>

      {/* 피라미드 렌더링 영역 */}
      <div style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        padding: '4px 0'
      }}>
        {rows.map((rowNodes, rIdx) => (
          <div key={rIdx} style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {rowNodes.map(node => {
              if (node.isTaken) {
                // 이미 가져간 빈 슬롯은 플레이스홀더로 윤곽만 보존
                return (
                  <div
                    key={node.id}
                    style={{
                      width: '64px',
                      height: '84px',
                      borderRadius: '8px',
                      border: '1px dashed rgba(255,255,255,0.05)',
                      opacity: 0.2
                    }}
                  />
                );
              }

              const style = getCardColorStyle(node.card.color);
              const isAvailable = node.isAvailable;
              const isOpen = node.isOpen;

              return (
                <div
                  key={node.id}
                  onClick={() => handleCardClick(node)}
                  style={{
                    width: '64px',
                    height: '84px',
                    borderRadius: '8px',
                    background: isOpen ? style.bg : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    border: isOpen 
                      ? (isAvailable ? `2px solid ${style.border}` : `1px solid ${style.border}`) 
                      : '1.5px solid rgba(255,255,255,0.15)',
                    padding: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: isAvailable ? 'pointer' : 'default',
                    opacity: isAvailable ? 1 : 0.65,
                    boxShadow: isAvailable ? `0 0 14px ${style.border}88` : 'none',
                    transform: isAvailable ? 'translateY(-2px)' : 'none',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative'
                  }}
                  title={isOpen ? `${node.card.name}: ${node.card.description}` : '뒷면 카드 (위의 카드를 치우면 공개됩니다)'}
                >
                  {isOpen ? (
                    <>
                      {/* 카드 상단: 비용/기호 */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.62rem', fontWeight: 800, color: style.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {node.card.name}
                        </span>
                      </div>

                      {/* 카드 중앙 아이콘/효과 */}
                      <div style={{ textAlign: 'center', fontSize: '0.85rem' }}>
                        {node.card.effects.militaryShields && <span>🛡️×{node.card.effects.militaryShields}</span>}
                        {node.card.effects.scienceSymbol && <span>🔬</span>}
                        {node.card.effects.victoryPoints && <span style={{ color: '#60a5fa', fontWeight: 800 }}>+{node.card.effects.victoryPoints}</span>}
                        {node.card.effects.coins && <span style={{ color: '#fbbf24', fontWeight: 800 }}>🪙+{node.card.effects.coins}</span>}
                        {node.card.effects.resources && <span>📦</span>}
                      </div>

                      {/* 카드 하단 비용 */}
                      <div style={{ fontSize: '0.58rem', color: '#cbd5e1', textAlign: 'right' }}>
                        {node.card.cost.coins ? `${node.card.cost.coins}원` : (node.card.chainSymbol ? '🔗' : '무료')}
                      </div>
                    </>
                  ) : (
                    // 뒷면 디자인
                    <div style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'rgba(255,255,255,0.3)',
                      fontSize: '0.65rem'
                    }}>
                      <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>🏛️</div>
                      <span>제{node.age}시대</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* 카드 액션 선택 팝오버 모달 (건설 / 버리기 / 불가사의) */}
      {selectedNode && currPlayer && opponent && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(5, 8, 15, 0.85)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '16px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '440px',
            background: 'linear-gradient(145deg, #182236 0%, #0c1220 100%)',
            border: '2px solid var(--gold-primary)',
            borderRadius: '14px',
            padding: '18px',
            boxShadow: '0 15px 40px rgba(0,0,0,0.9)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {/* 팝업 상단 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 700 }}>카드 선택 액션</span>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#ffffff' }}>
                  {selectedNode.card.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.4 }}>
              {selectedNode.card.description}
            </div>

            {/* 3가지 선택 액션 버튼 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
              {/* 1. 건물 건설 */}
              {(() => {
                const cost = calculateCardCost(currPlayer, selectedNode.card, opponent);
                return (
                  <button
                    disabled={!isMyTurn || !cost.canAfford}
                    onClick={() => {
                      buildCardAction(selectedNode.id);
                      setSelectedNode(null);
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: cost.canAfford ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255,255,255,0.05)',
                      color: cost.canAfford ? '#ffffff' : '#64748b',
                      border: 'none',
                      cursor: cost.canAfford ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontWeight: 700,
                      fontSize: '0.84rem'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Hammer size={16} /> 건물 건설
                    </span>
                    <span>
                      {cost.isFreeByChain ? '무료 (연계 기호 🔗)' : `${cost.totalCoinCost} 코인`}
                    </span>
                  </button>
                );
              })()}

              {/* 2. 카드 버리고 동전 획득 */}
              {(() => {
                const gain = calculateDiscardGain(currPlayer);
                return (
                  <button
                    disabled={!isMyTurn}
                    onClick={() => {
                      discardCardAction(selectedNode.id);
                      setSelectedNode(null);
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: '#1a1003',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontWeight: 800,
                      fontSize: '0.84rem'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Coins size={16} /> 카드 버리고 코인 수급
                    </span>
                    <span>+{gain} 코인 획득</span>
                  </button>
                );
              })()}

              {/* 3. 불가사의 건설 (내 미완성 불가사의 목록 중 선택) */}
              <div style={{ marginTop: '6px' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px' }}>
                  🏛️ 이 카드를 희생하여 불가사의 건설:
                </div>
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {currPlayer.wonders.filter(w => !w.isConstructed).map(wonder => {
                    const wCost = calculateWonderCost(currPlayer, wonder, opponent);
                    return (
                      <button
                        key={wonder.id}
                        disabled={!isMyTurn || !wCost.canAfford}
                        onClick={() => {
                          buildWonderAction(selectedNode.id, wonder.id);
                          setSelectedNode(null);
                        }}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: wCost.canAfford ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255,255,255,0.03)',
                          border: wCost.canAfford ? '1px solid #c084fc' : '1px solid rgba(255,255,255,0.08)',
                          color: wCost.canAfford ? '#e9d5ff' : '#64748b',
                          fontSize: '0.74rem',
                          cursor: wCost.canAfford ? 'pointer' : 'not-allowed',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {wonder.name} ({wCost.totalCoinCost}원)
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
