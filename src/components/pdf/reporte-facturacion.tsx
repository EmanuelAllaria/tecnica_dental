import "@/components/pdf/pdf-fonts";
import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { ESTADO_LABELS, formatCurrency } from "@/lib/utils";
import { baseStyles } from "./pdf-theme";
import { PDFHeader } from "./pdf-header";
import { PDFFooter } from "./pdf-footer";

const colStyles = {
  col1: { width: "10%" },
  col2: { width: "15%" },
  col3: { width: "12%" },
  col4: { width: "18%" },
  col5: { width: "12%" },
  col6: { width: "12%" },
  col7: { width: "10%" },
  col8: { width: "11%" },
};

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
      <Page size="A4" style={baseStyles.page}>
        <PDFHeader
          subtitle={`Reporte de facturación — ${periodo}`}
          meta={`Generado: ${fechaGeneracion}`}
        />

        <View style={baseStyles.tableContainer}>
          <View style={baseStyles.tableHeader}>
            <Text style={[baseStyles.headerText, colStyles.col1]}>Código</Text>
            <Text style={[baseStyles.headerText, colStyles.col2]}>Odontólogo</Text>
            <Text style={[baseStyles.headerText, colStyles.col3]}>Paciente</Text>
            <Text style={[baseStyles.headerText, colStyles.col4]}>Trabajo</Text>
            <Text style={[baseStyles.headerText, colStyles.col5]}>Precio</Text>
            <Text style={[baseStyles.headerText, colStyles.col6]}>Pagado</Text>
            <Text style={[baseStyles.headerText, colStyles.col7]}>Saldo</Text>
            <Text style={[baseStyles.headerText, colStyles.col8]}>Estado</Text>
          </View>

          {trabajos.map((t, i) => (
            <View
              key={i}
              style={[
                baseStyles.tableRow,
                i % 2 === 1 ? baseStyles.tableRowAlt : {},
              ]}
            >
              <Text style={[baseStyles.cellText, colStyles.col1]}>{t.codigo}</Text>
              <Text style={[baseStyles.cellText, colStyles.col2]}>{t.odontologo}</Text>
              <Text style={[baseStyles.cellText, colStyles.col3]}>{t.paciente}</Text>
              <Text style={[baseStyles.cellText, colStyles.col4]}>{t.tipoTrabajo}</Text>
              <Text style={[baseStyles.cellText, colStyles.col5]}>
                {formatCurrency(t.precio)}
              </Text>
              <Text style={[baseStyles.cellText, colStyles.col6]}>
                {formatCurrency(t.pagado)}
              </Text>
              <Text style={[baseStyles.accentText, colStyles.col7]}>
                {formatCurrency(t.saldo)}
              </Text>
              <Text style={[baseStyles.cellText, colStyles.col8]}>
                {ESTADO_LABELS[t.estado] || t.estado}
              </Text>
            </View>
          ))}
        </View>

        <View style={baseStyles.totalBox}>
          <View style={baseStyles.totalRow}>
            <Text style={baseStyles.totalLabel}>Total facturado</Text>
            <Text style={baseStyles.totalValue}>
              {formatCurrency(resumen.totalFacturado)}
            </Text>
          </View>
          <View style={baseStyles.totalRow}>
            <Text style={baseStyles.totalLabel}>Total cobrado</Text>
            <Text style={baseStyles.totalValue}>
              {formatCurrency(resumen.totalCobrado)}
            </Text>
          </View>
          <View style={baseStyles.totalRow}>
            <Text style={baseStyles.totalLabel}>Pendiente de cobro</Text>
            <Text style={baseStyles.totalValueAccent}>
              {formatCurrency(resumen.totalPendiente)}
            </Text>
          </View>
        </View>

        <PDFFooter fechaGeneracion={fechaGeneracion} />
      </Page>
    </Document>
  );
}
