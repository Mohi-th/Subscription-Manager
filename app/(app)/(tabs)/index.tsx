
import { HOME_BALANCE, HOME_SUBSCRIPTIONS, HOME_USER, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { formatCurrency } from "@/lib/utils";
import { useTrackScreen, EVENTS, captureEvent } from "@/lib/analytics";
import { usePostHog } from "posthog-react-native";
import dayjs from "dayjs";
import { useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import ListHeading from "../../components/ListHeading";
import SaveScreen from "../../components/SafeAreaView";
import SubscriptionsCard from "../../components/SubscriptionsCard";
import UpcomingSubscriptionCard from "../../components/UpcomingSubscriptionCard";

export default function App() {
  const posthog = usePostHog();
  useTrackScreen('Home');

  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);

  const handleToggleCard = (item: typeof HOME_SUBSCRIPTIONS[0]) => {
    const isExpanding = expandedSubscriptionId !== item.id;
    setExpandedSubscriptionId((prev) => prev === item.id ? null : item.id);

    captureEvent(posthog, isExpanding ? EVENTS.SUBSCRIPTION_CARD_EXPANDED : EVENTS.SUBSCRIPTION_CARD_COLLAPSED, {
      subscription_id: item.id,
      subscription_name: item.name,
      subscription_price: item.price,
      subscription_billing: item.billing,
    });
  };

  const handleAddPress = () => {
    captureEvent(posthog, EVENTS.ADD_BUTTON_CLICKED, {
      screen: 'Home',
    });
  };

  return (
    <SaveScreen>
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image source={images.avatar} className="home-avatar" />
                <Text className="home-user-name">{HOME_USER.name}</Text>
              </View>
              <Pressable onPress={handleAddPress}>
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>
            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                </Text>
              </View>
            </View>

            <View className="mb-5">
              <ListHeading title="Upcoming " />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => <UpcomingSubscriptionCard {...item} />}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={<Text className="home-empty-state">No upcoming subscriptions</Text>}
              />
            </View>
            <ListHeading title="All Subscriptions " />
          </>
        )}
        data={HOME_SUBSCRIPTIONS}
        renderItem={({ item }) => (
          <SubscriptionsCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => handleToggleCard(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4"></View>}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text className="home-empty-state">No subscriptions found</Text>}
        contentContainerClassName="pb-18"
      />
    </SaveScreen>
  );
}