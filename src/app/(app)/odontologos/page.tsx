"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
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
import { formatCurrency } from "@/lib/utils";

interface Odontologo {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  trabajosCount: number;
  deuda: number;
}

export default function OdontologosPage() {
  const [odontologos, setOdontologos] = useState<Odontologo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: "", telefono: "", email: "" });

  async function load() {
    const res = await fetch("/api/odontologos");
    setOdontologos(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await fetch(`/api/odontologos/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/odontologos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setForm({ nombre: "", telefono: "", email: "" });
    setShowForm(false);
    setEditingId(null);
    load();
  }

  function startEdit(o: Odontologo) {
    setForm({
      nombre: o.nombre,
      telefono: o.telefono || "",
      email: o.email || "",
    });
    setEditingId(o.id);
    setShowForm(true);
  }

  return (
    <div>
      <Header title="Odontólogos" subtitle="Clientes y contactos">
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm({ nombre: "", telefono: "", email: "" });
          }}
        >
          <Plus className="h-4 w-4" />
          Agregar
        </Button>
      </Header>

      {showForm && (
        <Card className="mb-6 max-w-md">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
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
              <TableHead>Nombre</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Trabajos</TableHead>
              <TableHead>Deuda</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {odontologos.map((o) => (
              <TableRow key={o.id}>
                <TableCell>
                  <Link
                    href={`/odontologos/${o.id}`}
                    className="text-gold hover:text-gold-light font-medium"
                  >
                    {o.nombre}
                  </Link>
                </TableCell>
                <TableCell className="text-ivory/60">
                  {o.telefono || "—"}
                </TableCell>
                <TableCell className="text-ivory/60">
                  {o.email || "—"}
                </TableCell>
                <TableCell>{o.trabajosCount}</TableCell>
                <TableCell
                  className={o.deuda > 0 ? "text-amber-400" : "text-emerald-400"}
                >
                  {formatCurrency(o.deuda)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEdit(o)}
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
