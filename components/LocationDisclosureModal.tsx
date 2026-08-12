import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface LocationDisclosureModalProps {
  visible: boolean;
  onContinue: () => void;
  onCancel: () => void;
}

export default function LocationDisclosureModal({
  visible,
  onContinue,
  onCancel,
}: LocationDisclosureModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header Warm Gold Icon Circle */}
          <View style={styles.iconCircle}>
            <Ionicons name="location" size={36} color="#D97706" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Location Permission Required 📍</Text>

          {/* Concise Explanation */}
          <Text style={styles.message}>
            <Text style={styles.appName}>The Neatify Team Partner</Text> accesses
            your background location while <Text style={styles.boldText}>ON DUTY</Text>{" "}
            to assign nearby jobs, track travel & monitor service zones.
          </Text>

          {/* Solid Rounded Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onContinue}
              activeOpacity={0.85}
            >
              <Ionicons name="navigate" size={18} color="#000" style={{ marginRight: 6 }} />
              <Text style={styles.primaryBtnText}>Enable Location Access</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryBtnText}>Not Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#FDE047",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 24,
  },
  message: {
    fontSize: 13,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  appName: {
    fontWeight: "700",
    color: "#111827",
  },
  boldText: {
    fontWeight: "700",
    color: "#D97706",
  },
  buttonContainer: {
    width: "100%",
    gap: 10,
  },
  primaryBtn: {
    width: "100%",
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FFD700",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000000",
  },
  secondaryBtn: {
    width: "100%",
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },
});
