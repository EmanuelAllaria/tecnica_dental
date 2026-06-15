# Sistema Dental — Técnica Dental

Sistema de gestión para laboratorio dental: trabajos, odontólogos, pagos, reportes PDF e IA.

## Requisitos

- Node.js 20+
- Cuenta en [Supabase](https://supabase.com) (Auth, DB, Storage)
- Docker Desktop (opcional, para producción containerizada)

## Desarrollo local

```bash
cp .env.example .env
# Completá las variables de Supabase y Groq en .env

npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

### Base de datos

1. Ejecutá [`supabase/schema.sql`](supabase/schema.sql) en el SQL Editor de Supabase (instalación nueva).
2. Si migrás una base existente, ejecutá también [`supabase/migration_dual_pricing.sql`](supabase/migration_dual_pricing.sql).
3. Creá el bucket `trabajos-fotos` en Supabase Storage (público).
4. Seed opcional: `npm run db:seed`

## Docker (producción)

La app se containeriza con Next.js standalone. Supabase sigue en la nube.

### Prerrequisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución.

### Configuración

```bash
cp .env.docker.example .env
# Completá NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY y secretos
```

| Variable | Cuándo se aplica | Requiere rebuild |
|----------|------------------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Build | Sí |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Build | Sí |
| `NEXT_PUBLIC_APP_URL` | Build | Sí |
| `SUPABASE_SERVICE_ROLE_KEY` | Runtime | No |
| `GROQ_API_KEY` | Runtime | No |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Runtime | No |

Si cambiás la URL pública de la app (ej. deploy en VPS), actualizá `NEXT_PUBLIC_APP_URL` y volvé a hacer build.

### Build y ejecución

```bash
npm run docker:build
npm run docker:up
```

Verificá:

- App: [http://localhost:3010](http://localhost:3010)
- Health: [http://localhost:3010/api/health](http://localhost:3010/api/health)

El puerto host por defecto es **3010** (libre respecto a 80, 443, 17778, 3306). Se expone solo en `127.0.0.1` para que nginx u otro reverse proxy en el mismo servidor pueda enrutar el tráfico sin abrir otro puerto público.

### Comandos útiles

```bash
npm run docker:logs    # Ver logs del contenedor
npm run docker:down    # Detener y remover contenedores

# Seed de datos contra Supabase cloud
docker compose --profile tools run --rm seed
```

### Deploy en servidor (VPS) — coffeemap

#### 1. DNS (obligatorio)

El error `DNS_PROBE_POSSIBLE` significa que el dominio **no existe en DNS**. Creá un registro en tu proveedor (Cloudflare, etc.):

| Tipo | Nombre | Valor |
|------|--------|-------|
| A | `tecnica-dental` | IP de tu VPS |

**Importante:** usá **guión** (`tecnica-dental.coffeemap.app`), no underscore (`tecnica_dental`). Los subdominios con `_` no son válidos en DNS estándar y muchos proveedores no los resuelven.

Verificá:

```bash
dig +short tecnica-dental.coffeemap.app
# Debe devolver la IP del VPS
```

#### 2. Variables en `.env`

```env
NEXT_PUBLIC_APP_URL="https://tecnica-dental.coffeemap.app"
APP_PORT=3010
```

#### 3. Build y levantar

```bash
docker compose build
docker compose up -d
```

#### 4. Nginx reverse proxy

`coffeemap_reverse_proxy` corre en otro contenedor. Por defecto la app publica el puerto **3010** en el host y nginx debe apuntar al gateway Docker del host:

```nginx
set $upstream_endpoint http://172.17.0.1:3010;
```

Si `172.17.0.1` no funciona, verificá la IP de `docker0`:

```bash
ip -4 addr show docker0 | grep inet
```

**Alternativa (red compartida):** si querés usar `http://tecnica_dental_app:3000`:

```bash
# Descubrí el nombre real de la red
docker inspect coffeemap_reverse_proxy --format '{{range $k, $v := .NetworkSettings.Networks}}{{$k}} {{end}}'

# En .env: DOCKER_NETWORK=nombre_real
docker compose -f docker-compose.yml -f docker-compose.coffeemap.yml up -d
```

Plantilla completa: [`deploy/nginx-tecnica-dental.conf.example`](deploy/nginx-tecnica-dental.conf.example)

Después de editar la config:

```bash
docker restart coffeemap_reverse_proxy
```

#### 5. Verificación

```bash
# App en el host
curl http://127.0.0.1:3010/api/health

# Como lo ve nginx (desde su contenedor)
docker exec coffeemap_reverse_proxy wget -qO- http://172.17.0.1:3010/api/health

# DNS
dig +short tecnica-dental.coffeemap.app
```

Para usar otro puerto host, definí `APP_PORT` en `.env` (ej. `APP_PORT=3011`).

> **Nota:** Para desarrollo diario con hot reload, usá `npm run dev`. Docker en Windows/Mac es más lento para HMR; reservalo para builds de producción y pruebas.

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción (sin Docker) |
| `npm run db:seed` | Cargar datos de ejemplo |
| `npm run docker:build` | Construir imagen Docker |
| `npm run docker:up` | Levantar contenedor |
| `npm run docker:down` | Bajar contenedor |
| `npm run docker:logs` | Ver logs |
