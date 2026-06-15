"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IngresosChart } from "@/components/charts/ingresos-chart";
import { TopOdontologosChart } from "@/components/charts/top-odontologos-chart";
import { formatDate } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface EstadisticasClientProps {
  ingresosMensuales: { mes: string; ingresos: number; facturado: number; trabajos: number }[];
  distribucionTipos: { nombre: string; cantidad: number; precio: number }[];
  topOdontologos: { nombre: string; total: number; trabajos: number }[];
  historialIA: Array<{
    id: string;
    tipo: string;
    periodo: string;
    contenido: string;
    createdAt: string;
  }>;
  periodo: string;
  year: number;
}

export function EstadisticasClient({
  ingresosMensuales,
  distribucionTipos,
  topOdontologos,
  historialIA: initialHistorial,
  periodo,
  year,
}: EstadisticasClientProps) {
  const [resumenIA, setResumenIA] = useState("");
  const [loadingIA, setLoadingIA] = useState(false);
  const [errorIA, setErrorIA] = useState("");
  const [historial, setHistorial] = useState(initialHistorial);

  async function generarAnalisis() {
    setLoadingIA(true);
    setErrorIA("");
    const res = await fetch("/api/ia/resumen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: "estadisticas", periodo }),
    });
    const result = await res.json();
    if (result.error) {
      setErrorIA(result.error);
    } else {
      setResumenIA(result.contenido);
      setHistorial([
        {
          id: Date.now().toString(),
          tipo: "estadisticas",
          periodo,
          contenido: result.contenido,
          createdAt: new Date().toISOString(),
        },
        ...historial,
      ]);
    }
    setLoadingIA(false);
  }

  const estadosData = distribucionTipos.map((t) => ({
    estado: t.nombre,
    count: t.cantidad,
  }));

  return (
    <div>
      <Header
        title="Estadísticas"
        subtitle={`Análisis inteligente — ${year}`}
      />

      <Card className="mb-8 border-gold/20 bg-gradient-to-br from-gold/5 to-transparent">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-gold" />
            <CardTitle className="text-lg">Análisis inteligente con IA</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={generarAnalisis}
            disabled={loadingIA}
          >
            {loadingIA ? "Analizando..." : "Generar análisis"}
          </Button>
        </CardHeader>
        <CardContent>
          {errorIA && (
            <p className="text-sm text-amber-400/80 mb-3">{errorIA}</p>
          )}
          {resumenIA ? (
            <p className="text-ivory/80 leading-relaxed">{resumenIA}</p>
          ) : !errorIA ? (
            <p className="text-ivory/40 text-sm">
              La IA analizará tus estadísticas y te dará insights accionables.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Evolución de ingresos {year}</CardTitle>
          </CardHeader>
          <CardContent>
            <IngresosChart
              data={ingresosMensuales.map((d) => ({
                mes: d.mes,
                ingresos: d.ingresos,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribución por tipo de trabajo</CardTitle>
          </CardHeader>
          <CardContent>
            {distribucionTipos.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={distribucionTipos}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,240,232,0.05)" />
                  <XAxis
                    dataKey="nombre"
                    stroke="rgba(245,240,232,0.4)"
                    fontSize={10}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="rgba(245,240,232,0.4)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "#1a1a22",
                      border: "1px solid rgba(201,168,124,0.2)",
                      borderRadius: "12px",
                      color: "#f5f0e8",
                    }}
                  />
                  <Bar dataKey="cantidad" fill="#1a4a42" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-ivory/40 text-sm text-center py-12">
                Sin datos suficientes
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {topOdontologos.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Top odontólogos — facturación total</CardTitle>
          </CardHeader>
          <CardContent>
            <TopOdontologosChart data={topOdontologos} />
          </CardContent>
        </Card>
      )}

      {historial.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Historial de análisis IA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {historial.map((h) => (
              <div
                key={h.id}
                className="p-4 rounded-xl bg-ivory/5 border border-ivory/10"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gold uppercase tracking-wider">
                    {h.tipo}
                  </span>
                  <span className="text-xs text-ivory/30">·</span>
                  <span className="text-xs text-ivory/40">{h.periodo}</span>
                  <span className="text-xs text-ivory/30">·</span>
                  <span className="text-xs text-ivory/40">
                    {formatDate(h.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-ivory/70 leading-relaxed">
                  {h.contenido}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
