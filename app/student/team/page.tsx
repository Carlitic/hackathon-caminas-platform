"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { getCurrentUserProfile } from "@/lib/auth"
import { getMyTeam, getAvailableTeachers } from "@/lib/student"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Github, Mail, AlertCircle, Copy, LifeBuoy, LogOut } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { getTeamWildcardsStatus, createSupportTicket } from "@/lib/wildcards"
import { Textarea } from "@/components/ui/textarea"

export default function StudentTeamPage() {
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)
    const [team, setTeam] = useState<any>(null)
    const [teachers, setTeachers] = useState<any[]>([])
    const [wildcardStatus, setWildcardStatus] = useState({ used: 0, remaining: 5, max: 5 })
    const [helpMessage, setHelpMessage] = useState("")
    const [helpDialogOpen, setHelpDialogOpen] = useState(false)

    // Requisitos de estructura del equipo
    const requiredRoles = ['1º DAW', '1º DAW', '1º DAM', '1º DAM', '1º ASIR', '1º ASIR']

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        try {
            const userProfile = await getCurrentUserProfile()
            if (!userProfile) return // El middleware maneja la redirección

            setProfile(userProfile)

            const teamData = await getMyTeam(userProfile.id)
            setTeam(teamData)

            const teachersData = await getAvailableTeachers()
            setTeachers(teachersData)

            // Cargar estado del comodín si el equipo existe
            if (teamData?.id) {
                const wildcards = await getTeamWildcardsStatus(teamData.id)
                setWildcardStatus(wildcards)
            }

        } catch (error) {
            console.error(error)
            toast.error("Error al cargar datos")
        } finally {
            setLoading(false)
        }
    }

    async function handleRequestHelp() {
        if (!team?.id) {
            toast.error("No tienes equipo asignado")
            return
        }

        if (!helpMessage.trim()) {
            toast.error("Escribe un mensaje describiendo tu problema")
            return
        }

        try {
            const result = await createSupportTicket(team.id, helpMessage)
            toast.success(`Ticket creado! Comodines restantes: ${result.remaining}/${wildcardStatus.max}`)
            setHelpMessage("")
            setHelpDialogOpen(false)

            // Recargar estado del comodín
            const wildcards = await getTeamWildcardsStatus(team.id)
            setWildcardStatus(wildcards)
        } catch (error: any) {
            toast.error(error.message || "Error al crear ticket")
        }
    }

    if (loading) return <div className="flex h-screen items-center justify-center">Cargando...</div>

    // Función auxiliar para construir los espacios visuales del equipo
    const teamSlots = requiredRoles.map((role, index) => {
        const cycle = role
        const membersInCycle = team?.members?.filter((m: any) => m.cycle === cycle) || []

        let member = null
        if (role.includes("DAW")) member = membersInCycle[index % 2]
        if (role.includes("DAM")) member = membersInCycle[index % 2]
        if (role.includes("ASIR")) member = membersInCycle[index % 2]

        if (member) {
            return { ...member, status: 'filled', roleSpec: role }
        } else {
            return { name: "Vacante", role: role, status: 'empty', roleSpec: role }
        }
    })

    const isTeamReady = team?.status === 'READY'
    const teamName = team?.name || "Sin Equipo"

    return (
        <div className="container mx-auto p-6 space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mi Equipo</h1>
                    <p className="text-muted-foreground">Gestiona tu equipo y entregas para la Hackathon.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={async () => {
                        const { supabase } = await import("@/lib/supabase");
                        await supabase.auth.signOut();
                        window.location.href = "/login"
                    }}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Salir
                    </Button>

                    <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="destructive"
                                className="gap-2"
                                disabled={wildcardStatus.remaining === 0 || !team}
                            >
                                <LifeBuoy className="h-4 w-4" />
                                Solicitar Ayuda ({wildcardStatus.remaining}/{wildcardStatus.max})
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Solicitar Ayuda (Comodín)</DialogTitle>
                                <DialogDescription>
                                    Describe tu problema y un profesor te ayudará. Comodines disponibles hoy: <strong>{wildcardStatus.remaining}/{wildcardStatus.max}</strong>
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="help-message">Describe tu problema:</Label>
                                    <Textarea
                                        id="help-message"
                                        className="min-h-[100px]"
                                        placeholder="Ej: No podemos conectar con la API de..."
                                        value={helpMessage}
                                        onChange={(e) => setHelpMessage(e.target.value)}
                                    />
                                </div>
                                <Button
                                    onClick={handleRequestHelp}
                                    disabled={wildcardStatus.remaining === 0 || !helpMessage.trim()}
                                >
                                    Enviar Solicitud
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </header>

            {/* Banner de Estado */}
            <div className={`border-l-4 p-4 rounded ${isTeamReady ? 'bg-green-100 border-green-500 dark:bg-green-900/30' : 'bg-yellow-100 border-yellow-500 dark:bg-yellow-900/30'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className={`font-bold ${isTeamReady ? 'text-green-700 dark:text-green-500' : 'text-yellow-700 dark:text-yellow-500'}`}>
                            Estado: {team ? team.status : 'SIN ASIGNAR'}
                        </p>
                        <p className={`text-sm ${isTeamReady ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                            {isTeamReady
                                ? 'Tu equipo está completo y listo para competir.'
                                : 'Tu equipo aún no está completo o no has sido asignado a uno.'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Tarjeta de Lista */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Composición del Equipo: {teamName}</CardTitle>
                        <CardDescription>2 de cada ciclo (DAW, DAM, ASIR), todos del mismo curso para igualdad de condiciones.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {teamSlots.map((member, i) => (
                                <div key={i} className={`flex items-center gap-4 p-4 rounded-lg border ${member.status === 'empty' ? 'border-dashed bg-slate-50 opacity-60' : 'bg-white shadow-sm'}`}>
                                    <Avatar>
                                        <AvatarFallback>{member.roleSpec.split(' ')[1][0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-medium truncate">{member.full_name || member.name}</p>
                                        <p className="text-xs text-muted-foreground">{member.roleSpec}</p>
                                    </div>
                                    {member.status === 'filled' && (
                                        <Button variant="ghost" size="icon" title="Copiar Email" onClick={() => {
                                            navigator.clipboard.writeText(member.email)
                                            toast.success("Email copiado")
                                        }}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Tarjeta URL de GitHub */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Github className="h-5 w-5" />
                            Repositorio del Proyecto
                        </CardTitle>
                        <CardDescription>Enlace público de GitHub donde está alojado tu código.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Input
                                placeholder="https://github.com/..."
                                defaultValue={team?.github_url || ""}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full">Guardar URL</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
