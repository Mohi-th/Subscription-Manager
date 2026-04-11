
import { HOME_BALANCE, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { formatCurrency } from "@/lib/utils";
import { useTrackScreen, EVENTS, captureEvent } from "@/lib/analytics";
import { useSubscriptions } from "@/lib/SubscriptionsContext";
import { usePostHog } from "posthog-react-native";
import { useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import ListHeading from "../../components/ListHeading";
import SaveScreen from "../../components/SafeAreaView";
import SubscriptionsCard from "../../components/SubscriptionsCard";
import UpcomingSubscriptionCard from "../../components/UpcomingSubscriptionCard";
import CreateSubscriptionModal from "../../components/CreateSubscriptionModal";

export default function App() {
  const posthog = usePostHog();
  const { user } = useUser();
  useTrackScreen('Home');

  const { subscriptions, addSubscription } = useSubscriptions();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`
    : user?.fullName || user?.emailAddresses[0]?.emailAddress || 'User';

  const avatarSource = user?.imageUrl
    ? { uri: user.imageUrl }
    : images.avatar;

  const handleToggleCard = (item: Subscription) => {
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
    captureEvent(posthog, EVENTS.ADD_BUTTON_CLICKED, { screen: 'Home' });
    setModalVisible(true);
  };

  const handleCreateSubscription = (subscription: Subscription) => {
    addSubscription(subscription);
    captureEvent(posthog, EVENTS.SUBSCRIPTION_CREATED, {
      subscription_name: subscription.name,
      subscription_price: subscription.price,
      subscription_billing: subscription.billing,
      subscription_category: subscription.category,
    });
  };

  return (
    <SaveScreen>
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image source={avatarSource} className="home-avatar" />
                <Text className="home-user-name">{displayName}</Text>
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
        data={subscriptions}
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

      <CreateSubscriptionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreateSubscription}
      />
    </SaveScreen>
  );
}