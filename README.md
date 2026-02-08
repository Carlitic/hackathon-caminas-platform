# Plataforma Hackathon IES El Caminàs

Plataforma completa para gestionar la Hackathon del instituto, incluyendo registro de estudiantes y profesores, formación de equipos, votación y certificados.

## 🚀 Características

- **Sistema de Autenticación**: Registro e inicio de sesión para estudiantes, profesores y administradores
- **Aprobación de Alumnos**: Los tutores aprueban a sus alumnos antes de que puedan acceder
- **Aprobación de Tutores**: Solo el admin puede aprobar tutores (un tutor por grupo)
- **Formación de Equipos**: Sistema colaborativo donde cada tutor añade 2 alumnos de su asignatura
- **Sistema de Votación**: Los profesores votan por los mejores proyectos
- **Ranking en Tiempo Real**: Actualización automática de posiciones
- **Certificados Descargables**: Certificados en PDF según la posición del equipo
- **Gestión de Fases**: El admin controla las fases del evento

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **UI Components**: shadcn/ui
- **PDF Generation**: jsPDF

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase

**O simplemente:**
- Docker (para ejecutar con un solo comando)

## 🐳 Inicio Rápido con Docker (Recomendado)

**La forma más fácil de ejecutar la aplicación:**

```bash
# 1. Clonar el repositorio
git clone https://github.com/Carlitic/hackathon-caminas-platform.git
cd hackathon-caminas-platform

# 2. Crear archivo .env.local con tus credenciales de Supabase
# NEXT_PUBLIC_SUPABASE_URL=tu-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-key

# 3. Iniciar con Docker
docker-compose up -d

# 4. Abrir http://localhost:3000
```

**Comandos útiles:**
```bash
docker-compose logs -f    # Ver logs
docker-compose down       # Detener
docker-compose restart    # Reiniciar
```

Ver [DOCKER.md](DOCKER.md) para más detalles.

---

## ⚙️ Instalación Manual (Sin Docker)

1. **Clonar el repositorio**
```bash
git clone <tu-repo-url>
cd hackathon-caminas-platform
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Edita `.env.local` y añade tus credenciales de Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

4. **Configurar la base de datos**

Ve a tu panel de Supabase y ejecuta los siguientes scripts en orden:

a. Esquema principal:
```bash
# Ejecuta el contenido de: supabase/schema.sql
```

b. Migración de aprobación de tutores:
```bash
# Ejecuta el contenido de: supabase/migrations/add_tutor_approval.sql
```

5. **Crear usuario administrador**

Después de registrarte como profesor, ejecuta en Supabase:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'tu-email@edu.gva.es';
```

6. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📖 Uso

### Flujo de Trabajo

1. **Admin**: 
   - Registrarse como profesor
   - Ejecutar SQL para convertirse en admin
   - Aprobar tutores desde `/admin/dashboard`

2. **Tutores**:
   - Registrarse como profesor tutor
   - Esperar aprobación del admin
   - Aprobar alumnos desde `/teacher/dashboard`
   - Formar equipos (2 alumnos de su asignatura por equipo)

3. **Alumnos**:
   - Registrarse seleccionando su tutor
   - Esperar aprobación del tutor
   - Ver su equipo en `/student/team`
   - Descargar certificado cuando el evento finalice

### Reglas de Equipos

- Cada equipo tiene **6 miembros** (2 DAW + 2 DAM + 2 ASIR)
- Todos los miembros deben ser del **mismo año** (1º o 2º)
- Cada tutor solo puede añadir alumnos de **su propia asignatura**
- Los tutores **colaboran** para formar equipos completos

## 🗂️ Estructura del Proyecto

```
hackathon-caminas-platform/
├── app/                      # Páginas de Next.js
│   ├── admin/               # Dashboard de admin
│   ├── teacher/             # Dashboard de profesores
│   ├── student/             # Dashboard de estudiantes
│   ├── login/               # Página de login
│   ├── register/            # Registro de estudiantes
│   │   └── teacher/         # Registro de profesores
│   └── ranking/             # Ranking público
├── components/              # Componentes reutilizables
│   ├── ui/                  # Componentes de shadcn/ui
│   └── Certificate.tsx      # Componente de certificados
├── lib/                     # Utilidades y helpers
│   ├── supabase.ts         # Cliente de Supabase
│   ├── auth.ts             # Funciones de autenticación
│   ├── teacher.ts          # Funciones de profesores
│   └── admin.ts            # Funciones de admin
└── supabase/               # Scripts de base de datos
    ├── schema.sql          # Esquema principal
    └── migrations/         # Migraciones
```

## 🔐 Seguridad

- **RLS (Row Level Security)**: Políticas de seguridad a nivel de base de datos
- **Aprobación de tutores**: Solo el admin puede aprobar tutores
- **Un tutor por grupo**: Constraint en BD previene duplicados
- **Validación de equipos**: Solo alumnos del mismo año
- **Variables de entorno**: Credenciales protegidas en `.env.local`

## 🚀 Despliegue

### Vercel (Recomendado)

1. Push a GitHub
2. Importa el proyecto en Vercel
3. Añade las variables de entorno
4. Deploy automático

### Otras plataformas

El proyecto es compatible con cualquier plataforma que soporte Next.js.

## 📝 Licencia

Este proyecto está bajo la licencia MIT.

## 👥 Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría hacer.

---

Desarrollado con ❤️ para la Hackathon 2026
