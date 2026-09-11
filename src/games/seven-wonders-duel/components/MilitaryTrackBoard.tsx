import React from 'react';
import { useDuelStore } from '../store/useDuelStore';
import { Shield, Swords, Award } from 'lucide-react';

export const MilitaryTrackBoard: React.FC = () => {
  const { militaryPosition, availableProgressTokens } = useDuelStore();

  // 트랙 좌표: -9 ~ +9 (총 19단계, 0이 중앙)
  const steps = Array.from({ length: 19 }, (_, i) => i - 9);

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)',
      border: '1.5px solid rgba(245, 158, 11, 0.35)',
      borderRadius: '12px',
      padding: '8px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
    }}>
      {/* 1. 군사 분쟁 트랙 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Swords size={16} color="#ef4444" />
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fca5a5', letterSpacing: '0.5px' }}>
            군사 분쟁 트랙 (MILITARY TRACK)
          </span>
        </div>

        {/* 현재 우세 상태 뱃지 */}
        <div style={{ fontSize: '0.74rem', fontWeight: 700 }}>
          {militaryPosition === 0 && <span style={{ color: '#94a3b8' }}>팽팽한 균형 (중립 0)</span>}
          {militaryPosition > 0 && (
            <span style={{ color: '#38bdf8' }}>
              나(P1) 우세: +{militaryPosition}칸 (승리까지 {9 - militaryPosition}칸)
            </span>
          )}
          {militaryPosition < 0 && (
            <span style={{ color: '#f87171' }}>
              상대(P2) 우세: {Math.abs(militaryPosition)}칸 침공 (패배까지 {9 - Math.abs(militaryPosition)}칸)
            </span>
          )}
        </div>
      </div>

      {/* 2. 트랙 바 (-9 ~ +9) */}
      <div style={{
        position: 'relative',
        background: 'rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '8px',
        padding: '6px 4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* P2 수도 (패배 지점) */}
        <div style={{
          fontSize: '0.65rem',
          fontWeight: 800,
          color: '#f43f5e',
          padding: '2px 6px',
          background: 'rgba(244, 63, 94, 0.15)',
          borderRadius: '4px',
          border: '1px solid rgba(244, 63, 94, 0.3)'
        }}>
          P2 수도 (-9)
        </div>

        {/* 19개 트랙 슬롯 */}
        <div style={{ display: 'flex', gap: '3px', flex: 1, margin: '0 8px', justifyContent: 'center' }}>
          {steps.map(pos => {
            const isPawnHere = militaryPosition === pos;
            const isCenter = pos === 0;
            const isDanger = Math.abs(pos) >= 6;

            return (
              <div
                key={pos}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: isPawnHere
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    : (isCenter ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)'),
                  border: isPawnHere
                    ? '2px solid #ffffff'
                    : (isDanger ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255,255,255,0.05)'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: isPawnHere ? '#ffffff' : (isDanger ? '#fca5a5' : '#64748b'),
                  boxShadow: isPawnHere ? '0 0 12px rgba(239, 68, 68, 0.8)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {isPawnHere ? <Shield size={14} /> : (pos === 0 ? '0' : Math.abs(pos))}
              </div>
            );
          })}
        </div>

        {/* P1 수도 (승리 지점) */}
        <div style={{
          fontSize: '0.65rem',
          fontWeight: 800,
          color: '#38bdf8',
          padding: '2px 6px',
          background: 'rgba(56, 189, 248, 0.15)',
          borderRadius: '4px',
          border: '1px solid rgba(56, 189, 248, 0.3)'
        }}>
          P1 수도 (+9)
        </div>
      </div>

      {/* 3. 과학 진보 토큰 랙 (Progress Tokens) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(15, 23, 42, 0.5)',
        padding: '4px 10px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#34d399', fontWeight: 700, whiteSpace: 'nowrap' }}>
          <Award size={14} /> 과학 진보 토큰:
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {availableProgressTokens.map(token => (
            <div
              key={token.id}
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)',
                border: '1px solid #10b981',
                borderRadius: '6px',
                padding: '2px 8px',
                fontSize: '0.68rem',
                color: '#6ee7b7',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
              title={`${token.name}: ${token.description}`}
            >
              <span>{token.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
