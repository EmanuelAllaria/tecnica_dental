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

interface IngresosChartProps {
  data: { mes: string; ingresos: number }[];
}

export function IngresosChart({ data }: IngresosChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,240,232,0.05)" />
        <XAxis
          dataKey="mes"
          stroke="rgba(245,240,232,0.4)"
          fontSize={12}
          tickLine={false}
        />
        <YAxis
          stroke="rgba(245,240,232,0.4)"
          fontSize={12}
          tickLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            background: "#1a1a22",
            border: "1px solid rgba(201,168,124,0.2)",
            borderRadius: "12px",
            color: "#f5f0e8",
          }}
          formatter={(value) => [formatCurrency(Number(value)), "Ingresos"]}
        />
        <Bar
          dataKey="ingresos"
          fill="#c9a87c"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
