import { View, Text, Image } from 'react-native'
import React, { useRef } from 'react'
import { Tabs } from 'expo-router'
import { tabs } from '@/constants/data'
import clsx from "clsx"
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { components, colors } from '@/constants/theme'
import { usePostHog } from 'posthog-react-native'
import { EVENTS, captureEvent } from '@/lib/analytics'

const tabBar = components.tabBar;

const TabLayout = () => {

  const insets = useSafeAreaInsets()
  const posthog = usePostHog()
  const previousTab = useRef<string>('index')

  const TabIcon = ({ focused, icon }: TabIconProps) => {
    return (
      <View className='tabs-icon'>
        <View className={clsx("tabs-pill", focused && "tabs-active")}>
          <Image source={icon} className="tabs-glyph" />
        </View>
      </View>
    )
  }

  return (
    <Tabs
      screenListeners={{
        state: (e) => {
          const data = e.data as any;
          if (data?.state) {
            const routes = data.state.routes;
            const index = data.state.index;
            const currentRoute = routes[index];
            if (currentRoute && currentRoute.name !== previousTab.current) {
              captureEvent(posthog, EVENTS.TAB_SWITCHED, {
                from_tab: previousTab.current,
                to_tab: currentRoute.name,
              });
              previousTab.current = currentRoute.name;
            }
          }
        },
      }}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Math.max(insets.bottom, tabBar.horizontalInset),
          height: tabBar.height,
          marginHorizontal: tabBar.horizontalInset,
          borderRadius: tabBar.radius,
          backgroundColor: colors.primary,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarItemStyle: {
          paddingVertical: tabBar.height / 2 - tabBar.iconFrame / 1.6
        },
        tabBarIconStyle: {
          width: tabBar.iconFrame,
          height: tabBar.iconFrame,
          alignItems: "center"
        }
      }}>
      {
        tabs.map((tab) => <Tabs.Screen
          name={tab?.name}
          key={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={tab.icon} />
            )
          }} />)
      }
    </Tabs>
  )
}

export default TabLayout