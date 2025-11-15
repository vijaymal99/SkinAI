import { Tabs } from 'expo-router';
import {Fontisto, MaterialIcons} from "@expo/vector-icons";
import CustomHeader from "@/src/components/customHeader";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function TabLayout() {
    const insets = useSafeAreaInsets();
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#9333ea',
                header: () => <CustomHeader />,
                tabBarStyle: {
                    paddingBottom: insets.bottom,
                    backgroundColor:'#fff',
                    height: 60 + insets.bottom,
                },
            }}

        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => (
                        <Fontisto size={20} name="home" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="image"
                options={{
                    title: 'Gallery',
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons size={28} name="add-photo-alternate" color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
