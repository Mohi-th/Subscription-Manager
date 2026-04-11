import React from 'react'
import { Stack } from 'expo-router'
import { SubscriptionsProvider } from '@/lib/SubscriptionsContext'

function AppLayout() {
  return (
    <SubscriptionsProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SubscriptionsProvider>
  )
}

export default AppLayout