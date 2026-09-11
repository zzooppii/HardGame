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
      
      {/* 1. 상단 디포 타이틀 & 스플랜더식 실시간 상태 가이드 바 (컴팩트 1줄 통합) */}
      <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212, 175, 55, 0.15)', paddingBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#d4af37', fontSize: '0.8rem' }}>●</span>
          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#f8fafc', letterSpacing: '0.5px' }}>
            공용 주사위 디포 (DEPOTS)
          </span>
        </div>

        {/* 상태 가이드 배지 */}
        <div style={{
          padding: '3px 10px',
          borderRadius: '12px',
          background: guideType === 'action' 
            ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(180, 83, 9, 0.25) 100%)' 
            : 'rgba(0, 0, 0, 0.45)',
          border: guideType === 'action' ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.1)',
          color: guideType === 'action' ? '#fde047' : '#cbd5e1',
          fontSize: '0.72rem',
          fontWeight: 700,
          boxShadow: guideType === 'action' ? '0 0 10px rgba(212, 175, 55, 0.3)' : 'none',
          maxWidth: '380px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {guideMessage}
        </div>
      </div>

      {/* 2. 실물 보드게임 트레이 감성의 1~6번 디포 진열대 (좌우 2구 슬롯 트레이) */}
      <div style={{ 
        flex: 1, 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', 
        gridTemplateRows: '1fr 1fr', 
        gap: '6px', 
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
                borderRadius: '7px',
                padding: '5px 6px',
                background: isMatchingDie 
                  ? 'linear-gradient(145deg, rgba(38, 54, 44, 0.95) 0%, rgba(20, 28, 23, 0.95) 100%)' 
                  : 'rgba(14, 20, 17, 0.8)',
                border: isMatchingDie 
                  ? '1.5px solid #d4af37' 
                  : '1px solid rgba(212, 175, 55, 0.18)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
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
              {/* 디포 헤더 바 (황동 씰 + 라벨 + 상태) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212,175,55,0.12)', paddingBottom: '2px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div className="brass-seal-badge" style={{ width: '20px', height: '20px', fontSize: '0.72rem', flexShrink: 0 }}>
                    {depotNum}
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: isMatchingDie ? '#facc15' : '#e2e8f0' }}>
                    {depotNum}번 디포
                  </span>
                </div>
                <span style={{ 
                  fontSize: '0.58rem', 
                  color: isMatchingDie ? '#86efac' : '#94a3b8', 
                  fontWeight: isMatchingDie ? 800 : 600,
                  background: isMatchingDie ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                  padding: isMatchingDie ? '1px 4px' : '0',
                  borderRadius: '3px'
                }}>
                  {isMatchingDie ? '가져오기 가능' : `${tiles.length}개`}
                </span>
              </div>

              {/* 좌우 2구 타일 슬롯 트레이 (가로 2열 배치로 세로 공간 최적화) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', width: '100%', flex: 1, minHeight: 0, minWidth: 0 }}>
                {[0, 1].map(slotIdx => {
                  const tile = tiles[slotIdx];

                  if (!tile) {
                    return (
                      <div 
                        key={slotIdx}
                        style={{
                          height: '100%',
                          borderRadius: '5px',
                          border: '1px dashed rgba(255, 255, 255, 0.1)',
                          background: 'rgba(0, 0, 0, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#475569',
                          fontSize: '0.62rem',
                          fontWeight: 600,
                          minHeight: 0
                        }}
                      >
                        [ 빈칸 ]
                      </div>
                    );
                  }

                  return (
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
                        height: '100%',
                        padding: '3px 4px',
                        borderRadius: '5px',
                        background: isMatchingDie ? tile.color : 'rgba(25, 34, 29, 0.92)',
                        border: isMatchingDie ? '1.5px solid #facc15' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: isMatchingDie ? '#fff' : '#cbd5e1',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px',
                        cursor: isMatchingDie ? 'pointer' : 'not-allowed',
                        opacity: isMatchingDie ? 1 : 0.7,
                        boxShadow: isMatchingDie ? '0 2px 6px rgba(0,0,0,0.6)' : 'none',
                        transition: 'all 0.15s ease',
                        width: '100%',
                        minWidth: 0,
                        minHeight: 0,
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        textAlign: 'center'
                      }}
                    >
                      <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>{tile.icon}</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                        {tile.name}
                      </span>
                      <span style={{ fontSize: '0.55rem', color: isMatchingDie ? '#fef08a' : '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', opacity: 0.85 }}>
                        {tile.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. 중앙 암시장 & 상품 판매 트레이 (빈 공간 없이 유기적으로 채움) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '8px',
        flexShrink: 0
      }}>
        {/* [암시장 (은화 2개 구매)] */}
        <div style={{
          padding: '6px 8px',
          borderRadius: '7px',
          background: 'linear-gradient(145deg, #18130d 0%, #0d0a07 100%)',
          border: '1px dashed rgba(212, 175, 55, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '0.72rem', color: '#facc15' }}>
              🪙 암시장 (은화 2개 구매)
            </span>
            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
              내 은화: <strong style={{ color: '#facc15' }}>{currPlayer?.silverlings || 0}개</strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {blackMarketDepot.length === 0 ? (
              <div style={{ fontSize: '0.65rem', color: '#64748b', padding: '2px 0' }}>암시장 타일 소진</div>
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
                      gap: '3px',
                      padding: '3px 6px',
                      borderRadius: '4px',
                      background: tile.color,
                      border: canBuy ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      cursor: canBuy ? 'pointer' : 'not-allowed',
                      opacity: canBuy ? 1 : 0.5,
                      fontSize: '0.65rem',
                      fontWeight: 700
                    }}
                  >
                    <span>{tile.icon}</span>
                    <span style={{ maxWidth: '65px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tile.name}</span>
                    <span style={{ color: '#fef08a' }}>(-2)</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* [상품 판매 코너 (창고 상품 매각)] */}
        <div style={{
          padding: '6px 8px',
          borderRadius: '7px',
          background: 'rgba(18, 26, 22, 0.9)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '0.72rem', color: '#93c5fd' }}>
              📦 상품 판매 (은화 1개 + VP)
            </span>
            <span style={{ fontSize: '0.62rem', color: '#64748b' }}>
              주사위 일치 시
            </span>
          </div>

          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', minHeight: '26px' }}>
            {currPlayer?.goods && currPlayer.goods.length > 0 ? (
              currPlayer.goods.map(g => {
                const canSell = activeDie === g.dieNumber;
                return (
                  <button
                    key={g.id}
                    onClick={() => {
                      if (canSell) {
                        useBurgundyStore.getState().sellGoodsAction(g.dieNumber);
                      }
                    }}
                    disabled={!canSell}
                    title={`[${g.dieNumber}번 상품] ${g.name} 판매 (은화 +1, 플레이어수 VP)`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 6px',
                      borderRadius: '4px',
                      background: canSell ? '#3b82f6' : 'rgba(30, 41, 59, 0.7)',
                      border: canSell ? '1px solid #93c5fd' : '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      cursor: canSell ? 'pointer' : 'not-allowed',
                      opacity: canSell ? 1 : 0.6
                    }}
                  >
                    <span>📦</span>
                    <span>{g.name} ({g.dieNumber}번)</span>
                    {canSell && <span style={{ color: '#fef08a' }}>[판매!]</span>}
                  </button>
                );
              })
            ) : (
              <span style={{ fontSize: '0.65rem', color: '#64748b' }}>보유 상품 없음</span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
