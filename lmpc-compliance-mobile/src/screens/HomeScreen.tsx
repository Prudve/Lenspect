import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ComplianceStatusBadge } from "../components/ComplianceStatusBadge";
import { OfflineBanner } from "../components/OfflineBanner";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../navigation/types";
import { AnalyticsApi, InspectionApi } from "../services/api";
import { ComplianceRateData, Inspection, InspectionStatsSummary } from "../types/inspection";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [stats, setStats] = useState<InspectionStatsSummary | null>(null);
  const [complianceRate, setComplianceRate] = useState<ComplianceRateData | null>(null);
  const [recentInspections, setRecentInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, rateRes, recentRes] = await Promise.allSettled([
        InspectionApi.getStatsSummary(),
        AnalyticsApi.getComplianceRate(),
        InspectionApi.getMyInspections({ limit: 5 }),
      ]);

      if (statsRes.status === "fulfilled") setStats(statsRes.value);
      if (rateRes.status === "fulfilled") setComplianceRate(rateRes.value);
      if (recentRes.status === "fulfilled") setRecentInspections(recentRes.value.inspections);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <OfflineBanner />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />}
      >
        {/* Header Bar */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Field Inspector Terminal</Text>
            <Text style={styles.officerName}>{user?.fullName || "Officer"}</Text>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role || "INSPECTOR"}</Text>
          </View>
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity
          style={styles.scanCta}
          onPress={() => (navigation as any).navigate("Scan")}
          activeOpacity={0.88}
        >
          <View style={styles.scanIconWrapper}>
            <Ionicons name="scan-outline" size={28} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.scanCtaTitle}>Start New Field Inspection</Text>
            <Text style={styles.scanCtaDesc}>
              Snap package with scaling card for real-time LMPC verification
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Stats Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Compliance Overview</Text>
          {rateResRateText(complianceRate?.complianceRate)}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginVertical: 30 }} />
        ) : (
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { borderLeftColor: "#3B82F6" }]}>
              <Text style={styles.statNumber}>{stats?.total || 0}</Text>
              <Text style={styles.statLabel}>Total Scans</Text>
            </View>

            <View style={[styles.statCard, { borderLeftColor: "#10B981" }]}>
              <Text style={[styles.statNumber, { color: "#10B981" }]}>
                {stats?.byCompliance?.COMPLIANT || 0}
              </Text>
              <Text style={styles.statLabel}>Compliant</Text>
            </View>

            <View style={[styles.statCard, { borderLeftColor: "#EF4444" }]}>
              <Text style={[styles.statNumber, { color: "#EF4444" }]}>
                {stats?.byCompliance?.NON_COMPLIANT || 0}
              </Text>
              <Text style={styles.statLabel}>Violations</Text>
            </View>

            <View style={[styles.statCard, { borderLeftColor: "#F59E0B" }]}>
              <Text style={[styles.statNumber, { color: "#F59E0B" }]}>
                {stats?.byCompliance?.NEEDS_REVIEW || 0}
              </Text>
              <Text style={styles.statLabel}>Review Req.</Text>
            </View>
          </View>
        )}

        {/* Recent Scans Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Recent Scans</Text>
          <TouchableOpacity onPress={() => (navigation as any).navigate("History")}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentInspections.length === 0 && !loading ? (
          <View style={styles.emptyCard}>
            <Ionicons name="document-text-outline" size={36} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Scans Recorded Yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap 'Start New Field Inspection' to snap your first package label.
            </Text>
          </View>
        ) : (
          recentInspections.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.inspectionCard}
              onPress={() => navigation.navigate("InspectionDetail", { inspectionId: item._id })}
            >
              <View style={styles.cardTop}>
                <Text style={styles.inspectionDate}>
                  {new Date(item.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
                <ComplianceStatusBadge status={item.complianceStatus} size="small" />
              </View>

              <View style={styles.cardDetails}>
                <Text style={styles.coordText}>
                  📍 {item.location?.coordinates?.[1]?.toFixed(4)}, {item.location?.coordinates?.[0]?.toFixed(4)}
                </Text>
                {item.extractedData?.mrp_val && (
                  <Text style={styles.mrpText}>₹{item.extractedData.mrp_val}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

function rateResRateText(rate?: number) {
  if (rate === undefined || rate === null) return null;
  return (
    <View style={styles.ratePill}>
      <Text style={styles.rateText}>{rate}% Rate</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  officerName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
  },
  scanCta: {
    backgroundColor: "#1E3A8A",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#1E3A8A",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  scanIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  scanCtaTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  scanCtaDesc: {
    color: "#93C5FD",
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  ratePill: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rateText: {
    color: "#166534",
    fontSize: 11,
    fontWeight: "700",
  },
  viewAllText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#475569",
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 4,
  },
  inspectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  inspectionDate: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  cardDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  coordText: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "500",
  },
  mrpText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#059669",
  },
});
