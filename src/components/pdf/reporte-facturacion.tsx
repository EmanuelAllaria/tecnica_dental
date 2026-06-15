import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { ESTADO_LABELS, formatCurrency } from "@/lib/utils";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10 },
  header: { marginBottom: 20 },
  title: { fontSize: 22, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  subtitle: { fontSize: 11, color: "#666", marginBottom: 2 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1a4a42",
    color: "#fff",
    padding: 6,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    padding: 5,
    fontSize: 8,
  },
  col1: { width: "10%" },
  col2: { width: "15%" },
  col3: { width: "12%" },
  col4: { width: "18%" },
  col5: { width: "12%" },
  col6: { width: "12%" },
  col7: { width: "10%" },
  col8: { width: "11%" },
  totals: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f5f0e8",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
    fontSize: 10,
  },
  totalBold: { fontFamily: "Helvetica-Bold", fontSize: 12 },
});

export interface ReportePDFProps {
  trabajos: Array<{
    codigo: string;
    odontologo: string;
    paciente: string;
    tipoTrabajo: string;
    precio: number;
    pagado: number;
    saldo: number;
    estado: string;
  }>;
  resumen: {
    totalFacturado: number;
    totalCobrado: number;
    totalPendiente: number;
  };
  periodo: string;
  fechaGeneracion: string;
}

export function ReporteFacturacionPDF({
  trabajos,
  resumen,
  periodo,
  fechaGeneracion,
}: ReportePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Técnica Dental</Text>
          <Text style={styles.subtitle}>
            Reporte de facturación — {periodo}
          </Text>
          <Text style={styles.subtitle}>Generado: {fechaGeneracion}</Text>
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.col1}>Código</Text>
          <Text style={styles.col2}>Odontólogo</Text>
          <Text style={styles.col3}>Paciente</Text>
          <Text style={styles.col4}>Trabajo</Text>
          <Text style={styles.col5}>Precio</Text>
          <Text style={styles.col6}>Pagado</Text>
          <Text style={styles.col7}>Saldo</Text>
          <Text style={styles.col8}>Estado</Text>
        </View>

        {trabajos.map((t, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.col1}>{t.codigo}</Text>
            <Text style={styles.col2}>{t.odontologo}</Text>
            <Text style={styles.col3}>{t.paciente}</Text>
            <Text style={styles.col4}>{t.tipoTrabajo}</Text>
            <Text style={styles.col5}>{formatCurrency(t.precio)}</Text>
            <Text style={styles.col6}>{formatCurrency(t.pagado)}</Text>
            <Text style={styles.col7}>{formatCurrency(t.saldo)}</Text>
            <Text style={styles.col8}>
              {ESTADO_LABELS[t.estado] || t.estado}
            </Text>
          </View>
        ))}

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Total facturado:</Text>
            <Text>{formatCurrency(resumen.totalFacturado)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Total cobrado:</Text>
            <Text>{formatCurrency(resumen.totalCobrado)}</Text>
          </View>
          <View style={[styles.totalRow, styles.totalBold]}>
            <Text>Pendiente de cobro:</Text>
            <Text>{formatCurrency(resumen.totalPendiente)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
