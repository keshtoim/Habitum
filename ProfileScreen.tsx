// src/screens/ProfileScreen.tsx
import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { User, getHabits, getCompletions, clearUser } from '../storage';

interface Props {
  user: User;
  onLogout: () => void;
}

export default function ProfileScreen({ user, onLogout }: Props) {
  const [habitCount, setHabitCount] = useState(0);
  const [totalDone, setTotalDone] = useState(0);

  useFocusEffect(useCallback(() => {
    (async () => {
      const [h, c] = await Promise.all([getHabits(), getCompletions()]);
      setHabitCount(h.length);
      setTotalDone(c.length);
    })();
  }, []));

  const joinDate = new Date(user.joinedAt);
  const daysSince = Math.floor((Date.now() - joinDate.getTime()) / 86400000);

  const handleLogout = () => {
    Alert.alert(
      'Выйти из аккаунта',
      'Ваши данные останутся на устройстве. Продолжить?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: async () => {
            await clearUser();
            onLogout();
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar + name */}
      <View style={styles.hero}>
        <View style={styles.avatarRing}>
          <Text style={styles.avatarText}>{user.avatar}</Text>
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <View style={styles.joinBadge}>
          <Text style={styles.joinText}>С нами {daysSince} дней</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statBlock}>
          <Text style={styles.statNum}>{habitCount}</Text>
          <Text style={styles.statLbl}>привычек</Text>
        </View>
        <View style={[styles.statBlock, styles.statBorder]}>
          <Text style={styles.statNum}>{totalDone}</Text>
          <Text style={styles.statLbl}>выполнений</Text>
        </View>
        <View style={styles.statBlock}>
          <Text style={styles.statNum}>{daysSince}</Text>
          <Text style={styles.statLbl}>дней</Text>
        </View>
      </View>

      {/* Info section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Аккаунт</Text>
        <InfoRow icon="👤" label="Имя" value={user.name} />
        <InfoRow icon="📧" label="Email" value={user.email} />
        <InfoRow icon="📅" label="Дата регистрации" value={joinDate.toLocaleDateString('ru-RU')} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>О приложении</Text>
        <InfoRow icon="📱" label="Версия" value="1.0.0" />
        <InfoRow icon="💾" label="Хранение данных" value="На устройстве" />
        <InfoRow icon="🔒" label="Приватность" value="100% локально" />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Выйти из аккаунта</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },

  hero: { alignItems: 'center', paddingVertical: Spacing.xl },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.bgElevated,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: { fontSize: 52 },
  userName: { ...Typography.h2, color: Colors.textPrimary },
  userEmail: { ...Typography.body, color: Colors.textSecondary, marginTop: 2 },
  joinBadge: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.accentGlow,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  joinText: { ...Typography.caption, color: Colors.accentSoft },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  statBlock: { flex: 1, alignItems: 'center', paddingVertical: Spacing.lg },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.border,
  },
  statNum: { ...Typography.h2, color: Colors.textPrimary },
  statLbl: { ...Typography.micro, color: Colors.textMuted, marginTop: 2 },

  section: { marginBottom: Spacing.xl },
  sectionTitle: { ...Typography.caption, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.sm },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  infoIcon: { fontSize: 18 },
  infoLabel: { ...Typography.body, color: Colors.textSecondary, flex: 1 },
  infoValue: { ...Typography.body, color: Colors.textPrimary },

  logoutBtn: {
    backgroundColor: Colors.dangerSoft,
    borderWidth: 1,
    borderColor: Colors.danger + '44',
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  logoutText: { ...Typography.bodyBold, color: Colors.danger },
});
