import Groq from "groq-sdk";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

const rateLimit = new Map<string, number[]>();
const MAX_REQUESTS_PER_HOUR = 20;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  const requests = (rateLimit.get(key) || []).filter((t) => now - t < hour);
  if (requests.length >= MAX_REQUESTS_PER_HOUR) return false;
  requests.push(now);
  rateLimit.set(key, requests);
  return true;
}

function generarResumenLocal(
  tipo: "facturacion" | "dashboard" | "estadisticas",
  datos: Record<string, unknown>
): string {
  const facturado = Number(datos.totalFacturado ?? 0);
  const cobrado = Number(datos.totalCobrado ?? 0);
  const pendiente = Number(datos.pendiente ?? datos.pendienteCobro ?? 0);
  const vencidos = Number(datos.vencidos ?? 0);
  const cantidad = Number(datos.cantidadTrabajos ?? datos.trabajosMes ?? 0);
  const variacion = Number(datos.variacion ?? datos.variacionMesAnterior ?? 0);

  if (tipo === "dashboard") {
    const partes = [
      `En el período registraste ${cantidad} trabajos con ingresos de ${formatCurrency(cobrado || facturado)}.`,
      pendiente > 0
        ? `Hay ${formatCurrency(pendiente)} pendientes de cobro.`
        : `No tenés saldos pendientes de cobro.`,
    ];
    if (vencidos > 0) {
      partes.push(`Atención: ${formatCurrency(vencidos)} en trabajos vencidos.`);
    }
    return partes.join(" ");
  }

  if (tipo === "facturacion") {
    const partes = [
      `Facturación del mes: ${formatCurrency(facturado)} en ${cantidad} trabajos.`,
      `Cobraste ${formatCurrency(cobrado)}.`,
    ];
    if (variacion !== 0) {
      partes.push(
        `Eso representa un ${variacion > 0 ? "aumento" : "descenso"} del ${Math.abs(variacion)}% respecto al mes anterior.`
      );
    }
    if (pendiente > 0) {
      partes.push(`Quedan ${formatCurrency(pendiente)} por cobrar.`);
    }
    if (vencidos > 0) {
      partes.push(`Revisá ${formatCurrency(vencidos)} en cuentas vencidas.`);
    }
    return partes.join(" ");
  }

  const topOdontologos = (datos.topOdontologos as { nombre: string; total: number }[]) ?? [];
  const topTipos = (datos.topTipos as { nombre: string; total: number }[]) ?? [];
  const partes = [
    `Análisis del período: ${cantidad || datos.totalTrabajosHistorico || 0} trabajos, facturación ${formatCurrency(facturado)}.`,
  ];
  if (topOdontologos[0]) {
    partes.push(
      `Tu principal cliente fue ${topOdontologos[0].nombre} con ${formatCurrency(topOdontologos[0].total)}.`
    );
  }
  if (topTipos[0]) {
    partes.push(`El trabajo más demandado: ${topTipos[0].nombre}.`);
  }
  if (variacion !== 0) {
    partes.push(
      `La facturación ${variacion > 0 ? "creció" : "bajó"} un ${Math.abs(variacion)}% vs. el mes anterior.`
    );
  }
  return partes.join(" ");
}

async function generarConGroq(
  tipo: "facturacion" | "dashboard" | "estadisticas",
  datos: Record<string, unknown>
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("NO_API_KEY");

  const groq = new Groq({ apiKey });

  const prompts: Record<string, string> = {
    facturacion: `Sos un asistente financiero para "Técnica Dental", laboratorio dental en Argentina.
Escribí un resumen ejecutivo en español argentino, 3-4 oraciones, profesional y cálido.
Incluí comparación con el mes anterior, logros y alertas sobre deudas.
Datos: ${JSON.stringify(datos)}`,

    dashboard: `Sos asistente de "Técnica Dental", laboratorio dental personal en Argentina.
Resumen breve de 2-3 oraciones del estado del laboratorio este mes. Español argentino.
Datos: ${JSON.stringify(datos)}`,

    estadisticas: `Sos analista para "Técnica Dental". Insights accionables en español argentino, 4-5 oraciones.
Usá números concretos del JSON. Datos: ${JSON.stringify(datos)}`,
  };

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompts[tipo] }],
    temperature: 0.7,
    max_tokens: 500,
  });

  const contenido = completion.choices[0]?.message?.content?.trim();
  if (!contenido) throw new Error("EMPTY_RESPONSE");
  return contenido;
}

export async function generarResumenIA(
  tipo: "facturacion" | "dashboard" | "estadisticas",
  periodo: string,
  datos: Record<string, unknown>
): Promise<{ contenido: string; error?: string; fuente?: "ia" | "local" }> {
  if (!checkRateLimit(tipo)) {
    const local = generarResumenLocal(tipo, datos);
    await db.createResumenIA({ tipo, periodo, contenido: local });
    return {
      contenido: local,
      fuente: "local",
      error: "Límite de solicitudes IA alcanzado. Mostrando resumen automático.",
    };
  }

  try {
    const contenido = await generarConGroq(tipo, datos);
    await db.createResumenIA({ tipo, periodo, contenido });
    return { contenido, fuente: "ia" };
  } catch (error) {
    console.error("Groq error:", error);
    const local = generarResumenLocal(tipo, datos);
    await db.createResumenIA({ tipo, periodo, contenido: local });

    const sinKey = String(error).includes("NO_API_KEY");
    return {
      contenido: local,
      fuente: "local",
      error: sinKey
        ? "Sin GROQ_API_KEY: usando resumen automático. Agregá una key gratis en console.groq.com para textos con IA."
        : "IA no disponible ahora. Mostrando resumen automático con tus datos.",
    };
  }
}

export async function obtenerUltimoResumen(tipo: string, periodo: string) {
  return db.getUltimoResumen(tipo, periodo);
}

export async function obtenerHistorialResumenes(limit = 10) {
  return db.getHistorialResumenes(limit);
}
