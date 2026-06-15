"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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

interface Trabajo {
  id: string;
  codigo: string;
  tipoCliente: string;
  paciente: string;
  precio: number;
  totalPagado: number;
  saldo: number;
  estado: string;
  fechaIngreso: string;
  clienteLabel: string;
  odontologo: { nombre: string } | null;
  tipoTrabajo: { nombre: string };
}

interface Odontologo {
  id: string;
  nombre: string;
}

export default function TrabajosPage() {
  const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
  const [odontologos, setOdontologos] = useState<Odontologo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("");
  const [odontologoId, setOdontologoId] = useState("");
  const [tipoCliente, setTipoCliente] = useState("");

  const fetchTrabajos = useCallback(async () => {
    const params = new URLSearchParams();
    if (busqueda) params.set("busqueda", busqueda);
    if (estado) params.set("estado", estado);
    if (odontologoId) params.set("odontologoId", odontologoId);
    if (tipoCliente) params.set("tipoCliente", tipoCliente);

    const res = await fetch(`/api/trabajos?${params}`);
    const data = await res.json();
    setTrabajos(data);
    setLoading(false);
  }, [busqueda, estado, odontologoId, tipoCliente]);

  useEffect(() => {
    fetch("/api/odontologos")
      .then((r) => r.json())
      .then(setOdontologos);
    fetchTrabajos();
  }, [fetchTrabajos]);

  return (
    <div>
      <Header title="Trabajos" subtitle="Odontólogos y clientes directos">
        <Link href="/trabajos/nuevo">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Nuevo trabajo
          </Button>
        </Link>
      </Header>

      <div className="glass mb-6 flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:flex-wrap">
        <div className="relative min-w-0 flex-1 sm:min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ivory/40" />
          <Input
            placeholder="Buscar por código o nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={tipoCliente}
          onChange={(e) => setTipoCliente(e.target.value)}
          className="w-full sm:w-44"
        >
          <option value="">Todos los tipos</option>
          <option value="ODONTOLOGO">Odontólogo</option>
          <option value="CLIENTE_DIRECTO">Cliente directo</option>
        </Select>
        <Select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="w-full sm:w-44"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_PROCESO">En proceso</option>
          <option value="ENTREGADO">Entregado</option>
          <option value="PAGADO">Pagado</option>
          <option value="VENCIDO">Vencido</option>
        </Select>
        <Select
          value={odontologoId}
          onChange={(e) => setOdontologoId(e.target.value)}
          className="w-full sm:w-48"
        >
          <option value="">Todos los odontólogos</option>
          {odontologos.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nombre}
            </option>
          ))}
        </Select>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <p className="text-center text-ivory/40 py-12">Cargando...</p>
        ) : trabajos.length === 0 ? (
          <p className="text-center text-ivory/40 py-12">
            No hay trabajos registrados
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cliente / Odontólogo</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Trabajo</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trabajos.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <Link
                      href={`/trabajos/${t.id}`}
                      className="text-gold hover:text-gold-light font-medium"
                    >
                      {t.codigo}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        t.tipoCliente === "CLIENTE_DIRECTO"
                          ? "secondary"
                          : "default"
                      }
                      className="text-[10px]"
                    >
                      {t.tipoCliente === "CLIENTE_DIRECTO"
                        ? "Directo"
                        : "Odontólogo"}
                    </Badge>
                  </TableCell>
                  <TableCell>{t.clienteLabel}</TableCell>
                  <TableCell>
                    {t.tipoCliente === "CLIENTE_DIRECTO" ? "—" : t.paciente}
                  </TableCell>
                  <TableCell>{t.tipoTrabajo?.nombre}</TableCell>
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
        )}
      </div>
    </div>
  );
}
