import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Trophy, ArrowRight, FileText } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">

      <main className="flex-1">
        {/* Sección Hero */}
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
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link href="/login">
                <Button size="lg" className="font-semibold text-white w-full sm:w-auto shadow-md hover:shadow-lg transition-all">
                  Entrar a la Plataforma <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="secondary" className="font-semibold w-full sm:w-auto shadow-sm">
                  Registro Alumno
                </Button>
              </Link>
              <Link href="/register/teacher">
                <Button size="lg" variant="secondary" className="font-semibold w-full sm:w-auto shadow-sm">
                  Registro Profesor
                </Button>
              </Link>
              <Link href="/ranking">
                <Button size="lg" variant="outline" className="font-semibold w-full sm:w-auto gap-2 shadow-sm">
                  <Trophy className="h-4 w-4" />
                  Ver Ranking
                </Button>
              </Link>
              <Link href="/normas">
                <Button size="lg" variant="outline" className="font-semibold w-full sm:w-auto gap-2 shadow-sm">
                  <FileText className="h-4 w-4" />
                  Normas
                </Button>
              </Link>
            </div>

          </div>
        </section>

        {/* Tarjetas de Características */}
        <section className="w-full py-12 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3 justify-items-center">
            <Card className="w-full max-w-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Equipos 2+2+2</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Formación estratégica con estudiantes de DAW, DAM y ASIR. ¡Colaboración interdisciplinar total!
                </p>
              </CardContent>
            </Card>
            <Card className="w-full max-w-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                  <Trophy className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                </div>
                <CardTitle className="text-xl">Competición</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Sistema de votación en tiempo real por parte de los profesores. Semáforo de estado y rankings.
                </p>
              </CardContent>
            </Card>
            <Card className="w-full max-w-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                </div>
                <CardTitle className="text-xl">Gestión de Turnos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Coordinación perfecta entre turnos de mañana y tarde con herramientas de contacto remoto.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="py-8 md:px-8 border-t bg-slate-50 dark:bg-slate-900">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row px-4">
          <p className="text-sm text-center md:text-left text-muted-foreground">
            &copy; {new Date().getFullYear()} IES El Caminàs - Hackathon Platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
