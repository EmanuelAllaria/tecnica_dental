"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConfiguracionPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/configuracion/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      setMessage("Contraseña actualizada correctamente");
      setPassword("");
      setConfirmPassword("");
    } else {
      const data = await res.json();
      setError(data.error || "Error al actualizar");
    }
    setLoading(false);
  }

  return (
    <div>
      <Header title="Configuración" subtitle="Ajustes de tu cuenta" />

      <div className="max-w-lg space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Laboratorio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-ivory/50">Nombre</p>
              <p className="font-display text-xl text-ivory">Técnica Dental</p>
            </div>
            <p className="text-xs text-ivory/30">
              Sistema personal de gestión de laboratorio dental.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
