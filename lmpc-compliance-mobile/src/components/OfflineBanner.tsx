import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useOffline } from "../context/OfflineContext";

export const OfflineBanner: React.FC = () => {
  const { isOnline, isSyncing, queue, syncQueue } = useOffline();

  const pendingCount = queue.filter((q) => q.status !== "SYNCING").length;

  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <View style={[styles.container, !isOnline ? styles.offlineBg : styles.syncBg]}>
      <View style={styles.leftContent}>
        <Ionicons
          name={!isOnline ? "cloud-offline-outline" : "cloud-upload-outline"}
          size={18}
          color="#FFFFFF"
          style={styles.icon}
        />
        <Text style={styles.bannerText}>
          {!isOnline
            ? `Offline Mode: ${pendingCount} scan(s) queued locally`
            : isSyncing
            ? "Syncing scans to server..."
            : `${pendingCount} scan(s) ready to sync`}
        </Text>
      </View>

      {isOnline && pendingCount > 0 && (
        <TouchableOpacity style={styles.syncBtn} onPress={syncQueue} disabled={isSyncing}>
          {isSyncing ? (
            <ActivityIndicator size="small" color="#1E293B" />
          ) : (
            <Text style={styles.syncBtnText}>Sync Now</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  offlineBg: {
    backgroundColor: "#DC2626", // Red for offline
  },
  syncBg: {
    backgroundColor: "#2563EB", // Blue for pending sync
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  bannerText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  syncBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  syncBtnText: {
    color: "#1E293B",
    fontSize: 12,
    fontWeight: "700",
  },
});
