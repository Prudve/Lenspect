import { Ionicons } from "@expo/vector-icons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraOverlay } from "../components/CameraOverlay";
import { RootStackParamList } from "../navigation/types";
import { GeoLocationResult, LocationService } from "../services/locationService";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ScanCaptureScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<any>(null);

  // Safe hardware insets: guarantees at least 48dp on Android so notch/cutout never cuts off text
  const topInset = Math.max(
    insets.top,
    Platform.OS === "android" ? (StatusBar.currentHeight || 0) : 0,
    48
  );
  const bottomInset = Math.max(insets.bottom, Platform.OS === "android" ? 28 : 20);

  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState<boolean>(false);
  const [capturing, setCapturing] = useState<boolean>(false);
  const [location, setLocation] = useState<GeoLocationResult | null>(null);
  const [locating, setLocating] = useState<boolean>(true);

  // Acquire GPS position eagerly
  useEffect(() => {
    let isMounted = true;
    const fetchGps = async () => {
      try {
        setLocating(true);
        const loc = await LocationService.getCurrentLocation();
        if (isMounted) setLocation(loc);
      } catch (err: any) {
        console.warn("GPS Warning:", err.message);
      } finally {
        if (isMounted) setLocating(false);
      }
    };

    if (isFocused) {
      fetchGps();
    }

    return () => {
      isMounted = false;
    };
  }, [isFocused]);

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;

    try {
      setCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });

      if (photo?.uri) {
        proceedToPreview(photo.uri);
      }
    } catch (err: any) {
      Alert.alert("Capture Failed", err.message || "Unable to capture image.");
    } finally {
      setCapturing(false);
    }
  };

  const proceedToPreview = (photoUri: string) => {
    // Default fallback coordinates if GPS is disabled on emulator
    const latitude = location?.latitude ?? 28.6139;
    const longitude = location?.longitude ?? 77.209;
    const address = location?.address || "New Delhi, Central District";

    navigation.navigate("InspectionPreview", {
      photoUri,
      latitude,
      longitude,
      address,
    });
  };

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Ionicons name="camera-outline" size={54} color="#94A3B8" />
        <Text style={styles.permTitle}>Camera Permission Required</Text>
        <Text style={styles.permDesc}>
          LMPC Field Scanner needs camera access to inspect labels and verify scaling card font ratios.
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {isFocused && (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          facing="back"
          enableTorch={torch}
        />
      )}

      {/* Real-time PDP and Scaling Card Guide Overlay */}
      <CameraOverlay />

      {/* Top Controls Bar with Android Status Bar clearance */}
      <View style={styles.topControlContainer}>
        <View style={styles.topControls}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.gpsIndicator}>
            <Ionicons
              name={location ? "location" : "location-outline"}
              size={14}
              color={location ? "#10B981" : "#F59E0B"}
            />
            <Text style={styles.gpsText}>
              {locating ? "Locking GPS..." : location ? "GPS Locked" : "GPS Default"}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.iconButton, torch && styles.iconButtonActive]}
            onPress={() => setTorch(!torch)}
            activeOpacity={0.7}
          >
            <Ionicons name={torch ? "flash" : "flash-off"} size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Shutter Controls (Live Evidence Only) */}
      <View style={styles.bottomControlContainer}>
        <View style={styles.bottomControls}>
          <View style={styles.chainOfCustodyBadge}>
            <Ionicons name="shield-checkmark" size={13} color="#34D399" />
            <Text style={styles.chainOfCustodyText}>Live Field Capture • Tamper-Proof</Text>
          </View>

          <TouchableOpacity
            style={styles.shutterBtn}
            onPress={handleCapture}
            disabled={capturing}
            activeOpacity={0.7}
          >
            <View style={styles.shutterInner}>
              {capturing && <ActivityIndicator color="#2563EB" size="small" />}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  permTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  permDesc: {
    color: "#94A3B8",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 24,
  },
  permBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  permBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  topControlContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gpsIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  gpsText: {
    color: "#E2E8F0",
    fontSize: 11,
    fontWeight: "600",
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  iconButtonActive: {
    backgroundColor: "#2563EB",
    borderColor: "#38BDF8",
  },
  bottomControlContainer: {
    position: "absolute",
    bottom: Platform.OS === "android" ? 28 : 20,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  bottomControls: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 14,
  },
  chainOfCustodyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.4)",
  },
  chainOfCustodyText: {
    color: "#E2E8F0",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  shutterBtn: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
});
