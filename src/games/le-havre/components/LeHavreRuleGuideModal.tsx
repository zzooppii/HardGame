import React, { useState } from 'react';
import { 
  X, BookOpen, Anchor, Factory, Ship, 
  Coins, Utensils, AlertTriangle, ArrowRight 
} from 'lucide-react';
import { soundManager } from '../../../utils/sound';
import { GOODS_DEFINITIONS } from '../data/goods';
import type { ResourceType } from '../types';
import { INITIAL_BUILDINGS } from '../data/buildings';
import { INITIAL_SHIPS } from '../data/ships';

interface LeHavreRuleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type GuideTab = 'overview' | 'docks_turn' | 'processing_table' | 'buildings_ships' | 'harvest_feeding';

export const LeHavreRuleGuideModal: React.FC<LeHavreRuleGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<GuideTab>('overview');

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(3, 7, 18, 0.88)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 500,
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(180deg, #091524 0%, #050c17 100%)',
        border: '1.5px solid rgba(56, 189, 248, 0.4)',
        width: '100%',
        maxWidth: '860px',
        maxHeight: '88vh',
        borderRadius: '16px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 30px rgba(56, 189, 248, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: '#f1f5f9'
      }}>
        
        {/* 헤더 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
          background: 'rgba(10, 25, 47, 0.7)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8'
            }}>
              <BookOpen size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc' }}>
                르아브르 (Le Havre) 공식 규칙 & 전략 가이드
                <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', fontWeight: 600 }}>
                  항구 경제 전략
                </span>
              </h2>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                우베 로젠베르크(Uwe Rosenberg)의 명작 경제 보드게임 완벽 마스터
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            style={{
              padding: '6px',
              color: '#94a3b8',
              background: 'none',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(5, 10, 20, 0.6)',
          padding: '4px 16px 0',
          gap: '6px',
          overflowX: 'auto',
          flexShrink: 0
        }}>
          {[
            { id: 'overview', label: '1. 개요 & 승리 조건', icon: Coins },
            { id: 'docks_turn', label: '2. 턴 진행 & 7대 도크', icon: Anchor },
            { id: 'processing_table', label: '3. 8+8 가공 계통도', icon: Factory },
            { id: 'buildings_ships', label: '4. 건물 & 선박 도감', icon: Ship },
            { id: 'harvest_feeding', label: '5. 수확 & 밥 먹이기', icon: Utensils },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab(tab.id as GuideTab);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  borderRadius: '8px 8px 0 0',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #38bdf8' : '2px solid transparent',
                  background: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                  color: isActive ? '#38bdf8' : '#94a3b8',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 탭 콘텐츠 본문 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '18px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          fontSize: '0.8rem',
          lineHeight: 1.5,
          color: '#cbd5e1'
        }}>
          
          {/* TAB 1: 개요 & 승리 조건 */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                background: 'rgba(52, 211, 153, 0.08)',
                border: '1px solid rgba(52, 211, 153, 0.25)',
                borderRadius: '10px',
                padding: '12px 16px'
              }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '0.9rem', fontWeight: 800, color: '#34d399' }}>
                  ⚓ 게임의 테마와 목표
                </h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#cbd5e1' }}>
                  플레이어는 19세기 프랑스 북서부 해운의 요충지 <strong>르아브르(Le Havre)</strong> 항구의 상인이 되어, 
                  부두로 입항하는 원자재를 확보하고 공장과 가공 시설을 세워 부가가치를 창출하며, 
                  증기선과 호화 여객선을 건조하여 최고의 해운 거물로 성장해야 합니다.
                </p>
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '14px 16px'
              }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Coins size={15} color="#facc15" />
                  최종 순자산(Net Worth) 승리 공식
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center' }}>
                  <div style={{ padding: '10px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ color: '#facc15', fontWeight: 800, display: 'block', fontSize: '0.85rem' }}>보유 현금</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: '4px', display: 'block' }}>1 프랑 = 1점</span>
                  </div>
                  <div style={{ padding: '10px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ color: '#38bdf8', fontWeight: 800, display: 'block', fontSize: '0.85rem' }}>보유 건물 가치</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: '4px', display: 'block' }}>건물 승점 (VP)</span>
                  </div>
                  <div style={{ padding: '10px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ color: '#60a5fa', fontWeight: 800, display: 'block', fontSize: '0.85rem' }}>보유 선박 가치</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: '4px', display: 'block' }}>선박 가치 (VP)</span>
                  </div>
                  <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <span style={{ color: '#f87171', fontWeight: 800, display: 'block', fontSize: '0.85rem' }}>미상환 대출</span>
                    <span style={{ color: '#fca5a5', fontSize: '0.72rem', marginTop: '4px', display: 'block' }}>장당 -7점 감점!</span>
                  </div>
                </div>
                <p style={{ margin: '10px 0 0 0', fontSize: '0.72rem', color: '#fde047' }}>
                  💡 자원 자체는 직접적인 점수가 되지 않으므로, 게임 종료 전 가공품이나 현금으로 환전하거나 건물/선박으로 전환해야 합니다.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: 턴 진행 & 7대 도크 */}
          {activeTab === 'docks_turn' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '14px 16px'
              }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>
                  내 턴의 2단계 행동 플로우
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '10px', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                    <span style={{ padding: '2px 6px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', borderRadius: '4px', fontWeight: 800, height: 'fit-content' }}>
                      1단계
                    </span>
                    <div>
                      <strong style={{ color: '#f8fafc', display: 'block' }}>보급선 전진 (Supply Ship Movement)</strong>
                      <span>7개 램프 트랙 중 다음 칸으로 이동하며, 해당 타일에 그려진 2종류의 도크에 상품이 1개씩 추가됩니다.</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                    <span style={{ padding: '2px 6px', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', borderRadius: '4px', fontWeight: 800, height: 'fit-content' }}>
                      2단계
                    </span>
                    <div>
                      <strong style={{ color: '#f8fafc', display: 'block' }}>주 행동 수행 (메인 액션 택 1)</strong>
                      <span>
                        • <strong>도크 자원 수령</strong>: 7개 부두 중 하나를 선택해 지금까지 누적된 자원을 전부 내 창고로 가져옵니다.<br />
                        • <strong>건물 입장</strong>: 비어있는 건물에 일꾼을 배치하고 해당 건물의 고유 기능을 수행합니다.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '14px 16px'
              }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>
                  7대 도크(부두) 자원 종류
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '0.72rem' }}>
                  <div style={{ padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    🪙 <strong>프랑 (1 ₣)</strong>
                  </div>
                  <div style={{ padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    🐟 <strong>어획</strong> (식량 1)
                  </div>
                  <div style={{ padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    🪵 <strong>목재</strong> (연료 1, 건축)
                  </div>
                  <div style={{ padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    🧱 <strong>점토</strong> (벽돌 원료)
                  </div>
                  <div style={{ padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    ⛓️ <strong>철</strong> (강철 원료, 선박)
                  </div>
                  <div style={{ padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    🌾 <strong>곡물</strong> (빵 원료, 번식)
                  </div>
                  <div style={{ padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    🐂 <strong>가축</strong> (고기/가죽, 번식)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 8+8 가공 계통도 */}
          {activeTab === 'processing_table' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                background: 'rgba(52, 211, 153, 0.08)',
                border: '1px solid rgba(52, 211, 153, 0.25)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '0.75rem'
              }}>
                💡 르아브르의 핵심은 <strong>원자재를 가공품으로 변환</strong>하여 식량/연료 가치를 끌어올리고, 건축과 선박 건조에 활용하는 것입니다.
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.4)', color: '#94a3b8' }}>
                      <th style={{ padding: '8px 10px' }}>원자재</th>
                      <th style={{ padding: '8px 10px' }}>식량 / 연료</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center' }}>가공</th>
                      <th style={{ padding: '8px 10px' }}>가공품</th>
                      <th style={{ padding: '8px 10px' }}>식량 / 연료</th>
                      <th style={{ padding: '8px 10px' }}>가공 시설</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { raw: 'fish', proc: 'smoked_fish', bldg: '어물 훈제장', icon: '🐟➔🐟' },
                      { raw: 'wood', proc: 'charcoal', bldg: '제탄소', icon: '🪵➔🪵' },
                      { raw: 'clay', proc: 'brick', bldg: '벽돌 가마', icon: '🧱➔🧱' },
                      { raw: 'iron', proc: 'steel', bldg: '제철소 (연료 5 필요)', icon: '⛓️➔⛓️' },
                      { raw: 'grain', proc: 'bread', bldg: '제빵소 (연료 1당 빵2개)', icon: '🌾➔🍞' },
                      { raw: 'cattle', proc: 'meat', bldg: '도축장 (가축1=고기2+가죽1)', icon: '🐂➔🥩' },
                      { raw: 'coal', proc: 'coke', bldg: '코크스 오븐', icon: '🪨➔🪨' },
                      { raw: 'hide', proc: 'leather', bldg: '피혁 무두질소', icon: '📜➔👞' },
                    ].map((row, idx) => {
                      const r = GOODS_DEFINITIONS[row.raw as ResourceType];
                      const p = GOODS_DEFINITIONS[row.proc as ResourceType];
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '8px 10px', fontWeight: 700, color: '#f8fafc' }}>
                            <span>{r.icon}</span> {r.name}
                          </td>
                          <td style={{ padding: '8px 10px', color: '#94a3b8' }}>
                            {r.foodValue > 0 && <span style={{ color: '#34d399' }}>식량 {r.foodValue} </span>}
                            {r.fuelValue > 0 && <span style={{ color: '#facc15' }}>연료 {r.fuelValue}</span>}
                            {r.foodValue === 0 && r.fuelValue === 0 && '-'}
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'center', color: '#38bdf8' }}>
                            <ArrowRight size={13} style={{ display: 'inline' }} />
                          </td>
                          <td style={{ padding: '8px 10px', fontWeight: 700, color: '#38bdf8' }}>
                            <span>{p.icon}</span> {p.name}
                          </td>
                          <td style={{ padding: '8px 10px' }}>
                            {p.foodValue > 0 && <span style={{ color: '#34d399', fontWeight: 700 }}>식량 {p.foodValue} </span>}
                            {p.fuelValue > 0 && <span style={{ color: '#facc15', fontWeight: 700 }}>연료 {p.fuelValue}</span>}
                          </td>
                          <td style={{ padding: '8px 10px', color: '#cbd5e1' }}>{row.bldg}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: 건물 & 선박 도감 */}
          {activeTab === 'buildings_ships' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Factory size={15} color="#38bdf8" />
                  주요 건물 14채 목록
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.72rem' }}>
                  {INITIAL_BUILDINGS.map((b) => (
                    <div key={b.id} style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800 }}>
                        <span style={{ color: '#38bdf8' }}>{b.name}</span>
                        <span style={{ color: '#facc15' }}>{b.buyCostFranc} ₣</span>
                      </div>
                      <p style={{ margin: '4px 0', color: '#94a3b8', fontSize: '0.68rem' }}>{b.description}</p>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', display: 'flex', gap: '8px' }}>
                        <span>입장료: {b.entryCost.food ? `식량 ${b.entryCost.food}` : ''} {b.entryCost.franc ? `${b.entryCost.franc} ₣` : ''} {!b.entryCost.food && !b.entryCost.franc ? '무료' : ''}</span>
                        <span>• 가치: {b.value} VP</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Ship size={15} color="#60a5fa" />
                  4대 해운 선박 (조선소에서 건조)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '0.72rem', textAlign: 'center' }}>
                  {INITIAL_SHIPS.map((s) => (
                    <div key={s.id} style={{ padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(96, 165, 250, 0.2)', borderRadius: '8px' }}>
                      <span style={{ fontWeight: 800, color: '#60a5fa', display: 'block', fontSize: '0.8rem' }}>{s.name}</span>
                      <span style={{ color: '#34d399', fontWeight: 700, display: 'block', marginTop: '4px' }}>식량 절감 +{s.foodProvided}</span>
                      <span style={{ color: '#facc15', display: 'block', marginTop: '2px' }}>{s.value} VP / {s.buyCostFranc} ₣</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: 수확 & 밥 먹이기 */}
          {activeTab === 'harvest_feeding' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '14px 16px'
              }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Utensils size={15} color="#34d399" />
                  라운드 종료 수확 & 밥 먹이기 (Harvest & Feeding)
                </h4>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: '#cbd5e1' }}>
                  보급선이 7칸을 이동할 때마다 1라운드가 종료되며 다음 2단계가 자동 진행됩니다:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem' }}>
                  <div style={{ padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                    <strong style={{ color: '#34d399', display: 'block', marginBottom: '2px' }}>1. 수확 (Harvest)</strong>
                    <span>
                      • 곡물(Grain)을 1개 이상 보유 시 <strong>곡물 +1개</strong> 증식.<br />
                      • 가축(Cattle)을 2마리 이상 보유 시 <strong>가축 +1마리</strong> 번식(송아지 출생).
                    </span>
                  </div>

                  <div style={{ padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                    <strong style={{ color: '#facc15', display: 'block', marginBottom: '2px' }}>2. 밥 먹이기 (Feeding)</strong>
                    <span>
                      • 라운드 카드에 지정된 식량(예: R1=3, R2=4, R3=5...)을 지불해야 합니다.<br />
                      • <strong>선박 식량 실드</strong>가 있다면 그만큼 요구량이 영구 감면됩니다.<br />
                      • 남은 식량은 훈제생선, 빵, 고기, 어획 또는 1프랑=1식량으로 자동 지불됩니다.
                    </span>
                  </div>

                  <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px' }}>
                    <strong style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                      <AlertTriangle size={14} />
                      식량 부족 시 긴급 대출 (Loan)
                    </strong>
                    <span>
                      식량이나 현금이 부족하면 자동으로 <strong>대출 증서</strong>를 발행받아 4프랑을 즉시 지급받고 식량을 해결합니다.<br />
                      ⚠️ 대출은 1장당 매 이자 정산 시 1프랑이 나가며, <strong>게임 종료 시 미상환 대출 1장당 -7점 감점</strong>이라는 치명적인 페널티를 받습니다!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* 푸터 */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(10, 25, 47, 0.7)',
          display: 'flex',
          justifyContent: 'flex-end',
          flexShrink: 0
        }}>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            가이드 닫기
          </button>
        </div>

      </div>
    </div>
  );
};
