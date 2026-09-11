import React, { useState } from 'react';
import { soundManager } from '../../../utils/sound';

interface CavernaRuleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'overview' | 'dwarfs' | 'furnishings' | 'farming' | 'scoring';

export const CavernaRuleGuideModal: React.FC<CavernaRuleGuideModalProps> = ({ isOpen, onClose }) => {
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
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
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
          backgroundColor: '#1e293b',
          border: '1px solid #475569',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
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
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>⛏️</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                카베르나: 동굴 농부들 (Caverna) 공식 게임 가이드
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                우베 로젠베르크의 명작 일꾼 놓기 & 동굴/농경 개발 전략 완벽 가이드
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
            backgroundColor: '#0f172a',
            padding: '0 16px',
            gap: '8px',
            overflowX: 'auto'
          }}
        >
          {[
            { id: 'overview', label: '📖 게임 개요 & 흐름', icon: '⛰️' },
            { id: 'dwarfs', label: '🧔 일꾼 & 무기 원정', icon: '⚔️' },
            { id: 'furnishings', label: '🏠 동굴 발굴 & 12개 방', icon: '🛋️' },
            { id: 'farming', label: '🌾 농경 개간 & 가축', icon: '🐑' },
            { id: 'scoring', label: '🏆 수확 & 최종 승점표', icon: '⭐' }
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
                  borderBottom: isSelected ? '3px solid #f59e0b' : '3px solid transparent',
                  color: isSelected ? '#f59e0b' : '#94a3b8',
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
              <h3 style={{ color: '#f59e0b', marginTop: 0, fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⛰️</span> 동굴을 파고 숲을 일구는 드워프 부족의 번영
              </h3>
              <p>
                플레이어는 산비탈에 자리 잡은 드워프 가족의 족장이 되어 <strong>동굴 보드(좌측)</strong>와 <strong>농경 보드(우측)</strong>를
                가꾸게 됩니다. 동굴에서는 암석을 채굴하여 광석/루비를 캐고 아늑한 방을 건설하며, 숲에서는 나무를 베고 화전을 일구어 농작물을 파종하고 가축을 목축합니다.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', margin: '20px 0' }}>
                <div style={{ background: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
                  <h4 style={{ color: '#38bdf8', margin: '0 0 8px 0', fontSize: '15px' }}>1. 라운드 구조 (총 12라운드)</h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#94a3b8' }}>
                    <li><strong>자원 누적</strong>: 행동 칸에 목재, 광석, 식량 등이 매 턴마다 자동으로 쌓입니다.</li>
                    <li><strong>일꾼 배치</strong>: 차례대로 드워프 1명씩 비어있는 행동 칸에 배치합니다.</li>
                    <li><strong>귀가 및 수확</strong>: 일꾼이 귀가하며, 수확 라운드에서는 작물 수확 및 식량 지불, 가축 번식이 일어납니다.</li>
                  </ul>
                </div>

                <div style={{ background: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
                  <h4 style={{ color: '#ec4899', margin: '0 0 8px 0', fontSize: '15px' }}>2. 드워프의 만능 보석: 루비(Ruby 💎)</h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#94a3b8' }}>
                    <li>루비는 언제든지 조커 자원으로 사용할 수 있습니다.</li>
                    <li><strong>1 루비</strong> = <strong>식량 2</strong> 즉시 교환 (밥먹이기 부족 시 자동 변환).</li>
                    <li><strong>1 루비</strong> = <strong>나무 1 / 돌 1 / 광석 1</strong> 또는 <strong>가축 1마리</strong>로 즉시 교환 가능.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dwarfs' && (
            <div>
              <h3 style={{ color: '#f59e0b', marginTop: 0, fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚔️</span> 드워프 무기 단조와 영웅적인 원정(Expeditions)
              </h3>
              <p>
                드워프는 광석(Ore 🪨)을 소모하여 <strong>무기(Weapons)</strong>를 단조할 수 있습니다. 
                무기를 장착한 드워프는 원정 칸을 이용할 때 전리품을 획득하며, 원정을 다녀올 때마다 <strong>무기 레벨이 영구히 +1씩 상승</strong>합니다 (최대 14레벨).
              </p>

              <div style={{ background: '#0f172a', borderRadius: '12px', border: '1px solid #334155', padding: '16px', margin: '16px 0' }}>
                <h4 style={{ color: '#fbbf24', margin: '0 0 12px 0', fontSize: '14px' }}>무기 레벨별 획득 가능한 대표 전리품</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px', border: '1px solid #475569' }}>
                    <div style={{ fontWeight: 700, color: '#38bdf8' }}>Lv 1 ~ 3 원정</div>
                    <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>나무 1, 식량 1, 돌 1, 양 1마리</div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px', border: '1px solid #475569' }}>
                    <div style={{ fontWeight: 700, color: '#a855f7' }}>Lv 4 ~ 8 원정</div>
                    <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>멧돼지 1마리, 광석 2, 금화 1, 밭 개간 1회</div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px', border: '1px solid #475569' }}>
                    <div style={{ fontWeight: 700, color: '#f43f5e' }}>Lv 9 ~ 14 원정</div>
                    <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>소 1마리, 루비 1개, 무료 방 건축 1회</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'furnishings' && (
            <div>
              <h3 style={{ color: '#f59e0b', marginTop: 0, fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🛋️</span> 동굴 발굴 및 12대 방 타일(Furnishings)
              </h3>
              <p>
                단단한 바위 동굴을 발굴(Cavern)하면 비어있는 동굴 슬롯이 생깁니다. 여기에 목재와 석재를 지불하여 강력한 보너스 방을 건축할 수 있습니다.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginTop: '14px' }}>
                {[
                  { name: '기본 거주방 (Dwelling)', cost: '나무 4 + 돌 3', vp: '3점', desc: '새로운 드워프를 출산할 수 있는 기본 주거 공간.' },
                  { name: '단일 거주방 (Simple Dwelling)', cost: '나무 4 + 돌 2', vp: '0점', desc: '저렴하게 드워프를 늘릴 수 있는 소형 방.' },
                  { name: '착유실 (Milking Parlor)', cost: '나무 2 + 돌 2', vp: '2점', desc: '수확마다 소 1마리당 식량 1개 추가 생산.' },
                  { name: '직조실 (Weaving Parlor)', cost: '나무 2 + 돌 1', vp: '2점', desc: '수확마다 양 1마리당 식량 1개 추가 생산.' },
                  { name: '단조 공방 (Smithy)', cost: '돌 2 + 광석 2', vp: '3점', desc: '무기 단조 시 광석 요구량 1개 할인.' },
                  { name: '보물창고 (Treasure Room)', cost: '돌 1 + 루비 1', vp: '4점', desc: '게임 종료 시 보유한 루비 1개당 추가 +1점.' },
                  { name: '맥주 양조장 (Brewery)', cost: '나무 1 + 돌 2', vp: '2점', desc: '수확마다 곡물 1개를 식량 3개로 양조.' },
                  { name: '목공소 (Carpenter Shop)', cost: '나무 1 + 돌 1', vp: '2점', desc: '모든 방 건설 시 나무 1개 할인.' }
                ].map((f, i) => (
                  <div key={i} style={{ background: '#0f172a', padding: '12px', borderRadius: '10px', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '13px' }}>{f.name}</span>
                      <span style={{ background: '#f59e0b22', color: '#f59e0b', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>{f.vp}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '4px' }}>비용: {f.cost}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'farming' && (
            <div>
              <h3 style={{ color: '#f59e0b', marginTop: 0, fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🌾</span> 숲 개간, 화전, 파종 및 가축 목축
              </h3>
              <p>
                농경 보드(우측)는 울창한 숲으로 덮여 있습니다. 도끼로 나무를 베고 불을 질러 화전 밭을 일구거나 울타리를 쳐서 가축을 키워야 합니다.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px', margin: '16px 0' }}>
                <div style={{ background: '#0f172a', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
                  <h4 style={{ color: '#22c55e', margin: '0 0 8px 0', fontSize: '14px' }}>🌱 밭 파종 (Sowing)</h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#cbd5e1' }}>
                    <li><strong>곡물(Grain) 파종</strong>: 밭에 곡물 1개를 심으면 공급처에서 2개를 가져와 총 3단으로 쌓입니다.</li>
                    <li><strong>호박(Pumpkin) 파종</strong>: 밭에 호박 1개를 심으면 공급처에서 1개를 가져와 총 2단으로 쌓입니다.</li>
                    <li>수확기마다 맨 위의 작물 1개씩 내 창고로 수확됩니다.</li>
                  </ul>
                </div>

                <div style={{ background: '#0f172a', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
                  <h4 style={{ color: '#eab308', margin: '0 0 8px 0', fontSize: '14px' }}>🐑 4대 가축 사육 및 번식</h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#cbd5e1' }}>
                    <li><strong>양(Sheep), 멧돼지(Boar), 소(Cattle), 당나귀(Donkey)</strong> 4종의 가축이 존재합니다.</li>
                    <li>가축은 <strong>울타리 친 목초지(Pasture)</strong>나 외양간에서 안전하게 살 수 있습니다.</li>
                    <li>수확 시 <strong>같은 가축이 2마리 이상</strong> 있으면 아기 가축 1마리가 번식합니다!</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scoring' && (
            <div>
              <h3 style={{ color: '#f59e0b', marginTop: 0, fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🏆</span> 수확기 밥먹이기 & 최종 승점 계산표
              </h3>
              <p>
                수확 라운드에서는 드워프 1명당 <strong>식량 2개</strong>를 먹여야 합니다 (부족 시 루비 1개=식량 2개로 자동 환전되며, 그래도 부족하면 구걸 감점표 -3점).
              </p>

              <div style={{ background: '#0f172a', borderRadius: '12px', border: '1px solid #334155', padding: '16px', margin: '14px 0' }}>
                <h4 style={{ color: '#38bdf8', margin: '0 0 10px 0', fontSize: '14px' }}>최종 승점(VP) 상세 정산 공식</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '8px', color: '#94a3b8' }}>드워프 일꾼</td>
                      <td style={{ padding: '8px', fontWeight: 700, color: '#f8fafc' }}>드워프 1명당 1점</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '8px', color: '#94a3b8' }}>가축 4종</td>
                      <td style={{ padding: '8px', fontWeight: 700, color: '#f8fafc' }}>
                        가축 1마리당 1점 (소는 2점) / 단, 없는 가축 종류당 <strong>-2점 페널티</strong>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '8px', color: '#94a3b8' }}>작물 및 보석</td>
                      <td style={{ padding: '8px', fontWeight: 700, color: '#f8fafc' }}>
                        곡물 2개당 1점, 호박 1개당 1점, <strong>루비 1개당 1점</strong>, 금화 1원당 1점
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '8px', color: '#94a3b8' }}>건축된 방 타일</td>
                      <td style={{ padding: '8px', fontWeight: 700, color: '#f59e0b' }}>각 방에 적힌 고유 승점 및 보너스 점수</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px', color: '#ef4444' }}>미개간 공간 페널티</td>
                      <td style={{ padding: '8px', fontWeight: 700, color: '#ef4444' }}>
                        개발되지 않은 빈 동굴/숲 슬롯당 <strong>-1점 감점</strong>
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
            backgroundColor: '#0f172a',
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
              backgroundColor: '#f59e0b',
              border: 'none',
              borderRadius: '8px',
              color: '#0f172a',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}
          >
            확인 및 게임 계속하기
          </button>
        </div>
      </div>
    </div>
  );
};
