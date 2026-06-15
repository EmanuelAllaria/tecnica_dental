"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  delay?: number;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  delay = 0,
}: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState<string | number>(0);
  const isNumber = typeof value === "number";

  useEffect(() => {
    if (!isNumber) {
      setDisplayValue(value);
      return;
    }

    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), value);
      setDisplayValue(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, isNumber]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass rounded-2xl p-4 group transition-all duration-300 hover:border-gold/20 sm:p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-ivory/50 mb-2">{title}</p>
          <p className="font-display text-2xl font-semibold text-ivory sm:text-3xl">
            {displayValue}
          </p>
          {subtitle && (
            <p className="text-xs text-ivory/40 mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="rounded-xl bg-gold/10 p-3 text-gold group-hover:bg-gold/20 transition-colors">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}
