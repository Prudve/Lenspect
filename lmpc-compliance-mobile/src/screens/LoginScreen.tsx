import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { ConfigModal } from "../components/ConfigModal";
import { useAuth } from "../context/AuthContext";

export const LoginScreen: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [configVisible, setConfigVisible] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      Alert.alert("Missing Fields", "Please enter your username/email and password.");
      return;
    }

    try {
      await login(identifier.trim(), password);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Invalid credentials. Please verify your backend.";
      Alert.alert("Authentication Failed", msg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.configBtn} onPress={() => setConfigVisible(true)}>
              <Ionicons name="server-outline" size={18} color="#475569" />
              <Text style={styles.configBtnText}>Server IP</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Ionicons name="shield-checkmark" size={38} color="#2563EB" />
            </View>
            <Text style={styles.title}>LENSPECT MOBILE</Text>
            <Text style={styles.subtitle}>Legal Metrology (LMPC) Field Verification</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.cardHeader}>Inspector Sign In</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username or Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="inspector_john / officer@lmpc.gov"
                  placeholderTextColor="#94A3B8"
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginBtnText}>Access Inspection Terminal</Text>
              )}
            </TouchableOpacity>

            {/* Built-in Offline Test Account (No backend needed) */}
            <View style={styles.demoCard}>
              <View style={styles.demoHeader}>
                <Ionicons name="flash" size={14} color="#D97706" />
                <Text style={styles.demoHeaderText}>Built-in Test Account (No Backend Required)</Text>
              </View>

              <Text style={styles.demoDesc}>
                Credentials: <Text style={styles.boldText}>inspector</Text> | Password: <Text style={styles.boldText}>demo123</Text>
              </Text>

              <TouchableOpacity
                style={styles.instantDemoBtn}
                onPress={() => login("inspector", "demo123")}
                disabled={isLoading}
              >
                <Ionicons name="play-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.instantDemoBtnText}>Instant Demo Sign In (1-Tap)</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footerNote}>
            <Text style={styles.footerText}>
              Statutory verification compliant with Legal Metrology (Packaged Commodities) Rules
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfigModal visible={configVisible} onClose={() => setConfigVisible(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 12,
  },
  configBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 6,
  },
  configBtnText: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "600",
  },
  brandContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 28,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    borderWidth: 1.5,
    borderColor: "#BFDBFE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#2563EB",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  subtitle: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 6,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOpacity: 0.07,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardHeader: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.2,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: "#0F172A",
    fontSize: 14,
    paddingVertical: 12,
  },
  eyeBtn: {
    padding: 6,
  },
  loginBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#2563EB",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  loginBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  demoCard: {
    marginTop: 20,
    backgroundColor: "#FEFCE8",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FDE047",
  },
  demoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  demoHeaderText: {
    color: "#B45309",
    fontSize: 12,
    fontWeight: "800",
  },
  demoDesc: {
    color: "#78350F",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  boldText: {
    color: "#451A03",
    fontWeight: "800",
  },
  instantDemoBtn: {
    backgroundColor: "#059669",
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#059669",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  instantDemoBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  footerNote: {
    alignItems: "center",
    marginTop: 26,
  },
  footerText: {
    color: "#94A3B8",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
  },
});
