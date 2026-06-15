"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const TOOLTIP_STYLE = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  color: "#1e293b",
};

interface IngresosChartProps {
  data: { mes: string; ingresos: number }[];
}

export function IngresosChart({ data }: IngresosChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240} className="min-h-[200px] sm:!h-[280px]">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
        <XAxis
          dataKey="mes"
          stroke="rgba(148, 163, 184, 0.6)"
          fontSize={11}
          tickLine={false}
        />
        <YAxis
          stroke="rgba(148, 163, 184, 0.6)"
          fontSize={11}
          tickLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value) => [formatCurrency(Number(value)), "Ingresos"]}
        />
        <Bar
          dataKey="ingresos"
          fill="#0d9488"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
