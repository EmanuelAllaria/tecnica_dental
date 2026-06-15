"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ESTADO_LABELS } from "@/lib/utils";

const COLORS: Record<string, string> = {
  PENDIENTE: "#f59e0b",
  EN_PROCESO: "#3b82f6",
  ENTREGADO: "#14b8a6",
  PAGADO: "#10b981",
  VENCIDO: "#f43f5e",
};

const TOOLTIP_STYLE = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  color: "#1e293b",
};

interface EstadosChartProps {
  data: { estado: string; count: number }[];
}

export function EstadosChart({ data }: EstadosChartProps) {
  const chartData = data.map((d) => ({
    name: ESTADO_LABELS[d.estado] || d.estado,
    value: d.count,
    estado: d.estado,
  }));

  if (chartData.length === 0) {
    return (
      <p className="text-ivory/40 text-sm text-center py-12">
        Sin trabajos registrados
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={4}
          dataKey="value"
        >
          {chartData.map((entry) => (
            <Cell
              key={entry.estado}
              fill={COLORS[entry.estado] || "#0d9488"}
            />
          ))}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend
          formatter={(value) => (
            <span style={{ color: "rgba(30, 41, 59, 0.7)" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
