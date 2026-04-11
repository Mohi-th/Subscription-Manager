import { View, Text } from 'react-native'
import React from 'react'
import { Link, useLocalSearchParams } from 'expo-router'
import { useTrackScreen } from '@/lib/analytics'

const SubscriptionDetails = () => {

    const { id } = useLocalSearchParams<{ id: string }>();

    useTrackScreen('Subscription Detail', {
        subscription_id: id,
    });

    return (
        <View>
            <Text>SubscriptionDetails : {id}</Text>
            <Link href='/'>Go back</Link>
        </View>
    )
}

export default SubscriptionDetails