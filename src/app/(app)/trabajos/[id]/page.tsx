"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import { Upload, DollarSign } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EstadoBadge } from "@/components/ui/estado-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";

interface TrabajoDetail {
  id: string;
  codigo: string;
  tipoCliente: string;
  paciente: string;
  precio: number;
  totalPagado: number;
  saldo: number;
  estado: string;
  fechaIngreso: string;
  fechaEntrega: string | null;
  notas: string | null;
  fotoUrl: string | null;
  odontologo: { id: string; nombre: string } | null;
  tipoTrabajo: {
    id: string;
    nombre: string;
    precioOdontologo?: number;
    precioCliente?: number;
  };
  pagos: Array<{
    id: string;
    monto: number;
    fecha: string;
    metodo: string | null;
    notas: string | null;
  }>;
}

export default function TrabajoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [trabajo, setTrabajo] = useState<TrabajoDetail | null>(null);
  const [odontologos, setOdontologos] = useState<{ id: string; nombre: string }[]>([]);
  const [tipos, setTipos] = useState<
    { id: string; nombre: string; precioOdontologo: number; precioCliente: number }[]
  >([]);
  const [editing, setEditing] = useState(false);
  const [pagoForm, setPagoForm] = useState({ monto: "", metodo: "", notas: "" });
  const [showPago, setShowPago] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    tipoCliente: "ODONTOLOGO" as "ODONTOLOGO" | "CLIENTE_DIRECTO",
    odontologoId: "",
    paciente: "",
    tipoTrabajoId: "",
    precio: "",
    estado: "",
    fechaEntrega: "",
    notas: "",
  });

  async function loadTrabajo() {
    const res = await fetch(`/api/trabajos/${id}`);
    const data = await res.json();
    setTrabajo(data);
    setForm({
      tipoCliente: data.tipoCliente,
      odontologoId: data.odontologo?.id ?? "",
      paciente: data.paciente,
      tipoTrabajoId: data.tipoTrabajo.id,
      precio: String(data.precio),
      estado: data.estado,
      fechaEntrega: data.fechaEntrega
        ? data.fechaEntrega.split("T")[0]
        : "",
      notas: data.notas || "",
    });
  }

  useEffect(() => {
    loadTrabajo();
    fetch("/api/odontologos").then((r) => r.json()).then(setOdontologos);
    fetch("/api/precios")
      .then((r) => r.json())
      .then((d) => setTipos(d.tipos));
  }, [id]);

  async function handleSave() {
    await fetch(`/api/trabajos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipoCliente: form.tipoCliente,
        odontologoId:
          form.tipoCliente === "ODONTOLOGO" ? form.odontologoId : null,
        paciente: form.paciente,
        tipoTrabajoId: form.tipoTrabajoId,
        precio: parseFloat(form.precio),
        estado: form.estado,
        fechaEntrega: form.fechaEntrega || null,
        notas: form.notas,
      }),
    });
    setEditing(false);
    loadTrabajo();
  }

  async function handlePago(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/trabajos/${id}/pagos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        monto: parseFloat(pagoForm.monto),
        metodo: pagoForm.metodo || null,
        notas: pagoForm.notas || null,
      }),
    });
    setPagoForm({ monto: "", metodo: "", notas: "" });
    setShowPago(false);
    loadTrabajo();
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("trabajoId", id);

    await fetch("/api/upload/foto", { method: "POST", body: formData });
    setUploading(false);
    loadTrabajo();
  }

  if (!trabajo) {
    return <p className="text-ivory/40 text-center py-20">Cargando...</p>;
  }

  return (
    <div>
      <Header
        title={trabajo.codigo}
        subtitle={
          trabajo.tipoCliente === "CLIENTE_DIRECTO"
            ? `Cliente: ${trabajo.paciente}`
            : `Paciente: ${trabajo.paciente}`
        }
      >
        <EstadoBadge estado={trabajo.estado} />
        <Button variant="outline" onClick={() => setEditing(!editing)}>
          {editing ? "Cancelar" : "Editar"}
        </Button>
      </Header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalle del trabajo</CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de cliente</Label>
                    <Select
                      value={form.tipoCliente}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          tipoCliente: e.target.value as
                            | "ODONTOLOGO"
                            | "CLIENTE_DIRECTO",
                          odontologoId:
                            e.target.value === "CLIENTE_DIRECTO"
                              ? ""
                              : form.odontologoId,
                        })
                      }
                    >
                      <option value="ODONTOLOGO">Odontólogo</option>
                      <option value="CLIENTE_DIRECTO">Cliente directo</option>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {form.tipoCliente === "ODONTOLOGO" && (
                      <div className="space-y-2">
                        <Label>Odontólogo</Label>
                        <Select
                          value={form.odontologoId}
                          onChange={(e) =>
                            setForm({ ...form, odontologoId: e.target.value })
                          }
                          required
                        >
                          <option value="">Seleccionar...</option>
                          {odontologos.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.nombre}
                            </option>
                          ))}
                        </Select>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>
                        {form.tipoCliente === "CLIENTE_DIRECTO"
                          ? "Cliente"
                          : "Paciente"}
                      </Label>
                      <Input
                        value={form.paciente}
                        onChange={(e) =>
                          setForm({ ...form, paciente: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de trabajo</Label>
                      <Select
                        value={form.tipoTrabajoId}
                        onChange={(e) =>
                          setForm({ ...form, tipoTrabajoId: e.target.value })
                        }
                      >
                        {tipos.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nombre}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Precio</Label>
                      <Input
                        type="number"
                        value={form.precio}
                        onChange={(e) =>
                          setForm({ ...form, precio: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Select
                        value={form.estado}
                        onChange={(e) =>
                          setForm({ ...form, estado: e.target.value })
                        }
                      >
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="EN_PROCESO">En proceso</option>
                        <option value="ENTREGADO">Entregado</option>
                        <option value="PAGADO">Pagado</option>
                        <option value="VENCIDO">Vencido</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha entrega</Label>
                      <Input
                        type="date"
                        value={form.fechaEntrega}
                        onChange={(e) =>
                          setForm({ ...form, fechaEntrega: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notas</Label>
                    <Textarea
                      value={form.notas}
                      onChange={(e) =>
                        setForm({ ...form, notas: e.target.value })
                      }
                    />
                  </div>
                  <Button onClick={handleSave}>Guardar cambios</Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                  <div>
                    <p className="text-ivory/40">Tipo</p>
                    <p className="text-ivory">
                      {trabajo.tipoCliente === "CLIENTE_DIRECTO"
                        ? "Cliente directo"
                        : "Odontólogo"}
                    </p>
                  </div>
                  {trabajo.tipoCliente === "ODONTOLOGO" ? (
                    <>
                      <div>
                        <p className="text-ivory/40">Odontólogo</p>
                        <p className="text-ivory">
                          {trabajo.odontologo?.nombre ?? "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-ivory/40">Paciente</p>
                        <p className="text-ivory">{trabajo.paciente}</p>
                      </div>
                    </>
                  ) : (
                    <div>
                      <p className="text-ivory/40">Cliente</p>
                      <p className="text-ivory">{trabajo.paciente}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-ivory/40">Tipo de trabajo</p>
                    <p className="text-ivory">{trabajo.tipoTrabajo.nombre}</p>
                  </div>
                  <div>
                    <p className="text-ivory/40">Fecha ingreso</p>
                    <p className="text-ivory">{formatDate(trabajo.fechaIngreso)}</p>
                  </div>
                  <div>
                    <p className="text-ivory/40">Fecha entrega</p>
                    <p className="text-ivory">
                      {trabajo.fechaEntrega
                        ? formatDate(trabajo.fechaEntrega)
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-ivory/40">Precio</p>
                    <p className="text-ivory font-display text-xl">
                      {formatCurrency(trabajo.precio)}
                    </p>
                  </div>
                  <div>
                    <p className="text-ivory/40">Saldo pendiente</p>
                    <p
                      className={`font-display text-xl ${trabajo.saldo > 0 ? "text-amber-400" : "text-emerald-400"}`}
                    >
                      {formatCurrency(trabajo.saldo)}
                    </p>
                  </div>
                  {trabajo.notas && (
                    <div className="col-span-2">
                      <p className="text-ivory/40">Notas</p>
                      <p className="text-ivory/80">{trabajo.notas}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Pagos</CardTitle>
              <Button size="sm" onClick={() => setShowPago(!showPago)}>
                <DollarSign className="h-4 w-4" />
                Registrar pago
              </Button>
            </CardHeader>
            <CardContent>
              {showPago && (
                <form onSubmit={handlePago} className="mb-6 p-4 rounded-xl bg-ivory/5 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label>Monto</Label>
                      <Input
                        type="number"
                        value={pagoForm.monto}
                        onChange={(e) =>
                          setPagoForm({ ...pagoForm, monto: e.target.value })
                        }
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Método</Label>
                      <Select
                        value={pagoForm.metodo}
                        onChange={(e) =>
                          setPagoForm({ ...pagoForm, metodo: e.target.value })
                        }
                      >
                        <option value="">Seleccionar...</option>
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="cheque">Cheque</option>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Notas</Label>
                      <Input
                        value={pagoForm.notas}
                        onChange={(e) =>
                          setPagoForm({ ...pagoForm, notas: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <Button type="submit" size="sm">
                    Confirmar pago
                  </Button>
                </form>
              )}

              {trabajo.pagos.length === 0 ? (
                <p className="text-ivory/40 text-sm">Sin pagos registrados</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Notas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trabajo.pagos.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{formatDate(p.fecha)}</TableCell>
                        <TableCell className="text-emerald-400">
                          {formatCurrency(p.monto)}
                        </TableCell>
                        <TableCell>{p.metodo || "—"}</TableCell>
                        <TableCell className="text-ivory/50">
                          {p.notas || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Foto del caso</CardTitle>
            </CardHeader>
            <CardContent>
              {trabajo.fotoUrl ? (
                <div className="relative aspect-square rounded-xl overflow-hidden">
                  <Image
                    src={trabajo.fotoUrl}
                    alt={`Caso ${trabajo.codigo}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square rounded-xl border-2 border-dashed border-ivory/10 flex items-center justify-center">
                  <p className="text-ivory/30 text-sm">Sin foto</p>
                </div>
              )}
              <label className="mt-4 flex items-center justify-center gap-2 cursor-pointer rounded-lg border border-ivory/15 py-2.5 text-sm text-ivory/60 hover:text-ivory hover:border-gold/30 transition-colors">
                <Upload className="h-4 w-4" />
                {uploading ? "Subiendo..." : "Subir foto"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-ivory/50">Total</span>
                <span className="text-ivory">{formatCurrency(trabajo.precio)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ivory/50">Pagado</span>
                <span className="text-emerald-400">
                  {formatCurrency(trabajo.totalPagado)}
                </span>
              </div>
              <div className="border-t border-ivory/10 pt-3 flex justify-between font-medium">
                <span className="text-ivory/50">Saldo</span>
                <span
                  className={
                    trabajo.saldo > 0 ? "text-amber-400" : "text-emerald-400"
                  }
                >
                  {formatCurrency(trabajo.saldo)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
