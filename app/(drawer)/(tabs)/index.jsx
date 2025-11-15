import React from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TextInput,
    TouchableOpacity,
    SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const newsData = [
    {
        id: 1,
        title: "Alert: New Skin Disease Discovered - Learn More Now!",
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=80&h=80&fit=crop"
    },
    {
        id: 2,
        title: "Conference Alert: Advanced AI for skin analysis by Dr. Kureha",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop"
    },
    {
        id: 3,
        title: "Revealing the Surprising Facts About Women's Skin - Research",
        image: "https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=80&h=80&fit=crop"
    },
    {
        id: 4,
        title: "Alert: New Skin Disease Discovered - Learn More Now!",
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=80&h=80&fit=crop"
    },
    {
        id: 5,
        title: "Conference Alert: Advanced AI for skin analysis by Dr. Kureha",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop"
    },
    {
        id: 6,
        title: "Revealing the Surprising Facts About Women's Skin - Research",
        image: "https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=80&h=80&fit=crop"
    },
];

const recentSearchImages = [
    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=400&fit=crop",
    "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=300&h=400&fit=crop",
    "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=300&h=400&fit=crop"
];

const IndexTab = () => {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1">
                <View className="px-5 pt-4 pb-4 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <Image
                            source={{ uri: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" }}
                            className="w-14 h-14 rounded-full mr-3"
                        />
                        <View>
                            <Text className="text-gray-600 text-base">Good morning,</Text>
                            <Text className="text-gray-900 text-2xl font-bold">Lola</Text>
                        </View>
                    </View>
                    <TouchableOpacity className="relative">
                        <Ionicons name="notifications-outline" size={28} color="#374151" />
                        <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                    </TouchableOpacity>
                </View>

                <View className="px-5 mb-6">
                    <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
                        <Ionicons name="search-outline" size={20} color="#9CA3AF" />
                        <TextInput
                            placeholder="Search for doctors, labs, etc."
                            placeholderTextColor="#9CA3AF"
                            className="flex-1 ml-2 text-base text-gray-900"
                        />
                        <Ionicons name="mic-outline" size={20} color="#9CA3AF" />
                    </View>
                </View>

                <View className="mb-6">
                    <View className="flex-row justify-between items-center px-5 mb-4">
                        <Text className="text-gray-900 text-xl font-bold">Recent Searches</Text>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20 }}
                    >
                        {recentSearchImages.map((img, index) => (
                            <TouchableOpacity key={index} style={{ marginRight: 12 }}>
                                <Image
                                    source={{ uri: img }}
                                    className="w-40 h-64 rounded-2xl"
                                />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View className="px-5 pb-8">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-gray-900 text-xl font-bold">Latest News</Text>
                        <TouchableOpacity>
                            <Text className="text-gray-500 text-sm">see all</Text>
                        </TouchableOpacity>
                    </View>

                    {newsData.map((news) => (
                        <TouchableOpacity
                            key={news.id}
                            className="flex-row items-center mb-4 bg-gray-50 rounded-2xl p-3"
                        >
                            <Image
                                source={{ uri: news.image }}
                                className="w-20 h-20 rounded-xl mr-4"
                            />
                            <Text className="flex-1 text-gray-900 text-base font-medium leading-5">
                                {news.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default IndexTab;