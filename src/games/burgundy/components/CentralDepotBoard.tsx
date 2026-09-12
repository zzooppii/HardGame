import React from 'react';
import { useBurgundyStore } from '../store/useBurgundyStore';
import { PHASE_COMPLETION_BONUS } from '../data/tiles';
import type { BurgundyPhase } from '../types';

export const CentralDepotBoard: React.FC = () => {
  const {
    centralDepots,
    blackMarketDepot,
    players,
    currentTurnPlayerIndex,
    selectedDieIndex,
    phase,
    takeTileFromDepot,
    buyFromBlackMarket,
    setHoveredTile
  } = useBurgundyStore();

  const playerCount = Math.max(players.length, 2);
  const currPlayer = players[currentTurnPlayerIndex];
  const activeDie = (selectedDieIndex !== null && currPlayer && !currPlayer.usedDice[selectedDieIndex]) ? currPlayer.dice[selectedDieIndex] : null;

  // 인원수에 따른 디포당 슬롯 수 (2인: 2개, 3인: 3개, 4인: 4개)
  const slotIndices = Array.from({ length: playerCount }, (_, i) => i);

  return (
    <div 
      className="saboteur-board-panel" 
      style={{ 
        padding: '10px 12px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px', 
        height: '100%', 
        boxSizing: 'border-box', 
        overflow: 'hidden' 
      }}
    >
      
      {/* 1. 실물 보드 벤치마크: 외곽 1~100 승점 트랙 (VP TRACK) 미니 바 */}
      <div style={{
        background: 'linear-gradient(145deg, #181d18 0%, #0d120e 100%)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        borderRadius: '8px',
        padding: '5px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#facc15' }}>🏆 승점 트랙 (VP Track 1~100)</span>
            <span style={{ 
              fontSize: '0.62rem', 
              background: 'rgba(212, 175, 55, 0.2)', 
              color: '#fef08a', 
              padding: '1px 5px', 
              borderRadius: '4px', 
              fontWeight: 700 
            }}>
              {playerCount}인용 메인 보드
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {players.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, display: 'inline-block' }} />
                <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{p.name.split(' ')[0]}:</span>
                <strong style={{ color: '#fde047' }}>{p.vp}점</strong>
              </div>
            ))}
          </div>
        </div>

        {/* 1~100 시각 게이지 바 */}
        <div style={{
          height: '8px',
          borderRadius: '4px',
          background: 'rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {players.map(p => {
            const pct = Math.min(Math.max((p.vp / 100) * 100, 1), 100);
            return (
              <div 
                key={p.id} 
                style={{
                  position: 'absolute',
                  left: `${pct}%`,
                  top: '-2px',
                  width: '6px',
                  height: '12px',
                  background: p.color,
                  borderRadius: '2px',
                  border: '1px solid #fff',
                  boxShadow: `0 0 6px ${p.color}`,
                  transform: 'translateX(-50%)'
                }}
                title={`${p.name}: ${p.vp} VP`}
              />
            );
          })}
        </div>
      </div>

      {/* 2. 상단 족자: 페이즈 보너스 (A:10, B:8, C:6, D:4, E:2) & 구역 크기 점수 안내 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(69, 34, 10, 0.6) 0%, rgba(35, 18, 5, 0.7) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        borderRadius: '6px',
        padding: '4px 10px',
        flexShrink: 0
      }}>
        {/* 페이즈 완료 보너스 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#facc15' }}>📜 페이즈 보너스:</span>
          {(['A', 'B', 'C', 'D', 'E'] as BurgundyPhase[]).map(ph => {
            const isCurr = phase === ph;
            return (
              <span 
                key={ph}
                style={{
                  padding: '1px 5px',
                  borderRadius: '3px',
                  background: isCurr ? '#ca8a04' : 'rgba(0,0,0,0.35)',
                  border: isCurr ? '1px solid #fef08a' : '1px solid rgba(255,255,255,0.1)',
                  color: isCurr ? '#fff' : '#94a3b8',
                  fontSize: '0.65rem',
                  fontWeight: isCurr ? 900 : 600
                }}
              >
                {ph} : {PHASE_COMPLETION_BONUS[ph]}점
              </span>
            );
          })}
        </div>

        {/* 구역 크기별 완성 점수 요약 */}
        <div style={{ fontSize: '0.64rem', color: '#cbd5e1' }}>
          구역 점수: 1칸 <strong style={{ color: '#facc15' }}>1점</strong> ~ 5칸 <strong style={{ color: '#facc15' }}>15점</strong> (크기 클수록 급증)
        </div>
      </div>

      {/* 3. 1~6번 디포 광장 (실제 보드게임 구조: 2인은 2칸, 3인은 3칸, 4인은 4칸) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', 
        gap: '6px', 
        minWidth: 0,
        flex: 1,
        minHeight: 0
      }}>
        {[1, 2, 3, 4, 5, 6].map(depotNum => {
          const tiles = centralDepots[depotNum] || [];
          const isMatchingDie = activeDie === depotNum;

          return (
            <div
              key={depotNum}
              style={{
                borderRadius: '8px',
                padding: '6px 8px',
                background: isMatchingDie 
                  ? 'linear-gradient(145deg, rgba(38, 54, 44, 0.95) 0%, rgba(20, 28, 23, 0.95) 100%)' 
                  : 'rgba(14, 20, 17, 0.85)',
                border: isMatchingDie 
                  ? '2px solid #d4af37' 
                  : '1px solid rgba(212, 175, 55, 0.22)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                minWidth: 0,
                boxSizing: 'border-box',
                boxShadow: isMatchingDie 
                  ? '0 0 16px rgba(212, 175, 55, 0.4), inset 0 1px 1px rgba(255,255,255,0.1)' 
                  : 'inset 0 2px 5px rgba(0,0,0,0.5)',
                transition: 'all 0.2s ease'
              }}
            >
              {/* 디포 헤더 (황동 씰 + 라벨 + 상태) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212,175,55,0.15)', paddingBottom: '3px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div className="brass-seal-badge" style={{ width: '22px', height: '22px', fontSize: '0.8rem', flexShrink: 0 }}>
                    {depotNum}
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: isMatchingDie ? '#facc15' : '#f1f5f9' }}>
                    {depotNum}번 디포
                  </span>
                </div>
                <span style={{ 
                  fontSize: '0.62rem', 
                  color: isMatchingDie ? '#86efac' : '#94a3b8', 
                  fontWeight: isMatchingDie ? 800 : 600,
                  background: isMatchingDie ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
                  padding: isMatchingDie ? '1px 5px' : '0',
                  borderRadius: '3px'
                }}>
                  {isMatchingDie ? '가져오기 가능' : `${tiles.length}개 타일`}
                </span>
              </div>

              {/* 인원수별 슬롯 그리드 (2인은 2열, 3~4인은 2열 2행) */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: playerCount > 2 ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)', 
                gap: '4px', 
                width: '100%', 
                minWidth: 0,
                flex: 1
              }}>
                {slotIndices.map(slotIdx => {
                  const tile = tiles[slotIdx];
                  const slotTag = slotIdx === 2 ? '3+' : (slotIdx === 3 ? '4인' : '');

                  if (!tile) {
                    return (
                      <div 
                        key={slotIdx}
                        style={{
                          height: playerCount > 2 ? '54px' : '72px',
                          borderRadius: '6px',
                          border: '1.5px dashed rgba(255, 255, 255, 0.12)',
                          background: 'rgba(0, 0, 0, 0.3)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#64748b',
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          position: 'relative'
                        }}
                      >
                        {slotTag && (
                          <span style={{ position: 'absolute', top: '2px', right: '3px', fontSize: '0.55rem', color: '#cbd5e1' }}>
                            {slotTag}
                          </span>
                        )}
                        <span>[ 빈칸 ]</span>
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
                      onMouseEnter={() => setHoveredTile(tile)}
                      onMouseLeave={() => setHoveredTile(null)}
                      disabled={!isMatchingDie || currPlayer?.isAI}
                      style={{
                        height: playerCount > 2 ? '54px' : '72px',
                        padding: '3px 5px',
                        borderRadius: '6px',
                        background: isMatchingDie ? tile.color : 'rgba(25, 34, 29, 0.95)',
                        border: isMatchingDie ? '2px solid #facc15' : '1px solid rgba(255, 255, 255, 0.12)',
                        color: isMatchingDie ? '#fff' : '#f1f5f9',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1px',
                        cursor: isMatchingDie ? 'pointer' : 'pointer',
                        opacity: isMatchingDie ? 1 : 0.8,
                        boxShadow: isMatchingDie ? '0 4px 12px rgba(0,0,0,0.7), 0 0 10px rgba(250, 204, 21, 0.4)' : '0 2px 6px rgba(0,0,0,0.5)',
                        transition: 'all 0.15s ease',
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        textAlign: 'center',
                        position: 'relative'
                      }}
                    >
                      {slotTag && (
                        <span style={{ position: 'absolute', top: '1px', right: '2px', fontSize: '0.55rem', color: '#fef08a', fontWeight: 800 }}>
                          {slotTag}
                        </span>
                      )}
                      <span style={{ fontSize: playerCount > 2 ? '1.15rem' : '1.35rem', lineHeight: 1 }}>{tile.icon}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', marginTop: '1px' }}>
                        {tile.name}
                      </span>
                      <span style={{ fontSize: '0.58rem', color: isMatchingDie ? '#fef08a' : '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', opacity: 0.9 }}>
                        {tile.desc.slice(0, 16)}...
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. 중앙 암시장 & 상품 판매 코너 (실물 중앙 검은색 암시장 충실 구현) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '6px',
        flexShrink: 0
      }}>
        {/* [암시장 (은화 2개 구매)] */}
        <div style={{
          padding: '6px 8px',
          borderRadius: '8px',
          background: 'linear-gradient(145deg, #18130d 0%, #0d0a07 100%)',
          border: '1.5px dashed rgba(212, 175, 55, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '0.75rem', color: '#facc15' }}>
              🪙 중앙 암시장 (은화 2개 즉시 구매)
            </span>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              내 은화: <strong style={{ color: '#facc15' }}>{currPlayer?.silverlings || 0}개</strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {blackMarketDepot.length === 0 ? (
              <div style={{ fontSize: '0.68rem', color: '#64748b', padding: '2px 0' }}>암시장 타일 소진</div>
            ) : (
              blackMarketDepot.map(tile => {
                const canBuy = currPlayer && currPlayer.silverlings >= 2 && !currPlayer.isAI;
                return (
                  <button
                    key={tile.id}
                    onClick={() => buyFromBlackMarket(tile.id)}
                    onMouseEnter={() => setHoveredTile(tile)}
                    onMouseLeave={() => setHoveredTile(null)}
                    disabled={!canBuy}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      padding: '3px 6px',
                      borderRadius: '5px',
                      background: tile.color,
                      border: canBuy ? '1.5px solid #d4af37' : '1px solid rgba(255,255,255,0.12)',
                      color: '#fff',
                      cursor: canBuy ? 'pointer' : 'not-allowed',
                      opacity: canBuy ? 1 : 0.6,
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      boxShadow: canBuy ? '0 2px 6px rgba(0,0,0,0.6)' : 'none'
                    }}
                  >
                    <span style={{ fontSize: '0.95rem' }}>{tile.icon}</span>
                    <span style={{ maxWidth: '65px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tile.name}</span>
                    <span style={{ color: '#fef08a' }}>(-2🪙)</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* [상품 판매 코너] */}
        <div style={{
          padding: '6px 8px',
          borderRadius: '8px',
          background: 'rgba(18, 26, 22, 0.92)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '0.75rem', color: '#93c5fd' }}>
              📦 상품 판매 (은화 1개 + VP)
            </span>
            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
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
                    title={`[${g.dieNumber}번 상품] ${g.name} 판매 (은화 +1, VP 획득)`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 6px',
                      borderRadius: '5px',
                      background: canSell ? '#2563eb' : 'rgba(30, 41, 59, 0.75)',
                      border: canSell ? '1.5px solid #93c5fd' : '1px solid rgba(255,255,255,0.12)',
                      color: '#fff',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      cursor: canSell ? 'pointer' : 'not-allowed',
                      opacity: canSell ? 1 : 0.65,
                      boxShadow: canSell ? '0 2px 8px rgba(37, 99, 235, 0.5)' : 'none'
                    }}
                  >
                    <span>📦</span>
                    <span>{g.name} ({g.dieNumber}번)</span>
                    {canSell && <span style={{ color: '#fef08a' }}>[판매!]</span>}
                  </button>
                );
              })
            ) : (
              <span style={{ fontSize: '0.68rem', color: '#64748b' }}>보유 상품 없음</span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
