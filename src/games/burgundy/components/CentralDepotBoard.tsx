import React from 'react';
import { useBurgundyStore } from '../store/useBurgundyStore';

export const CentralDepotBoard: React.FC = () => {
  const {
    centralDepots,
    blackMarketDepot,
    players,
    currentTurnPlayerIndex,
    selectedDieIndex,
    takeTileFromDepot,
    buyFromBlackMarket
  } = useBurgundyStore();

  const currPlayer = players[currentTurnPlayerIndex];
  const activeDie = (selectedDieIndex !== null && currPlayer && !currPlayer.usedDice[selectedDieIndex]) ? currPlayer.dice[selectedDieIndex] : null;

  return (
    <div className="saboteur-board-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* 1. 상단 사보타지 타이틀 바 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212, 175, 55, 0.15)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#d4af37', fontSize: '0.85rem' }}>●</span>
          <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#f8fafc', letterSpacing: '0.5px' }}>
            중앙 주사위 디포 & 암시장 (CENTRAL DEPOTS)
          </span>
        </div>
        {activeDie !== null && (
          <span style={{
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(180, 83, 9, 0.2) 100%)',
            border: '1px solid #d4af37',
            padding: '3px 10px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            color: '#facc15',
            fontWeight: 700
          }}>
            선택된 주사위: [{activeDie}]번 디포 획득 가능
          </span>
        )}
      </div>

      {/* 2. 1 ~ 6번 디포 그리드 (앤티크 펠트 트레이) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {[1, 2, 3, 4, 5, 6].map(depotNum => {
          const tiles = centralDepots[depotNum] || [];
          const isMatchingDie = activeDie === depotNum;

          return (
            <div
              key={depotNum}
              style={{
                borderRadius: '8px',
                padding: '10px 8px',
                background: isMatchingDie 
                  ? 'linear-gradient(145deg, rgba(38, 54, 44, 0.95) 0%, rgba(22, 32, 26, 0.95) 100%)' 
                  : 'rgba(14, 20, 17, 0.8)',
                border: isMatchingDie 
                  ? '1.5px solid #d4af37' 
                  : '1px solid rgba(212, 175, 55, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: isMatchingDie 
                  ? '0 0 14px rgba(212, 175, 55, 0.35), inset 0 1px 1px rgba(255,255,255,0.1)' 
                  : 'inset 0 2px 5px rgba(0,0,0,0.5)'
              }}
            >
              {/* 주사위 황동 씰 인장 */}
              <div className="brass-seal-badge">
                {depotNum}
              </div>

              {/* 디포 타일 리스트 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                {tiles.length === 0 ? (
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center', padding: '12px 0' }}>
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
                        padding: '7px 8px',
                        borderRadius: '6px',
                        background: isMatchingDie 
                          ? tile.color 
                          : 'rgba(25, 34, 29, 0.9)',
                        border: isMatchingDie 
                          ? '1px solid rgba(255, 255, 255, 0.4)' 
                          : '1px solid rgba(255, 255, 255, 0.08)',
                        color: isMatchingDie ? '#fff' : '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: isMatchingDie ? 'pointer' : 'not-allowed',
                        opacity: isMatchingDie ? 1 : 0.6,
                        boxShadow: isMatchingDie ? '0 4px 10px rgba(0,0,0,0.5)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span style={{ fontSize: '1.05rem' }}>{tile.icon}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75px' }}>
                        {tile.name}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. 중앙 암시장 (Black Market) */}
      <div style={{
        padding: '12px',
        borderRadius: '8px',
        background: 'linear-gradient(145deg, #16120d 0%, #0d0a07 100%)',
        border: '1px dashed rgba(212, 175, 55, 0.4)',
        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.1rem' }}>🪙</span>
            <span style={{ fontWeight: 800, fontSize: '0.84rem', color: '#facc15' }}>
              중앙 암시장 (은화 2개로 즉시 구매)
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            내 은화: <strong style={{ color: '#facc15' }}>{currPlayer?.silverlings || 0}개</strong>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {blackMarketDepot.length === 0 ? (
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>암시장 타일 소진됨</div>
          ) : (
            blackMarketDepot.map(tile => {
              const canBuy = currPlayer && currPlayer.silverlings >= 2 && !currPlayer.isAI;

              return (
                <button
                  key={tile.id}
                  onClick={() => buyFromBlackMarket(tile.id)}
                  disabled={!canBuy}
                  title={`${tile.name}: ${tile.desc} (은화 2개 소모)`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: tile.color,
                    border: canBuy ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    cursor: canBuy ? 'pointer' : 'not-allowed',
                    opacity: canBuy ? 1 : 0.5,
                    boxShadow: canBuy ? '0 3px 8px rgba(0,0,0,0.5)' : 'none'
                  }}
                >
                  <span>{tile.icon}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{tile.name}</span>
                  <span style={{ fontSize: '0.7rem', color: '#fef08a' }}>(-2🪙)</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
