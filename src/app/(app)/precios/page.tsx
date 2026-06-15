"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Download } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface TipoTrabajo {
  id: string;
  nombre: string;
  precioOdontologo: number;
  precioCliente: number;
  activo: boolean;
  trabajosCount: number;
}

export default function PreciosPage() {
  const [tipos, setTipos] = useState<TipoTrabajo[]>([]);
  const [promedioOdontologo, setPromedioOdontologo] = useState(0);
  const [promedioCliente, setPromedioCliente] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    precioOdontologo: "",
    precioCliente: "",
  });

  async function load() {
    const res = await fetch("/api/precios");
    const data = await res.json();
    setTipos(data.tipos);
    setPromedioOdontologo(data.promedioOdontologo);
    setPromedioCliente(data.promedioCliente);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      nombre: form.nombre,
      precioOdontologo: parseFloat(form.precioOdontologo),
      precioCliente: parseFloat(form.precioCliente),
      activo: true,
    };
    if (editingId) {
      await fetch(`/api/precios/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/precios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setForm({ nombre: "", precioOdontologo: "", precioCliente: "" });
    setShowForm(false);
    setEditingId(null);
    load();
  }

  function startEdit(tipo: TipoTrabajo) {
    setForm({
      nombre: tipo.nombre,
      precioOdontologo: String(tipo.precioOdontologo),
      precioCliente: String(tipo.precioCliente),
    });
    setEditingId(tipo.id);
    setShowForm(true);
  }

  async function toggleActivo(tipo: TipoTrabajo) {
    await fetch(`/api/precios/${tipo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: tipo.nombre,
        precioOdontologo: tipo.precioOdontologo,
        precioCliente: tipo.precioCliente,
        activo: !tipo.activo,
      }),
    });
    load();
  }

  async function descargarPDF(lista: "odontologo" | "cliente") {
    setDownloading(lista);
    const res = await fetch("/api/precios/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lista }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tecnica-dental-precios-${lista === "odontologo" ? "odontologos" : "clientes"}.pdf`;
    a.click();
    setDownloading(null);
  }

  return (
    <div>
      <Header title="Lista de precios" subtitle="Catálogo con tarifas diferenciadas">
        <Button
          variant="outline"
          size="sm"
          onClick={() => descargarPDF("odontologo")}
          disabled={!!downloading}
          className="w-full sm:w-auto"
        >
          <Download className="h-4 w-4" />
          {downloading === "odontologo" ? "..." : "PDF odontólogos"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => descargarPDF("cliente")}
          disabled={!!downloading}
          className="w-full sm:w-auto"
        >
          <Download className="h-4 w-4" />
          {downloading === "cliente" ? "..." : "PDF clientes"}
        </Button>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm({ nombre: "", precioOdontologo: "", precioCliente: "" });
          }}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Agregar
        </Button>
      </Header>

      <div className="glass mb-6 grid grid-cols-1 gap-4 rounded-2xl p-4 sm:grid-cols-3 sm:gap-6 sm:p-5">
        <div>
          <p className="text-sm text-ivory/50">Tipos activos</p>
          <p className="font-display text-2xl text-ivory">
            {tipos.filter((t) => t.activo).length}
          </p>
        </div>
        <div className="sm:border-l sm:border-ivory/10 sm:pl-6">
          <p className="text-sm text-ivory/50">Promedio odontólogos</p>
          <p className="font-display text-2xl text-gold">
            {formatCurrency(promedioOdontologo)}
          </p>
        </div>
        <div className="sm:border-l sm:border-ivory/10 sm:pl-6">
          <p className="text-sm text-ivory/50">Promedio clientes</p>
          <p className="font-display text-2xl text-teal-400">
            {formatCurrency(promedioCliente)}
          </p>
        </div>
      </div>

      {showForm && (
        <Card className="mb-6 max-w-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre del trabajo</Label>
                <Input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                  placeholder="Ej: Corona metal-porcelana"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Precio odontólogos</Label>
                  <Input
                    type="number"
                    value={form.precioOdontologo}
                    onChange={(e) =>
                      setForm({ ...form, precioOdontologo: e.target.value })
                    }
                    required
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Precio clientes</Label>
                  <Input
                    type="number"
                    value={form.precioCliente}
                    onChange={(e) =>
                      setForm({ ...form, precioCliente: e.target.value })
                    }
                    required
                    min="0"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? "Actualizar" : "Agregar"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="glass rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trabajo</TableHead>
              <TableHead>Precio odontólogos</TableHead>
              <TableHead>Precio clientes</TableHead>
              <TableHead>Histórico</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tipos.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.nombre}</TableCell>
                <TableCell className="text-gold">
                  {formatCurrency(t.precioOdontologo)}
                </TableCell>
                <TableCell className="text-teal-400">
                  {formatCurrency(t.precioCliente)}
                </TableCell>
                <TableCell className="text-ivory/50">
                  {t.trabajosCount} trabajos
                </TableCell>
                <TableCell>
                  <Badge
                    variant={t.activo ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => toggleActivo(t)}
                  >
                    {t.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEdit(t)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
