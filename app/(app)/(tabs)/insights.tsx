import React from 'react';
import { Text } from 'react-native';
import SaveScreen from "../../components/SafeAreaView";
import { useTrackScreen } from "@/lib/analytics";

const Insights = () => {
  useTrackScreen('Insights');

  return (
    <SaveScreen>
      <Text>Insights</Text>
    </SaveScreen>
  )
}

export default Insights