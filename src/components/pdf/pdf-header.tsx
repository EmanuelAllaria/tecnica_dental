import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { colors, fonts } from "./pdf-theme";

const styles = StyleSheet.create({
  header: {
    marginBottom: 32,
    borderBottomWidth: 2,
    borderBottomColor: colors.brand,
    paddingBottom: 18,
  },
  brandRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  brandAccent: {
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: 700,
    color: colors.brand,
    letterSpacing: 1,
  },
  brandText: {
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: 700,
    color: colors.text,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  meta: {
    fontSize: 9,
    color: colors.textSubtle,
    marginTop: 4,
  },
});

interface PDFHeaderProps {
  subtitle: string;
  meta?: string;
}

export function PDFHeader({ subtitle, meta }: PDFHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <Text style={styles.brandAccent}>Técnica</Text>
        <Text style={styles.brandText}> Dental</Text>
      </View>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
    </View>
  );
}
