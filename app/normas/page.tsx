import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Users, GitBranch, Lightbulb, Globe, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NormasPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
            <div className="container mx-auto max-w-4xl space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <FileText className="h-20 w-20 text-primary mx-auto" />
                    <h1 className="text-4xl font-bold tracking-tight">Normativa de la Hackathon</h1>
                    <p className="text-lg text-muted-foreground">
                        IES El Caminàs - Reglas y Procedimientos
                    </p>
                    <p className="text-sm text-muted-foreground">
                        La participación en la Hackathon implica la aceptación de las siguientes normas, cuyo cumplimiento es auditado automáticamente por el software.
                    </p>
                    <Link href="/">
                        <Button variant="outline" className="mt-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver al Inicio
                        </Button>
                    </Link>
                </div>

                {/* 6.1 Normativa de Conformación */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Users className="h-6 w-6 text-primary" />
                            <CardTitle className="text-2xl">6.1. Normativa de Conformación</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                <Badge variant="default">Integridad</Badge>
                            </h3>
                            <p className="text-muted-foreground">
                                Todo equipo debe estar formado estrictamente por <strong>6 integrantes</strong>.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                <Badge variant="default">Inamovilidad</Badge>
                            </h3>
                            <p className="text-muted-foreground">
                                Una vez el equipo es validado por los tres tutores, <strong>no se permitirán cambios de integrantes</strong> salvo causa de fuerza mayor autorizada por Jefatura de Estudios.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* 6.2 Normativa de Entrega */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <GitBranch className="h-6 w-6 text-primary" />
                            <CardTitle className="text-2xl">6.2. Normativa de Entrega (Code Freeze)</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground italic">
                            Para simular un entorno de producción real, se establecen plazos estrictos.
                        </p>
                        <div>
                            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                <Badge variant="default">Repositorio Único</Badge>
                            </h3>
                            <p className="text-muted-foreground">
                                Todo el código debe estar alojado en un <strong>repositorio público de GitHub</strong>. No se aceptan entregas por USB o correo.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                <Badge variant="destructive">Congelación de Código</Badge>
                            </h3>
                            <p className="text-muted-foreground">
                                En el momento exacto en que finaliza la cuenta atrás, el sistema registra el <strong>hash del último commit</strong>. Cualquier modificación posterior no será evaluada.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* 6.3 Uso de Recursos */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Lightbulb className="h-6 w-6 text-primary" />
                            <CardTitle className="text-2xl">6.3. Uso de Recursos y "Comodines" (Soporte Técnico)</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground italic">
                            Se limita el acceso a la ayuda docente para fomentar la autonomía y la investigación.
                        </p>
                        <div>
                            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                <Badge variant="default">Límite de Consultas</Badge>
                            </h3>
                            <p className="text-muted-foreground">
                                Cada equipo dispone de un máximo de <strong>5 tickets de soporte (comodines)</strong> por jornada.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                <Badge variant="default">Procedimiento Vía Email</Badge>
                            </h3>
                            <p className="text-muted-foreground">
                                Las consultas deben tramitarse pulsando el botón <strong>"Solicitar Ayuda"</strong>. El sistema enviará automáticamente un correo electrónico a los profesores de guardia y descontará un comodín del saldo del equipo.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* 6.4 Política sobre IA */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">6.4. Política sobre Inteligencia Artificial (IA)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            El uso de asistentes (ChatGPT, Copilot) está <strong>permitido</strong> como herramienta de productividad, bajo la condición de que <strong>todos los miembros del equipo sean capaces de explicar y defender el código generado</strong>. La falta de comprensión del propio código será motivo de penalización.
                        </p>
                    </CardContent>
                </Card>

                {/* 6.5 Entregables Documentales */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Globe className="h-6 w-6 text-primary" />
                            <CardTitle className="text-2xl">6.5. Entregables Documentales y Defensa Oral (Bilingüismo) 🇬🇧🇪🇸</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground italic">
                            La competencia técnica debe ir acompañada de competencia comunicativa. Se establecen los siguientes requisitos de entrega y exposición:
                        </p>
                        <div>
                            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                <Badge variant="default">Documentación Bilingüe</Badge>
                            </h3>
                            <p className="text-muted-foreground">
                                El repositorio de GitHub debe incluir obligatoriamente una carpeta <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">/docs</code> que contenga la Memoria Técnica en dos archivos PDF independientes:
                            </p>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                                <li><code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">MEMORIA_TECNICA_ES.pdf</code></li>
                                <li><code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">TECHNICAL_REPORT_EN.pdf</code></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                <Badge variant="default">Defensa ante el Tribunal</Badge>
                            </h3>
                            <p className="text-muted-foreground">
                                El equipo deberá realizar una <strong>exposición oral (máx 15 min)</strong> donde todos los miembros intervengan. El tribunal podrá realizar preguntas en inglés.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center pt-8">
                    <p className="text-sm text-muted-foreground">
                        El cumplimiento de estas normas es auditado automáticamente por el software de la plataforma.
                    </p>
                    <Link href="/">
                        <Button variant="outline" className="mt-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver al Inicio
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
