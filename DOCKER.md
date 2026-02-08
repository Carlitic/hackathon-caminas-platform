# Docker Setup para Hackathon Platform

Esta guía explica cómo construir y ejecutar la aplicación usando Docker.

## 📋 Requisitos Previos

- Docker instalado ([Descargar Docker](https://www.docker.com/products/docker-desktop))
- Docker Compose instalado (incluido con Docker Desktop)
- Archivo `.env.local` con las variables de Supabase

## 🚀 Opción 1: Docker Compose (Recomendado)

### Construir y ejecutar
```bash
docker-compose up --build
```

### Ejecutar en segundo plano
```bash
docker-compose up -d
```

### Ver logs
```bash
docker-compose logs -f
```

### Detener
```bash
docker-compose down
```

## 🐳 Opción 2: Docker Manual

### 1. Construir la imagen
```bash
docker build -t hackathon-platform .
```

### 2. Ejecutar el contenedor
```bash
docker run -p 3000:3000 \
  --env-file .env.local \
  --name hackathon-app \
  hackathon-platform
```

### 3. Ejecutar en segundo plano
```bash
docker run -d -p 3000:3000 \
  --env-file .env.local \
  --name hackathon-app \
  hackathon-platform
```

### 4. Ver logs
```bash
docker logs -f hackathon-app
```

### 5. Detener y eliminar
```bash
docker stop hackathon-app
docker rm hackathon-app
```

## 🌐 Acceder a la Aplicación

Una vez que el contenedor esté corriendo:
- Abre tu navegador en: http://localhost:3000

## 📝 Variables de Entorno

Asegúrate de tener un archivo `.env.local` con:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

## 🔧 Comandos Útiles

### Ver contenedores en ejecución
```bash
docker ps
```

### Ver todas las imágenes
```bash
docker images
```

### Eliminar imagen
```bash
docker rmi hackathon-platform
```

### Limpiar todo (contenedores, imágenes, volúmenes)
```bash
docker system prune -a
```

### Entrar al contenedor (debugging)
```bash
docker exec -it hackathon-app sh
```

## 📦 Características del Dockerfile

- **Multi-stage build**: Optimiza el tamaño de la imagen
- **Node 24 Alpine**: Imagen base ligera
- **Usuario no-root**: Mayor seguridad
- **Standalone output**: Build optimizado de Next.js
- **Healthcheck**: Monitoreo automático de salud

## 🚢 Despliegue en Producción

### Docker Hub
```bash
# Tag
docker tag hackathon-platform tu-usuario/hackathon-platform:latest

# Push
docker push tu-usuario/hackathon-platform:latest
```

### Render, Railway, Fly.io
Estos servicios detectan automáticamente el Dockerfile y lo despliegan.

### VPS (Ubuntu/Debian)
```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clonar repo
git clone https://github.com/tu-usuario/hackathon-caminas-platform.git
cd hackathon-caminas-platform

# Crear .env.local con tus variables

# Ejecutar
docker-compose up -d
```

## ⚠️ Notas Importantes

1. **No incluyas `.env.local` en el repositorio** - Ya está en `.gitignore`
2. **Las variables de entorno** se pasan en tiempo de ejecución, no en build
3. **El puerto 3000** debe estar disponible en tu máquina
4. **Supabase debe estar accesible** desde el contenedor

## 🐛 Troubleshooting

### El contenedor no inicia
```bash
docker logs hackathon-app
```

### Puerto ya en uso
```bash
# Cambiar puerto en docker-compose.yml
ports:
  - "8080:3000"  # Usa puerto 8080 en tu máquina
```

### Cambios no se reflejan
```bash
# Rebuild sin cache
docker-compose build --no-cache
docker-compose up
```

## ✅ Verificación

Para verificar que todo funciona:
```bash
curl http://localhost:3000
```

Deberías ver el HTML de la página de inicio.
