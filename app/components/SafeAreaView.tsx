import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {styled} from "nativewind"

const SafeAreaView=styled(RNSafeAreaView);

const SaveScreen = ({children}:{children:React.ReactNode}) => {
  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
      {children}
    </SafeAreaView>
  )
}

export default SaveScreen