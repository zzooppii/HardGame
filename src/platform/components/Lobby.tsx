import React, { useState } from 'react';
import { BOARD_GAMES_LIST } from '../data/gamesList';
import type { BoardGameMeta } from '../types';
import { GameSetupModal } from './GameSetupModal';
import { Play, Sparkles, Clock, Users, Flame, BookOpen } from 'lucide-react';

interface LobbyProps {
  onSelectGame: (gameId: string) => void;
}

export const Lobby: React.FC<LobbyProps> = ({ onSelectGame }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [selectedGameForDetail, setSelectedGameForDetail] = useState<BoardGameMeta | null>(null);
  const [setupModalOpen, setSetupModalOpen] = useState<boolean>(false);
  const [targetGameTitle, setTargetGameTitle] = useState<string>('푸에르토리코');

  // URL 파라미터 감지하여 즉시 멀티 모달 오픈
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('room')) {
      setTargetGameTitle('푸에르토리코');
      setSetupModalOpen(true);
    }
  }, []);

  const categories = ['전체', '역할 선택', '일꾼 놓기', '타일 배치', '덱 빌딩', '엔진 빌딩'];

  const filteredGames = BOARD_GAMES_LIST.filter(game => {
    if (selectedCategory === '전체') return true;
    return game.category.some(cat => cat.includes(selectedCategory));
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '60px' }}>
      
      {/* 1. 히어로 배너 섹션 */}
      <div style={{
        position: 'relative',
        padding: '60px 24px 40px 24px',
        textAlign: 'center',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(229, 169, 60, 0.15) 0%, rgba(13, 17, 23, 0) 70%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(229, 169, 60, 0.12)',
          border: '1px solid var(--amber-border)',
          padding: '6px 16px',
          borderRadius: '9999px',
          fontSize: '0.82rem',
          color: 'var(--gold-secondary)',
          fontWeight: 600,
          marginBottom: '16px'
        }}>
          <Sparkles size={14} /> 프리미엄 유로 전략 보드게임 컬렉션
        </div>

        <h1 className="font-serif text-gold-gradient" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '14px' }}>
          Euro Masterpieces
        </h1>
        <p style={{ maxWidth: '680px', margin: '0 auto 28px auto', fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          보드게임 긱(BGG) 역사상 가장 위대한 6대 전략 보드게임을 웹 브라우저에서 직접 경험하세요.
          치밀한 경제 엔진과 직관적인 인터페이스로 설계되었습니다.
        </p>

        {/* 카테고리 필터 칩 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: selectedCategory === cat ? 'var(--gold-primary)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedCategory === cat ? '#181105' : 'var(--text-muted)',
                border: selectedCategory === cat ? '1px solid var(--gold-secondary)' : '1px solid var(--border-subtle)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. 6종 게임 카드 그리드 쇼케이스 */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px', width: '100%' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', 
          gap: '28px' 
        }}>
          {filteredGames.map(game => {
            const isPlayable = game.status === 'available';

            return (
              <div
                key={game.id}
                className="glass-panel"
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isPlayable ? '1px solid var(--amber-border-bright)' : '1px solid var(--border-subtle)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isPlayable ? 'var(--shadow-luxury)' : '0 8px 24px rgba(0,0,0,0.4)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  if (isPlayable) {
                    e.currentTarget.style.borderColor = 'var(--gold-secondary)';
                    e.currentTarget.style.boxShadow = '0 16px 36px rgba(0, 0, 0, 0.8), 0 0 30px var(--gold-glow)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  if (isPlayable) {
                    e.currentTarget.style.borderColor = 'var(--amber-border-bright)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-luxury)';
                  }
                }}
              >
                {/* 상단 비주얼 배너 */}
                <div style={{
                  height: '140px',
                  background: game.bannerImage,
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {game.originalTitle} ({game.year})
                    </span>
                    {isPlayable ? (
                      <span className="badge badge-gold" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                        ● 지금 플레이 가능
                      </span>
                    ) : (
                      <span className="badge badge-soon" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                        순차 개발 예정
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-serif" style={{ fontSize: '1.6rem', color: '#fff', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                      {game.title}
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                      디자이너: {game.designer}
                    </span>
                  </div>
                </div>

                {/* 카드 본문 내용 */}
                <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    {/* 게임 테마 요약 문구 */}
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-gold)', fontStyle: 'italic', marginBottom: '10px' }}>
                      "{game.flavorText}"
                    </p>
                    
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
                      {game.description}
                    </p>

                    {/* 태그 리스트 */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      {game.category.map((cat, idx) => (
                        <span key={idx} style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          color: '#cbd5e1',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem'
                        }}>
                          {cat}
                        </span>
                      ))}
                    </div>

                    {/* 스펙 정보 바 (인원, 시간, 난이도) */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '8px',
                      background: 'rgba(0, 0, 0, 0.25)',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.04)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={14} color="var(--gold-secondary)" />
                        <span style={{ fontSize: '0.75rem', color: '#e2e8f0' }}>{game.players.split(' ')[0]}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} color="#38bdf8" />
                        <span style={{ fontSize: '0.75rem', color: '#e2e8f0' }}>{game.playTime}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Flame size={14} color="#f43f5e" />
                        <span style={{ fontSize: '0.75rem', color: '#e2e8f0' }}>난이도 {game.weight} / 5</span>
                      </div>
                    </div>
                  </div>

                  {/* 하단 버튼 액션 */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                    {isPlayable ? (
                      <button
                        className="btn-gold"
                        onClick={() => {
                          setTargetGameTitle(game.title);
                          setSetupModalOpen(true);
                        }}
                        style={{ flex: 1, padding: '12px 18px', fontSize: '0.92rem' }}
                      >
                        <Play size={16} fill="#181105" /> 게임 시작 (솔로 / 멀티)
                      </button>
                    ) : (
                      <button
                        disabled
                        style={{
                          flex: 1,
                          padding: '12px 18px',
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border-subtle)',
                          cursor: 'not-allowed',
                          fontSize: '0.88rem'
                        }}
                      >
                        로드맵 순차 오픈 예정
                      </button>
                    )}

                    <button
                      className="btn-secondary"
                      onClick={() => setSelectedGameForDetail(game)}
                      title="게임 소개 및 규칙 요약"
                      style={{ padding: '10px 14px' }}
                    >
                      <BookOpen size={16} />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 게임 상세 안내 모달 */}
      {selectedGameForDetail && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(5, 8, 15, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 300,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '620px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--gold-secondary)' }}>{selectedGameForDetail.originalTitle} ({selectedGameForDetail.year})</span>
                <h2 className="font-serif text-gold-gradient" style={{ margin: '4px 0 0 0', fontSize: '1.6rem' }}>
                  {selectedGameForDetail.title}
                </h2>
              </div>
              <button className="btn-secondary" onClick={() => setSelectedGameForDetail(null)}>
                닫기 ✕
              </button>
            </div>

            <p style={{ fontStyle: 'italic', color: 'var(--text-gold)', marginBottom: '14px' }}>
              "{selectedGameForDetail.flavorText}"
            </p>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
              {selectedGameForDetail.description}
            </p>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '8px', marginBottom: '24px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>
                게임 제원 및 메커니즘
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <div>게임 디자이너: <strong>{selectedGameForDetail.designer}</strong></div>
                <div>BGG 난이도: <strong>{selectedGameForDetail.weight} / 5</strong></div>
                <div>권장 인원: <strong>{selectedGameForDetail.players}</strong></div>
                <div>예상 소요 시간: <strong>{selectedGameForDetail.playTime}</strong></div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              {selectedGameForDetail.status === 'available' ? (
                <button
                  className="btn-gold"
                  onClick={() => {
                    setTargetGameTitle(selectedGameForDetail.title);
                    setSelectedGameForDetail(null);
                    setSetupModalOpen(true);
                  }}
                >
                  <Play size={16} fill="#181105" /> 지금 플레이하기
                </button>
              ) : (
                <span className="badge badge-soon">푸에르토리코 완성 후 순차 탑재됩니다</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 게임 모드 설정 모달 (솔로 / 로컬 / 온라인 P2P 멀티) */}
      {setupModalOpen && (
        <GameSetupModal
          gameTitle={targetGameTitle}
          onClose={() => setSetupModalOpen(false)}
          onStartGame={() => {
            setSetupModalOpen(false);
            const gameId = (targetGameTitle.includes('아르낙'))
              ? 'arnak'
              : (targetGameTitle.includes('카베르나')
                  ? 'caverna'
                  : (targetGameTitle === '르아브르' 
                      ? 'le-havre' 
                      : (targetGameTitle === '버건디의 성' ? 'burgundy' : 'puerto-rico')));
            onSelectGame(gameId);
          }}
        />
      )}

    </div>
  );
};
