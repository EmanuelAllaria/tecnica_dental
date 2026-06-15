"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  DollarSign,
  AlertTriangle,
  Clock,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { MetricCard } from "@/components/ui/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IngresosChart } from "@/components/charts/ingresos-chart";
import { EstadosChart } from "@/components/charts/estados-chart";
import { TopOdontologosChart } from "@/components/charts/top-odontologos-chart";
import { formatCurrency } from "@/lib/utils";

interface DashboardClientProps {
  metrics: {
    activos: number;
    ingresosMes: string;
    ingresosMesNum: number;
    pendienteCobro: string;
    pendienteCobroNum: number;
    vencidos: number;
    trabajosMes: number;
  };
  ingresos6Meses: { mes: string; ingresos: number }[];
  estadosData: { estado: string; count: number }[];
  topOdontologos: { nombre: string; total: number }[];
  resumenIA: string | null;
  periodo: string;
}

export function DashboardClient({
  metrics,
  ingresos6Meses,
  estadosData,
  topOdontologos,
  resumenIA: initialResumen,
  periodo,
}: DashboardClientProps) {
  const [resumenIA, setResumenIA] = useState(initialResumen);
  const [loadingIA, setLoadingIA] = useState(false);
  const [errorIA, setErrorIA] = useState("");

  async function generarResumen() {
    setLoadingIA(true);
    setErrorIA("");
    try {
      const res = await fetch("/api/ia/resumen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "dashboard", periodo }),
      });
      const data = await res.json();
      if (data.error) setErrorIA(data.error);
      else if (data.contenido) setResumenIA(data.contenido);
    } catch {
      setErrorIA("Error al generar resumen");
    }
    setLoadingIA(false);
  }

  return (
    <div>
      <Header title="Dashboard" subtitle="Vista general de tu laboratorio" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <MetricCard
          title="Trabajos activos"
          value={metrics.activos}
          icon={<Briefcase className="h-5 w-5" />}
          delay={0}
        />
        <MetricCard
          title="Ingresos del mes"
          value={metrics.ingresosMes}
          subtitle={`${metrics.trabajosMes} trabajos`}
          icon={<DollarSign className="h-5 w-5" />}
          delay={0.1}
        />
        <MetricCard
          title="Pendiente de cobro"
          value={metrics.pendienteCobro}
          icon={<Clock className="h-5 w-5" />}
          delay={0.2}
        />
        <MetricCard
          title="Vencidos"
          value={metrics.vencidos}
          icon={<AlertTriangle className="h-5 w-5" />}
          delay={0.3}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <Card className="border-gold/20 bg-gradient-to-br from-gold/5 to-transparent">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gold/15 p-2">
                <Sparkles className="h-5 w-5 text-gold" />
              </div>
              <CardTitle className="text-lg sm:text-xl">Resumen inteligente</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={generarResumen}
              disabled={loadingIA}
              className="w-full sm:w-auto"
            >
              {loadingIA ? "Generando..." : "Generar con IA"}
            </Button>
          </CardHeader>
          <CardContent>
            {errorIA && (
              <p className="text-sm text-amber-400/80">{errorIA}</p>
            )}
            {resumenIA ? (
              <p className="text-ivory/80 leading-relaxed">{resumenIA}</p>
            ) : !errorIA ? (
              <p className="text-ivory/40 text-sm">
                Presioná &quot;Generar con IA&quot; para obtener un resumen del mes.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ingresos — últimos 6 meses</CardTitle>
          </CardHeader>
          <CardContent>
            <IngresosChart data={ingresos6Meses} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trabajos por estado</CardTitle>
          </CardHeader>
          <CardContent>
            <EstadosChart data={estadosData} />
          </CardContent>
        </Card>
      </div>

      {topOdontologos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top odontólogos del mes</CardTitle>
          </CardHeader>
          <CardContent>
            <TopOdontologosChart
              data={topOdontologos.map((o) => ({
                nombre: o.nombre,
                total: o.total,
              }))}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
