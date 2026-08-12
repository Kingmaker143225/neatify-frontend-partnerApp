import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
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

export default function NewServices() {
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [deleteType, setDeleteType] = useState<"single" | "all" | null>(null);

  const loadNotifications = async () => {
    const { data: userData } = await supabase.auth.getUser();

    const email = userData.user?.email;

    if (!email) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("staff_email", email)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      Alert.alert("Error", error.message);

      return;
    }

    console.log("NOTIFICATIONS:", data);

    setNotifications(data || []);
  };

  useEffect(() => {
    loadNotifications();

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();

      return () => {};
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // ✅ EXIT SELECTION MODE

        if (selectedItems.length > 0) {
          setSelectedItems([]);

          return true;
        }

        // ✅ CLOSE DELETE MODAL

        if (showDeleteModal) {
          setShowDeleteModal(false);

          return true;
        }

        // ✅ CLOSE NOTIFICATION MODAL

        if (selectedNotification) {
          setSelectedNotification(null);

          return true;
        }

        return false;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [selectedItems, showDeleteModal, selectedNotification]),
  );

  /* ================= PULL TO REFRESH ================= */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, []);

  /* ================= GOOGLE MAPS ================= */
  const openMaps = (lat: number, lng: number) => {
    if (!lat || !lng) {
      Alert.alert("Location coordinates not available");
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar backgroundColor="#FFD700" barStyle="dark-content" />

      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/my-role")}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            contentFit="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            // ✅ EXIT SELECTION MODE FIRST

            if (selectedItems.length > 0) {
              setSelectedItems([]);

              return;
            }

            // ✅ CLOSE DELETE MODAL

            if (showDeleteModal) {
              setShowDeleteModal(false);

              return;
            }

            // ✅ CLOSE OPENED NOTIFICATION

            if (selectedNotification) {
              setSelectedNotification(null);

              return;
            }

            // ✅ NORMAL BACK

            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/my-role");
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* ================= CONTENT ================= */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* ================= NOTIFICATIONS ================= */}

        <View style={{ marginTop: 10 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "800",
              }}
            >
              Notifications
            </Text>

            {selectedItems.length > 0 ? (
              <TouchableOpacity
                onPress={() => {
                  setDeleteType("single");
                  setShowDeleteModal(true);
                }}
              >
                <Text
                  style={{
                    color: "red",
                    fontWeight: "700",
                  }}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setDeleteType("all");
                  setShowDeleteModal(true);
                }}
              >
                <Text
                  style={{
                    color: "red",
                    fontWeight: "700",
                  }}
                >
                  Clear All
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {notifications.length === 0 ? (
            <Text style={styles.emptyText}>No Notifications Available</Text>
          ) : (
            notifications.map((item) => (
              <TouchableOpacity
                key={item.id}
                onLongPress={() => {
                  if (selectedItems.includes(item.id)) {
                    setSelectedItems(
                      selectedItems.filter((id) => id !== item.id),
                    );
                  } else {
                    setSelectedItems([...selectedItems, item.id]);
                  }
                }}
                style={styles.notificationCard}
                activeOpacity={0.8}
                onPress={async () => {
                  // ✅ IF SELECTION MODE ACTIVE

                  if (selectedItems.length > 0) {
                    if (selectedItems.includes(item.id)) {
                      setSelectedItems(
                        selectedItems.filter((id) => id !== item.id),
                      );
                    } else {
                      setSelectedItems([...selectedItems, item.id]);
                    }

                    return;
                  }

                  // ✅ NORMAL OPEN

                  setSelectedNotification(item);

                  // ✅ MARK READ

                  if (!item.is_read) {
                    const { data, error } = await supabase
                      .from("notifications")
                      .update({
                        is_read: true,
                      })
                      .eq("id", item.id)
                      .select();

                    console.log("UPDATE RESULT:", data);

                    console.log("UPDATE ERROR:", error);

                    if (!error) {
                      setNotifications(
                        notifications.map((n) =>
                          n.id === item.id
                            ? {
                                ...n,
                                is_read: true,
                              }
                            : n,
                        ),
                      );
                    }
                  }
                }}
              >
                {/* ICON */}

                {selectedItems.length > 0 && (
                  <View
                    style={[
                      styles.checkbox,

                      selectedItems.includes(item.id) &&
                        styles.checkboxSelected,
                    ]}
                  >
                    {selectedItems.includes(item.id) && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                )}

                <View style={styles.iconCircle}>
                  <Ionicons name="notifications" size={20} color="#000" />
                </View>

                {/* CONTENT */}

                <View style={{ flex: 1 }}>
                  <View style={styles.notificationTop}>
                    <Text style={styles.notificationTitle} numberOfLines={1}>
                      {item.title}
                    </Text>

                    <Text style={styles.timeText}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                  </View>

                  <Text style={styles.notificationBody} numberOfLines={2}>
                    {item.body}
                  </Text>
                </View>
                {!item.is_read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))
          )}
        </View>

        <Modal
          visible={!!selectedNotification}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setSelectedNotification(null);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setSelectedNotification(null)}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>

              {selectedNotification && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalTitle}>
                    {selectedNotification.title}
                  </Text>

                  <Text style={styles.modalBody}>
                    {selectedNotification.body}
                  </Text>

                  {![
                    "payout_received",
                    "referral_reward",
                    "referral_reward_paid",
                    "service_cancelled",
                  ].includes(selectedNotification.type) && (
                    <View
                      style={{
                        marginTop: 20,
                      }}
                    >
                      <Text style={styles.detailLabel}>Customer</Text>

                      <Text style={styles.detailValue}>
                        {selectedNotification.customer_name}
                      </Text>

                      <Text style={styles.detailLabel}>Booking Date</Text>

                      <Text style={styles.detailValue}>
                        {selectedNotification.booking_date}
                      </Text>

                      <Text style={styles.detailLabel}>Booking Time</Text>

                      <Text style={styles.detailValue}>
                        {selectedNotification.booking_time}
                      </Text>

                      <Text style={styles.detailLabel}>Phone</Text>

                      <Text style={styles.detailValue}>
                        {selectedNotification.phone_number}
                      </Text>

                      <Text style={styles.detailLabel}>Address</Text>

                      <Text style={styles.detailValue}>
                        {selectedNotification.full_address}
                      </Text>

                      <Text style={styles.detailLabel}>Services</Text>

                      {selectedNotification.services?.map(
                        (s: any, i: number) => (
                          <Text key={i} style={styles.serviceText}>
                            • {s.title}
                          </Text>
                        ),
                      )}
                    </View>
                  )}

                  {selectedNotification.type === "referral_reward" ||
                  selectedNotification.type === "referral_reward_paid" ? (
                    <TouchableOpacity
                      style={styles.detailsBtn}
                      onPress={() => {
                        setSelectedNotification(null);
                        router.push("/referral-history");
                      }}
                    >
                      <Text style={styles.detailsBtnText}>
                        View Referral Details
                      </Text>
                    </TouchableOpacity>
                  ) : selectedNotification.type === "service_cancelled" ? (
                    <TouchableOpacity
                      style={styles.detailsBtn}
                      onPress={() => {
                        setSelectedNotification(null);
                        router.push("/cancellations");
                      }}
                    >
                      <Text style={styles.detailsBtnText}>View Details</Text>
                    </TouchableOpacity>
                  ) : selectedNotification.type !== "payout_received" ? (
                    <TouchableOpacity
                      style={styles.detailsBtn}
                      onPress={() => {
                        setSelectedNotification(null);
                        router.push("/assigned-services");
                      }}
                    >
                      <Text style={styles.detailsBtnText}>View Details</Text>
                    </TouchableOpacity>
                  ) : null}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        <Modal
          visible={showDeleteModal}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setShowDeleteModal(false);
          }}
        >
          <View style={styles.deleteOverlay}>
            <View style={styles.deleteBox}>
              <Text style={styles.deleteTitle}>
                {deleteType === "all"
                  ? "Delete All Notifications?"
                  : `Delete ${selectedItems.length} Notifications?`}
              </Text>

              <View style={styles.deleteActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setShowDeleteModal(false);
                  }}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={async () => {
                    if (deleteType === "single") {
                      const { error } = await supabase
                        .from("notifications")
                        .delete()
                        .in("id", selectedItems);

                      if (!error) {
                        setNotifications(
                          notifications.filter(
                            (n) => !selectedItems.includes(n.id),
                          ),
                        );

                        setSelectedItems([]);
                      }
                    }

                    if (deleteType === "all") {
                      const { data: userData } = await supabase.auth.getUser();

                      const email = userData.user?.email;

                      if (!email) return;

                      const { error } = await supabase
                        .from("notifications")
                        .delete()
                        .eq("staff_email", email);

                      if (!error) {
                        setNotifications([]);

                        setSelectedItems([]);
                      }
                    }

                    setShowDeleteModal(false);
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "700",
                    }}
                  >
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>

      {/* ================= FOOTER =================
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => router.replace("/my-role")}
        >
          <Ionicons name="home-outline" size={22} color="#000000" />
          <Text style={styles.footerText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => router.push("/dashboard")}
        >
          <Ionicons name="calendar-outline" size={22} color="#000" />
          <Text style={styles.footerText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => router.push("/my-account")}
        >
          <Ionicons name="person-outline" size={22} color="#000" />
          <Text style={styles.footerText}>Profile</Text>
        </TouchableOpacity>
      </View> */}
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  header: {
    height: 70,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    width: 190,
    height: 64,
  },

  emptyText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 40,
    color: "#666",
  },

  card: {
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    backgroundColor: "#FAFAFA",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10,
  },

  label: { fontWeight: "700" },

  section: { marginVertical: 10 },

  serviceItem: { marginLeft: 10, marginTop: 6 },

  serviceName: { fontWeight: "700" },

  serviceMeta: {
    marginLeft: 10,
    color: "#555",
    fontSize: 13,
  },

  mapBtn: {
    marginTop: 14,
    backgroundColor: "#FFD700",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  mapBtnText: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 14,
  },

  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
  },

  timeText: {
    marginTop: 12,
    fontSize: 12,
    color: "#777",
  },

  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF3B0",
    justifyContent: "center",
    alignItems: "center",
  },

  notificationTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  notificationTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },

  notificationBody: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },

  // footer: {
  //   height: 70,
  //   backgroundColor: "#ffffff",
  //   flexDirection: "row",
  //   justifyContent: "space-around",
  //   alignItems: "center",
  // },

  // footerItem: {
  //   alignItems: "center",
  //   justifyContent: "center",
  // },

  // footerText: {
  //   fontSize: 12,
  //   marginTop: 4,
  //   fontWeight: "600",
  //   color: "#000",
  // },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%",
  },

  closeBtn: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },

  modalBody: {
    fontSize: 16,
    lineHeight: 26,
    color: "#444",
    marginTop: 14,
  },

  detailLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 18,
    color: "#111827",
  },

  detailValue: {
    fontSize: 15,
    color: "#555",
    marginTop: 4,
  },

  serviceText: {
    fontSize: 15,
    color: "#444",
    marginTop: 6,
  },

  detailsBtn: {
    backgroundColor: "#FFD700",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },

  detailsBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },

  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563EB",
    marginLeft: 10,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  checkboxSelected: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  deleteOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  deleteBox: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 22,
  },

  deleteTitle: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },

  deleteActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },

  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginRight: 10,
  },

  deleteBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "red",
    borderRadius: 10,
  },
});
