# Brainia — AI Agent Platform

> Proyecto colaborativo de aprendizaje desarrollado por tres compañeros de estudio para poner en práctica habilidades reales de ingeniería de software con IA.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![LangChain](https://img.shields.io/badge/LangChain-LangGraph-green)](https://langchain.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-Private-red)](./LICENSE)

---

## Sobre este proyecto

Brainia nació como un proyecto entre tres compañeros de carrera con ganas de ir más allá de los ejercicios del aula. El objetivo fue claro desde el principio: construir algo real que nos obligara a enfrentar los problemas que solo aparecen cuando se despliega en producción.

A lo largo del desarrollo practicamos y aprendimos:

- **Prompt engineering** — diseño y refinamiento de prompts del sistema, instrucciones para agentes, cadenas de razonamiento y estrategias de few-shot para mejorar la calidad de las respuestas.
- **Arquitectura de aplicaciones con IA** — integración de LLMs en un flujo de producto real usando LangChain y LangGraph, con memoria, herramientas y retrieval.
- **Deployment y previews** — ciclos de CI/CD con GitHub Actions, previews por rama, variables de entorno por entorno (dev / staging / prod) y despliegue con Docker.
- **Infraestructura moderna** — uso de Supabase, Redis, pgvector, colas de workers y webhooks en un entorno de producción real.
- **Integraciones externas** — conexión con APIs de terceros como Evolution API (WhatsApp), Telegram, OpenAI y Google Gemini.

Es un proyecto imperfecto, en constante evolución, y eso es exactamente el punto.

---

## Equipo

| GitHub | Perfil |
|---|---|
| haison-ai | [@haison-ai](https://github.com/haison-ai) |
| mifonsecaa | [@Mifonsecaa](https://github.com/Mifonsecaa) |
| shirohigexe | [@shirohigexe](https://github.com/shirohigexe) |

---

## Que es Brainia

Brainia es una plataforma multi-tenant que permite a negocios desplegar agentes de IA personalizados conectados a sus canales de comunicación (WhatsApp y Telegram). Los agentes responden de forma contextual gracias a un pipeline RAG (Retrieval-Augmented Generation) alimentado con la base de conocimiento propia de cada negocio — archivos PDF, documentos, texto plano, etc.

**Produccion:** [https://www.brainia.tech](https://www.brainia.tech)

---

## Caracteristicas principales

- **Agentes conversacionales con LangGraph** — flujos de agentes con memoria persistente y lógica condicional.
- **WhatsApp** vía Evolution API (v2) — recibe y responde mensajes de forma automática.
- **Telegram** — integración con bots de Telegram con rate-limiting por chat.
- **Base de conocimiento RAG** — ingesta documentos (PDF, texto) y los recupera con búsqueda vectorial (pgvector).
- **Multi-modelo AI** — soporta OpenAI (GPT) y Google Gemini de forma intercambiable.
- **Transcripcion de audio** — cola de trabajos asíncronos para transcribir mensajes de voz.
- **Auth con OAuth** — login con Google y Facebook vía NextAuth.
- **Rate limiting distribuido** — control de tráfico en memoria y con Redis.
- **Panel de metricas** — seguimiento de uso, rendimiento del RAG y estado de colas.

---

## Stack tecnologico

| Capa | Tecnologia |
|---|---|
| Frontend / API | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| Agentes IA | LangChain, LangGraph, LangGraph Checkpoint (Postgres) |
| Modelos IA | OpenAI GPT, Google Gemini |
| Base de datos | PostgreSQL 16 + pgvector, Prisma ORM |
| Storage / DB cloud | Supabase |
| Mensajeria | Evolution API (WhatsApp), Telegram Bot API |
| Cache / Rate limiting | Redis (ioredis), cache en memoria |
| Auth | NextAuth v4 (Google OAuth, Facebook OAuth) |
| Email transaccional | Resend |
| Contenedorizacion | Docker + Docker Compose |
| CI/CD | GitHub Actions |

---

## Estructura del proyecto

```
├── app/                   # Rutas y API routes (Next.js App Router)
├── components/            # Componentes React reutilizables
├── context/               # Contextos globales de React
├── lib/                   # Utilidades, clientes de DB, helpers
├── prisma/                # Schema de Prisma y migraciones
├── public/                # Assets estáticos
├── scripts/               # Workers y scripts de evaluación RAG
│   ├── knowledge-worker-loop.js       # Worker de ingesta de conocimiento
│   ├── knowledge-cleanup-loop.js      # Limpieza de base de conocimiento
│   ├── transcription-worker-loop.js   # Worker de transcripción de audio
│   └── eval-rag-*.js                  # Scripts de evaluación y tuning RAG
├── services/              # Lógica de negocio y servicios externos
├── types/                 # Tipos TypeScript globales
├── .ai/mcp/               # Configuración MCP para AI tools
├── .github/workflows/     # Pipelines de CI/CD
├── docker-compose.yml     # Orquestación local (Evolution API + PostgreSQL)
└── .env.example           # Variables de entorno requeridas
```

---

## Instalacion y configuracion local

### Prerrequisitos

- Node.js 20+
- PostgreSQL 16 con extensión `pgvector`
- Redis (opcional, para rate limiting distribuido)
- Docker y Docker Compose (para Evolution API / WhatsApp)
- Cuentas en: Supabase, OpenAI o Google AI, Resend

### 1. Clonar el repositorio

```bash
git clone https://github.com/Mifonsecaa/Agenty-.git
cd Agenty-
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales. Las variables principales son:

```env
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/brainia_db?schema=public"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Auth
NEXTAUTH_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# AI Providers
OPENAI_API_KEY="sk-..."
GEMINI_API_KEY="AIza..."

# WhatsApp (Evolution API)
EVOLUTION_API_URL="http://localhost:8080"
EVOLUTION_API_KEY="..."
EVOLUTION_WEBHOOK_URL="https://tu-dominio.com/api/whatsapp/webhook"
```

Consulta `.env.example` para la lista completa de variables, incluyendo configuración de Redis, RAG tuning y workers.

### 4. Levantar servicios con Docker

```bash
docker-compose up -d
```

### 5. Inicializar la base de datos

```bash
npx prisma migrate dev
npx prisma generate
```

### 6. Iniciar la aplicacion

```bash
npm run dev
# App disponible en http://localhost:3001
```

---

## Workers en background

Los workers procesan colas de forma asíncrona. Ejecutar en terminales separadas:

```bash
# Worker de ingesta de base de conocimiento
npm run worker:knowledge

# Worker de limpieza de conocimiento
npm run worker:knowledge:cleanup

# Worker de transcripción de audio
npm run worker:transcription
```

Para ejecutar una sola pasada (útil en cron jobs):

```bash
npm run worker:knowledge:once
npm run worker:transcription:once
```

---

## Evaluacion y tuning del RAG

```bash
# Evaluar calidad general del RAG
npm run eval:rag

# Evaluar retrieval (hit@k)
npm run eval:rag:retrieval

# Optimizar pipeline RAG
npm run rag:optimize

# Generar y validar dataset de retrieval
npm run rag:dataset:generate
npm run rag:dataset:validate
```

Las variables de tuning del RAG se configuran en `.env`:

| Variable | Descripcion | Default |
|---|---|---|
| `RAG_CHUNK_SIZE` | Tamaño de chunk en caracteres | `700` |
| `RAG_CHUNK_OVERLAP` | Overlap entre chunks | `120` |
| `RAG_RETRIEVAL_TOP_K` | Documentos a recuperar | `4` |
| `RAG_MIN_VECTOR_SIMILARITY` | Umbral mínimo de similitud | `0.6` |
| `RAG_MULTI_QUERY_ENABLED` | Generación multi-query | `true` |

---

## Integracion con WhatsApp

Brainia usa Evolution API v2 para la integración con WhatsApp Web.

1. Asegúrate de que Docker esté corriendo (`docker-compose up -d`).
2. Accede a la Evolution API en `http://localhost:8080`.
3. Crea una instancia y escanea el QR con WhatsApp.
4. Configura el webhook en Evolution para apuntar a tu `EVOLUTION_WEBHOOK_URL`.

Para verificar la configuración:

```bash
# Linux/macOS
bash verify-whatsapp-setup.sh

# Windows (PowerShell)
.\Verify-WhatsappSetup.ps1
```

---

## Variables de entorno requeridas

| Variable | Descripcion |
|---|---|
| `DATABASE_URL` | URL de conexión a PostgreSQL |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio de Supabase |
| `NEXTAUTH_SECRET` | Secret para NextAuth |
| `GOOGLE_CLIENT_ID` / `_SECRET` | OAuth de Google |
| `OPENAI_API_KEY` | API key de OpenAI |
| `GEMINI_API_KEY` | API key de Google Gemini |
| `RESEND_API_KEY` | API key de Resend (emails) |
| `EVOLUTION_API_KEY` | Clave de Evolution API |
| `EVOLUTION_WEBHOOK_URL` | URL publica para recibir webhooks de WhatsApp |

---

## Licencia

Proyecto privado. Todos los derechos reservados © Brainia.
