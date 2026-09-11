import React, { useState } from 'react';
import { soundManager } from '../../../utils/sound';

interface TMRuleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'overview' | 'parameters' | 'resources' | 'map' | 'scoring';

export const TMRuleGuideModal: React.FC<TMRuleGuideModalProps> = ({ isOpen, onClose }) => {
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
        backgroundColor: 'rgba(5, 5, 10, 0.85)',
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
          border: '1px solid #ef4444',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.4)',
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
            background: 'linear-gradient(135deg, #7f1d1d 0%, #0f172a 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>🚀</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                테라포밍 마스 (Terraforming Mars) 공식 게임 가이드
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#fca5a5' }}>
                BGG 최고 평점 엔진 빌딩 & 화성 개발 전략 보드게임 완벽 가이드
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
            backgroundColor: '#090d16',
            padding: '0 16px',
            gap: '8px',
            overflowX: 'auto'
          }}
        >
          {[
            { id: 'overview', label: '📖 게임 개요 & 세대 흐름', icon: '🚀' },
            { id: 'parameters', label: '🌡️ 3대 글로벌 파라미터 & TR', icon: '🌍' },
            { id: 'resources', label: '🏭 6대 자원 & 생산 단계', icon: '⚡' },
            { id: 'map', label: '🗺️ 화성 지도 & 타일 배치', icon: '🌲' },
            { id: 'scoring', label: '🏆 표준 프로젝트 & 승점 계산', icon: '⭐' }
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
                  borderBottom: isSelected ? '3px solid #ef4444' : '3px solid transparent',
                  color: isSelected ? '#ef4444' : '#94a3b8',
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
              <h3 style={{ color: '#f87171', marginTop: 0, fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🚀</span> 거대 기업의 화성 테라포밍 프로젝트
              </h3>
              <p>
                플레이어는 지구 정부의 승인을 받은 거대 기업의 총수가 되어, 붉은 행성 화성을 인류가 살 수 있는 녹색 행성으로 탈바꿈시킵니다.
                <strong>온도, 산소, 해양</strong> 3대 파라미터를 완성하고 자원 생산 엔진을 구축하여 가장 높은 테라포밍 기여도(TR)와 기업 승점을 달성해야 합니다.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', margin: '20px 0' }}>
                <div style={{ background: '#090d16', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                  <h4 style={{ color: '#38bdf8', margin: '0 0 8px 0', fontSize: '15px' }}>1. 세대(Generation) 진행 구조</h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#94a3b8' }}>
                    <li><strong>행동 단계</strong>: 차례대로 1~2회의 행동을 수행합니다 (프로젝트 카드 플레이, 표준 프로젝트 실행, 식물/열 전환).</li>
                    <li>모든 플레이어가 패스하면 <strong>생산 단계</strong>가 시작됩니다.</li>
                    <li>생산 단계에서는 남은 에너지가 열로 전환되고 각 자원 생산량만큼 창고에 보충됩니다.</li>
                  </ul>
                </div>

                <div style={{ background: '#090d16', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                  <h4 style={{ color: '#ef4444', margin: '0 0 8px 0', fontSize: '15px' }}>2. 테라포밍 완료 및 게임 종료</h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#94a3b8' }}>
                    <li><strong>기온 +8°C 도달</strong></li>
                    <li><strong>산소 농도 14% 도달</strong></li>
                    <li><strong>해양 타일 9개 모두 배치</strong></li>
                    <li>3대 글로벌 파라미터가 모두 충족되면 해당 세대를 끝으로 최종 승점을 집계합니다.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'parameters' && (
            <div>
              <h3 style={{ color: '#f87171', marginTop: 0, fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🌍</span> 3대 글로벌 파라미터 & TR (Terraform Rating)
              </h3>
              <p>
                플레이어가 화성의 환경을 개선할 때마다 <strong>테라포밍 등급(TR)</strong>이 영구히 1씩 상승합니다.
                TR은 <strong>매 세대 생산되는 고정 메가크레딧(M€) 수입</strong>이자, <strong>게임 종료 시 1점당 1점의 승점</strong>이 됩니다!
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', margin: '16px 0' }}>
                <div style={{ background: '#090d16', padding: '14px', borderRadius: '10px', border: '1px solid #ef4444' }}>
                  <h4 style={{ color: '#ef4444', margin: '0 0 6px 0', fontSize: '14px' }}>🌡️ 기온 (-30°C ➔ +8°C)</h4>
                  <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                    열 8개를 소모하거나 소행성을 충돌시켜 2°C씩 상승시킵니다. 상승할 때마다 TR +1.
                  </div>
                </div>

                <div style={{ background: '#090d16', padding: '14px', borderRadius: '10px', border: '1px solid #10b981' }}>
                  <h4 style={{ color: '#10b981', margin: '0 0 6px 0', fontSize: '14px' }}>🍃 산소 농도 (0% ➔ 14%)</h4>
                  <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                    녹지 타일을 배치하여 1%씩 상승시킵니다. 상승할 때마다 TR +1.
                  </div>
                </div>

                <div style={{ background: '#090d16', padding: '14px', borderRadius: '10px', border: '1px solid #06b6d4' }}>
                  <h4 style={{ color: '#06b6d4', margin: '0 0 6px 0', fontSize: '14px' }}>🌊 해양 타일 (총 9개)</h4>
                  <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                    대양 슬롯에 바다를 채웁니다. 배치할 때마다 TR +1 및 인접 타일 2M€ 보너스.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div>
              <h3 style={{ color: '#f87171', marginTop: 0, fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🏭</span> 6대 자원 & 생산 단계 (Production Phase)
              </h3>
              <p>
                테라포밍 마스는 <strong>보유 창고 자원</strong>과 매 세대 공급되는 <strong>생산량(Production)</strong>이 완벽히 분리되어 있습니다.
              </p>

              <div style={{ background: '#090d16', borderRadius: '12px', border: '1px solid #1e293b', padding: '16px', margin: '14px 0' }}>
                <h4 style={{ color: '#fbbf24', margin: '0 0 10px 0', fontSize: '14px' }}>핵심 생산 공식</h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#cbd5e1' }}>
                  <li><strong>메가크레딧(M€) 획득</strong>: <code>내 TR + M€ 생산량</code> 만큼 즉시 현금으로 수령합니다.</li>
                  <li><strong>에너지 ➔ 열 자동 전환</strong>: 사용하지 않고 남은 에너지는 모두 <strong>열(Heat) 창고</strong>로 자동 이동합니다. 그 후 에너지 생산량만큼 새 에너지가 채워집니다.</li>
                  <li><strong>강철 & 티타늄 할인</strong>: 건물 태그 카드는 강철 1개당 2M€, 우주 태그 카드는 티타늄 1개당 3M€의 가치로 비용을 대체할 수 있습니다.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'map' && (
            <div>
              <h3 style={{ color: '#f87171', marginTop: 0, fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🗺️</span> 화성 헥스 표면 개발 & 타일 배치 규칙
              </h3>
              <p>
                화성 표면에 타일을 배치하면 즉시 해당 칸의 지표면 보너스(식물, 강철 등)를 수령합니다.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px', margin: '16px 0' }}>
                <div style={{ background: '#090d16', padding: '14px', borderRadius: '10px', border: '1px solid #10b981' }}>
                  <h4 style={{ color: '#10b981', margin: '0 0 8px 0', fontSize: '14px' }}>🌲 녹지 타일 (Greenery)</h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#cbd5e1' }}>
                    <li><strong>식물 8개</strong>(에코라인은 7개)를 소비하여 즉시 화성에 녹지를 심습니다.</li>
                    <li>산소 농도 +1% 및 TR +1 즉시 획득.</li>
                    <li>게임 종료 시 녹지 타일 1개당 <strong>1점의 승점</strong>을 제공합니다.</li>
                  </ul>
                </div>

                <div style={{ background: '#090d16', padding: '14px', borderRadius: '10px', border: '1px solid #9333ea' }}>
                  <h4 style={{ color: '#c084fc', margin: '0 0 8px 0', fontSize: '14px' }}>🏙️ 도시 타일 (City)</h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#cbd5e1' }}>
                    <li>기본적으로 다른 도시와 인접하지 않은 곳에 건설합니다.</li>
                    <li>게임 종료 시 <strong>해당 도시와 맞닿은 모든 녹지 타일 1개당 1점씩</strong> 승점을 얻습니다!</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scoring' && (
            <div>
              <h3 style={{ color: '#f87171', marginTop: 0, fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🏆</span> 최종 기업 승점 상세 집계표
              </h3>
              <p>모든 글로벌 파라미터가 달성되면 다음 4가지 항목을 합산하여 화성 최고의 기업을 결정합니다.</p>

              <div style={{ background: '#090d16', borderRadius: '12px', border: '1px solid #1e293b', padding: '16px', margin: '14px 0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '8px', color: '#94a3b8' }}>테라포밍 등급 (TR)</td>
                      <td style={{ padding: '8px', fontWeight: 700, color: '#f87171' }}>최종 TR 1점당 1점의 기본 승점</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '8px', color: '#94a3b8' }}>보유 녹지 타일 점수</td>
                      <td style={{ padding: '8px', fontWeight: 700, color: '#10b981' }}>내가 소유한 녹지 타일 1개당 1점</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '8px', color: '#94a3b8' }}>도시 타일 인접 녹지 점수</td>
                      <td style={{ padding: '8px', fontWeight: 700, color: '#c084fc' }}>내 도시와 인접한 모든 녹지 타일 1개당 1점 (누구의 녹지든 상관없음!)</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px', color: '#94a3b8' }}>프로젝트 카드 승점</td>
                      <td style={{ padding: '8px', fontWeight: 700, color: '#fbbf24' }}>플레이한 프로젝트 카드에 적힌 고유 승점</td>
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
            backgroundColor: '#090d16',
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
              backgroundColor: '#ef4444',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
            }}
          >
            확인 및 화성 개척 계속하기
          </button>
        </div>
      </div>
    </div>
  );
};
