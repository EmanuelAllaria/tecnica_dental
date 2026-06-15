import { StyleSheet } from "@react-pdf/renderer";

export const colors = {
  background: "#f0f7f5",
  surface: "#ffffff",
  text: "#1e293b",
  textMuted: "#64748b",
  textSubtle: "#94a3b8",
  brand: "#0d9488",
  brandLight: "#14b8a6",
  dental: "#0369a1",
  border: "#e2e8f0",
  rowAlt: "#f8fafc",
  white: "#ffffff",
} as const;

export const fonts = {
  display: "Cormorant Garamond",
  body: "DM Sans",
} as const;

export const baseStyles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: fonts.body,
    fontSize: 10,
    backgroundColor: colors.background,
    color: colors.text,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  tableContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.brand,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  tableRowAlt: {
    backgroundColor: colors.rowAlt,
  },
  headerText: {
    fontSize: 8,
    fontWeight: 700,
    color: colors.white,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cellText: {
    fontSize: 9,
    color: colors.text,
  },
  accentText: {
    fontSize: 9,
    fontWeight: 700,
    color: colors.brand,
  },
  totalBox: {
    marginTop: 20,
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 700,
    color: colors.text,
  },
  totalValueAccent: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.brand,
  },
});
