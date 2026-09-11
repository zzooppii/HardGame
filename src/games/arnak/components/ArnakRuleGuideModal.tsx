import React, { useState } from 'react';
import { soundManager } from '../../../utils/sound';

interface ArnakRuleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'overview' | 'sites' | 'guardians' | 'research' | 'scoring';

export const ArnakRuleGuideModal: React.FC<ArnakRuleGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 15, 12, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '95%',
          maxWidth: '900px',
          maxHeight: '88vh',
          backgroundColor: '#0f172a',
          border: '1px solid #10b981',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#f1f5f9'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>🌿</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                아르낙의 잊혀진 유적 (Lost Ruins of Arnak) 공식 게임 가이드
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6ee7b7' }}>
                BGG 상위권 현대 명작 덱빌딩 + 일꾼 놓기 + 고대 사원 탐험 전략 가이드
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            style={{
              background: '#334155',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              color: '#cbd5e1',
              cursor: 'pointer',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #334155',
            backgroundColor: '#09101d',
            padding: '0 16px',
            gap: '8px',
            overflowX: 'auto'
          }}
        >
          {[
            { id: 'overview', label: '📖 게임 개요 & 흐름', icon: '🗺️' },
            { id: 'sites', label: '⛏️ 발굴지 & 나침반 탐험', icon: '🧭' },
            { id: 'guardians', label: '🐍 수호자 출현 & 제압', icon: '⚔️' },
            { id: 'research', label: '🏛️ 사원 연구 트랙', icon: '🔍' },
            { id: 'scoring', label: '🏆 카드 덱 & 최종 승점표', icon: '⭐' }
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab(tab.id as TabType);
                }}
                style={{
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isSelected ? '3px solid #10b981' : '3px solid transparent',
                  color: isSelected ? '#10b981' : '#94a3b8',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            flex: 1,
            lineHeight: 1.6,
            fontSize: '14px',
            color: '#cbd5e1'
          }}
        >
          {activeTab === 'overview' && (
            <div>
              <h3 style={{ color: '#34d399', marginTop: 0, fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🗺️</span> 태고의 신비를 간직한 미지의 섬 아르낙
              </h3>
              <p>
                플레이어는 고고학 원정대를 이끌고 미지의 섬 아르낙을 탐험합니다. 
                정글 속에 숨겨진 고대 유적을 발굴하고, 유적을 지키는 전설의 수호자를 제압하며, 
                잃어버린 사원의 정상으로 향하는 연구 트랙을 조사하여 최고 득점을 올려야 합니다.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', margin: '20px 0' }}>
                <div style={{ background: '#09101d', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                  <h4 style={{ color: '#38bdf8', margin: '0 0 8px 0', fontSize: '15px' }}>1. 라운드 진행 (총 5라운드)</h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#94a3b8' }}>
                    <li>매 라운드마다 덱에서 <strong>5장의 카드</strong>를 드로우하여 시작합니다.</li>
                    <li>차례대로 <strong>주 행동 1회</strong>를 수행합니다 (일꾼 파견, 카드 구매, 연구 트랙 전진, 수호자 제압 등).</li>
                    <li>모든 플레이어가 패스하면 일꾼이 귀가하고 수호자 공포를 정산한 뒤 다음 라운드로 진행됩니다.</li>
                  </ul>
                </div>

                <div style={{ background: '#09101d', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                  <h4 style={{ color: '#fbbf24', margin: '0 0 8px 0', fontSize: '15px' }}>2. 5대 탐험 자원</h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#94a3b8' }}>
                    <li>🪙 <strong>코인</strong>: 탐험 장비 카드 구매에 소모.</li>
                    <li>🧭 <strong>나침반</strong>: 미발굴지 개척 및 고대 유물 카드 발굴에 소모.</li>
                    <li>📜 <strong>석판</strong> / 🏹 <strong>화살촉</strong> / 💎 <strong>보석</strong>: 연구 트랙 전진 및 수호자 제압에 필수적인 고고학 유물.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sites' && (
            <div>
              <h3 style={{ color: '#34d399', marginTop: 0, fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🧭</span> 발굴지 탐험 및 고고학자 일꾼 파견
              </h3>
              <p>
                플레이어는 매 라운드 <strong>2명의 고고학자</strong> 일꾼을 보유합니다. 발굴지에 일꾼을 보내 즉시 막대한 자원을 획득할 수 있습니다.
              </p>

              <div style={{ background: '#09101d', borderRadius: '12px', border: '1px solid #1e293b', padding: '16px', margin: '16px 0' }}>
                <h4 style={{ color: '#fbbf24', margin: '0 0 12px 0', fontSize: '14px' }}>발굴지 티어별 규칙</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
                    <div style={{ fontWeight: 700, color: '#94a3b8' }}>⛺ 베이스캠프 (레벨 0)</div>
                    <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>
                      나침반 소모 없음. 강가, 덤불, 진흙 등에서 기초 자원을 즉시 채집.
                    </div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', border: '1px solid #10b981' }}>
                    <div style={{ fontWeight: 700, color: '#34d399' }}>🏞️ 1티어 유적지 (레벨 1)</div>
                    <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>
                      최초 발견 시 <strong>나침반 3개</strong> 소모. 보석, 화살촉 등 고급 자원 획득 및 <strong>수호자 1체 출현</strong>!
                    </div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', border: '1px solid #f59e0b' }}>
                    <div style={{ fontWeight: 700, color: '#fbbf24' }}>🛕 2티어 심층 유적 (레벨 2)</div>
                    <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>
                      최초 발견 시 <strong>나침반 6개</strong> 소모. 보석 2개 등 막대한 보상 지급!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guardians' && (
            <div>
              <h3 style={{ color: '#34d399', marginTop: 0, fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚔️</span> 고대 수호자(Guardians)와의 조우 및 제압
              </h3>
              <p>
                새로운 유적지를 발견하면 고대의 야수나 마법 골렘 같은 <strong>수호자</strong>가 깨어납니다!
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px', margin: '16px 0' }}>
                <div style={{ background: '#09101d', padding: '14px', borderRadius: '10px', border: '1px solid #ef4444' }}>
                  <h4 style={{ color: '#f87171', margin: '0 0 8px 0', fontSize: '14px' }}>⚠️ 수호자의 공포(Fear) 위협</h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#cbd5e1' }}>
                    <li>수호자가 깨어있는 발굴지에 고고학자가 남아있는 상태로 라운드가 종료되면, <strong>공포 카드(게임 종료 시 1장당 -1점 감점)</strong>를 얻습니다!</li>
                    <li>공포 카드는 덱을 오염시켜 중요한 드로우를 방해합니다.</li>
                  </ul>
                </div>

                <div style={{ background: '#09101d', padding: '14px', borderRadius: '10px', border: '1px solid #10b981' }}>
                  <h4 style={{ color: '#34d399', margin: '0 0 8px 0', fontSize: '14px' }}>🛡️ 수호자 제압 및 승점 (+5점)</h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#cbd5e1' }}>
                    <li>수호자에 표시된 자원(화살촉, 보석, 석판 등)을 지불하면 즉시 제압할 수 있습니다.</li>
                    <li>제압된 수호자는 내 수집함으로 들어오며, <strong>게임 종료 시 1체당 5점의 큰 승점</strong>을 제공합니다!</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'research' && (
            <div>
              <h3 style={{ color: '#34d399', marginTop: 0, fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🔍</span> 잃어버린 사원 연구 트랙 (Research Track)
              </h3>
              <p>
                사원 연구 트랙은 아르낙에서 가장 많은 점수를 획득할 수 있는 핵심 시스템입니다.
                플레이어는 <strong>돋보기(Magnifying Glass 🔍)</strong>와 <strong>연구 수첩(Research Book 📖)</strong> 2개의 말을 전진시킵니다.
              </p>

              <div style={{ background: '#09101d', borderRadius: '12px', border: '1px solid #1e293b', padding: '16px', margin: '14px 0' }}>
                <h4 style={{ color: '#38bdf8', margin: '0 0 10px 0', fontSize: '14px' }}>공식 연구 규칙 제약</h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#cbd5e1' }}>
                  <li><strong>돋보기 우선 전진 원칙</strong>: 연구 수첩은 돋보기가 탐사해 둔 지점보다 앞설 수 없습니다 (최대 동일 위치까지만 전진 가능).</li>
                  <li><strong>단계별 보상</strong>: 트랙을 한 단계 전진할 때마다 즉시 석판, 보석 등의 귀중한 보너스 자원을 받습니다.</li>
                  <li><strong>사원 최상층(5단계) 선착순 보너스</strong>: 사원의 정상에 먼저 도달한 플레이어는 <strong>+11점, +8점, +6점</strong>의 최고가 사원 타일을 선점합니다.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'scoring' && (
            <div>
              <h3 style={{ color: '#34d399', marginTop: 0, fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🏆</span> 최종 승점(VP) 상세 정산 공식
              </h3>
              <p>5라운드가 끝나면 다음 4가지 항목의 점수를 모두 합산하여 최종 우승자를 가립니다.</p>

              <div style={{ background: '#09101d', borderRadius: '12px', border: '1px solid #1e293b', padding: '16px', margin: '14px 0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '8px', color: '#94a3b8' }}>연구 트랙 점수</td>
                      <td style={{ padding: '8px', fontWeight: 700, color: '#34d399' }}>
                        돋보기 도달 점수 (최대 25점) + 연구 수첩 도달 점수 (최대 20점)
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '8px', color: '#94a3b8' }}>사원 보너스 타일</td>
                      <td style={{ padding: '8px', fontWeight: 700, color: '#fbbf24' }}>
                        사원 최상층에서 획득한 타일 점수 (+11, +8, +6점 등)
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '8px', color: '#94a3b8' }}>제압한 수호자</td>
                      <td style={{ padding: '8px', fontWeight: 700, color: '#f43f5e' }}>
                        제압 성공한 수호자 <strong>1체당 +5점</strong>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '8px', color: '#94a3b8' }}>카드 점수</td>
                      <td style={{ padding: '8px', fontWeight: 700, color: '#38bdf8' }}>
                        덱/핸드/버린 카드에 있는 장비 및 유물 카드의 고유 승점
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px', color: '#ef4444' }}>공포 감점 페널티</td>
                      <td style={{ padding: '8px', fontWeight: 700, color: '#ef4444' }}>
                        보유한 공포 카드 <strong>1장당 -1점 감점</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #334155',
            backgroundColor: '#09101d',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            style={{
              padding: '10px 24px',
              backgroundColor: '#10b981',
              border: 'none',
              borderRadius: '8px',
              color: '#022c22',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
          >
            확인 및 탐험 계속하기
          </button>
        </div>
      </div>
    </div>
  );
};
