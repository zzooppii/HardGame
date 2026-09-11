import React from 'react';
import { useArnakStore } from '../store/useArnakStore';
import { Compass, ShieldAlert, Footprints } from 'lucide-react';
import { canDefeatGuardian } from '../engine/gameLogic';

export const DigSiteBoard: React.FC = () => {
  const { 
    digSites, 
    players, 
    currentTurnPlayerIndex, 
    placeWorkerAction, 
    defeatGuardianAction,
    playMode, 
    myPlayerId 
  } = useArnakStore();

  const currPlayer = players[currentTurnPlayerIndex];
  const isMyTurn = playMode === 'online' 
    ? currPlayer?.id === myPlayerId 
    : (currPlayer && !currPlayer.isAI);

  const availableWorker = currPlayer?.archaeologists.find(a => !a.isPlaced);

  return (
    <div style={{
      background: 'rgba(10, 16, 26, 0.95)',
      border: '1.5px solid rgba(16, 185, 129, 0.3)',
      borderRadius: '12px',
      padding: '10px 14px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🗺️</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
              미지의 아르낙 정글 발굴지
            </h3>
            <span style={{ fontSize: '0.65rem', color: '#34d399' }}>DIG SITES & GUARDIANS</span>
          </div>
        </div>

        {/* 내 일꾼 잔여 현황 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>보유 일꾼:</span>
          {currPlayer?.archaeologists.map((arc, i) => (
            <span
              key={i}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: arc.isPlaced ? '#334155' : currPlayer.color,
                color: '#f8fafc',
                fontSize: '0.65rem',
                fontWeight: 800,
                opacity: arc.isPlaced ? 0.4 : 1,
                border: '1.5px solid #ffffff33'
              }}
              title={arc.isPlaced ? '파견 완료' : '파견 가능'}
            >
              {i + 1}
            </span>
          ))}
        </div>
      </div>

      {/* 발굴지 그리드 리스트 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '8px',
        overflowY: 'auto',
        flex: 1,
        paddingRight: '4px'
      }}>
        {digSites.map((site) => {
          const isOccupied = site.occupiedByPlayerId !== null;
          const occupant = players.find(p => p.id === site.occupiedByPlayerId);
          const hasGuardian = site.guardian && !site.guardian.isDefeated;
          const canDefeat = hasGuardian && currPlayer && canDefeatGuardian(currPlayer, site.guardian!);
          const canDiscover = !site.isDiscovered && currPlayer && currPlayer.resources.compasses >= site.compassCostToDiscover;

          return (
            <div
              key={site.id}
              style={{
                background: site.level === 0 
                  ? 'rgba(15, 23, 42, 0.7)' 
                  : (site.level === 1 ? 'rgba(6, 78, 59, 0.3)' : 'rgba(120, 53, 15, 0.3)'),
                border: isOccupied 
                  ? '1px solid #475569' 
                  : (site.level === 2 ? '1.5px solid #f59e0b' : (site.level === 1 ? '1.5px solid #10b981' : '1px solid #334155')),
                borderRadius: '8px',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                transition: 'all 0.2s',
                opacity: isOccupied ? 0.75 : 1
              }}
            >
              <div>
                {/* 상단 뱃지 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <span style={{ fontSize: '18px' }}>{site.siteSlotIcon}</span>
                  <span style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    color: site.level === 0 ? '#94a3b8' : (site.level === 1 ? '#34d399' : '#fbbf24'),
                    background: 'rgba(0,0,0,0.4)',
                    padding: '2px 5px',
                    borderRadius: '4px'
                  }}>
                    {site.level === 0 ? '캠프' : `${site.level}티어 유적`}
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.2 }}>
                  {site.name}
                </div>

                {/* 보상 표시 */}
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', margin: '6px 0', fontSize: '0.7rem' }}>
                  {Object.entries(site.rewards).map(([k, v]) => (
                    <span
                      key={k}
                      style={{
                        background: 'rgba(0,0,0,0.5)',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        color: k === 'rubies' ? '#f43f5e' : (k === 'arrowheads' ? '#fbbf24' : (k === 'compasses' ? '#38bdf8' : '#cbd5e1')),
                        fontWeight: 700
                      }}
                    >
                      {k === 'rubies' ? `💎 +${v}` : (k === 'arrowheads' ? `🏹 +${v}` : (k === 'compasses' ? `🧭 +${v}` : (k === 'coins' ? `🪙 +${v}` : (k === 'tablets' ? `📜 +${v}` : `🎴 +${v}`))))}
                    </span>
                  ))}
                </div>

                {/* 수호자 출현 뱃지 및 제압 버튼 */}
                {hasGuardian && site.guardian && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid #ef4444',
                    borderRadius: '6px',
                    padding: '5px 6px',
                    marginTop: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem', color: '#fca5a5', fontWeight: 700 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <span>{site.guardian.icon}</span>
                        <span>{site.guardian.name}</span>
                      </span>
                      <span>+5점</span>
                    </div>

                    <div style={{ fontSize: '0.62rem', color: '#fecaca' }}>
                      비용: {Object.entries(site.guardian.defeatCost).map(([k, v]) => `${k} ${v}`).join(', ')}
                    </div>

                    {isMyTurn && (
                      <button
                        onClick={() => defeatGuardianAction(site.id)}
                        disabled={!canDefeat}
                        style={{
                          marginTop: '2px',
                          padding: '3px 6px',
                          background: canDefeat ? '#ef4444' : '#451a1a',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#ffffff',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          cursor: canDefeat ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '3px'
                        }}
                      >
                        <ShieldAlert size={11} />
                        <span>{canDefeat ? '수호자 제압!' : '자원 부족'}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* 하단 일꾼 배치 / 점유 상태 */}
              <div style={{ marginTop: '8px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {isOccupied ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: '#94a3b8' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: occupant?.color }} />
                    <span>{occupant?.name} 파견 중</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (isMyTurn && availableWorker) {
                        placeWorkerAction(site.id);
                      }
                    }}
                    disabled={!isMyTurn || !availableWorker || (!site.isDiscovered && !canDiscover)}
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      background: !site.isDiscovered 
                        ? (canDiscover && isMyTurn ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : '#1e293b')
                        : (availableWorker && isMyTurn ? '#10b981' : '#1e293b'),
                      border: 'none',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: isMyTurn && availableWorker && (site.isDiscovered || canDiscover) ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    {!site.isDiscovered ? (
                      <>
                        <Compass size={12} />
                        <span>탐험 (나침반 {site.compassCostToDiscover})</span>
                      </>
                    ) : (
                      <>
                        <Footprints size={12} />
                        <span>고고학자 파견</span>
                      </>
                    )}
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
