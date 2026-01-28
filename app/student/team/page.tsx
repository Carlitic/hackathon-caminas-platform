"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Github, Mail, AlertCircle, Copy, LifeBuoy } from "lucide-react"
import Certificate from "@/components/Certificate"

export default function StudentTeamPage() {
    // Mock Data - Team with all 1st year students (2 from each cycle)
    const teamMembers = [
        { role: "1º DAW", name: "Carlos Castaños", email: "carlos@alu.edu.gva.es", cycle: "1º DAW", level: "1º", status: "filled" },
        { role: "1º DAW", name: "Ana García", email: "ana@alu.edu.gva.es", cycle: "1º DAW", level: "1º", status: "filled" },
        { role: "1º DAM", name: "Juan Pérez", email: "juan@alu.edu.gva.es", cycle: "1º DAM", level: "1º", status: "filled" },
        { role: "1º DAM", name: "María López", email: "maria@alu.edu.gva.es", cycle: "1º DAM", level: "1º", status: "filled" },
        { role: "1º ASIR", name: "Pedro Sánchez", email: "pedro@alu.edu.gva.es", cycle: "1º ASIR", level: "1º", status: "filled" },
        { role: "1º ASIR", name: "Laura Martín", email: "laura@alu.edu.gva.es", cycle: "1º ASIR", level: "1º", status: "filled" },
    ]

    // Mock Requirements with teacher names
    const requirements = [
        { tag: "GLOBAL", title: "Implementar Login con Supabase", teacher: "Prof. María López" },
        { tag: "DAW", title: "Crear interfaz de gestión de equipos", teacher: "Prof. Juan Martínez" },
        { tag: "GLOBAL", title: "Desplegar en Vercel", teacher: "Prof. María López" },
    ]

    // Mock event status and team position
    const eventFinished = true // Set to true when event ends
    const teamPosition = 1 // 1 = Gold, 2 = Silver, 3 = Bronze, 4+ = Participant
    const teamName = "Equipo 1"
    const studentName = "Carlos Castaños"

    return (
        <div className="container mx-auto p-6 space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mi Equipo</h1>
                    <p className="text-muted-foreground">Gestiona tu equipo y entregas para la Hackathon.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="destructive" className="gap-2" title="Registra una solicitud de ayuda visible para los profesores">
                        <LifeBuoy className="h-4 w-4" />
                        Solicitar Ayuda (Comodín)
                    </Button>
                </div>
            </header>

            {/* Certificate Display - Only shown when event is finished */}
            {eventFinished && (
                <div className="mb-8">
                    <Certificate
                        position={teamPosition}
                        teamName={teamName}
                        studentName={studentName}
                    />
                </div>
            )}

            {/* Status Banner */}
            <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 p-4 rounded">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-bold text-yellow-700 dark:text-yellow-500">Estado: PENDING</p>
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">Faltan 2 miembros para completar el equipo. No podéis entregar aún.</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Roster Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Composición del Equipo (2+2+2 del mismo año)</CardTitle>
                        <CardDescription>2 de cada ciclo (DAW, DAM, ASIR), todos del mismo curso (1º o 2º) para igualdad de condiciones.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {teamMembers.map((member, i) => (
                                <div key={i} className={`flex items-center gap-4 p-4 rounded-lg border ${member.status === 'empty' ? 'border-dashed bg-slate-50 opacity-60' : 'bg-white shadow-sm'}`}>
                                    <Avatar>
                                        <AvatarFallback>{member.role.split(' ')[1][0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-medium truncate">{member.name}</p>
                                        <p className="text-xs text-muted-foreground">{member.role}</p>
                                    </div>
                                    {member.status === 'filled' && (
                                        <Button variant="ghost" size="icon" title="Copiar Email">
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* GitHub Submission */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Github className="h-5 w-5" /> Entrega de Repositorio
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input placeholder="https://github.com/..." disabled />
                            <Button disabled>Guardar</Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            El repositorio solo se puede vincular cuando el equipo esté completo (READY).
                        </p>
                    </CardContent>
                </Card>

                {/* Team Members Details Card (Replaces Tasks / Rubric) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Miembros del Equipo</CardTitle>
                        <CardDescription>Detalles de contacto y nivel de los miembros del equipo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {teamMembers.map((member, i) => (
                                <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900">
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                {member.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{member.name}</p>
                                            <p className="text-sm text-muted-foreground">{member.cycle}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Mail className="h-3 w-3 text-muted-foreground" />
                                                <p className="text-xs text-muted-foreground">{member.email}</p>
                                                {member.status === 'filled' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-6 px-2 text-xs"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(member.email)
                                                            alert('Email copiado al portapapeles')
                                                        }}
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {member.status === 'filled' && (
                                        <Badge variant={member.level === 'Senior' ? 'default' : 'secondary'}>
                                            {member.level}
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
