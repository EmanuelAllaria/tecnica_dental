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

interface TopOdontologosChartProps {
  data: { nombre: string; total: number }[];
}

export function TopOdontologosChart({ data }: TopOdontologosChartProps) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 50)}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,240,232,0.05)" />
        <XAxis
          type="number"
          stroke="rgba(245,240,232,0.4)"
          fontSize={12}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <YAxis
          type="category"
          dataKey="nombre"
          stroke="rgba(245,240,232,0.4)"
          fontSize={12}
          width={120}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#1a1a22",
            border: "1px solid rgba(201,168,124,0.2)",
            borderRadius: "12px",
            color: "#f5f0e8",
          }}
          formatter={(value) => [formatCurrency(Number(value)), "Facturado"]}
        />
        <Bar dataKey="total" fill="#1a4a42" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
