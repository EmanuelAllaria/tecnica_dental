"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EstadoBadge } from "@/components/ui/estado-badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface OdontologoDetail {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  deuda: number;
  trabajos: Array<{
    id: string;
    codigo: string;
    paciente: string;
    precio: number;
    saldo: number;
    estado: string;
    fechaIngreso: string;
    tipoTrabajo: { nombre: string };
  }>;
}

export default function OdontologoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<OdontologoDetail | null>(null);

  useEffect(() => {
    fetch(`/api/odontologos/${id}`)
      .then((r) => r.json())
      .then(setData);
  }, [id]);

  if (!data) {
    return <p className="text-ivory/40 text-center py-20">Cargando...</p>;
  }

  return (
    <div>
      <Header title={data.nombre} subtitle="Detalle del odontólogo" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-ivory/50">Teléfono</p>
            <p className="text-ivory">{data.telefono || "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-ivory/50">Email</p>
            <p className="text-ivory">{data.email || "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-ivory/50">Deuda total</p>
            <p
              className={`font-display text-2xl ${data.deuda > 0 ? "text-amber-400" : "text-emerald-400"}`}
            >
              {formatCurrency(data.deuda)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Trabajo</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Saldo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
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
                <TableCell>{t.paciente}</TableCell>
                <TableCell>{t.tipoTrabajo.nombre}</TableCell>
                <TableCell>{formatCurrency(t.precio)}</TableCell>
                <TableCell
                  className={t.saldo > 0 ? "text-amber-400" : "text-emerald-400"}
                >
                  {formatCurrency(t.saldo)}
                </TableCell>
                <TableCell>
                  <EstadoBadge estado={t.estado} />
                </TableCell>
                <TableCell className="text-ivory/50">
                  {formatDate(t.fechaIngreso)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
