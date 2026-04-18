// src/screens/HomeScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Typography, Spacing, Radius, CATEGORY_ICONS } from '../theme';
import {
  Habit,
  User,
  getHabits,
  getCompletions,
  toggleCompletion,
  getStreak,
  Completion,
} from '../storage';

const { width } = Dimensions.get('window');

const DAYS_RU = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const MONTHS_RU = [
  'января','февраля','марта','апреля','мая','июня',
  'июля','августа','сентября','октября','ноября','декабря',
];

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function formatDate(d: Date) {
  return `${d.getDate()} ${MONTHS_RU[d.getMonth()]}`;
}

interface Props {
  user: User;
  navigation: any;
}

export default function HomeScreen({ user, navigation }: Props) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [todayCompletions, setTodayCompletions] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date();
  const todayDate = todayStr();

  const load = async () => {
    const [h, c] = await Promise.all([getHabits(), getCompletions()]);
    setHabits(h);
    setCompletions(c);
    setTodayCompletions(
      new Set(c.filter(x => x.date === todayDate).map(x => x.habitId))
    );
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleToggle = async (habitId: string) => {
    await toggleCompletion(habitId, todayDate);
    await load();
  };

  // Build last 7 days for mini calendar
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const doneCount = todayCompletions.size;
  const totalCount = habits.length;
  const progress = totalCount > 0 ? doneCount / totalCount : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {getGreeting()}, {user.name.split(' ')[0]} {user.avatar}
          </Text>
          <Text style={styles.dateLabel}>
            {DAYS_RU[today.getDay()]}, {formatDate(today)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddHabit')}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Ring */}
      <View style={styles.progressCard}>
        <View style={styles.progressLeft}>
          <Text style={styles.progressNum}>{doneCount}</Text>
          <Text style={styles.progressDenom}>/{totalCount}</Text>
          <Text style={styles.progressLabel}>привычек{'\n'}выполнено</Text>
        </View>
        <View style={styles.progressRight}>
          <ProgressRing progress={progress} />
        </View>
        <View style={styles.progressMotivation}>
          <Text style={styles.motivationText}>{getMotivation(progress)}</Text>
        </View>
      </View>

      {/* Mini calendar */}
      <View style={styles.weekRow}>
        {last7.map((d, i) => {
          const ds = d.toISOString().split('T')[0];
          const isToday = ds === todayDate;
          const completedSome = completions.some(c => c.date === ds);
          return (
            <View key={i} style={[styles.dayCell, isToday && styles.dayCellToday]}>
              <Text style={[styles.dayName, isToday && styles.dayToday]}>
                {DAYS_RU[d.getDay()]}
              </Text>
              <Text style={[styles.dayNum, isToday && styles.dayToday]}>
                {d.getDate()}
              </Text>
              <View style={[
                styles.dayDot,
                completedSome && styles.dayDotActive,
                isToday && completedSome && styles.dayDotToday,
              ]} />
            </View>
          );
        })}
      </View>

      {/* Habits List */}
      <Text style={styles.sectionTitle}>Сегодня</Text>

      {habits.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🌱</Text>
          <Text style={styles.emptyTitle}>Начни с первой привычки</Text>
          <Text style={styles.emptySubtitle}>
            Нажми + чтобы добавить привычку
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate('AddHabit')}
          >
            <Text style={styles.emptyBtnText}>Добавить привычку</Text>
          </TouchableOpacity>
        </View>
      ) : (
        habits.map(habit => (
          <HabitCard
            key={habit.id}
            habit={habit}
            done={todayCompletions.has(habit.id)}
            streak={getStreak(completions, habit.id)}
            onToggle={() => handleToggle(habit.id)}
            onPress={() => navigation.navigate('HabitDetail', { habitId: habit.id })}
          />
        ))
      )}
    </ScrollView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function HabitCard({
  habit, done, streak, onToggle, onPress,
}: {
  habit: Habit;
  done: boolean;
  streak: number;
  onToggle: () => void;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.habitCard, done && styles.habitCardDone]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.habitLeft}>
        <View style={[styles.habitEmoji, { backgroundColor: habit.color + '22' }]}>
          <Text style={styles.habitEmojiText}>{habit.emoji}</Text>
        </View>
        <View style={styles.habitInfo}>
          <Text style={[styles.habitName, done && styles.habitNameDone]}>{habit.name}</Text>
          <View style={styles.habitMeta}>
            <Text style={styles.habitCategory}>
              {CATEGORY_ICONS[habit.category]} {habit.category}
            </Text>
            {streak > 0 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakText}>🔥 {streak}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.checkBtn, done && styles.checkBtnDone]}
        onPress={onToggle}
      >
        {done && <Text style={styles.checkMark}>✓</Text>}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function ProgressRing({ progress }: { progress: number }) {
  const size = 90;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const fill = circumference * (1 - progress);
  const pct = Math.round(progress * 100);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background ring */}
      <View style={{
        position: 'absolute',
        width: size - strokeWidth,
        height: size - strokeWidth,
        borderRadius: (size - strokeWidth) / 2,
        borderWidth: strokeWidth,
        borderColor: Colors.bgElevated,
      }} />
      {/* We approximate fill with border trick since no SVG */}
      <View style={{
        position: 'absolute',
        width: size - strokeWidth,
        height: size - strokeWidth,
        borderRadius: (size - strokeWidth) / 2,
        borderWidth: strokeWidth,
        borderColor: Colors.accent,
        opacity: progress > 0 ? 1 : 0,
        borderTopColor: progress < 0.25 ? 'transparent' : Colors.accent,
        borderRightColor: progress < 0.5 ? 'transparent' : Colors.accent,
        borderBottomColor: progress < 0.75 ? 'transparent' : Colors.accent,
      }} />
      <Text style={{ ...Typography.h3, color: Colors.textPrimary }}>{pct}%</Text>
    </View>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return 'Не спится';
  if (h < 12) return 'Доброе утро';
  if (h < 18) return 'Добрый день';
  return 'Добрый вечер';
}

function getMotivation(progress: number) {
  if (progress === 0) return 'Начни прямо сейчас ✨';
  if (progress < 0.3) return 'Хорошее начало! 💪';
  if (progress < 0.6) return 'Ты в ударе! 🚀';
  if (progress < 1) return 'Почти там! 🔥';
  return 'Идеальный день! 🏆';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
    marginTop: Spacing.lg,
  },
  greeting: { ...Typography.h2, color: Colors.textPrimary },
  dateLabel: { ...Typography.body, color: Colors.textSecondary, marginTop: 2 },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 24, lineHeight: 26 },

  // Progress card
  progressCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  progressLeft: { flexDirection: 'row', alignItems: 'flex-end', marginRight: Spacing.md },
  progressNum: { ...Typography.h1, color: Colors.textPrimary },
  progressDenom: { ...Typography.h3, color: Colors.textSecondary, marginBottom: 4 },
  progressLabel: { ...Typography.caption, color: Colors.textSecondary, marginLeft: Spacing.sm },
  progressRight: { flex: 1, alignItems: 'center' },
  progressMotivation: { flex: 1.5 },
  motivationText: { ...Typography.body, color: Colors.textSecondary, textAlign: 'right' },

  // Week
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  dayCell: {
    alignItems: 'center',
    padding: Spacing.xs,
    width: (width - Spacing.lg * 2) / 7,
  },
  dayCellToday: {
    backgroundColor: Colors.accentGlow,
    borderRadius: Radius.md,
  },
  dayName: { ...Typography.micro, color: Colors.textMuted, marginBottom: 3 },
  dayNum: { ...Typography.caption, color: Colors.textSecondary },
  dayToday: { color: Colors.accentSoft },
  dayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'transparent',
    marginTop: 3,
  },
  dayDotActive: { backgroundColor: Colors.textMuted },
  dayDotToday: { backgroundColor: Colors.accent },

  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },

  // Habit card
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  habitCardDone: {
    borderColor: Colors.successSoft,
    backgroundColor: Colors.bgCard,
    opacity: 0.75,
  },
  habitLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  habitEmoji: {
    width: 46,
    height: 46,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  habitEmojiText: { fontSize: 24 },
  habitInfo: { flex: 1 },
  habitName: { ...Typography.bodyBold, color: Colors.textPrimary },
  habitNameDone: { color: Colors.textMuted, textDecorationLine: 'line-through' },
  habitMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: Spacing.sm },
  habitCategory: { ...Typography.caption, color: Colors.textMuted, textTransform: 'capitalize' },
  streakBadge: {
    backgroundColor: Colors.goldSoft,
    borderRadius: Radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  streakText: { ...Typography.micro, color: Colors.gold },

  checkBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtnDone: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  checkMark: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyEmoji: { fontSize: 56, marginBottom: Spacing.md },
  emptyTitle: { ...Typography.h3, color: Colors.textPrimary, marginBottom: Spacing.xs },
  emptySubtitle: { ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.xl },
  emptyBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  emptyBtnText: { ...Typography.bodyBold, color: '#fff' },
});
