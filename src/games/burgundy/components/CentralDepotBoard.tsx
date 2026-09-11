import React from 'react';
import { useBurgundyStore } from '../store/useBurgundyStore';

export const CentralDepotBoard: React.FC = () => {
  const {
    centralDepots,
    blackMarketDepot,
    players,
    currentTurnPlayerIndex,
    selectedDieIndex,
    selectedKeySlotIndex,
    takeTileFromDepot,
    buyFromBlackMarket
  } = useBurgundyStore();

  const currPlayer = players[currentTurnPlayerIndex];
  const activeDie = (selectedDieIndex !== null && currPlayer && !currPlayer.usedDice[selectedDieIndex]) ? currPlayer.dice[selectedDieIndex] : null;
  const selectedTile = (selectedKeySlotIndex !== null && currPlayer) ? currPlayer.keySlots[selectedKeySlotIndex] : null;

  // 스플랜더식 실시간 상태 가이드 메시지 산출
  let guideMessage = '🎲 행동을 시작하려면 주사위를 선택하세요';
  let guideType: 'info' | 'action' | 'warning' = 'info';

  if (currPlayer?.isAI) {
    guideMessage = `🤖 ${currPlayer.name}님이 행동을 고심하고 있습니다...`;
  } else if (selectedTile) {
    guideMessage = `🏰 [${selectedTile.name}] 배치: 좌측 영지에서 반짝이는 칸을 클릭하세요!`;
    guideType = 'action';
  } else if (activeDie !== null) {
    guideMessage = `📦 [${activeDie}번 디포]의 타일을 클릭하여 가져오거나, 보관소 타일을 선택하세요.`;
    guideType = 'action';
  } else if (currPlayer?.usedDice[0] && currPlayer?.usedDice[1]) {
    guideMessage = '⏳ 이번 라운드의 주사위를 모두 사용했습니다. 다음 턴으로 전환 중...';
  }

  return (
    <div className="saboteur-board-panel" style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '10px', height: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
      
      {/* 1. 상단 디포 타이틀 & 스플랜더식 실시간 상태 가이드 바 */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#d4af37', fontSize: '0.8rem' }}>●</span>
            <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#f8fafc', letterSpacing: '0.5px' }}>
              공용 주사위 디포 (CENTRAL DEPOTS)
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            {activeDie !== null ? `선택 눈금: [${activeDie}]` : '주사위 미선택'}
          </span>
        </div>

        {/* 스플랜더 Big CTA 상태 가이드 배너 */}
        <div style={{
          padding: '8px 12px',
          borderRadius: '8px',
          background: guideType === 'action' 
            ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(180, 83, 9, 0.25) 100%)' 
            : 'rgba(0, 0, 0, 0.45)',
          border: guideType === 'action' ? '1.5px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.1)',
          color: guideType === 'action' ? '#fde047' : '#cbd5e1',
          fontSize: '0.8rem',
          fontWeight: 700,
          textAlign: 'center',
          boxShadow: guideType === 'action' ? '0 0 14px rgba(212, 175, 55, 0.35)' : 'none',
          transition: 'all 0.2s ease'
        }}>
          {guideMessage}
        </div>
      </div>

      {/* 2. 스플랜더 카드 매트 감성의 1~6번 디포 진열대 (3열 2행 minmax(0, 1fr) 무잘림 그리드) */}
      <div style={{ 
        flex: 1, 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', 
        gridTemplateRows: '1fr 1fr', 
        gap: '8px', 
        minHeight: 0,
        minWidth: 0,
        overflow: 'hidden'
      }}>
        {[1, 2, 3, 4, 5, 6].map(depotNum => {
          const tiles = centralDepots[depotNum] || [];
          const isMatchingDie = activeDie === depotNum;

          return (
            <div
              key={depotNum}
              style={{
                borderRadius: '8px',
                padding: '8px 6px',
                background: isMatchingDie 
                  ? 'linear-gradient(145deg, rgba(38, 54, 44, 0.95) 0%, rgba(22, 32, 26, 0.95) 100%)' 
                  : 'rgba(14, 20, 17, 0.75)',
                border: isMatchingDie 
                  ? '1.5px solid #d4af37' 
                  : '1px solid rgba(212, 175, 55, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                height: '100%',
                minWidth: 0,
                boxSizing: 'border-box',
                overflow: 'hidden',
                boxShadow: isMatchingDie 
                  ? '0 0 14px rgba(212, 175, 55, 0.35), inset 0 1px 1px rgba(255,255,255,0.1)' 
                  : 'inset 0 2px 5px rgba(0,0,0,0.5)',
                transition: 'all 0.2s ease'
              }}
            >
              {/* 주사위 황동 씰 인장 */}
              <div className="brass-seal-badge" style={{ width: '24px', height: '24px', fontSize: '0.8rem', flexShrink: 0 }}>
                {depotNum}
              </div>

              {/* 디포 타일 리스트 (카드를 세로로 꽉 채움) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', flex: 1, justifyContent: 'center', minWidth: 0, overflow: 'hidden' }}>
                {tiles.length === 0 ? (
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center', padding: '8px 0' }}>
                    비어있음
                  </div>
                ) : (
                  tiles.map(tile => (
                    <button
                      key={tile.id}
                      onClick={() => {
                        if (isMatchingDie) {
                          takeTileFromDepot(depotNum, tile.id);
                        }
                      }}
                      disabled={!isMatchingDie || currPlayer?.isAI}
                      title={`${tile.name}: ${tile.desc}`}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '6px',
                        background: isMatchingDie ? tile.color : 'rgba(25, 34, 29, 0.9)',
                        border: isMatchingDie ? '1px solid rgba(255, 255, 255, 0.45)' : '1px solid rgba(255, 255, 255, 0.08)',
                        color: isMatchingDie ? '#fff' : '#cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: isMatchingDie ? 'pointer' : 'not-allowed',
                        opacity: isMatchingDie ? 1 : 0.65,
                        boxShadow: isMatchingDie ? '0 3px 8px rgba(0,0,0,0.6)' : 'none',
                        transition: 'all 0.15s ease',
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        overflow: 'hidden'
                      }}
                    >
                      <span style={{ fontSize: '1.15rem', flexShrink: 0 }}>{tile.icon}</span>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', overflow: 'hidden', minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                          {tile.name}
                        </span>
                        <span style={{ fontSize: '0.62rem', color: isMatchingDie ? '#fef08a' : '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                          {tile.desc}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. 중앙 암시장 (은화 2개 구매 코너) */}
      <div style={{
        padding: '8px 10px',
        borderRadius: '8px',
        background: 'linear-gradient(145deg, #16120d 0%, #0d0a07 100%)',
        border: '1px dashed rgba(212, 175, 55, 0.35)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontWeight: 800, fontSize: '0.78rem', color: '#facc15' }}>
            🪙 암시장 (은화 2개 구매)
          </span>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
            보유: <strong style={{ color: '#facc15' }}>{currPlayer?.silverlings || 0}개</strong>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {blackMarketDepot.length === 0 ? (
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>암시장 타일 소진</div>
          ) : (
            blackMarketDepot.map(tile => {
              const canBuy = currPlayer && currPlayer.silverlings >= 2 && !currPlayer.isAI;

              return (
                <button
                  key={tile.id}
                  onClick={() => buyFromBlackMarket(tile.id)}
                  disabled={!canBuy}
                  title={`${tile.name}: ${tile.desc} (은화 2개)`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '5px',
                    background: tile.color,
                    border: canBuy ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    cursor: canBuy ? 'pointer' : 'not-allowed',
                    opacity: canBuy ? 1 : 0.5,
                    fontSize: '0.7rem',
                    fontWeight: 700
                  }}
                >
                  <span>{tile.icon}</span>
                  <span>{tile.name}</span>
                  <span style={{ color: '#fef08a' }}>(-2)</span>
                </button>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
