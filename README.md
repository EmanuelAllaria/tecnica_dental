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

### Deploy en servidor (VPS)

1. Cloná el repo y configurá `.env` con el dominio real en `NEXT_PUBLIC_APP_URL`.
2. `docker compose build && docker compose up -d`
3. En nginx (ej. `coffeemap_reverse_proxy`), agregá un `proxy_pass` al puerto interno:

```nginx
location / {
    proxy_pass http://127.0.0.1:3010;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
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
