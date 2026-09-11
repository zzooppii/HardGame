import React, { useState } from 'react';
import { usePlatformStore } from '../store/usePlatformStore';
import { BOARD_GAMES_LIST } from '../data/gamesList';
import { Trophy, TrendingUp, Calendar, RotateCcw, X } from 'lucide-react';

interface StatsModalProps {
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ onClose }) => {
  const { records, getGameStats, resetAllData } = usePlatformStore();
  const [selectedGameTab, setSelectedGameTab] = useState<string>('all');
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const overallStats = getGameStats();

  const filteredRecords = selectedGameTab === 'all'
    ? records
    : records.filter(r => r.gameId === selectedGameTab);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 8, 15, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 400,
      padding: '20px'
    }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '840px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(145deg, #131b2e 0%, #0a0f1d 100%)',
          border: '1.5px solid rgba(229, 169, 60, 0.35)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
        }}
      >
        {/* 모달 상단 헤더 */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(20, 29, 49, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(245, 158, 11, 0.4)'
            }}>
              <Trophy size={20} color="#1c1103" />
            </div>
            <div>
              <h2 className="font-serif text-gold-gradient" style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>
                플랫폼 통합 전적 & 랭킹 분석
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                로컬 브라우저 영속화 기반 누적 게임 데이터
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '6px 10px', borderRadius: '8px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 모달 본문 영역 (스크롤 가능) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* 1. 종합 전적 서머리 카드 4종 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '12px',
              padding: '14px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px' }}>총 플레이 수</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>{overallStats.totalGames}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>완주 경기</div>
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '12px',
              padding: '14px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.72rem', color: '#f59e0b', marginBottom: '4px' }}>통산 승리 (1위)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24' }}>{overallStats.wins}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{overallStats.losses}패</div>
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '12px',
              padding: '14px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginBottom: '4px' }}>통산 승률</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>
                {overallStats.winRate}<span style={{ fontSize: '1.1rem' }}>%</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>승리 달성률</div>
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(168, 85, 247, 0.2)',
              borderRadius: '12px',
              padding: '14px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.72rem', color: '#c084fc', marginBottom: '4px' }}>전체 최고 점수</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#e879f9' }}>{overallStats.highScore}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>단일 최고 기록</div>
            </div>
          </div>

          {/* 2. 6대 명작별 상세 전적 그리드 */}
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={16} color="#f59e0b" />
              6대 명작별 전적 분석
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              {BOARD_GAMES_LIST.map(game => {
                const stats = getGameStats(game.id);
                return (
                  <div
                    key={game.id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.65)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                        {game.title}
                      </span>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: stats.winRate >= 50 ? '#4ade80' : '#94a3b8',
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '2px 8px',
                        borderRadius: '12px'
                      }}>
                        승률 {stats.winRate}%
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#94a3b8', marginBottom: '6px' }}>
                      <span>전적: <strong style={{ color: '#e2e8f0' }}>{stats.wins}승 {stats.losses}패</strong> ({stats.totalGames}전)</span>
                      <span>최고: <strong style={{ color: '#f59e0b' }}>{stats.highScore}점</strong></span>
                    </div>

                    {/* 승률 게이지 바 */}
                    <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${stats.winRate}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #f59e0b 0%, #10b981 100%)',
                        borderRadius: '2px',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. 최근 플레이 기록 히스토리 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} color="#38bdf8" />
                최근 플레이 기록 ({filteredRecords.length})
              </div>

              {/* 필터 탭 */}
              <select
                value={selectedGameTab}
                onChange={e => setSelectedGameTab(e.target.value)}
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#e2e8f0',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  outline: 'none'
                }}
              >
                <option value="all">모든 게임 전체</option>
                {BOARD_GAMES_LIST.map(g => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            </div>

            {filteredRecords.length === 0 ? (
              <div style={{
                padding: '30px',
                textAlign: 'center',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '10px',
                color: '#64748b',
                fontSize: '0.85rem'
              }}>
                아직 기록된 플레이 전적이 없습니다. 게임을 완주해보세요!
              </div>
            ) : (
              <div style={{
                maxHeight: '220px',
                overflowY: 'auto',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                background: 'rgba(0, 0, 0, 0.25)'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
                      <th style={{ padding: '8px 12px' }}>일시</th>
                      <th style={{ padding: '8px 12px' }}>게임명</th>
                      <th style={{ padding: '8px 12px' }}>결과</th>
                      <th style={{ padding: '8px 12px' }}>순위</th>
                      <th style={{ padding: '8px 12px' }}>내 점수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map(r => (
                      <tr key={r.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '8px 12px', color: '#64748b' }}>
                          {new Date(r.playedAt).toLocaleDateString()} {new Date(r.playedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: '#f1f5f9' }}>{r.gameTitle}</td>
                        <td style={{ padding: '8px 12px' }}>
                          {r.isWin ? (
                            <span style={{ color: '#fbbf24', fontWeight: 700 }}>승리 (1위) 🏆</span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>완주</span>
                          )}
                        </td>
                        <td style={{ padding: '8px 12px', color: '#cbd5e1' }}>{r.rank}위 / {r.totalPlayers}인</td>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: '#38bdf8' }}>{r.myScore}점</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* 모달 하단 푸터 (전적 초기화 등) */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(10, 15, 26, 0.8)'
        }}>
          <div>
            {showConfirmReset ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: '#f87171' }}>정말 모든 전적과 업적을 초기화하시겠습니까?</span>
                <button
                  onClick={() => {
                    resetAllData();
                    setShowConfirmReset(false);
                  }}
                  style={{
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.74rem',
                    cursor: 'pointer'
                  }}
                >
                  초기화 실행
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#cbd5e1',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.74rem',
                    cursor: 'pointer'
                  }}
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmReset(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <RotateCcw size={12} /> 데이터 초기화
              </button>
            )}
          </div>

          <button
            className="btn-gold"
            onClick={onClose}
            style={{ padding: '8px 20px', fontSize: '0.88rem' }}
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
