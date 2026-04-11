import React from 'react';
import { Text } from 'react-native';
import SaveScreen from "../../components/SafeAreaView";
import { useTrackScreen } from "@/lib/analytics";

const Subscription = () => {
  useTrackScreen('Subscriptions');

  return (
    <SaveScreen>
      <Text>Subscription</Text>
    </SaveScreen>
  )
}

export default Subscription