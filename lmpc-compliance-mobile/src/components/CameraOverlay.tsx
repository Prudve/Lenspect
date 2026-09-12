import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Standard Card Dimensions Ratio: 85.6mm x 53.98mm (~1.586)
const CARD_WIDTH = SCREEN_WIDTH * 0.38;
const CARD_HEIGHT = CARD_WIDTH / 1.586;

export const CameraOverlay: React.FC = () => {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <View style={styles.container}>
        {/* Main Package / PDP Alignment Frame */}
        <View style={styles.packageFrame}>
          {/* Corner accents */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />

          <View style={styles.centerCrosshair}>
            <View style={styles.crosshairH} />
            <View style={styles.crosshairV} />
          </View>

          <View style={styles.packageLabelTag}>
            <Text style={styles.tagText}>PDP TARGET</Text>
          </View>

          {/* Physical Reference Scaling Card Slot */}
          <View style={styles.cardSlot}>
            <View style={styles.cardBorder}>
              <View style={styles.cardCornerTL} />
              <View style={styles.cardCornerBR} />
              <Text style={styles.cardLabel}>REFERENCE CARD</Text>
              <Text style={styles.cardSublabel}>85.6 × 54 mm</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  packageFrame: {
    width: SCREEN_WIDTH * 0.88,
    height: SCREEN_HEIGHT * 0.44,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
    borderStyle: "dashed",
    borderRadius: 12,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: "#38BDF8",
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  centerCrosshair: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  crosshairH: {
    width: 32,
    height: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  crosshairV: {
    position: "absolute",
    width: 1.5,
    height: 32,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  packageLabelTag: {
    position: "absolute",
    top: 8,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  tagText: {
    color: "#E2E8F0",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  cardSlot: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  cardBorder: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#F59E0B",
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderRadius: 6,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  cardCornerTL: {
    position: "absolute",
    top: -1,
    left: -1,
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#FBBF24",
  },
  cardCornerBR: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 8,
    height: 8,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: "#FBBF24",
  },
  cardLabel: {
    color: "#FEF08A",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  cardSublabel: {
    color: "#FDE68A",
    fontSize: 8,
    fontWeight: "500",
    marginTop: 2,
  },
});
