import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

function RootLayout(){
  return (
    <Stack screenOptions={{headerShown:true}}/>
  )
}

export default RootLayout