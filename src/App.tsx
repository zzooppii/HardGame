import { useState } from 'react';
import { Lobby } from './platform/components/Lobby';
import { PuertoRicoGame } from './games/puerto-rico/PuertoRicoGame';
import { Dices } from 'lucide-react';

export function App() {
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 플랫폼 상단 글로벌 헤더 */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 32px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(13, 17, 23, 0.85)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div 
          onClick={() => setActiveGameId(null)}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(245, 158, 11, 0.4)'
          }}>
            <Dices size={22} color="#1c1103" />
          </div>
          <div>
            <div className="font-serif text-gold-gradient" style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.1 }}>
              Euro Masterpieces
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              명작 유로 보드게임 웹 플랫폼
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {activeGameId ? (
            <button 
              className="btn-secondary" 
              onClick={() => setActiveGameId(null)}
              style={{ fontSize: '0.82rem', padding: '6px 14px' }}
            >
              로비로 나가기
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span className="badge badge-gold">1단계 푸에르토리코 완성</span>
            </div>
          )}
        </div>
      </header>

      {/* 화면 라우팅: 로비 vs 개별 게임 */}
      <div style={{ flex: 1 }}>
        {activeGameId === 'puerto-rico' ? (
          <PuertoRicoGame onBackToLobby={() => setActiveGameId(null)} />
        ) : (
          <Lobby onSelectGame={(gameId) => setActiveGameId(gameId)} />
        )}
      </div>

      {/* 플랫폼 푸터 */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '24px 32px',
        textAlign: 'center',
        background: 'rgba(9, 13, 18, 0.95)',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <span>Euro Board Game Masterpieces Web Platform</span>
          <span>•</span>
          <span>Designed with Precision</span>
        </div>
        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>
          1단계: 푸에르토리코 | 2단계: 버건디의 성 | 3단계: 르아브르 | 4단계: 카베르나 | 5단계: 아르낙 | 6단계: 테라포밍 마스
        </div>
      </footer>

    </div>
  );
}

export default App;
