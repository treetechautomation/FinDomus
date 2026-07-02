import { financialEvents, type FinancialEvent } from '@/core/finance/events';
import { AcademyAchievements, getAchievementById } from './academy-achievements';
import { AcademyLessons } from './academy-lessons';
import { academyStorage } from './academy-storage';
import type { AcademyProgress, JourneyEntry } from './academy-types';

type AcademyEventCallback = (event: {
  type: 'achievement_unlocked' | 'mission_completed' | 'lesson_completed' | 'progress_updated';
  payload: any;
}) => void;

let onAcademyEvent: AcademyEventCallback | null = null;

export function setAcademyEventListener(callback: AcademyEventCallback): void {
  onAcademyEvent = callback;
}

function emit(type: 'achievement_unlocked' | 'mission_completed' | 'lesson_completed' | 'progress_updated', payload: any): void {
  if (onAcademyEvent) onAcademyEvent({ type, payload });
}

export async function checkAchievements(
  userId: string,
  event: FinancialEvent
): Promise<AcademyProgress | null> {
  if (!userId) return null;

  const progress = await academyStorage.load(userId);
  if (!progress) return null;

  const unlocked: string[] = [];

  for (const achievement of AcademyAchievements) {
    if (progress.achievements.includes(achievement.id)) continue;

    let shouldUnlock = false;

    switch (achievement.trigger.type) {
      case 'event':
        shouldUnlock =
          achievement.trigger.eventType === event.type &&
          (!achievement.trigger.source || achievement.trigger.source === event.source);
        break;
      case 'lesson_completed':
        shouldUnlock = progress.completedLessons.includes(achievement.trigger.lessonId);
        break;
      case 'metric':
        // Métricas são verificadas separadamente via `checkMetricAchievements`
        break;
    }

    if (shouldUnlock) {
      const updated = [...progress.achievements, achievement.id];
      const entry: JourneyEntry = {
        type: 'achievement_unlocked',
        icon: achievement.icon,
        title: achievement.title,
        timestamp: new Date().toISOString(),
      };

      await academyStorage.save(userId, {
        achievements: updated,
        history: [...progress.history, entry],
      });

      unlocked.push(achievement.id);
      emit('achievement_unlocked', achievement);
    }
  }

  if (unlocked.length > 0) {
    return academyStorage.load(userId);
  }
  return progress;
}

export async function checkMetricAchievements(
  userId: string,
  metrics: { netWorth?: number; coveredMonths?: number }
): Promise<AcademyProgress | null> {
  if (!userId) return null;

  const progress = await academyStorage.load(userId);
  if (!progress) return null;

  const unlocked: string[] = [];

  for (const achievement of AcademyAchievements) {
    if (progress.achievements.includes(achievement.id)) continue;
    if (achievement.trigger.type !== 'metric') continue;

    let shouldUnlock = false;

    switch (achievement.trigger.metric) {
      case 'netWorth':
        shouldUnlock = (metrics.netWorth || 0) >= achievement.trigger.threshold;
        break;
      case 'coveredMonths':
        shouldUnlock = (metrics.coveredMonths || 0) >= achievement.trigger.threshold;
        break;
      case 'completedLessons':
        shouldUnlock = progress.completedLessons.length >= achievement.trigger.threshold;
        break;
      case 'allAchievements':
        shouldUnlock = progress.achievements.length >= achievement.trigger.threshold;
        break;
    }

    if (shouldUnlock) {
      const updated = [...progress.achievements, achievement.id];
      const entry: JourneyEntry = {
        type: 'achievement_unlocked',
        icon: achievement.icon,
        title: achievement.title,
        timestamp: new Date().toISOString(),
      };

      await academyStorage.save(userId, {
        achievements: updated,
        history: [...progress.history, entry],
      });

      unlocked.push(achievement.id);
      emit('achievement_unlocked', achievement);
    }
  }

  if (unlocked.length > 0) {
    return academyStorage.load(userId);
  }
  return progress;
}

export async function getNextMission(
  progress: AcademyProgress
): Promise<{ lessonId: number; mission: string; lessonTitle: string } | null> {
  for (const lesson of AcademyLessons) {
    if (progress.completedLessons.includes(lesson.id)) continue;
    if (lesson.mission) {
      return {
        lessonId: lesson.id,
        mission: lesson.mission,
        lessonTitle: lesson.title,
      };
    }
  }
  return null;
}
