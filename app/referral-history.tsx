import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  DimensionValue,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "../lib/supabase";

export default function ReferralHistoryScreen() {
  const [referrals, setReferrals] = useState([]);
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [shownRewards, setShownRewards] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [totalRewards, setTotalRewards] = useState(0);

  useEffect(() => {
    loadReferrals();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReferrals();
    setRefreshing(false);
  };

  const loadReferrals = async () => {
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) return;

    const userId = authData.user.id;

    // FETCH REFERRED USERS
    const { data: referredUsers } = await supabase
      .from("staff_profile")
      .select("*")
      .eq("referred_by", userId);

    console.log("REFERRED USERS:", referredUsers);

    if (!referredUsers || referredUsers.length === 0) {
      setReferrals([]);
      return;
    }

    // FETCH COMPLETED BOOKINGS
    const updatedData = await Promise.all(
      referredUsers.map(async (user: any) => {
        const { data: referralData } = await supabase
          .from("staff_referral_forms")
          .select("completed_booking, bonus_status, bonus_amount")
          .eq("id", user.referral_form_id)
          .single();

        console.log(
          "REFERRAL MATCH:",
          user.name,
          user.referral_form_id,
          referralData,
        );
        return {
          ...user,
          completed_booking: referralData?.completed_booking || 0,
          bonus_status: referralData?.bonus_status || "pending",
          bonus_amount: referralData?.bonus_amount || 0,
        };
      }),
    );

    const totalEarned = updatedData.reduce((sum, item: any) => {
      if (item.bonus_status === "paid") {
        return sum + Number(item.bonus_amount || 0);
      }
      return sum;
    }, 0);

    setTotalRewards(totalEarned);

    setReferrals(updatedData as any);
  };

  const renderItem = ({ item }: any) => {
    const progressWidth: DimensionValue = `${Math.min(
      (item.completed_booking / 30) * 100,
      100,
    )}%`;

    if (
      item.completed_booking >= 30 &&
      item.bonus_status === "pending" &&
      !shownRewards.includes(item.id)
    ) {
      setTimeout(() => {
        Alert.alert(
          "Congratulations 🎉",
          `You have earned ₹1500 as your referral ${item.name} completed 30 successful bookings.\n\nYou will receive your amount shortly.`,
        );

        setShownRewards((prev) => [...prev, item.id]);
      }, 500);
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.name}>{item.name}</Text>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.bookingCount}>
              {item.completed_booking}/30 Completed
            </Text>

            {item.completed_booking >= 30 && item.bonus_amount > 0 && (
              <Text
                style={[
                  styles.bonusAmount,
                  {
                    color: item.bonus_status === "paid" ? "#16A34A" : "#EA580C",
                  },
                ]}
              >
                +₹{item.bonus_amount}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
        </View>

        {item.completed_booking >= 30 && (
          <>
            {item.bonus_status === "pending" && (
              <View style={styles.pendingBtn}>
                <Text style={styles.pendingText}>Pending</Text>
              </View>
            )}

            {item.bonus_status === "paid" && (
              <View style={styles.paidBtn}>
                <Text style={styles.paidText}>Paid</Text>
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFD700" barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/my-role")}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            contentFit="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/refer-and-earn")
          }
        >
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.screenTitle}>Referral Tracking</Text>
          <Text style={styles.screenSubtitle}>Track referral progress</Text>
        </View>

        <View style={styles.rewardCard}>
          <Text style={styles.rewardTitle}>Rewards Earned</Text>
          <Text style={styles.rewardAmount}>₹{totalRewards}</Text>
        </View>
      </View>

      <FlatList
        data={referrals}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FFD700"]}
            tintColor="#FFD700"
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No referrals available</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    height: 72,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },

  name: {
    fontSize: 17,
    fontWeight: "800",
    color: "#000",
  },

  bookingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },

  progressContainer: {
    marginTop: 12,
  },

  progressBackground: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 8,
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#22C55E",
    borderRadius: 999,
  },

  rewardBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },

  rewardText: {
    color: "#166534",
    fontWeight: "800",
    fontSize: 13,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 80,
    color: "#64748B",
    fontSize: 15,
    fontWeight: "600",
  },

  logo: {
    width: 220,
    height: 70,
  },

  titleCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 14,
    borderRadius: 24,
    paddingVertical: 15,
    paddingHorizontal: 24,
  },

  screenTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
  },

  screenSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  bookingCount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },

  claimBtn: {
    marginTop: 14,
    backgroundColor: "#FFD700",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  claimBtnText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "800",
  },

  pendingBtn: {
    marginTop: 14,
    backgroundColor: "#FFF7ED",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  pendingText: {
    color: "#EA580C",
    fontSize: 14,
    fontWeight: "800",
  },

  paidBtn: {
    marginTop: 14,
    backgroundColor: "#DCFCE7",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  paidText: {
    color: "#15803D",
    fontSize: 14,
    fontWeight: "800",
  },

  bonusAmount: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "800",
  },

  summaryRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 36,
    marginBottom: 14,
    gap: 12,
  },

  summaryCard: {
    flex: 1.5,
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },

  rewardCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
  },

  rewardTitle: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "700",
  },

  rewardAmount: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: "900",
    color: "#16A34A",
  },
});
