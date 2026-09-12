import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useOffline } from "../context/OfflineContext";
import { RootStackParamList } from "../navigation/types";
import { InspectionApi } from "../services/api";

type ScreenRouteProp = RouteProp<RootStackParamList, "InspectionPreview">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const InspectionPreviewScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { photoUri, latitude, longitude, address } = route.params;

  const { isOnline, enqueueInspection } = useOffline();

  const [merchantName, setMerchantName] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!isOnline) {
      handleQueueOffline();
      return;
    }

    setSubmitting(true);
    try {
      const inspection = await InspectionApi.uploadScan({
        imageUri: photoUri,
        latitude,
        longitude,
      });

      Alert.alert(
        "Upload Confirmed",
        "Scan uploaded to Cloudinary and queued in Redis/BullMQ for AI feature extraction.",
        [
          {
            text: "Track Inspection",
            onPress: () => navigation.replace("InspectionDetail", { inspectionId: inspection._id }),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert(
        "Upload Failed",
        `${err?.response?.data?.message || err?.message || "Server unreachable"}. Save to offline queue instead?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Save Offline", onPress: handleQueueOffline },
        ]
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleQueueOffline = async () => {
    try {
      await enqueueInspection({
        imageUri: photoUri,
        latitude,
        longitude,
        merchantName,
        notes,
      });

      Alert.alert(
        "Saved to Offline Queue",
        "Scan stored locally on your device. It will automatically sync to the server when network connectivity is restored.",
        [{ text: "OK", onPress: () => navigation.navigate("MainTabs", { screen: "Dashboard" }) }]
      );
    } catch (err: any) {
      Alert.alert("Queue Error", err.message || "Failed to save offline scan.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#0F172A" />
              <Text style={styles.backText}>Retake</Text>
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Review Scan & Geotag</Text>
            <View style={{ width: 60 }} />
          </View>

          {/* Photo Preview */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: photoUri }} style={styles.image} resizeMode="contain" />
            <View style={styles.scaleCardCheckBadge}>
              <Ionicons name="card-outline" size={14} color="#F59E0B" />
              <Text style={styles.scaleCardCheckText}>Scaling Card Check</Text>
            </View>
          </View>

          {/* Geolocation Card */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="location" size={18} color="#2563EB" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.cardTitle}>Statutory Geotag Attached</Text>
                <Text style={styles.cardSubtitle}>
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </Text>
              </View>
            </View>
            {address ? <Text style={styles.addressText}>📍 {address}</Text> : null}
          </View>

          {/* Metadata Inputs */}
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Inspection Notes (Optional)</Text>

            <Text style={styles.inputLabel}>Merchant / Store Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Reliance Fresh, Metro Mall"
              placeholderTextColor="#94A3B8"
              value={merchantName}
              onChangeText={setMerchantName}
            />

            <Text style={styles.inputLabel}>Field Officer Remarks</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Add package condition, batch notes, or distributor observations..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.primaryBtn, !isOnline && styles.offlineBtn]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name={isOnline ? "cloud-upload-outline" : "save-outline"}
                    size={20}
                    color="#FFFFFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.primaryBtnText}>
                    {isOnline ? "Upload Scan & Run AI Analysis" : "Queue Offline on Device"}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {isOnline && (
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleQueueOffline} disabled={submitting}>
                <Text style={styles.secondaryBtnText}>Save to Offline Queue Instead</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "600",
  },
  screenTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  imageContainer: {
    width: "100%",
    height: 260,
    backgroundColor: "#0F172A",
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  scaleCardCheckBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  scaleCardCheckText: {
    color: "#FEF08A",
    fontSize: 11,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  addressText: {
    fontSize: 12,
    color: "#334155",
    marginTop: 10,
    backgroundColor: "#F1F5F9",
    padding: 8,
    borderRadius: 8,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
    marginBottom: 12,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  actions: {
    marginTop: 10,
  },
  primaryBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  offlineBtn: {
    backgroundColor: "#D97706",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryBtn: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  secondaryBtnText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
  },
});
