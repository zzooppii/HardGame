import React, { useState } from 'react';
import { BookOpen, Swords, Award, Landmark, X } from 'lucide-react';

interface DuelRuleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DuelRuleGuideModal: React.FC<DuelRuleGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'victory' | 'actions' | 'trade' | 'pantheon'>('victory');

  if (!isOpen) return null;

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
      zIndex: 9999,
      padding: '20px'
    }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(145deg, #182236 0%, #0c1220 100%)',
          border: '1.5px solid rgba(245, 158, 11, 0.5)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.9)'
        }}
      >
        {/* 상단 헤더 */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(20, 28, 45, 0.7)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen size={18} color="#1c1103" />
            </div>
            <div>
              <h2 className="font-serif text-gold-gradient" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                세븐 원더스 듀얼 & 판테온 공식 가이드
              </h2>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                세계 최고의 2인 문명 전략 대전 규칙 요약
              </span>
            </div>
          </div>

          <button onClick={onClose} className="btn-secondary" style={{ padding: '6px 10px' }}>
            <X size={16} />
          </button>
        </div>

        {/* 탭 바 */}
        <div style={{ display: 'flex', gap: '6px', padding: '12px 20px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { id: 'victory', label: '🏆 3대 승리 조건' },
            { id: 'actions', label: '🔺 피라미드 & 3가지 액션' },
            { id: 'trade', label: '🪙 무역 및 연계 건설' },
            { id: 'pantheon', label: '⚡ 판테온 확장 규칙' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.76rem',
                fontWeight: 700,
                border: activeTab === tab.id ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                background: activeTab === tab.id ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.04)',
                color: activeTab === tab.id ? '#fbbf24' : '#94a3b8',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 본문 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.6 }}>
          {activeTab === 'victory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px', borderRadius: '10px' }}>
                <strong style={{ color: '#f87171', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Swords size={16} /> 1. 군사적 우세 (Military Supremacy) — 즉시 승리!
                </strong>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem' }}>
                  빨간색 군사 건물을 지을 때마다 분쟁 말이 상대방 수도를 향해 전진합니다. 말이 상대방 수도 끝(+9 또는 -9)에 도달하면 그 즉시 군사적 우세로 완승을 거둡니다.
                </p>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '12px', borderRadius: '10px' }}>
                <strong style={{ color: '#4ade80', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={16} /> 2. 과학적 우세 (Scientific Supremacy) — 즉시 승리!
                </strong>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem' }}>
                  초록색 과학 건물에는 6종류의 과학 기호(나침반, 바퀴, 톱니, 서판, 막자사발, 깃펜)가 있습니다. 서로 다른 6종의 과학 기호를 먼저 수집하면 그 즉시 과학적 우세로 승리합니다. (동일한 기호 2개를 모으면 진보 토큰 1개 획득!)
                </p>
              </div>

              <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '12px', borderRadius: '10px' }}>
                <strong style={{ color: '#38bdf8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Landmark size={16} /> 3. 민간 승점 (Civilian Victory)
                </strong>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem' }}>
                  3시대가 끝날 때까지 즉시 승리가 나오지 않으면, 파란색 민간 건물 점수 + 불가사의 점수 + 군사 트랙 우위 점수 + 진보 토큰 점수 + 남은 주화(3코인당 1점)를 합산하여 총점이 더 높은 플레이어가 승리합니다.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p>
                매 턴 플레이어는 피라미드에서 <strong>가려지지 않은 앞면 카드 1장</strong>을 선택하여 다음 3가지 액션 중 하나를 수행합니다:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <strong style={{ color: '#10b981' }}>1. 건물 건설</strong>
                  <p style={{ fontSize: '0.78rem', margin: '4px 0 0 0' }}>
                    비용을 내고 카드를 내 도시로 가져와 자원, 승점, 군사 방패, 과학 기호를 영구적으로 획득합니다.
                  </p>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <strong style={{ color: '#f59e0b' }}>2. 카드 버리고 동전</strong>
                  <p style={{ fontSize: '0.78rem', margin: '4px 0 0 0' }}>
                    카드를 버리고 <strong>기본 2원 + 내가 가진 노란색(상업) 카드 수</strong>만큼 코인을 은행에서 획득합니다.
                  </p>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <strong style={{ color: '#c084fc' }}>3. 불가사의 건설</strong>
                  <p style={{ fontSize: '0.78rem', margin: '4px 0 0 0' }}>
                    선택한 카드를 내 미완성 불가사의 밑에 뒷면으로 끼워넣고 비용을 지불하여 강력한 불가사의 권능을 발동합니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trade' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ margin: 0, color: '#f8fafc' }}>💡 부족한 자원 구매 (무역 수수료 계산 공식)</h4>
              <p>
                카드를 건설할 때 내가 생산하지 못하는 자원이 있다면, 은행에서 동전을 내고 즉시 구매할 수 있습니다:
              </p>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '10px', borderRadius: '8px', border: '1px solid #f59e0b' }}>
                <strong style={{ color: '#fbbf24' }}>부족한 자원 1개당 가격 = 2 코인 + [상대방의 해당 자원 생산 카드 수]</strong>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                *단, 내가 해당 자원의 [노란색 비축기지] 카드를 보유하고 있다면 상대방 생산량과 무관하게 1 코인 고정으로 구매할 수 있습니다!
              </p>
            </div>
          )}

          {activeTab === 'pantheon' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ margin: 0, color: '#c084fc' }}>⚡ 판테온 확장판의 핵심 차이점</h4>
              <ul>
                <li><strong>피라미드 카드를 가져오는 대신:</strong> 코인을 지불하고 판테온의 신 카드를 활성화하여 기적을 발동할 수 있습니다.</li>
                <li><strong>5대 신화의 권능:</strong>
                  <ul>
                    <li>그리스: 카드 파괴 및 승점 대량 확보</li>
                    <li>로마: 군사 전선 급진격 및 수호 방어벽</li>
                    <li>이집트: 불가사의 즉시 무료 완공 또는 상대 원더 파괴</li>
                    <li>메소포타미아: 과학 기호 복사 및 진보 토큰 획득</li>
                    <li>페니키아: 대량의 코인 수탈 및 상대 자원 카드 강탈</li>
                  </ul>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(10, 15, 26, 0.8)' }}>
          <button className="btn-gold" onClick={onClose} style={{ padding: '6px 18px', fontSize: '0.84rem' }}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
