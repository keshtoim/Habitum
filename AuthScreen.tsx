// src/screens/AuthScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { saveUser, User } from '../storage';

const { width } = Dimensions.get('window');

const AVATARS = ['🦊', '🐼', '🦁', '🐸', '🐺', '🦋', '🐉', '🦅', '🐬', '🌟'];

interface Props {
  onAuth: (user: User) => void;
}

export default function AuthScreen({ onAuth }: Props) {
  const [mode, setMode] = useState<'welcome' | 'register' | 'login'>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен быть не менее 6 символов');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Ошибка', 'Введите корректный email');
      return;
    }

    setLoading(true);
    try {
      const user: User = {
        id: Math.random().toString(36).slice(2),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        avatar,
        joinedAt: new Date().toISOString(),
      };
      await saveUser(user);
      onAuth(user);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }
    setLoading(true);
    // Simulated login — in production, verify against stored/remote data
    setTimeout(async () => {
      const user: User = {
        id: Math.random().toString(36).slice(2),
        name: email.split('@')[0],
        email: email.trim().toLowerCase(),
        avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
        joinedAt: new Date().toISOString(),
      };
      await saveUser(user);
      onAuth(user);
      setLoading(false);
    }, 800);
  };

  // ── Welcome Screen ──────────────────────────────────────────────────────────
  if (mode === 'welcome') {
    return (
      <View style={styles.container}>
        <View style={styles.welcomeGlow} />

        <View style={styles.welcomeContent}>
          <Text style={styles.bigEmoji}>✦</Text>
          <Text style={styles.welcomeTitle}>Habitum</Text>
          <Text style={styles.welcomeSubtitle}>
            Строй привычки,{'\n'}меняй жизнь.
          </Text>

          <View style={styles.featureRow}>
            {['📈 Стрики', '🎯 Цели', '📊 Аналитика'].map(f => (
              <View key={f} style={styles.featurePill}>
                <Text style={styles.featurePillText}>{f}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.welcomeButtons}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => setMode('register')}
          >
            <Text style={styles.btnPrimaryText}>Начать бесплатно</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => setMode('login')}
          >
            <Text style={styles.btnSecondaryText}>Уже есть аккаунт</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Register / Login ────────────────────────────────────────────────────────
  const isRegister = mode === 'register';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.welcomeGlow} />

      <ScrollView
        contentContainerStyle={styles.formScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => setMode('welcome')}>
          <Text style={styles.backBtnText}>← Назад</Text>
        </TouchableOpacity>

        <Text style={styles.formTitle}>
          {isRegister ? 'Создать аккаунт' : 'Добро пожаловать'}
        </Text>
        <Text style={styles.formSubtitle}>
          {isRegister
            ? 'Все данные хранятся только на устройстве'
            : 'Войдите в свой аккаунт'}
        </Text>

        {/* Avatar picker (register only) */}
        {isRegister && (
          <View style={styles.avatarSection}>
            <Text style={styles.label}>Выберите аватар</Text>
            <View style={styles.avatarGrid}>
              {AVATARS.map(a => (
                <TouchableOpacity
                  key={a}
                  style={[styles.avatarItem, avatar === a && styles.avatarSelected]}
                  onPress={() => setAvatar(a)}
                >
                  <Text style={styles.avatarEmoji}>{a}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Form fields */}
        {isRegister && (
          <>
            <Text style={styles.label}>Имя</Text>
            <TextInput
              style={styles.input}
              placeholder="Как вас зовут?"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </>
        )}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="your@email.com"
          placeholderTextColor={Colors.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Пароль</Text>
        <TextInput
          style={styles.input}
          placeholder={isRegister ? 'Минимум 6 символов' : 'Введите пароль'}
          placeholderTextColor={Colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.btnPrimary, loading && { opacity: 0.6 }]}
          onPress={isRegister ? handleRegister : handleLogin}
          disabled={loading}
        >
          <Text style={styles.btnPrimaryText}>
            {loading ? '...' : isRegister ? 'Зарегистрироваться' : 'Войти'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMode(isRegister ? 'login' : 'register')}
        >
          <Text style={styles.switchText}>
            {isRegister
              ? 'Уже есть аккаунт? Войти'
              : 'Нет аккаунта? Зарегистрироваться'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  welcomeGlow: {
    position: 'absolute',
    top: -80,
    left: width / 2 - 150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.accent,
    opacity: 0.12,
  },

  // Welcome
  welcomeContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  bigEmoji: {
    fontSize: 56,
    color: Colors.accent,
    marginBottom: Spacing.md,
  },
  welcomeTitle: {
    ...Typography.h1,
    color: Colors.textPrimary,
    fontSize: 48,
    letterSpacing: -2,
    marginBottom: Spacing.sm,
  },
  welcomeSubtitle: {
    ...Typography.h3,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: Spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  featurePill: {
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  featurePillText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  welcomeButtons: {
    padding: Spacing.xl,
    gap: Spacing.sm,
  },

  // Form
  formScroll: {
    padding: Spacing.xl,
    paddingTop: Spacing.xxl,
    flexGrow: 1,
  },
  backBtn: {
    marginBottom: Spacing.xl,
  },
  backBtnText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  formTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  formSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  avatarSection: {
    marginBottom: Spacing.lg,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  avatarItem: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentGlow,
  },
  avatarEmoji: {
    fontSize: 28,
  },

  // Shared
  label: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  input: {
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  btnPrimary: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  btnPrimaryText: {
    ...Typography.bodyBold,
    color: '#fff',
    fontSize: 16,
  },
  btnSecondary: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  btnSecondaryText: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
  },
  switchText: {
    ...Typography.body,
    color: Colors.accentSoft,
    textAlign: 'center',
    padding: Spacing.md,
  },
});
