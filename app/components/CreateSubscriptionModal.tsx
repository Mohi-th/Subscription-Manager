import { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { clsx } from 'clsx';
import dayjs from 'dayjs';
import { icons } from '@/constants/icons';
import { usePostHog } from 'posthog-react-native';
import { EVENTS, captureEvent } from '@/lib/analytics';

const CATEGORIES = [
  'Entertainment',
  'AI Tools',
  'Developer Tools',
  'Design',
  'Productivity',
  'Cloud',
  'Music',
  'Other',
] as const;

type Category = typeof CATEGORIES[number];
type Frequency = 'Monthly' | 'Yearly';

const CATEGORY_COLORS: Record<Category, string> = {
  Entertainment: '#fbbf24',
  'AI Tools': '#b8d4e3',
  'Developer Tools': '#e8def8',
  Design: '#f5c542',
  Productivity: '#a3e635',
  Cloud: '#93c5fd',
  Music: '#f9a8d4',
  Other: '#d1d5db',
};

const CATEGORY_ICONS: Record<Category, { name: string; family: string }> = {
  Entertainment: { name: 'movie-open', family: 'MaterialCommunityIcons' },
  'AI Tools': { name: 'robot', family: 'MaterialCommunityIcons' },
  'Developer Tools': { name: 'code-braces', family: 'MaterialCommunityIcons' },
  Design: { name: 'palette', family: 'MaterialCommunityIcons' },
  Productivity: { name: 'lightning-bolt', family: 'MaterialCommunityIcons' },
  Cloud: { name: 'cloud', family: 'MaterialCommunityIcons' },
  Music: { name: 'music', family: 'MaterialCommunityIcons' },
  Other: { name: 'apps', family: 'MaterialCommunityIcons' },
};

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (subscription: Subscription) => void;
}

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onSubmit,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('Monthly');
  const [category, setCategory] = useState<Category | null>(null);

  const posthog = usePostHog();

  // Validation
  const [nameTouched, setNameTouched] = useState(false);
  const [priceTouched, setPriceTouched] = useState(false);

  // Track modal open
  useEffect(() => {
    if (visible) {
      captureEvent(posthog, EVENTS.CREATE_MODAL_OPENED);
    }
  }, [visible]);

  const nameValid = name.trim().length > 0;
  const priceValid = price.length > 0 && !isNaN(Number(price)) && Number(price) > 0;
  const formValid = nameValid && priceValid;

  const resetForm = () => {
    setName('');
    setPrice('');
    setFrequency('Monthly');
    setCategory(null);
    setNameTouched(false);
    setPriceTouched(false);
  };

  const handleClose = () => {
    captureEvent(posthog, EVENTS.CREATE_MODAL_CLOSED, {
      had_input: name.trim().length > 0 || price.length > 0,
    });
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!formValid) return;

    const now = dayjs();
    const renewalDate =
      frequency === 'Monthly'
        ? now.add(1, 'month').toISOString()
        : now.add(1, 'year').toISOString();

    const selectedCategory = category ?? 'Other';
    const categoryIcon = CATEGORY_ICONS[selectedCategory];

    const subscription: Subscription = {
      id: `sub-${Date.now()}`,
      name: name.trim(),
      price: Number(price),
      currency: 'USD',
      billing: frequency,
      category: selectedCategory,
      status: 'active',
      startDate: now.toISOString(),
      renewalDate,
      icon: icons.wallet,
      color: CATEGORY_COLORS[selectedCategory],
      categoryIconName: categoryIcon.name,
      categoryIconFamily: categoryIcon.family,
    };

    onSubmit(subscription);
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Overlay */}
        <Pressable className="modal-overlay" onPress={handleClose} />

        {/* Modal card */}
        <View className="modal-container">
          {/* Header */}
          <View className="modal-header">
            <Text className="modal-title">New Subscription</Text>
            <Pressable className="modal-close" onPress={handleClose}>
              <Text className="modal-close-text">✕</Text>
            </Pressable>
          </View>

          {/* Body */}
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="modal-body">
              {/* Name */}
              <View className="auth-field">
                <Text className="auth-label">Subscription Name</Text>
                <TextInput
                  className={clsx(
                    'auth-input',
                    nameTouched && !nameValid && 'auth-input-error'
                  )}
                  placeholder="e.g. Netflix, Spotify…"
                  placeholderTextColor="rgba(0, 0, 0, 0.35)"
                  value={name}
                  onChangeText={setName}
                  onBlur={() => setNameTouched(true)}
                  autoCapitalize="words"
                />
                {nameTouched && !nameValid && (
                  <Text className="auth-error">Name is required</Text>
                )}
              </View>

              {/* Price */}
              <View className="auth-field">
                <Text className="auth-label">Price (USD)</Text>
                <TextInput
                  className={clsx(
                    'auth-input',
                    priceTouched && !priceValid && 'auth-input-error'
                  )}
                  placeholder="9.99"
                  placeholderTextColor="rgba(0, 0, 0, 0.35)"
                  value={price}
                  onChangeText={setPrice}
                  onBlur={() => setPriceTouched(true)}
                  keyboardType="decimal-pad"
                />
                {priceTouched && !priceValid && (
                  <Text className="auth-error">Enter a valid price</Text>
                )}
              </View>

              {/* Frequency */}
              <View className="auth-field">
                <Text className="auth-label">Billing Frequency</Text>
                <View className="picker-row">
                  {(['Monthly', 'Yearly'] as const).map((opt) => (
                    <Pressable
                      key={opt}
                      className={clsx(
                        'picker-option',
                        frequency === opt && 'picker-option-active'
                      )}
                      onPress={() => {
                        setFrequency(opt);
                        captureEvent(posthog, EVENTS.CREATE_FREQUENCY_CHANGED, { frequency: opt });
                      }}
                    >
                      <Text
                        className={clsx(
                          'picker-option-text',
                          frequency === opt && 'picker-option-text-active'
                        )}
                      >
                        {opt}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Category */}
              <View className="auth-field">
                <Text className="auth-label">Category</Text>
                <View className="category-scroll">
                  {CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat}
                      className={clsx(
                        'category-chip',
                        category === cat && 'category-chip-active'
                      )}
                      onPress={() => {
                        const newValue = category === cat ? null : cat;
                        setCategory(newValue as any);
                        if (newValue) {
                          captureEvent(posthog, EVENTS.CREATE_CATEGORY_SELECTED, { category: newValue });
                        }
                      }}
                    >
                      <Text
                        className={clsx(
                          'category-chip-text',
                          category === cat && 'category-chip-text-active'
                        )}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Submit */}
              <Pressable
                className={clsx(
                  'auth-button',
                  !formValid && 'auth-button-disabled'
                )}
                onPress={handleSubmit}
                disabled={!formValid}
              >
                <Text className="auth-button-text">Add Subscription</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
