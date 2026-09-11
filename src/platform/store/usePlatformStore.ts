import { create } from 'zustand';
import type { GameResultRecord, GameStats, Achievement } from '../types';
import { INITIAL_ACHIEVEMENTS } from '../data/achievements';
import { soundManager } from '../../utils/sound';

const STATS_STORAGE_KEY = 'euro_platform_game_records_v1';
const ACHIEVEMENTS_STORAGE_KEY = 'euro_platform_achievements_v1';

interface PlatformStore {
  records: GameResultRecord[];
  achievements: Achievement[];
  latestUnlockedAchievement: Achievement | null;

  recordGameResult: (record: Omit<GameResultRecord, 'id' | 'playedAt'>) => Achievement[];
  clearLatestUnlocked: () => void;
  getGameStats: (gameId?: string) => GameStats;
  resetAllData: () => void;
}

// 로컬 스토리지 로드 헬퍼
const loadRecordsFromStorage = (): GameResultRecord[] => {
  try {
    const data = localStorage.getItem(STATS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const loadAchievementsFromStorage = (): Achievement[] => {
  try {
    const data = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (!data) return INITIAL_ACHIEVEMENTS;
    const stored: Achievement[] = JSON.parse(data);
    // 새로운 업적이 추가되었을 때 병합
    return INITIAL_ACHIEVEMENTS.map(initial => {
      const match = stored.find(s => s.id === initial.id);
      return match ? { ...initial, unlockedAt: match.unlockedAt } : initial;
    });
  } catch {
    return INITIAL_ACHIEVEMENTS;
  }
};

export const usePlatformStore = create<PlatformStore>((set, get) => ({
  records: loadRecordsFromStorage(),
  achievements: loadAchievementsFromStorage(),
  latestUnlockedAchievement: null,

  clearLatestUnlocked: () => {
    set({ latestUnlockedAchievement: null });
  },

  recordGameResult: (recordData) => {
    const newRecord: GameResultRecord = {
      ...recordData,
      id: `record_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      playedAt: new Date().toISOString()
    };

    const updatedRecords = [newRecord, ...get().records];
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(updatedRecords));

    // 업적 조건 평가
    const currentAchievements = get().achievements;
    const newlyUnlocked: Achievement[] = [];
    const nowIso = new Date().toISOString();

    const playedGameIds = new Set(updatedRecords.map(r => r.gameId));
    const totalWins = updatedRecords.filter(r => r.isWin).length;
    const winRate = updatedRecords.length > 0 ? (totalWins / updatedRecords.length) * 100 : 0;

    const updatedAchievements = currentAchievements.map(ach => {
      if (ach.unlockedAt) return ach; // 이미 달성됨

      let isConditionMet = false;

      switch (ach.id) {
        // 공통
        case 'first_step':
          isConditionMet = updatedRecords.length >= 1;
          break;
        case 'first_victory':
          isConditionMet = newRecord.isWin;
          break;
        case 'euro_master':
          isConditionMet = ['puerto-rico', 'burgundy', 'le-havre', 'caverna', 'arnak', 'terraforming-mars'].every(id => playedGameIds.has(id));
          break;
        case 'triple_crown':
          isConditionMet = totalWins >= 3;
          break;
        case 'perfectionist':
          isConditionMet = updatedRecords.length >= 3 && winRate >= 60;
          break;

        // 푸에르토리코
        case 'pr_winner':
          isConditionMet = newRecord.gameId === 'puerto-rico' && newRecord.isWin;
          break;
        case 'pr_high_score':
          isConditionMet = newRecord.gameId === 'puerto-rico' && newRecord.myScore >= 50;
          break;

        // 버건디의 성
        case 'burgundy_winner':
          isConditionMet = newRecord.gameId === 'burgundy' && newRecord.isWin;
          break;
        case 'burgundy_high_score':
          isConditionMet = newRecord.gameId === 'burgundy' && newRecord.myScore >= 200;
          break;

        // 르아브르
        case 'le_havre_winner':
          isConditionMet = newRecord.gameId === 'le-havre' && newRecord.isWin;
          break;
        case 'le_havre_wealthy':
          isConditionMet = newRecord.gameId === 'le-havre' && newRecord.myScore >= 100;
          break;

        // 카베르나
        case 'caverna_winner':
          isConditionMet = newRecord.gameId === 'caverna' && newRecord.isWin;
          break;
        case 'caverna_high_score':
          isConditionMet = newRecord.gameId === 'caverna' && newRecord.myScore >= 70;
          break;

        // 아르낙
        case 'arnak_winner':
          isConditionMet = newRecord.gameId === 'arnak' && newRecord.isWin;
          break;
        case 'arnak_high_score':
          isConditionMet = newRecord.gameId === 'arnak' && newRecord.myScore >= 60;
          break;

        // 테라포밍 마스
        case 'tm_winner':
          isConditionMet = newRecord.gameId === 'terraforming-mars' && newRecord.isWin;
          break;
        case 'tm_high_score':
          isConditionMet = newRecord.gameId === 'terraforming-mars' && newRecord.myScore >= 70;
          break;
        case 'green_mars':
          isConditionMet = newRecord.gameId === 'terraforming-mars';
          break;
      }

      if (isConditionMet) {
        const unlockedAch = { ...ach, unlockedAt: nowIso };
        newlyUnlocked.push(unlockedAch);
        return unlockedAch;
      }
      return ach;
    });

    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(updatedAchievements));

    set({
      records: updatedRecords,
      achievements: updatedAchievements,
      latestUnlockedAchievement: newlyUnlocked.length > 0 ? newlyUnlocked[0] : null
    });

    if (newlyUnlocked.length > 0) {
      soundManager.playGrandFanfare();
    }

    return newlyUnlocked;
  },

  getGameStats: (gameId?: string): GameStats => {
    const allRecords = get().records;
    const targetRecords = gameId 
      ? allRecords.filter(r => r.gameId === gameId)
      : allRecords;

    const totalGames = targetRecords.length;
    if (totalGames === 0) {
      return {
        totalGames: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        highScore: 0,
        averageScore: 0
      };
    }

    const wins = targetRecords.filter(r => r.isWin).length;
    const losses = totalGames - wins;
    const winRate = Math.round((wins / totalGames) * 100);
    const highScore = Math.max(...targetRecords.map(r => r.myScore), 0);
    const averageScore = Math.round(
      targetRecords.reduce((acc, r) => acc + r.myScore, 0) / totalGames
    );

    return {
      totalGames,
      wins,
      losses,
      winRate,
      highScore,
      averageScore
    };
  },

  resetAllData: () => {
    localStorage.removeItem(STATS_STORAGE_KEY);
    localStorage.removeItem(ACHIEVEMENTS_STORAGE_KEY);
    set({
      records: [],
      achievements: INITIAL_ACHIEVEMENTS,
      latestUnlockedAchievement: null
    });
  }
}));
