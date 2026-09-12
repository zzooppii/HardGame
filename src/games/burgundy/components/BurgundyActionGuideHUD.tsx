import React from 'react';
import { useBurgundyStore } from '../store/useBurgundyStore';
import { Sparkles, UserPlus, ShoppingBag, Layers, MapPin } from 'lucide-react';

export const BurgundyActionGuideHUD: React.FC = () => {
  const {
    players,
    currentTurnPlayerIndex,
    selectedDieIndex,
    selectedKeySlotIndex,
    takeWorkersAction
  } = useBurgundyStore();

  const currPlayer = players[currentTurnPlayerIndex];
  if (!currPlayer) return null;

  const activeDie = (selectedDieIndex !== null && !currPlayer.usedDice[selectedDieIndex]) ? currPlayer.dice[selectedDieIndex] : null;
  const selectedStorageTile = selectedKeySlotIndex !== null ? currPlayer.keySlots[selectedKeySlotIndex] : null;

  // 행동 가이드 단계 판정
  let stepTitle = '주사위 선택 단계';
  let stepDesc = '아래 내 컨트롤 허브에서 행동에 사용할 주사위를 먼저 선택하세요.';

  if (currPlayer.isAI) {
    stepTitle = 'AI 턴 진행 중';
    stepDesc = `${currPlayer.name}님이 최적의 전략을 고민하여 행동을 수행하고 있습니다.`;
  } else if (!currPlayer.hasRolledDice) {
    stepTitle = '주사위 굴리기 필요';
    stepDesc = '화면 중앙의 [주사위 굴리기] 버튼을 눌러 라운드를 시작하세요.';
  } else if (selectedStorageTile) {
    stepTitle = `타일 [${selectedStorageTile.name}] 영지 배치`;
    stepDesc = `좌측 영지 맵에서 주사위 눈금 [${activeDie}]과 일치하고 인접한 반짝이는 슬롯을 클릭하세요.`;
  } else if (activeDie !== null) {
    stepTitle = `주사위 [${activeDie}]번 활성화`;
    stepDesc = `[${activeDie}번 디포]에서 타일을 가져오거나, 내 보관소 타일을 선택해 영지에 배치하세요.`;
  }

  return (
    <div 
      className="saboteur-board-panel" 
      style={{ 
        padding: '8px 12px', 
        borderRadius: '8px', 
        background: 'linear-gradient(145deg, rgba(20, 30, 24, 0.95) 0%, rgba(10, 16, 13, 0.95) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        display: 'flex', 
        flexDirection: 'column', 
        gap: '6px',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. 상단 현재 상태 바 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} color="#facc15" />
          <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#facc15' }}>
            버건디 4대 주사위 행동 가이드
          </span>
        </div>
        <div style={{
          background: 'rgba(212, 175, 55, 0.15)',
          border: '1px solid #d4af37',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '0.7rem',
          color: '#fef08a',
          fontWeight: 700
        }}>
          {stepTitle}
        </div>
      </div>

      <div style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.3 }}>
        {stepDesc}
      </div>

      {/* 2. 버건디 4대 행동 시각화 버튼/안내 칩 4종 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '2px' }}>
        {/* ① 디포 타일 획득 */}
        <div style={{
          padding: '5px 6px',
          borderRadius: '6px',
          background: activeDie !== null && !selectedStorageTile ? 'rgba(212, 175, 55, 0.18)' : 'rgba(0,0,0,0.3)',
          border: activeDie !== null && !selectedStorageTile ? '1px solid #facc15' : '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          transition: 'all 0.2s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fde047', fontSize: '0.7rem', fontWeight: 800 }}>
            <Layers size={12} />
            <span>① 디포 타일 획득</span>
          </div>
          <span style={{ fontSize: '0.62rem', color: '#94a3b8', lineHeight: 1.2 }}>
            주사위 번호 디포 타일을 내 보관소(3칸)로 가져옴
          </span>
        </div>

        {/* ② 영지에 타일 배치 */}
        <div style={{
          padding: '5px 6px',
          borderRadius: '6px',
          background: selectedStorageTile ? 'rgba(34, 197, 94, 0.2)' : 'rgba(0,0,0,0.3)',
          border: selectedStorageTile ? '1.5px solid #4ade80' : '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          transition: 'all 0.2s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#86efac', fontSize: '0.7rem', fontWeight: 800 }}>
            <MapPin size={12} />
            <span>② 영지에 배치</span>
          </div>
          <span style={{ fontSize: '0.62rem', color: '#94a3b8', lineHeight: 1.2 }}>
            보관소 타일 클릭 후 일치하는 영지 빈 칸 클릭
          </span>
        </div>

        {/* ③ 상품 판매 */}
        <div style={{
          padding: '5px 6px',
          borderRadius: '6px',
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f472b6', fontSize: '0.7rem', fontWeight: 800 }}>
            <ShoppingBag size={12} />
            <span>③ 상품 판매</span>
          </div>
          <span style={{ fontSize: '0.62rem', color: '#94a3b8', lineHeight: 1.2 }}>
            주사위 눈금과 같은 상품 판매 (은화 1개 + VP)
          </span>
        </div>

        {/* ④ 일꾼 2명 데려오기 (클릭하여 즉시 행동 가능!) */}
        <button
          onClick={() => {
            if (activeDie !== null && !currPlayer.isAI) {
              takeWorkersAction();
            }
          }}
          disabled={activeDie === null || currPlayer.isAI}
          style={{
            padding: '5px 6px',
            borderRadius: '6px',
            background: activeDie !== null && !currPlayer.isAI ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.3) 100%)' : 'rgba(0,0,0,0.3)',
            border: activeDie !== null && !currPlayer.isAI ? '1px solid #60a5fa' : '1px solid rgba(255,255,255,0.1)',
            color: activeDie !== null && !currPlayer.isAI ? '#93c5fd' : '#64748b',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            textAlign: 'left',
            cursor: activeDie !== null && !currPlayer.isAI ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease'
          }}
          title={activeDie !== null ? `주사위 [${activeDie}]를 소모하여 일꾼 2개 즉시 획득` : '주사위를 먼저 선택하세요'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 800 }}>
            <UserPlus size={12} />
            <span>④ 일꾼 2명 받기</span>
          </div>
          <span style={{ fontSize: '0.62rem', color: activeDie !== null ? '#bfdbfe' : '#64748b', lineHeight: 1.2 }}>
            {activeDie !== null ? '👉 클릭하여 일꾼 2명 획득' : '주사위 소모하여 일꾼 2명 영입'}
          </span>
        </button>
      </div>
    </div>
  );
};
