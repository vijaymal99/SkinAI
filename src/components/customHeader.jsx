import {StyleSheet, View, Text, TouchableOpacity} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {Feather} from "@expo/vector-icons";

const CustomHeader = () => {
    return (
        <>
            <StatusBar style="dark" backgroundColor="#f9f9f9" />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>


                    <Text className='text-2xl text-[#9333ea]'>𝕊𝕜𝕚𝕟𝔸𝕀</Text>

                    <TouchableOpacity
                        className='flex-row items-center justify-evenly px-2  py-2 rounded-full bg-[#9333ea] gap-x-2  border-gray-600'
                    >
                        <Feather name="user" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: "#f9f9f9", 
    },
    header: {
        height: 56,
        width: "100%",
        backgroundColor: "#f9f9f9",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,

        // iOS shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,

        // Android elevation
        // elevation: 3,
    },
});

export default CustomHeader;
