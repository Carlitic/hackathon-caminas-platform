import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Trophy, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full px-4 sm:px-8 pb-8 pt-16 md:py-24">
          <div className="max-w-5xl mx-auto flex flex-col items-center gap-4 text-center">
            <Image
              src="/logo.jpg"
              alt="Hackathon Logo"
              width={200}
              height={200}
              className="rounded-full shadow-xl mb-4 border-4 border-primary/20"
              priority
            />
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-slate-900 dark:text-slate-50">
              Hackathon <span className="text-primary">IES El Caminàs</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-[700px]">
              La plataforma oficial para gestionar equipos, roles y evaluaciones del evento tecnológico más esperado del año.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Link href="/login">
                <Button size="lg" className="font-semibold text-white w-full sm:w-auto">
                  Entrar a la Plataforma <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="secondary" className="font-semibold w-full sm:w-auto">
                  Registro Alumno
                </Button>
              </Link>
              <Link href="/register/teacher">
                <Button size="lg" variant="secondary" className="font-semibold w-full sm:w-auto">
                  Registro Profesor
                </Button>
              </Link>
              <Link href="/ranking">
                <Button size="lg" variant="outline" className="font-semibold w-full sm:w-auto gap-2">
                  <Trophy className="h-4 w-4" />
                  Ver Ranking
                </Button>
              </Link>
            </div>

            {/* DEMO ACCESS - Central Hub for Screenshots */}
            <div className="mt-8 p-4 border border-dashed border-amber-300 rounded-lg bg-amber-50 dark:bg-amber-900/20 max-w-2xl w-full">
              <p className="text-xs font-bold text-amber-600 dark:text-amber-500 mb-3 uppercase tracking-wide text-center">
                Acceso Rápido (Mapa del Sitio)
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Link href="/login">
                  <Badge variant="secondary" className="cursor-pointer hover:bg-slate-200">🔐 Login</Badge>
                </Link>
                <Link href="/register">
                  <Badge variant="secondary" className="cursor-pointer hover:bg-slate-200">📝 Reg Alumno</Badge>
                </Link>
                <Link href="/register/teacher">
                  <Badge variant="secondary" className="cursor-pointer hover:bg-slate-200">👨‍🏫 Reg Profe</Badge>
                </Link>
                <Link href="/student/team">
                  <Badge variant="outline" className="hover:bg-amber-100 dark:hover:bg-amber-900/40 cursor-pointer">👨‍🎓 Dshb Alumno</Badge>
                </Link>
                <Link href="/teacher/dashboard">
                  <Badge variant="outline" className="hover:bg-amber-100 dark:hover:bg-amber-900/40 cursor-pointer">👨‍🏫 Dshb Tutor</Badge>
                </Link>
                <Link href="/teacher/general">
                  <Badge variant="outline" className="hover:bg-amber-100 dark:hover:bg-amber-900/40 cursor-pointer">👨‍🏫 Dshb Profe</Badge>
                </Link>
                <Link href="/admin/dashboard">
                  <Badge variant="outline" className="hover:bg-amber-100 dark:hover:bg-amber-900/40 cursor-pointer">🛠️ Dshb Admin</Badge>
                </Link>
                <Link href="/ranking">
                  <Badge variant="outline" className="hover:bg-amber-100 dark:hover:bg-amber-900/40 cursor-pointer">🏆 Ranking</Badge>
                </Link>
              </div>
            </div>


          </div>
        </section>

        {/* Feature Cards */}
        <section className="w-full py-12 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-3 justify-items-center">
            <Card className="w-full max-w-sm">
              <CardHeader className="flex flex-row items-center gap-4">
                <Users className="h-8 w-8 text-primary" />
                <CardTitle>Equipos 2+2+2</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Formación estratégica con estudiantes de DAW, DAM y ASIR. ¡Colaboración interdisciplinar total!
                </p>
              </CardContent>
            </Card>
            <Card className="w-full max-w-sm">
              <CardHeader className="flex flex-row items-center gap-4">
                <Trophy className="h-8 w-8 text-secondary" />
                <CardTitle>Competición</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Sistema de votación en tiempo real por parte de los profesores. Semáforo de estado y rankings.
                </p>
              </CardContent>
            </Card>
            <Card className="w-full max-w-sm">
              <CardHeader className="flex flex-row items-center gap-4">
                <Calendar className="h-8 w-8 text-blue-500" />
                <CardTitle>Gestión de Turnos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Coordinación perfecta entre turnos de mañana y tarde con herramientas de contacto remoto.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-start justify-start gap-4 md:h-24 px-4">
          <p className="text-left text-sm leading-loose text-muted-foreground">
            Creado para IES El Caminàs.
          </p>
        </div>
      </footer>
    </div>
  );
}
