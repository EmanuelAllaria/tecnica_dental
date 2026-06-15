"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, DollarSign } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EstadoBadge } from "@/components/ui/estado-badge";
import { formatCurrency } from "@/lib/utils";

interface FacturacionData {
  year: number;
  month: number;
  resumen: {
    totalFacturado: number;
    totalCobrado: number;
    totalPendiente: number;
    totalVencido: number;
    cantidadTrabajos: number;
    variacion: number;
  };
  trabajos: Array<{
    id: string;
    codigo: string;
    odontologo: string;
    paciente: string;
    tipoTrabajo: string;
    precio: number;
    pagado: number;
    saldo: number;
    estado: string;
  }>;
  formatted: {
    totalFacturado: string;
    totalCobrado: string;
    totalPendiente: string;
    totalVencido: string;
  };
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default function FacturacionPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<FacturacionData | null>(null);
  const [resumenIA, setResumenIA] = useState("");
  const [loadingIA, setLoadingIA] = useState(false);
  const [errorIA, setErrorIA] = useState("");
  const [pagoTrabajoId, setPagoTrabajoId] = useState<string | null>(null);
  const [pagoMonto, setPagoMonto] = useState("");

  async function load() {
    const res = await fetch(`/api/facturacion?year=${year}&month=${month}`);
    setData(await res.json());
  }

  useEffect(() => {
    load();
  }, [year, month]);

  async function generarResumen() {
    setLoadingIA(true);
    setErrorIA("");
    const periodo = `${year}-${String(month).padStart(2, "0")}`;
    const res = await fetch("/api/ia/resumen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: "facturacion", periodo }),
    });
    const result = await res.json();
    if (result.error) setErrorIA(result.error);
    else setResumenIA(result.contenido);
    setLoadingIA(false);
  }

  async function registrarPago(trabajoId: string) {
    if (!pagoMonto) return;
    await fetch(`/api/trabajos/${trabajoId}/pagos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monto: parseFloat(pagoMonto) }),
    });
    setPagoTrabajoId(null);
    setPagoMonto("");
    load();
  }

  return (
    <div>
      <Header title="Facturación" subtitle="Resumen mensual de facturación">
        <Select
          value={String(month)}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          className="w-36"
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
      </Header>

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <MetricCard
              title="Total facturado"
              value={data.formatted.totalFacturado}
              subtitle={
                data.resumen.variacion !== 0
                  ? `${data.resumen.variacion > 0 ? "+" : ""}${data.resumen.variacion}% vs mes anterior`
                  : `${data.resumen.cantidadTrabajos} trabajos`
              }
              delay={0}
            />
            <MetricCard
              title="Total cobrado"
              value={data.formatted.totalCobrado}
              delay={0.1}
            />
            <MetricCard
              title="Pendiente"
              value={data.formatted.totalPendiente}
              delay={0.2}
            />
            <MetricCard
              title="Vencido"
              value={data.formatted.totalVencido}
              delay={0.3}
            />
          </div>

          <Card className="mb-8 border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-gold" />
                <CardTitle className="text-lg">Resumen ejecutivo con IA</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={generarResumen}
                disabled={loadingIA}
              >
                {loadingIA ? "Generando..." : "Generar resumen"}
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
                  Generá un resumen inteligente de la facturación del mes.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <div className="glass rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Referencia</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Trabajo</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Pagado</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.trabajos.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <Link
                        href={`/trabajos/${t.id}`}
                        className="text-gold hover:text-gold-light"
                      >
                        {t.codigo}
                      </Link>
                    </TableCell>
                    <TableCell>{t.odontologo}</TableCell>
                    <TableCell>{t.paciente}</TableCell>
                    <TableCell>{t.tipoTrabajo}</TableCell>
                    <TableCell>{formatCurrency(t.precio)}</TableCell>
                    <TableCell className="text-emerald-400">
                      {formatCurrency(t.pagado)}
                    </TableCell>
                    <TableCell
                      className={t.saldo > 0 ? "text-amber-400" : "text-emerald-400"}
                    >
                      {formatCurrency(t.saldo)}
                    </TableCell>
                    <TableCell>
                      <EstadoBadge estado={t.estado} />
                    </TableCell>
                    <TableCell>
                      {t.saldo > 0 && (
                        pagoTrabajoId === t.id ? (
                          <div className="flex gap-1">
                            <Input
                              type="number"
                              value={pagoMonto}
                              onChange={(e) => setPagoMonto(e.target.value)}
                              className="h-8 w-20 text-xs"
                              placeholder="$"
                            />
                            <Button
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => registrarPago(t.id)}
                            >
                              OK
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setPagoTrabajoId(t.id);
                              setPagoMonto(String(t.saldo));
                            }}
                          >
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        )
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
