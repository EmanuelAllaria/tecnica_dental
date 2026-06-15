import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { formatCurrency } from "@/lib/utils";

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Helvetica",
    backgroundColor: "#0f0f12",
    color: "#f5f0e8",
  },
  header: {
    marginBottom: 36,
    borderBottomWidth: 2,
    borderBottomColor: "#c9a87c",
    paddingBottom: 20,
  },
  brand: {
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    color: "#c9a87c",
    letterSpacing: 2,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: "#a89f94",
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#f5f0e8",
    marginBottom: 16,
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1a4a42",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a32",
  },
  tableRowAlt: {
    backgroundColor: "#1a1a22",
  },
  colTrabajo: { flex: 1 },
  colPrecio: { width: 100, textAlign: "right" },
  headerText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#f5f0e8",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cellText: { fontSize: 11, color: "#f5f0e8" },
  priceText: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#c9a87c",
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: "#2a2a32",
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 8, color: "#6b6560" },
  totalBox: {
    marginTop: 20,
    padding: 14,
    backgroundColor: "#1a1a22",
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#c9a87c",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalLabel: { fontSize: 10, color: "#a89f94" },
  totalValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#c9a87c",
  },
});

export interface ListaPreciosPDFProps {
  items: { nombre: string; precio: number }[];
  fechaGeneracion: string;
}

export function ListaPreciosPDF({ items, fechaGeneracion }: ListaPreciosPDFProps) {
  const promedio =
    items.length > 0
      ? items.reduce((s, i) => s + i.precio, 0) / items.length
      : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>Técnica Dental</Text>
          <Text style={styles.subtitle}>Laboratorio · Lista de precios</Text>
        </View>

        <Text style={styles.sectionTitle}>Trabajos y tarifas</Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.headerText, styles.colTrabajo]}>Trabajo</Text>
          <Text style={[styles.headerText, styles.colPrecio]}>Precio</Text>
        </View>

        {items.map((item, i) => (
          <View
            key={i}
            style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
          >
            <Text style={[styles.cellText, styles.colTrabajo]}>{item.nombre}</Text>
            <Text style={[styles.priceText, styles.colPrecio]}>
              {formatCurrency(item.precio)}
            </Text>
          </View>
        ))}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Técnica Dental</Text>
          <Text style={styles.footerText}>Actualizado: {fechaGeneracion}</Text>
        </View>
      </Page>
    </Document>
  );
}
