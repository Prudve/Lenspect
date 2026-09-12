import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BoundingBoxViewer } from "../components/BoundingBoxViewer";
import { ComplianceStatusBadge, PipelineStatusBadge } from "../components/ComplianceStatusBadge";
import { RootStackParamList } from "../navigation/types";
import { InspectionApi, NoticeApi } from "../services/api";
import { Inspection, Notice } from "../types/inspection";

type ScreenRouteProp = RouteProp<RootStackParamList, "InspectionDetail">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const InspectionDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { inspectionId } = route.params;

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchDetails = useCallback(async () => {
    try {
      const data = await InspectionApi.getInspectionById(inspectionId);
      setInspection(data);

      if (data.complianceStatus === "NON_COMPLIANT") {
        const existingNotice = await NoticeApi.getNoticeByInspection(inspectionId);
        setNotice(existingNotice);
      }
    } catch (err: any) {
      console.warn("Fetch inspection details error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [inspectionId]);

  // Polling hook while status is PENDING or PROCESSING in BullMQ
  useEffect(() => {
    fetchDetails();

    const interval = setInterval(() => {
      if (inspection?.status === "PENDING" || inspection?.status === "PROCESSING") {
        fetchDetails();
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [fetchDetails, inspection?.status]);

  const handleRetry = async () => {
    setActionLoading(true);
    try {
      const updated = await InspectionApi.retryInspection(inspectionId);
      setInspection(updated);
      Alert.alert("Re-queued", "Inspection has been re-submitted to the CV pipeline.");
    } catch (err: any) {
      Alert.alert("Retry Failed", err?.response?.data?.message || err?.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateNotice = async () => {
    setActionLoading(true);
    try {
      const createdNotice = await NoticeApi.generateNotice(inspectionId, [
        { rule: "LMPC Rule 6(1)", description: "Mandatory declaration missing or illegible" },
      ]);
      setNotice(createdNotice);
      Alert.alert("Notice Issued", `Legal notice ${createdNotice.noticeNumber} generated.`);
    } catch (err: any) {
      Alert.alert("Notice Error", err?.response?.data?.message || err?.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenPdf = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Cannot Open PDF", "Please ensure a browser or PDF viewer is available.");
    }
  };

  if (loading && !inspection) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Fetching statutory inspection record...</Text>
      </View>
    );
  }

  if (!inspection) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Inspection Not Found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isPendingOrProcessing = inspection.status === "PENDING" || inspection.status === "PROCESSING";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDetails(); }} tintColor="#2563EB" />
        }
      >
        {/* Top Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBack}>
            <Ionicons name="chevron-back" size={24} color="#0F172A" />
            <Text style={styles.navBackText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerId}>ID: {inspection._id.slice(-6).toUpperCase()}</Text>
        </View>

        {/* Status Banner */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <ComplianceStatusBadge status={inspection.complianceStatus} size="medium" />
            <PipelineStatusBadge status={inspection.status} size="small" />
          </View>
          <Text style={styles.timestampText}>
            Inspected on {new Date(inspection.createdAt).toLocaleString("en-IN")}
          </Text>
        </View>

        {/* Live BullMQ Pipeline Progress Stepper */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Event-Driven Pipeline Status</Text>

          <View style={styles.stepperContainer}>
            <StepItem
              label="1. Ingested"
              desc="Cloudinary + BullMQ"
              status={inspection.status ? "done" : "active"}
            />
            <StepItem
              label="2. AI Processing"
              desc="YOLOv8 + OpenCV Dewarp"
              status={
                inspection.status === "PROCESSING"
                  ? "active"
                  : inspection.status === "COMPLETED" || inspection.status === "FAILED"
                  ? "done"
                  : "pending"
              }
            />
            <StepItem
              label="3. LMPC Verified"
              desc="PaddleOCR + Font Scaling"
              status={inspection.status === "COMPLETED" ? "done" : inspection.status === "FAILED" ? "error" : "pending"}
            />
          </View>

          {isPendingOrProcessing && (
            <View style={styles.processingRow}>
              <ActivityIndicator size="small" color="#2563EB" />
              <Text style={styles.processingText}>
                Queue worker processing image. Polling for updates...
              </Text>
            </View>
          )}

          {inspection.status === "FAILED" && (
            <View style={styles.failureBox}>
              <Ionicons name="warning-outline" size={20} color="#DC2626" />
              <Text style={styles.failureText}>
                {inspection.failureReason || "AI Microservice error occurred."}
              </Text>
              <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} disabled={actionLoading}>
                <Text style={styles.retryBtnText}>Retry AI Analysis</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Visual Inspection Image & Bounding Box Viewer */}
        <View style={styles.card}>
          <View style={styles.boxViewerHeader}>
            <Text style={styles.cardTitle}>Visual Evidence & Bounding Boxes</Text>
            <Text style={styles.boxCountText}>
              {inspection.boundingBoxes?.length || 0} zones detected
            </Text>
          </View>

          <BoundingBoxViewer
            imageUrl={inspection.imageUrl}
            boundingBoxes={inspection.boundingBoxes || []}
          />
        </View>

        {/* Extracted LMPC Mandatory Declarations */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Extracted Package Declarations</Text>
          <Text style={styles.subText}>
            Statutory attributes extracted by PaddleOCR and validated by rule engine:
          </Text>

          <View style={styles.attributeGrid}>
            <AttrRow
              label="Maximum Retail Price (MRP)"
              value={inspection.extractedData?.mrp_val ? `₹${inspection.extractedData.mrp_val}` : "NOT DETECTED"}
              highlight={!inspection.extractedData?.mrp_val}
            />
            <AttrRow
              label="Net Quantity / Unit Symbol"
              value={inspection.extractedData?.unit_symbol || "NOT DETECTED"}
              highlight={!inspection.extractedData?.unit_symbol}
            />
            <AttrRow
              label="Date of Manufacture"
              value={
                inspection.extractedData?.mfg_date
                  ? new Date(inspection.extractedData.mfg_date).toLocaleDateString("en-IN")
                  : "NOT DETECTED"
              }
              highlight={!inspection.extractedData?.mfg_date}
            />
            <AttrRow
              label="Country of Origin"
              value={inspection.extractedData?.country_origin || "NOT DETECTED"}
              highlight={!inspection.extractedData?.country_origin}
            />
          </View>
        </View>

        {/* Geotag & Coordinates */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Geotag Location (2dsphere)</Text>
          <Text style={styles.coordText}>
            Latitude: {inspection.location?.coordinates?.[1]?.toFixed(6)} | Longitude:{" "}
            {inspection.location?.coordinates?.[0]?.toFixed(6)}
          </Text>
        </View>

        {/* Legal Notice Action (for Violations) */}
        {inspection.complianceStatus === "NON_COMPLIANT" && (
          <View style={[styles.card, styles.violationNoticeCard]}>
            <View style={styles.noticeHeader}>
              <Ionicons name="document-attach-outline" size={22} color="#991B1B" />
              <Text style={styles.noticeTitle}>Statutory Violation Notice</Text>
            </View>

            {notice ? (
              <View style={styles.noticeDetails}>
                <Text style={styles.noticeNum}>Notice No: {notice.noticeNumber}</Text>
                <Text style={styles.noticeStatus}>Status: {notice.status}</Text>
                {notice.pdfUrl && (
                  <TouchableOpacity
                    style={styles.downloadPdfBtn}
                    onPress={() => handleOpenPdf(notice.pdfUrl!)}
                  >
                    <Ionicons name="download-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.downloadPdfText}>Download Legal PDF Notice</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View>
                <Text style={styles.noticePrompt}>
                  This package violates LMPC mandatory declaration rules. Generate an official PDF
                  notice stamped with visual evidence overlays.
                </Text>
                <TouchableOpacity
                  style={styles.generateNoticeBtn}
                  onPress={handleGenerateNotice}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.generateNoticeText}>Generate Legal Notice (PDFKit)</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

interface StepItemProps {
  label: string;
  desc: string;
  status: "done" | "active" | "pending" | "error";
}

const StepItem: React.FC<StepItemProps> = ({ label, desc, status }) => {
  const getIcon = () => {
    switch (status) {
      case "done":
        return <Ionicons name="checkmark-circle" size={18} color="#10B981" />;
      case "active":
        return <ActivityIndicator size="small" color="#2563EB" />;
      case "error":
        return <Ionicons name="close-circle" size={18} color="#EF4444" />;
      case "pending":
      default:
        return <Ionicons name="ellipse-outline" size={18} color="#94A3B8" />;
    }
  };

  return (
    <View style={styles.stepItem}>
      {getIcon()}
      <View style={{ marginLeft: 8 }}>
        <Text style={[styles.stepLabel, status === "active" && { color: "#2563EB" }]}>{label}</Text>
        <Text style={styles.stepDesc}>{desc}</Text>
      </View>
    </View>
  );
};

const AttrRow: React.FC<{ label: string; value: string; highlight?: boolean }> = ({
  label,
  value,
  highlight,
}) => (
  <View style={styles.attrRow}>
    <Text style={styles.attrLabel}>{label}</Text>
    <Text style={[styles.attrValue, highlight && styles.attrHighlight]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 14,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 12,
  },
  backButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#2563EB",
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  navBack: {
    flexDirection: "row",
    alignItems: "center",
  },
  navBackText: {
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "600",
  },
  headerId: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "700",
  },
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timestampText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  subText: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 12,
  },
  stepperContainer: {
    marginTop: 6,
    gap: 10,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  stepDesc: {
    fontSize: 11,
    color: "#64748B",
  },
  processingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    backgroundColor: "#EFF6FF",
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  processingText: {
    fontSize: 12,
    color: "#1E40AF",
    flex: 1,
  },
  failureBox: {
    marginTop: 12,
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  failureText: {
    fontSize: 12,
    color: "#B91C1C",
    marginTop: 4,
    marginBottom: 8,
  },
  retryBtn: {
    backgroundColor: "#DC2626",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  boxViewerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  boxCountText: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "600",
  },
  attributeGrid: {
    gap: 8,
  },
  attrRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  attrLabel: {
    fontSize: 13,
    color: "#475569",
    flex: 1,
  },
  attrValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  attrHighlight: {
    color: "#DC2626",
    fontWeight: "800",
  },
  coordText: {
    fontSize: 13,
    color: "#334155",
    fontFamily: "Courier",
  },
  violationNoticeCard: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FFF5F5",
  },
  noticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#991B1B",
  },
  noticeDetails: {
    marginTop: 6,
  },
  noticeNum: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  noticeStatus: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    marginBottom: 10,
  },
  downloadPdfBtn: {
    backgroundColor: "#B91C1C",
    borderRadius: 8,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  downloadPdfText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  noticePrompt: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 18,
    marginBottom: 12,
  },
  generateNoticeBtn: {
    backgroundColor: "#DC2626",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  generateNoticeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
