import React from 'react';
import { usePuertoRicoStore } from '../store/usePuertoRicoStore';
import { ScrollText } from 'lucide-react';

export const GameLog: React.FC = () => {
  const { actionLogs, round } = usePuertoRicoStore();

  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '480px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ScrollText size={18} color="var(--gold-primary)" />
          <h4 className="font-serif" style={{ fontSize: '0.95rem', color: '#f8fafc', margin: 0 }}>
            게임 로그 (Log)
          </h4>
        </div>
        <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
          라운드 {round}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
        {actionLogs.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', marginTop: '20px' }}>
            기록된 행동이 없습니다.
          </div>
        ) : (
          actionLogs.map(log => {
            let textColor = '#e2e8f0';
            let borderLeftColor = 'transparent';

            if (log.type === 'role') {
              textColor = '#fcd34d';
              borderLeftColor = 'var(--gold-primary)';
            } else if (log.type === 'reward') {
              textColor = '#86efac';
              borderLeftColor = '#22c55e';
            } else if (log.type === 'trade') {
              textColor = '#67e8f9';
              borderLeftColor = '#06b6d4';
            } else if (log.type === 'ship') {
              textColor = '#93c5fd';
              borderLeftColor = '#3b82f6';
            }

            return (
              <div
                key={log.id}
                style={{
                  padding: '6px 8px',
                  borderRadius: '4px',
                  background: 'rgba(15, 23, 42, 0.5)',
                  borderLeft: `3px solid ${borderLeftColor}`,
                  fontSize: '0.78rem',
                  lineHeight: 1.4,
                  color: textColor
                }}
              >
                <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', marginRight: '6px' }}>
                  {log.timestamp}
                </span>
                {log.text}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
