import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "../lib/supabase";

export default function ReferAndEarnScreen() {
  const [referralCode, setReferralCode] = useState("");
  const [showSteps, setShowSteps] = useState(false);
  const [referralCount, setReferralCount] = useState(0);
  const [totalRewards, setTotalRewards] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedModalVisible, setCopiedModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("Referral link copied successfully");

  useEffect(() => {
    loadReferralCode();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReferralCode();
    setRefreshing(false);
  };

  const loadReferralCode = async () => {
    const { data } = await supabase.auth.getUser();

    if (!data.user) return;

    const userId = data.user.id;

    // FETCH REFERRAL CODE
    const { data: profile } = await supabase
      .from("staff_profile")
      .select("referral_code")
      .eq("id", userId)
      .single();

    if (profile?.referral_code) {
      setReferralCode(profile.referral_code);
    }

    // FETCH REFERRAL COUNT
    const { count } = await supabase
      .from("staff_profile")
      .select("*", { count: "exact", head: true })
      .eq("referred_by", userId);

    setReferralCount(count || 0);

    // FETCH ONLY CURRENT USER'S REFERRAL REWARDS

    const { data: referredUsers } = await supabase
      .from("staff_profile")
      .select("referral_form_id")
      .eq("referred_by", userId);

    let totalEarned = 0;

    if (referredUsers?.length) {
      const referralFormIds = referredUsers
        .map((user) => user.referral_form_id)
        .filter(Boolean);

      if (referralFormIds.length > 0) {
        const { data: rewardsData } = await supabase
          .from("staff_referral_forms")
          .select("bonus_amount, bonus_status")
          .in("id", referralFormIds);

        totalEarned =
          rewardsData?.reduce((sum, item) => {
            if (item.bonus_status === "paid") {
              return sum + Number(item.bonus_amount || 0);
            }
            return sum;
          }, 0) || 0;
      }
    }

    setTotalRewards(totalEarned);
  };

  const referralLink =
    `https://docs.google.com/forms/d/e/1FAIpQLSdla23ak9gah9ttKBOT-zpk36EqyEMHDjrDiPIY_rWMN5Gxtw/viewform?usp=pp_url&entry.441806303=` +
    referralCode;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(referralLink);
    setModalMessage("Referral link copied successfully");
    setCopiedModalVisible(true);
  };

  const handleWhatsAppShare = async () => {
    const message =
      `Hi 👋\n\n` +
      `Join The Neatify Team as a Service Partner.\n\n` +
      `Complete 30 successful bookings and earn exciting rewards.\n\n` +
      `Apply here:\n${referralLink}\n\n` +
      `Referral Code: ${referralCode}`;

    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;

    Linking.openURL(url);
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
            router.canGoBack() ? router.back() : router.replace("/my-account")
          }
        >
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FFD700"]}
            tintColor="#FFD700"
          />
        }
      >
        {/* TOP CARD */}
        <View style={styles.topCard}>
          <Text style={styles.title}>Invite Partners & Earn ₹1500</Text>

          <Text style={styles.subTitle}>
            When your referred partner completes 30 successful bookings.
          </Text>

          {/* REFERRAL STATS */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Referrals</Text>

              <Text style={styles.statValue}>{referralCount}</Text>

              <TouchableOpacity
                style={styles.viewBtn}
                onPress={() => router.push("/referral-history")}
              >
                <Text style={styles.viewBtnText}>View</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Earnings</Text>
              <Text style={styles.statValue}>₹{totalRewards}</Text>
            </View>
          </View>

          {/* SMALL REFERRAL CODE */}
          <View style={styles.smallCodeWrap}>
            <Text style={styles.smallCodeLabel}>Referral Code</Text>

            <View style={styles.smallCodeBox}>
              <Text style={styles.smallCodeText}>
                {referralCode || "Loading..."}
              </Text>

              <TouchableOpacity
                style={styles.copyMiniBtn}
                onPress={async () => {
                  await Clipboard.setStringAsync(referralCode);
                  setModalMessage("Referral code copied");
                  setCopiedModalVisible(true);
                }}
              >
                <Ionicons name="copy-outline" size={16} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* COPY BUTTON */}
        <TouchableOpacity style={styles.primaryBtn} onPress={handleCopy}>
          <Text style={styles.primaryBtnText}>Copy Referral Link</Text>
        </TouchableOpacity>
        {/* WHATSAPP BUTTON */}
        <TouchableOpacity
          style={styles.whatsappBtn}
          onPress={handleWhatsAppShare}
        >
          <Ionicons name="logo-whatsapp" size={22} color="#fff" />

          <Text style={styles.whatsappText}>Share on WhatsApp</Text>
        </TouchableOpacity>
        {/* INFO CARD */}
        {/* HOW IT WORKS */}
        <View style={styles.infoCard}>
          <TouchableOpacity
            style={styles.infoHeader}
            onPress={() => setShowSteps(!showSteps)}
          >
            <Text style={styles.infoTitle}>How it works?</Text>

            <Ionicons
              name={showSteps ? "chevron-up" : "chevron-down"}
              size={22}
              color="#000"
            />
          </TouchableOpacity>

          {showSteps && (
            <View style={{ marginTop: 14 }}>
              <Text style={styles.infoText}>1. Share your referral link.</Text>

              <Text style={styles.infoText}>
                2. New partner fills onboarding form.
              </Text>

              <Text style={styles.infoText}>
                3. Admin verifies and onboard partner.
              </Text>

              <Text style={styles.infoText}>
                4. Complete 30 bookings to unlock ₹1500.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* CUSTOM COPIED POPUP MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={copiedModalVisible}
        onRequestClose={() => setCopiedModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderBadge}>
              <Ionicons name="checkmark-circle-outline" size={40} color="#0fd357" />
            </View>
            <Text style={styles.modalTitle}>Copied! 📋</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>

            <TouchableOpacity
              style={styles.modalOkBtn}
              onPress={() => setCopiedModalVisible(false)}
            >
              <Text style={styles.modalOkBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  topCard: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 22,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#000",
  },

  subTitle: {
    marginTop: 10,
    fontSize: 15,
    color: "#64748B",
    lineHeight: 22,
  },

  codeBox: {
    marginTop: 24,
    backgroundColor: "#F1F5F9",
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
  },

  codeLabel: {
    color: "#64748B",
    fontWeight: "700",
    fontSize: 12,
  },

  codeText: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 2,
  },

  primaryBtn: {
    marginHorizontal: 20,
    backgroundColor: "#FFD700",
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
  },

  primaryBtnText: {
    fontWeight: "800",
    fontSize: 15,
    color: "#000",
  },

  whatsappBtn: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: "#25D366",
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  whatsappText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },

  infoCard: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 20,
  },

  infoTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 16,
  },

  infoText: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 12,
    lineHeight: 22,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
    gap: 14,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 95,
  },

  statLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "700",
  },

  statValue: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: "900",
    color: "#000",
  },

  smallCodeWrap: {
    marginTop: 16,
  },

  smallCodeLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "700",
    marginBottom: 8,
  },

  smallCodeBox: {
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  smallCodeText: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#000",
  },

  copyMiniBtn: {
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 8,
  },

  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  viewBtn: {
    marginTop: 12,
    backgroundColor: "#FFD700",
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 10,
  },

  viewBtnText: {
    fontWeight: "800",
    fontSize: 13,
    color: "#000",
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
    paddingVertical: 28,
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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  modalContent: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },

  modalHeaderBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },

  modalMessage: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },

  modalOkBtn: {
    width: "100%",
    backgroundColor: "#FFD700",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  modalOkBtnText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#000",
  },
});
