import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HOME_SUBSCRIPTIONS } from '@/constants/data';
import { icons } from '@/constants/icons';

const STORAGE_KEY = '@recurrly/subscriptions';

interface SubscriptionsContextType {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
  isLoaded: boolean;
}

const SubscriptionsContext = createContext<SubscriptionsContextType | null>(null);

/**
 * Serialise subscriptions for storage.
 * `icon` is an `ImageSourcePropType` (a require() result) which can't be
 * serialised to JSON, so we strip it before saving and restore it on load.
 */
function serialise(subs: Subscription[]): string {
  const stripped = subs.map(({ icon, ...rest }) => rest);
  return JSON.stringify(stripped);
}

function deserialise(json: string): Subscription[] {
  const parsed: Omit<Subscription, 'icon'>[] = JSON.parse(json);
  return parsed.map((sub) => ({
    ...sub,
    icon: icons.wallet, // user-created subs always use the wallet icon
  }));
}

export function SubscriptionsProvider({ children }: { children: React.ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(HOME_SUBSCRIPTIONS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted subscriptions on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const userSubs = deserialise(stored);
          // Prepend user-created subs before the seed data
          setSubscriptions([...userSubs, ...HOME_SUBSCRIPTIONS]);
        }
      } catch (e) {
        console.error('Failed to load subscriptions:', e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  // Persist only user-created subscriptions (those not in seed data)
  const persist = useCallback(async (allSubs: Subscription[]) => {
    const seedIds = new Set(HOME_SUBSCRIPTIONS.map((s) => s.id));
    const userSubs = allSubs.filter((s) => !seedIds.has(s.id));
    try {
      await AsyncStorage.setItem(STORAGE_KEY, serialise(userSubs));
    } catch (e) {
      console.error('Failed to persist subscriptions:', e);
    }
  }, []);

  const addSubscription = useCallback((subscription: Subscription) => {
    setSubscriptions((prev) => {
      const next = [subscription, ...prev];
      persist(next);
      return next;
    });
  }, [persist]);

  return (
    <SubscriptionsContext.Provider value={{ subscriptions, addSubscription, isLoaded }}>
      {children}
    </SubscriptionsContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionsContext);
  if (!context) {
    throw new Error('useSubscriptions must be used within a SubscriptionsProvider');
  }
  return context;
}
