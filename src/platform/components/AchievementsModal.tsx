import React, { useState } from 'react';
import { usePlatformStore } from '../store/usePlatformStore';
import type { AchievementCategory } from '../types';
import { Award, Lock, CheckCircle2, X } from 'lucide-react';

interface AchievementsModalProps {
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ onClose }) => {
  const { achievements } = usePlatformStore();
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');

  const categories: { id: AchievementCategory | 'all'; label: string }[] = [
    { id: 'all', label: '전체 도감' },
    { id: 'common', label: '플랫폼 공통' },
    { id: 'puerto-rico', label: '푸에르토리코' },
    { id: 'burgundy', label: '버건디의 성' },
    { id: 'le-havre', label: '르아브르' },
    { id: 'caverna', label: '카베르나' },
    { id: 'arnak', label: '아르낙' },
    { id: 'terraforming-mars', label: '테라포밍 마스' }
  ];

  const totalCount = achievements.length;
  const unlockedCount = achievements.filter(a => a.unlockedAt !== null).length;
  const progressPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === selectedCategory);

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
      zIndex: 400,
      padding: '20px'
    }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '860px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(145deg, #131a2a 0%, #0c101d 100%)',
          border: '1.5px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
        }}
      >
        {/* 상단 헤더 */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(20, 27, 43, 0.7)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(245, 158, 11, 0.4)'
            }}>
              <Award size={20} color="#1c1103" />
            </div>
            <div>
              <h2 className="font-serif text-gold-gradient" style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>
                마스터피스 업적 컬렉션 (Achievements)
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                총 {totalCount}개의 고유 마일스톤 중 {unlockedCount}개 달성 ({progressPercent}%)
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '6px 10px', borderRadius: '8px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 진행률 바 & 카테고리 탭 바 */}
        <div style={{ padding: '16px 24px 0 24px', background: 'rgba(0,0,0,0.2)' }}>
          {/* 달성 진행 바 */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '4px' }}>
              <span>컬렉션 완성도</span>
              <strong style={{ color: '#f59e0b' }}>{unlockedCount} / {totalCount} ({progressPercent}%)</strong>
            </div>
            <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #f59e0b 0%, #10b981 100%)',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>

          {/* 카테고리 칩 */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '12px' }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: selectedCategory === cat.id ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: selectedCategory === cat.id ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: selectedCategory === cat.id ? '#f59e0b' : '#94a3b8'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 본문 그리드 (업적 카드 목록) */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '14px'
        }}>
          {filteredAchievements.map(ach => {
            const isUnlocked = ach.unlockedAt !== null;

            return (
              <div
                key={ach.id}
                style={{
                  background: isUnlocked 
                    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)'
                    : 'rgba(15, 20, 30, 0.4)',
                  border: isUnlocked 
                    ? '1.5px solid rgba(245, 158, 11, 0.6)' 
                    : '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  gap: '12px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isUnlocked ? '0 4px 16px rgba(245, 158, 11, 0.15)' : 'none',
                  opacity: isUnlocked ? 1 : 0.65
                }}
              >
                {/* 엠블럼 / 자물쇠 */}
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: isUnlocked 
                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isUnlocked ? '1.5rem' : '1.1rem',
                  color: isUnlocked ? '#fff' : '#64748b',
                  flexShrink: 0
                }}>
                  {isUnlocked ? ach.icon : <Lock size={18} />}
                </div>

                {/* 텍스트 내용 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <div style={{
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: isUnlocked ? '#ffffff' : '#94a3b8',
                      lineHeight: 1.2
                    }}>
                      {ach.title}
                    </div>
                    {isUnlocked && <CheckCircle2 size={13} color="#10b981" />}
                  </div>

                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.3, marginBottom: '6px' }}>
                    {ach.description}
                  </div>

                  <div style={{
                    fontSize: '0.68rem',
                    color: isUnlocked ? '#f59e0b' : '#64748b',
                    background: 'rgba(0, 0, 0, 0.25)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}>
                    {isUnlocked 
                      ? `달성: ${new Date(ach.unlockedAt!).toLocaleDateString()}` 
                      : `조건: ${ach.conditionDesc}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 하단 푸터 */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'flex-end',
          background: 'rgba(10, 15, 26, 0.8)'
        }}>
          <button
            className="btn-gold"
            onClick={onClose}
            style={{ padding: '8px 20px', fontSize: '0.88rem' }}
          >
            확인
          </button>
        </div>

      </div>
    </div>
  );
};
