// src/screens/StatsScreen.tsx
import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Typography, Spacing, Radius, CATEGORY_ICONS } from '../theme';
import {
  getHabits, getCompletions, getStreak, getCompletionRate,
  Habit, Completion,
} from '../storage';

const { width } = Dimensions.get('window');

export default function StatsScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);

  useFocusEffect(useCallback(() => {
    (async () => {
      const [h, c] = await Promise.all([getHabits(), getCompletions()]);
      setHabits(h);
      setCompletions(c);
    })();
  }, []));

  // Overall stats
  const totalDone = completions.length;
  const maxStreak = habits.reduce((max, h) => Math.max(max, getStreak(completions, h.id)), 0);
  const avgRate = habits.length
    ? Math.round(habits.reduce((s, h) => s + getCompletionRate(completions, h.id, 7), 0) / habits.length)
    : 0;

  // Last 14 days heatmap
  const today = new Date();
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (13 - i));
    const ds = d.toISOString().split('T')[0];
    const count = completions.filter(c => c.date === ds).length;
    return { date: ds, count, day: d.getDate() };
  });
  const maxCount = Math.max(...last14.map(d => d.count), 1);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Статистика</Text>

      {/* Overview cards */}
      <View style={styles.overviewRow}>
        <StatCard emoji="✅" value={totalDone} label="Выполнений" color={Colors.success} />
        <StatCard emoji="🔥" value={maxStreak} label="Макс. стрик" color={Colors.gold} />
        <StatCard emoji="📊" value={`${avgRate}%`} label="7 дней" color={Colors.accent} />
      </View>

      {/* Heatmap */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Активность (14 дней)</Text>
        <View style={styles.heatmap}>
          {last14.map((d, i) => {
            const intensity = d.count / maxCount;
            return (
              <View key={i} style={styles.heatCell}>
                <View style={[
                  styles.heatBox,
                  {
                    backgroundColor: d.count === 0
                      ? Colors.bgElevated
                      : `rgba(123, 97, 255, ${0.2 + intensity * 0.8})`,
                  },
                ]} />
                <Text style={styles.heatLabel}>{d.day}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Per habit breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>По привычкам</Text>
        {habits.length === 0 ? (
          <Text style={styles.empty}>Добавьте привычки для отображения статистики</Text>
        ) : (
          habits.map(habit => {
            const streak = getStreak(completions, habit.id);
            const rate7 = getCompletionRate(completions, habit.id, 7);
            const rate30 = getCompletionRate(completions, habit.id, 30);
            const total = completions.filter(c => c.habitId === habit.id).length;

            return (
              <View key={habit.id} style={styles.habitRow}>
                <View style={styles.habitRowLeft}>
                  <Text style={styles.habitRowEmoji}>{habit.emoji}</Text>
                  <View>
                    <Text style={styles.habitRowName}>{habit.name}</Text>
                    <Text style={styles.habitRowSub}>
                      {CATEGORY_ICONS[habit.category]} {habit.category}
                    </Text>
                  </View>
                </View>

                <View style={styles.habitStats}>
                  <MiniStat label="7д" value={`${rate7}%`} color={Colors.accent} />
                  <MiniStat label="30д" value={`${rate30}%`} color={Colors.accentSoft} />
                  <MiniStat label="🔥" value={streak} color={Colors.gold} />
                  <MiniStat label="всего" value={total} color={Colors.textSecondary} />
                </View>

                {/* Progress bar */}
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${rate7}%`, backgroundColor: habit.color }]} />
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

function StatCard({
  emoji, value, label, color,
}: { emoji: string; value: number | string; label: string; color: string }) {
  return (
    <View style={[styles.statCard, { borderColor: color + '33' }]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={[styles.miniStatValue, { color }]}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  title: { ...Typography.h2, color: Colors.textPrimary, marginBottom: Spacing.lg, marginTop: Spacing.lg },

  overviewRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  statEmoji: { fontSize: 22, marginBottom: 4 },
  statValue: { ...Typography.h2, marginBottom: 2 },
  statLabel: { ...Typography.micro, color: Colors.textMuted, textAlign: 'center' },

  section: { marginBottom: Spacing.xl },
  sectionTitle: { ...Typography.h3, color: Colors.textPrimary, marginBottom: Spacing.md },

  heatmap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
  },
  heatCell: { alignItems: 'center', gap: 4, flex: 1 },
  heatBox: {
    width: (width - Spacing.lg * 2) / 14 - 3,
    height: (width - Spacing.lg * 2) / 14 - 3,
    borderRadius: 4,
  },
  heatLabel: { ...Typography.micro, color: Colors.textMuted },

  habitRow: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  habitRowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  habitRowEmoji: { fontSize: 24 },
  habitRowName: { ...Typography.bodyBold, color: Colors.textPrimary },
  habitRowSub: { ...Typography.caption, color: Colors.textMuted, textTransform: 'capitalize' },

  habitStats: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  miniStat: { flex: 1, alignItems: 'center' },
  miniStatValue: { ...Typography.bodyBold, fontSize: 14 },
  miniStatLabel: { ...Typography.micro, color: Colors.textMuted },

  progressBarBg: {
    height: 4,
    backgroundColor: Colors.bgElevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 2 },

  empty: { ...Typography.body, color: Colors.textMuted, textAlign: 'center', paddingVertical: Spacing.xl },
});
