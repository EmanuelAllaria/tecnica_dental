import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { colors } from "./pdf-theme";

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 40,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: colors.textSubtle,
  },
});

interface PDFFooterProps {
  fechaGeneracion: string;
  label?: string;
}

export function PDFFooter({
  fechaGeneracion,
  label = "Técnica Dental",
}: PDFFooterProps) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>{label}</Text>
      <Text style={styles.footerText}>Generado: {fechaGeneracion}</Text>
    </View>
  );
}
