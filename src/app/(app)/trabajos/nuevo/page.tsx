"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface Odontologo {
  id: string;
  nombre: string;
}

interface TipoTrabajo {
  id: string;
  nombre: string;
  precioOdontologo: number;
  precioCliente: number;
}

export default function NuevoTrabajoPage() {
  const router = useRouter();
  const [odontologos, setOdontologos] = useState<Odontologo[]>([]);
  const [tipos, setTipos] = useState<TipoTrabajo[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tipoCliente: "ODONTOLOGO" as "ODONTOLOGO" | "CLIENTE_DIRECTO",
    odontologoId: "",
    paciente: "",
    tipoTrabajoId: "",
    precio: "",
    estado: "PENDIENTE",
    fechaEntrega: "",
    notas: "",
  });

  useEffect(() => {
    fetch("/api/odontologos").then((r) => r.json()).then(setOdontologos);
    fetch("/api/precios")
      .then((r) => r.json())
      .then((d) =>
        setTipos(
          d.tipos.filter((t: TipoTrabajo & { activo: boolean }) => t.activo)
        )
      );
  }, []);

  function handleTipoChange(tipoId: string) {
    const tipo = tipos.find((t) => t.id === tipoId);
    const precio =
      form.tipoCliente === "ODONTOLOGO"
        ? tipo?.precioOdontologo
        : tipo?.precioCliente;
    setForm({
      ...form,
      tipoTrabajoId: tipoId,
      precio: precio != null ? String(precio) : "",
    });
  }

  function handleTipoClienteChange(tipoCliente: "ODONTOLOGO" | "CLIENTE_DIRECTO") {
    const tipo = tipos.find((t) => t.id === form.tipoTrabajoId);
    const precio =
      tipoCliente === "ODONTOLOGO"
        ? tipo?.precioOdontologo
        : tipo?.precioCliente;
    setForm({
      ...form,
      tipoCliente,
      odontologoId: tipoCliente === "CLIENTE_DIRECTO" ? "" : form.odontologoId,
      precio: precio != null ? String(precio) : form.precio,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/trabajos", {
      method: "POST",
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

    if (res.ok) {
      const trabajo = await res.json();
      router.push(`/trabajos/${trabajo.id}`);
    }
    setLoading(false);
  }

  const esClienteDirecto = form.tipoCliente === "CLIENTE_DIRECTO";

  return (
    <div>
      <Header title="Nuevo trabajo" subtitle="Registrar una nueva orden" />

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Tipo de cliente</Label>
              <Select
                value={form.tipoCliente}
                onChange={(e) =>
                  handleTipoClienteChange(
                    e.target.value as "ODONTOLOGO" | "CLIENTE_DIRECTO"
                  )
                }
              >
                <option value="ODONTOLOGO">Odontólogo (derivación)</option>
                <option value="CLIENTE_DIRECTO">Cliente directo</option>
              </Select>
              <p className="text-xs text-ivory/40">
                {esClienteDirecto
                  ? "La persona viene directamente al laboratorio."
                  : "El trabajo lo deriva un odontólogo."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {!esClienteDirecto && (
                <div className="space-y-2">
                  <Label>Odontólogo</Label>
                  <Select
                    value={form.odontologoId}
                    onChange={(e) =>
                      setForm({ ...form, odontologoId: e.target.value })
                    }
                    required={!esClienteDirecto}
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
                <Label>{esClienteDirecto ? "Cliente" : "Paciente"}</Label>
                <Input
                  value={form.paciente}
                  onChange={(e) =>
                    setForm({ ...form, paciente: e.target.value })
                  }
                  required
                  placeholder={
                    esClienteDirecto
                      ? "Nombre del cliente"
                      : "Nombre del paciente"
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de trabajo</Label>
                <Select
                  value={form.tipoTrabajoId}
                  onChange={(e) => handleTipoChange(e.target.value)}
                  required
                >
                  <option value="">Seleccionar...</option>
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
                  required
                  min="0"
                  step="0.01"
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
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fecha de entrega</Label>
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
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                placeholder="Observaciones del caso..."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Crear trabajo"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
