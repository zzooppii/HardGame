import React, { useEffect } from 'react';
import { usePlatformStore } from '../store/usePlatformStore';
import { Award, X } from 'lucide-react';

export const AchievementToast: React.FC = () => {
  const { latestUnlockedAchievement, clearLatestUnlocked } = usePlatformStore();

  useEffect(() => {
    if (latestUnlockedAchievement) {
      const timer = setTimeout(() => {
        clearLatestUnlocked();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [latestUnlockedAchievement, clearLatestUnlocked]);

  if (!latestUnlockedAchievement) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      zIndex: 9999,
      background: 'linear-gradient(135deg, rgba(20, 25, 40, 0.96) 0%, rgba(10, 14, 26, 0.98) 100%)',
      border: '1.5px solid #f59e0b',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 25px rgba(245, 158, 11, 0.4)',
      borderRadius: '12px',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      maxWidth: '380px',
      animation: 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      backdropFilter: 'blur(10px)'
    }}>
      {/* 엠블럼 아이콘 */}
      <div style={{
        width: '46px',
        height: '46px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.6rem',
        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
        flexShrink: 0
      }}>
        {latestUnlockedAchievement.icon}
      </div>

      {/* 텍스트 내용 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <Award size={13} color="#f59e0b" />
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f59e0b', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            새로운 업적 달성!
          </span>
        </div>
        <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.2, marginBottom: '4px' }}>
          {latestUnlockedAchievement.title}
        </div>
        <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.3 }}>
          {latestUnlockedAchievement.description}
        </div>
      </div>

      {/* 닫기 버튼 */}
      <button
        onClick={clearLatestUnlocked}
        style={{
          background: 'none',
          border: 'none',
          color: '#64748b',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};
