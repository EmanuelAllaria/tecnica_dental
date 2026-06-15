"use client";

import { useState } from "react";
import { Download, Eye } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default function ReportesPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function generarPDF(download = true) {
    setLoading(true);
    const res = await fetch("/api/reportes/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, month }),
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    if (download) {
      const a = document.createElement("a");
      a.href = url;
      a.download = `tecnica-dental-${year}-${String(month).padStart(2, "0")}.pdf`;
      a.click();
    } else {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(url);
    }

    setLoading(false);
  }

  return (
    <div>
      <Header title="Reportes" subtitle="Generá reportes PDF imprimibles" />

      <Card className="max-w-lg mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Reporte de facturación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-ivory/60">
            Generá un reporte PDF con todos los trabajos del mes, incluyendo
            estados de pago, saldos y totales.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Select
              value={String(month)}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="flex-1"
            >
              {MESES.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </Select>
            <Select
              value={String(year)}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-28"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => generarPDF(true)} disabled={loading} className="w-full sm:w-auto">
              <Download className="h-4 w-4" />
              {loading ? "Generando..." : "Descargar PDF"}
            </Button>
            <Button
              variant="outline"
              onClick={() => generarPDF(false)}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              <Eye className="h-4 w-4" />
              Vista previa
            </Button>
          </div>
        </CardContent>
      </Card>

      {previewUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vista previa</CardTitle>
          </CardHeader>
          <CardContent>
            <iframe
              src={previewUrl}
              className="h-[50vh] min-h-[320px] w-full rounded-xl border border-ivory/10 sm:h-[600px] lg:h-[800px]"
              title="Vista previa PDF"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
