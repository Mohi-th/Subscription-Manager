import { View, Text, Image, Pressable } from 'react-native'
import React from 'react'
import { formatCurrency, formatStatusLabel, formatSubscriptionDateTime } from '@/lib/utils'
import { clsx } from 'clsx'
import {
    MaterialCommunityIcons,
    Ionicons,
    FontAwesome5,
} from '@expo/vector-icons'

/** Resolve a vector icon component from its family string */
function CategoryIcon({ name, family, size = 28, color = '#081126' }: {
    name: string;
    family?: string;
    size?: number;
    color?: string;
}) {
    switch (family) {
        case 'Ionicons':
            return <Ionicons name={name as any} size={size} color={color} />;
        case 'FontAwesome5':
            return <FontAwesome5 name={name as any} size={size} color={color} />;
        case 'MaterialCommunityIcons':
        default:
            return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
    }
}

const SubscriptionsCard = ({ name, price, currency, icon, billing, color, category, plan, renewalDate, status, expanded, onPress, paymentMethod, startDate, categoryIconName, categoryIconFamily }: SubscriptionCardProps) => {

    return (
        <Pressable onPress={onPress} className={clsx("sub-card", expanded ? "sub-card-expanded" : "bg-card")} style={!expanded && color ? { backgroundColor: color } : {}}>
            <View className='sub-head'>
                <View className='sub-main'>
                    {categoryIconName ? (
                        <View className='sub-icon items-center justify-center rounded-lg bg-white/50'>
                            <CategoryIcon
                                name={categoryIconName}
                                family={categoryIconFamily}
                            />
                        </View>
                    ) : (
                        <Image source={icon} className='sub-icon' />
                    )}
                    <View className='sub-copy'>
                        <Text className='sub-title' numberOfLines={1}>{name}</Text>
                        <Text numberOfLines={1} ellipsizeMode='tail' className='sub-meta'>{category?.trim() || plan?.trim() || (renewalDate ? formatSubscriptionDateTime(renewalDate) : "N/A")}</Text>
                    </View>
                </View>
                <View className='sub-price-box'>
                    <Text className='sub-price'>{formatCurrency(price, currency)}</Text>
                    <Text className='sub-billing'>{billing}</Text>
                </View>
            </View>
            {expanded && (
                <View className='sub-body'>
                    <View className='sub-details'>
                        <View className='sub-row'>
                            <View className='sub-row-copy'>
                                <Text className='sub-label'>Payment :</Text>
                                <Text className='sub-value' numberOfLines={1} ellipsizeMode='tail'>{paymentMethod?.trim() || "N/A"}</Text>
                            </View>
                        </View>
                        <View className='sub-row'>
                            <View className='sub-row-copy'>
                                <Text className='sub-label'>Category :</Text>
                                <Text className='sub-value' numberOfLines={1} ellipsizeMode='tail'>{category?.trim() || plan?.trim() || "N/A"}</Text>
                            </View>
                        </View>
                        <View className='sub-row'>
                            <View className='sub-row-copy'>
                                <Text className='sub-label'>Started :</Text>
                                <Text className='sub-value' numberOfLines={1} ellipsizeMode='tail'>{startDate ? formatSubscriptionDateTime(startDate) : "N/A"}</Text>
                            </View>
                        </View>
                        <View className='sub-row'>
                            <View className='sub-row-copy'>
                                <Text className='sub-label'>Renewal date :</Text>
                                <Text className='sub-value' numberOfLines={1} ellipsizeMode='tail'>{renewalDate ? formatSubscriptionDateTime(renewalDate) : "N/A"}</Text>
                            </View>
                        </View>
                        <View className='sub-row'>
                            <View className='sub-row-copy'>
                                <Text className='sub-label'>Status :</Text>
                                <Text className='sub-value' numberOfLines={1} ellipsizeMode='tail'>{status ? formatStatusLabel(status) : "N/A"}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            )}

        </Pressable>
    )
}

export default SubscriptionsCard