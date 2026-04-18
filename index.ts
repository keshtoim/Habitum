// src/storage/index.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER: '@habit_tracker:user',
  HABITS: '@habit_tracker:habits',
  COMPLETIONS: '@habit_tracker:completions',
};

// ─── Types ──────────────────────────────────────────────────────────────────

export type Category = 'health' | 'mind' | 'social' | 'work' | 'creative' | 'other';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string; // emoji
  joinedAt: string;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: Category;
  emoji: string;
  frequency: 'daily' | 'weekly';
  targetDays?: number[]; // 0=Sun..6=Sat for weekly
  createdAt: string;
  color: string;
}

export interface Completion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completedAt: string;
  note?: string;
}

// ─── User ────────────────────────────────────────────────────────────────────

export async function saveUser(user: User): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
}

export async function getUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(KEYS.USER);
  return raw ? JSON.parse(raw) : null;
}

export async function clearUser(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.USER);
}

// ─── Habits ──────────────────────────────────────────────────────────────────

export async function saveHabits(habits: Habit[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.HABITS, JSON.stringify(habits));
}

export async function getHabits(): Promise<Habit[]> {
  const raw = await AsyncStorage.getItem(KEYS.HABITS);
  return raw ? JSON.parse(raw) : [];
}

export async function addHabit(habit: Habit): Promise<void> {
  const habits = await getHabits();
  habits.push(habit);
  await saveHabits(habits);
}

export async function updateHabit(updated: Habit): Promise<void> {
  const habits = await getHabits();
  const idx = habits.findIndex(h => h.id === updated.id);
  if (idx !== -1) {
    habits[idx] = updated;
    await saveHabits(habits);
  }
}

export async function deleteHabit(id: string): Promise<void> {
  const habits = await getHabits();
  await saveHabits(habits.filter(h => h.id !== id));
  // Also remove completions
  const completions = await getCompletions();
  await saveCompletions(completions.filter(c => c.habitId !== id));
}

// ─── Completions ─────────────────────────────────────────────────────────────

export async function saveCompletions(completions: Completion[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.COMPLETIONS, JSON.stringify(completions));
}

export async function getCompletions(): Promise<Completion[]> {
  const raw = await AsyncStorage.getItem(KEYS.COMPLETIONS);
  return raw ? JSON.parse(raw) : [];
}

export async function toggleCompletion(habitId: string, date: string): Promise<boolean> {
  const completions = await getCompletions();
  const existing = completions.find(c => c.habitId === habitId && c.date === date);

  if (existing) {
    await saveCompletions(completions.filter(c => !(c.habitId === habitId && c.date === date)));
    return false;
  } else {
    completions.push({
      id: `${habitId}_${date}`,
      habitId,
      date,
      completedAt: new Date().toISOString(),
    });
    await saveCompletions(completions);
    return true;
  }
}

export async function getCompletionsForDate(date: string): Promise<Completion[]> {
  const completions = await getCompletions();
  return completions.filter(c => c.date === date);
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export function getStreak(completions: Completion[], habitId: string): number {
  const dates = completions
    .filter(c => c.habitId === habitId)
    .map(c => c.date)
    .sort()
    .reverse();

  if (!dates.length) return 0;

  const today = new Date();
  let streak = 0;
  let checkDate = new Date(today);

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (dates.includes(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (i === 0) {
      // Today not done yet, check from yesterday
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function getCompletionRate(
  completions: Completion[],
  habitId: string,
  days: number = 30
): number {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - days);

  let count = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    if (completions.some(c => c.habitId === habitId && c.date === dateStr)) {
      count++;
    }
  }

  return Math.round((count / days) * 100);
}
