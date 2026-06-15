import "@/components/pdf/pdf-fonts";
import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { formatCurrency } from "@/lib/utils";
import { baseStyles } from "./pdf-theme";
import { PDFHeader } from "./pdf-header";
import { PDFFooter } from "./pdf-footer";

const styles = {
  colTrabajo: { flex: 1 },
  colPrecio: { width: 100, textAlign: "right" as const },
};

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
      <Page size="A4" style={baseStyles.page}>
        <PDFHeader subtitle="Laboratorio · Lista de precios" />

        <Text style={baseStyles.sectionTitle}>Trabajos y tarifas</Text>

        <View style={baseStyles.tableContainer}>
          <View style={baseStyles.tableHeader}>
            <Text style={[baseStyles.headerText, styles.colTrabajo]}>Trabajo</Text>
            <Text style={[baseStyles.headerText, styles.colPrecio]}>Precio</Text>
          </View>

          {items.map((item, i) => (
            <View
              key={i}
              style={[
                baseStyles.tableRow,
                i % 2 === 1 ? baseStyles.tableRowAlt : {},
              ]}
            >
              <Text style={[baseStyles.cellText, styles.colTrabajo]}>
                {item.nombre}
              </Text>
              <Text style={[baseStyles.accentText, styles.colPrecio]}>
                {formatCurrency(item.precio)}
              </Text>
            </View>
          ))}
        </View>

        {items.length > 0 && (
          <View style={baseStyles.totalBox}>
            <View style={baseStyles.totalRow}>
              <Text style={baseStyles.totalLabel}>Promedio de precios</Text>
              <Text style={baseStyles.totalValueAccent}>
                {formatCurrency(promedio)}
              </Text>
            </View>
          </View>
        )}

        <PDFFooter fechaGeneracion={fechaGeneracion} />
      </Page>
    </Document>
  );
}
