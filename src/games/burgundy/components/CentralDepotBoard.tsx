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
    buyFromBlackMarket,
    uiTheme
  } = useBurgundyStore();

  const isTabletop = uiTheme === 'tabletop';
  const currPlayer = players[currentTurnPlayerIndex];
  const activeDie = (selectedDieIndex !== null && currPlayer && !currPlayer.usedDice[selectedDieIndex]) ? currPlayer.dice[selectedDieIndex] : null;

  return (
    <div style={{
      background: isTabletop ? 'linear-gradient(145deg, #fdf6e2 0%, #ecdcb9 100%)' : 'rgba(15, 23, 42, 0.75)',
      borderRadius: '14px',
      padding: '16px',
      border: isTabletop ? '2px solid #8a6534' : '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      boxShadow: isTabletop ? '0 8px 24px rgba(0,0,0,0.3)' : 'none'
    }}>
      {/* 중앙 보드 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="font-serif text-gold-gradient" style={{ margin: 0, fontSize: '1.1rem' }}>
          🎲 중앙 주사위 디포 (Central Depots)
        </h3>
        {activeDie !== null && (
          <span className="badge badge-gold" style={{ fontSize: '0.78rem' }}>
            선택된 주사위: [{activeDie}]번 디포 타일 획득 가능
          </span>
        )}
      </div>

      {/* 1 ~ 6번 디포 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        {[1, 2, 3, 4, 5, 6].map(depotNum => {
          const tiles = centralDepots[depotNum] || [];
          const isMatchingDie = activeDie === depotNum;

          return (
            <div
              key={depotNum}
              style={{
                borderRadius: '10px',
                padding: '10px 8px',
                background: isMatchingDie 
                  ? (isTabletop ? '#faecc8' : 'rgba(234, 179, 8, 0.12)') 
                  : (isTabletop ? '#f3e5c8' : 'rgba(30, 41, 59, 0.5)'),
                border: isMatchingDie 
                  ? '2px solid #f59e0b' 
                  : (isTabletop ? '1px solid #cbb28d' : '1px solid rgba(255, 255, 255, 0.08)'),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: isMatchingDie ? '0 0 12px rgba(245, 158, 11, 0.3)' : 'none'
              }}
            >
              {/* 디포 주사위 눈금 배지 */}
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                background: isMatchingDie ? '#f59e0b' : (isTabletop ? '#8a6534' : '#334155'),
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem'
              }}>
                {depotNum}
              </div>

              {/* 디포에 적재된 타일들 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                {tiles.length === 0 ? (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>
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
                      title={`${tile.name}: ${tile.desc}`}
                      disabled={!isMatchingDie || currPlayer?.isAI}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '6px',
                        background: tile.color,
                        border: '1px solid rgba(255,255,255,0.3)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: isMatchingDie ? 'pointer' : 'not-allowed',
                        opacity: isMatchingDie ? 1 : 0.65,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>{tile.icon}</span>
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

      {/* 중앙 암시장 (Black Market) */}
      <div style={{
        marginTop: '6px',
        padding: '12px',
        borderRadius: '10px',
        background: isTabletop ? '#e8d5b5' : 'rgba(2, 6, 23, 0.7)',
        border: '1.5px dashed #d97706'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.1rem' }}>🪙</span>
            <span style={{ fontWeight: 800, fontSize: '0.85rem', color: isTabletop ? '#2b1805' : 'var(--gold-secondary)' }}>
              중앙 암시장 (은화 2개로 즉시 구매)
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: isTabletop ? '#664d30' : 'var(--text-muted)' }}>
            내 은화: {currPlayer?.silverlings || 0}개
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {blackMarketDepot.length === 0 ? (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>암시장 타일 소진됨</div>
          ) : (
            blackMarketDepot.map(tile => (
              <button
                key={tile.id}
                onClick={() => buyFromBlackMarket(tile.id)}
                disabled={!currPlayer || currPlayer.silverlings < 2 || currPlayer.isAI}
                title={`${tile.name}: ${tile.desc} (은화 2개 소모)`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: tile.color,
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#fff',
                  cursor: (currPlayer && currPlayer.silverlings >= 2) ? 'pointer' : 'not-allowed',
                  opacity: (currPlayer && currPlayer.silverlings >= 2) ? 1 : 0.5
                }}
              >
                <span>{tile.icon}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{tile.name}</span>
                <span style={{ fontSize: '0.7rem', color: '#fef08a' }}>(-2🪙)</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
