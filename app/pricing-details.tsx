import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator, Image, SafeAreaView,
    ScrollView,
    StyleSheet,
    Text, TouchableOpacity, View
} from "react-native";

import { partnerApi } from "../lib/api";

export default function PricingDetails() {
    const [pricing, setPricing] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    console.log("📄 Pricing Details Screen Loaded");

    useEffect(() => {
        loadPricing();
    }, []);

    const loadPricing = async () => {
        try {
            console.log("🚀 Loading pricing...");

            const response: any =
                await partnerApi.pricingCards();

            console.log(
                "✅ PRICING RESPONSE:",
                JSON.stringify(response, null, 2)
            );

            setPricing(response?.data || []);
        } catch (error) {
            console.log("❌ Pricing Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: "#fff",
            }}
        >
            {/* HEADER */}
            <View style={styles.headerBar}>
                <TouchableOpacity
                    onPress={() => router.push("/my-role")}
                >
                    <Image
                        source={require("../assets/images/logo.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.back()}
                >
                    <Ionicons
                        name="arrow-back"
                        size={28}
                        color="#000"
                    />
                </TouchableOpacity>
            </View>

            {/* SCREEN TITLE */}
            <View style={styles.titleContainer}>
                <Text style={styles.screenTitle}>
                    Pricing Details
                </Text>
            </View>

            {/* SCROLLABLE CONTENT */}
            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingBottom: 30,
                }}
            >
                {loading && (
                    <ActivityIndicator
                        size="large"
                        color="#FFD54F"
                    />
                )}

                {!loading && pricing.length === 0 && (
                    <Text style={styles.emptyText}>
                        No pricing data found
                    </Text>
                )}

                {!loading && pricing.length > 0 && (
                    <>
                        <View style={styles.tableHeader}>
                            <Text style={styles.headerIndex}>#</Text>
                            <Text style={styles.headerTitle}>Service</Text>
                            <Text style={styles.headerAmount}>Amount</Text>
                        </View>

                        {pricing.map((item, index) => (
                            <View
                                key={item.id || index}
                                style={styles.row}
                            >
                                <Text style={styles.index}>
                                    {index + 1}
                                </Text>

                                <Text style={styles.serviceName}>
                                    {item.title}
                                </Text>

                                <Text style={styles.staffAmount}>
                                    {item.staff_amount}
                                </Text>
                            </View>
                        ))}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        fontSize: 22,
        fontWeight: "800",
        marginBottom: 20,
        textAlign: "center",
    },

    emptyText: {
        textAlign: "center",
        marginTop: 40,
        color: "#666",
        fontSize: 16,
    },

    card: {
        backgroundColor: "#FFFBEA",
        borderWidth: 1,
        borderColor: "#FFD54F",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },

    title: {
        fontSize: 15,
        fontWeight: "700",
        color: "#000",
    },

    amount: {
        marginTop: 8,
        color: "#16a34a",
        fontWeight: "800",
        fontSize: 18,
    },

    tableHeader: {
        flexDirection: "row",
        paddingVertical: 12,
        paddingHorizontal: 8,
        backgroundColor: "#FFF8E1",
        borderBottomWidth: 2,
        borderBottomColor: "#FFD54F",
        marginTop: 10,
    },

    headerIndex: {
        width: 40,
        fontWeight: "700",
        fontSize: 14,
    },

    headerTitle: {
        flex: 1,
        fontWeight: "700",
        fontSize: 14,
    },

    headerAmount: {
        width: 90,
        textAlign: "right",
        fontWeight: "700",
        fontSize: 14,
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },

    index: {
        width: 40,
        fontWeight: "600",
    },

    serviceName: {
        flex: 1,
        fontSize: 14,
        color: "#111827",
    },

    staffAmount: {
        width: 90,
        textAlign: "right",
        fontWeight: "700",
        color: "#16A34A",
    },

    topHeader: {
        height: 82,
        paddingHorizontal: 20,
        backgroundColor: "#ffffff",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    logo: {
        width: 190,
        height: 64,
    },

    pageTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#000",
        marginBottom: 15,
    },

    titleContainer: {
        alignItems: "center",
        marginBottom: 2,
    },

    headerBar: {
        height: 92,
        paddingHorizontal: 20,
        backgroundColor: "#fff",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    // logo: {
    //     width: 160,
    //     height: 55,
    // },

    // titleContainer: {
    //     paddingBottom: 12,
    //     alignItems: "center",
    // },

    screenTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#000",
    },
});