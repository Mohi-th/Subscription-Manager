import React, { useState, useMemo, useCallback } from 'react';
import { Text, View, TextInput, FlatList, Pressable } from 'react-native';
import SaveScreen from "../../components/SafeAreaView";
import SubscriptionsCard from "../../components/SubscriptionsCard";
import { useSubscriptions } from "@/lib/SubscriptionsContext";
import { useTrackScreen, EVENTS, captureEvent } from "@/lib/analytics";
import { usePostHog } from "posthog-react-native";
import { formatCurrency } from "@/lib/utils";

const STATUS_FILTERS = ['All', 'Active', 'Paused', 'Cancelled'] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

const Subscription = () => {
  const posthog = usePostHog();
  const { subscriptions } = useSubscriptions();
  useTrackScreen('Subscriptions');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('All');
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);

  const filteredSubscriptions = useMemo(() => {
    let result = subscriptions;

    // Filter by status
    if (activeFilter !== 'All') {
      result = result.filter(
        (sub) => sub.status?.toLowerCase() === activeFilter.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (sub) =>
          sub.name.toLowerCase().includes(query) ||
          sub.category?.toLowerCase().includes(query) ||
          sub.plan?.toLowerCase().includes(query) ||
          sub.billing?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [searchQuery, activeFilter, subscriptions]);

  const handleToggleCard = useCallback((item: Subscription) => {
    const isExpanding = expandedSubscriptionId !== item.id;
    setExpandedSubscriptionId((prev) => prev === item.id ? null : item.id);

    captureEvent(posthog, isExpanding ? EVENTS.SUBSCRIPTION_CARD_EXPANDED : EVENTS.SUBSCRIPTION_CARD_COLLAPSED, {
      subscription_id: item.id,
      subscription_name: item.name,
      screen: 'Subscriptions',
    });
  }, [expandedSubscriptionId, posthog]);

  const handleFilterPress = useCallback((filter: StatusFilter) => {
    setActiveFilter(filter);
    setExpandedSubscriptionId(null);
    captureEvent(posthog, EVENTS.SUBSCRIPTION_FILTER_CHANGED, {
      filter,
      screen: 'Subscriptions',
    });
  }, [posthog]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    setExpandedSubscriptionId(null);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim()) {
      captureEvent(posthog, EVENTS.SUBSCRIPTION_SEARCHED, {
        query: searchQuery.trim(),
        result_count: filteredSubscriptions.length,
      });
    }
  }, [searchQuery, filteredSubscriptions.length, posthog]);

  // Summary stats
  const totalMonthly = useMemo(() => {
    return subscriptions
      .filter((s) => s.status === 'active')
      .reduce((sum, s) => {
        if (s.billing === 'Yearly') return sum + s.price / 12;
        return sum + s.price;
      }, 0);
  }, [subscriptions]);

  const activeCount = subscriptions.filter((s) => s.status === 'active').length;

  return (
    <SaveScreen>
      <FlatList
        ListHeaderComponent={() => (
          <>
            {/* Page title */}
            <Text className="subs-page-title">Subscriptions</Text>

            {/* Summary strip */}
            <View className="subs-summary-strip">
              <View className="subs-summary-item">
                <Text className="subs-summary-value">{subscriptions.length}</Text>
                <Text className="subs-summary-label">Total</Text>
              </View>
              <View className="subs-summary-divider" />
              <View className="subs-summary-item">
                <Text className="subs-summary-value">{activeCount}</Text>
                <Text className="subs-summary-label">Active</Text>
              </View>
              <View className="subs-summary-divider" />
              <View className="subs-summary-item">
                <Text className="subs-summary-value">{formatCurrency(totalMonthly)}</Text>
                <Text className="subs-summary-label">Monthly</Text>
              </View>
            </View>

            {/* Search bar */}
            <View className="subs-search-wrap">
              <Text className="subs-search-icon">🔍</Text>
              <TextInput
                className="subs-search-input"
                placeholder="Search subscriptions..."
                placeholderTextColor="rgba(0, 0, 0, 0.35)"
                value={searchQuery}
                onChangeText={handleSearchChange}
                onBlur={handleSearchSubmit}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => handleSearchChange('')} className="subs-search-clear">
                  <Text className="subs-search-clear-text">✕</Text>
                </Pressable>
              )}
            </View>

            {/* Filter chips */}
            <View className="subs-filter-row">
              {STATUS_FILTERS.map((filter) => (
                <Pressable
                  key={filter}
                  onPress={() => handleFilterPress(filter)}
                  className={`subs-filter-chip ${activeFilter === filter ? 'subs-filter-chip-active' : ''}`}
                >
                  <Text className={`subs-filter-chip-text ${activeFilter === filter ? 'subs-filter-chip-text-active' : ''}`}>
                    {filter}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Result count */}
            <Text className="subs-result-count">
              {filteredSubscriptions.length} {filteredSubscriptions.length === 1 ? 'subscription' : 'subscriptions'}
              {activeFilter !== 'All' ? ` · ${activeFilter}` : ''}
              {searchQuery ? ` · "${searchQuery}"` : ''}
            </Text>
          </>
        )}
        data={filteredSubscriptions}
        renderItem={({ item }) => (
          <SubscriptionsCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => handleToggleCard(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="subs-empty">
            <Text className="subs-empty-emoji">📭</Text>
            <Text className="subs-empty-title">No subscriptions found</Text>
            <Text className="subs-empty-subtitle">
              {searchQuery
                ? `No results for "${searchQuery}"`
                : `No ${activeFilter.toLowerCase()} subscriptions`}
            </Text>
            {(searchQuery || activeFilter !== 'All') && (
              <Pressable
                className="subs-empty-reset"
                onPress={() => {
                  captureEvent(posthog, EVENTS.SUBSCRIPTION_FILTERS_CLEARED, {
                    previous_filter: activeFilter,
                    previous_query: searchQuery,
                  });
                  setSearchQuery('');
                  setActiveFilter('All');
                }}
              >
                <Text className="subs-empty-reset-text">Clear filters</Text>
              </Pressable>
            )}
          </View>
        }
        contentContainerClassName="pb-18"
      />
    </SaveScreen>
  );
};

export default Subscription;