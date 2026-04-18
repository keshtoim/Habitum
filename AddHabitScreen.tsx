// src/screens/AddHabitScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, CATEGORY_ICONS } from '../theme';
import { addHabit, Category, Habit } from '../storage';

const EMOJIS = [
  '💧','🏃','📚','🧘','💤','🥗','🏋️','🎯',
  '✍️','🎨','🎵','🌿','🧹','💊','🐕','☕',
  '🚴','🧠','❤️','🌅','🎮','📝','🤸','💡',
];

const CATEGORIES: { key: Category; label: string; color: string }[] = [
  { key: 'health',   label: 'Здоровье',   color: '#3DDBB5' },
  { key: 'mind',     label: 'Разум',       color: '#7B61FF' },
  { key: 'social',   label: 'Общение',     color: '#F5C842' },
  { key: 'work',     label: 'Работа',      color: '#FF8C61' },
  { key: 'creative', label: 'Творчество',  color: '#FF6B9D' },
  { key: 'other',    label: 'Другое',      color: '#61B8FF' },
];

interface Props {
  navigation: any;
}

export default function AddHabitScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [category, setCategory] = useState<Category>('health');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [saving, setSaving] = useState(false);

  const selectedCategory = CATEGORIES.find(c => c.key === category)!;

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Ошибка', 'Введите название привычки');
      return;
    }
    setSaving(true);
    try {
      const habit: Habit = {
        id: Math.random().toString(36).slice(2) + Date.now(),
        name: name.trim(),
        description: description.trim(),
        emoji,
        category,
        frequency,
        color: selectedCategory.color,
        createdAt: new Date().toISOString(),
      };
      await addHabit(habit);
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Preview card */}
        <View style={[styles.previewCard, { borderColor: selectedCategory.color + '44' }]}>
          <View style={[styles.previewEmoji, { backgroundColor: selectedCategory.color + '22' }]}>
            <Text style={styles.previewEmojiText}>{emoji}</Text>
          </View>
          <View>
            <Text style={styles.previewName}>{name || 'Название привычки'}</Text>
            <Text style={styles.previewCategory}>
              {CATEGORY_ICONS[category]} {selectedCategory.label} · {frequency === 'daily' ? 'Ежедневно' : 'Еженедельно'}
            </Text>
          </View>
        </View>

        {/* Name */}
        <Text style={styles.label}>Название</Text>
        <TextInput
          style={styles.input}
          placeholder="Пить воду, читать 20 мин..."
          placeholderTextColor={Colors.textMuted}
          value={name}
          onChangeText={setName}
          maxLength={40}
        />

        {/* Description */}
        <Text style={styles.label}>Описание (опционально)</Text>
        <TextInput
          style={[styles.input, styles.inputMulti]}
          placeholder="Зачем эта привычка?"
          placeholderTextColor={Colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          maxLength={120}
        />

        {/* Emoji */}
        <Text style={styles.label}>Иконка</Text>
        <View style={styles.emojiGrid}>
          {EMOJIS.map(e => (
            <TouchableOpacity
              key={e}
              style={[styles.emojiItem, emoji === e && styles.emojiSelected]}
              onPress={() => setEmoji(e)}
            >
              <Text style={styles.emojiItemText}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category */}
        <Text style={styles.label}>Категория</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c.key}
              style={[
                styles.categoryItem,
                category === c.key && { backgroundColor: c.color + '22', borderColor: c.color },
              ]}
              onPress={() => setCategory(c.key)}
            >
              <Text style={styles.categoryEmoji}>{CATEGORY_ICONS[c.key]}</Text>
              <Text style={[
                styles.categoryLabel,
                category === c.key && { color: c.color },
              ]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Frequency */}
        <Text style={styles.label}>Частота</Text>
        <View style={styles.freqRow}>
          {(['daily', 'weekly'] as const).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.freqBtn, frequency === f && styles.freqBtnActive]}
              onPress={() => setFrequency(f)}
            >
              <Text style={[styles.freqText, frequency === f && styles.freqTextActive]}>
                {f === 'daily' ? '📅 Ежедневно' : '📆 Еженедельно'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Сохранение...' : 'Сохранить привычку'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },

  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    gap: Spacing.md,
  },
  previewEmoji: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewEmojiText: { fontSize: 30 },
  previewName: { ...Typography.bodyBold, color: Colors.textPrimary, fontSize: 17 },
  previewCategory: { ...Typography.caption, color: Colors.textSecondary, marginTop: 3, textTransform: 'capitalize' },

  label: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
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
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },

  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  emojiItem: {
    width: 46,
    height: 46,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentGlow,
  },
  emojiItemText: { fontSize: 22 },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.full,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  categoryEmoji: { fontSize: 15 },
  categoryLabel: { ...Typography.caption, color: Colors.textSecondary },

  freqRow: { flexDirection: 'row', gap: Spacing.sm },
  freqBtn: {
    flex: 1,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  freqBtnActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentGlow,
  },
  freqText: { ...Typography.caption, color: Colors.textSecondary },
  freqTextActive: { color: Colors.accentSoft },

  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  saveBtnText: { ...Typography.bodyBold, color: '#fff', fontSize: 16 },
});
