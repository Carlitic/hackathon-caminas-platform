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
import { Users, Github, Mail, AlertCircle, Copy, LifeBuoy } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"

export default function StudentTeamPage() {
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)
    const [team, setTeam] = useState<any>(null)
    const [teachers, setTeachers] = useState<any[]>([])

    // Team structure requirements
    const requiredRoles = ['1º DAW', '1º DAW', '1º DAM', '1º DAM', '1º ASIR', '1º ASIR']

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        try {
            const userProfile = await getCurrentUserProfile()
            if (!userProfile) return // middleware handles redirect

            setProfile(userProfile)

            const teamData = await getMyTeam(userProfile.id)
            setTeam(teamData)

            const teachersData = await getAvailableTeachers()
            setTeachers(teachersData)

        } catch (error) {
            console.error(error)
            toast.error("Error al cargar datos")
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="flex h-screen items-center justify-center">Cargando...</div>

    // Helper to build the visual team slots
    const teamSlots = requiredRoles.map((role, index) => {
        // Try to find a member that fits this slot (and hasn't been used yet)
        // ideally logic should be robust, for now we map sequentially or by strict cycle match
        // A simple approach: Filter members by cycle, take the n-th one.
        const cycle = role // e.g., "1º DAW"
        const membersInCycle = team?.members?.filter((m: any) => m.cycle === cycle) || []

        // We need to distribute them. 
        // If index is 0 or 1, it's DAW. 0 -> first DAW, 1 -> second DAW.
        // If index is 2 or 3, it's DAM.
        // If index is 4 or 5, it's ASIR.

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
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="destructive" className="gap-2">
                                <LifeBuoy className="h-4 w-4" />
                                Solicitar Ayuda (Comodín)
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Solicitar Ayuda a un Profesor</DialogTitle>
                                <DialogDescription>
                                    Elige un profesor disponible para pedir ayuda con tu proyecto.
                                    Recuerda que solo tienes 3 comodines.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Selecciona un Profesor:</Label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {teachers.map((teacher: any) => (
                                            <Button
                                                key={teacher.id}
                                                variant="outline"
                                                className="justify-start text-left h-auto py-3"
                                                onClick={() => {
                                                    toast.success(`Ayuda solicitada a ${teacher.full_name}`)
                                                }}
                                            >
                                                <Users className="mr-2 h-4 w-4" />
                                                <div className="flex flex-col items-start">
                                                    <span>{teacher.full_name}</span>
                                                    <span className="text-xs text-muted-foreground">{teacher.subjects?.[0]}</span>
                                                </div>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </header>

            {/* Status Banner */}
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
                {/* Roster Card */}
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

                {/* GitHub Submission */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Github className="h-5 w-5" /> Entrega de Repositorio
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="https://github.com/..."
                                defaultValue={team?.github_url || ''}
                                disabled={!isTeamReady}
                            />
                            <Button disabled={!isTeamReady}>Guardar</Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            El repositorio solo se puede vincular cuando el equipo esté completo (READY).
                        </p>
                    </CardContent>
                </Card>

                {/* Members Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Miembros del Equipo</CardTitle>
                        <CardDescription>Detalles de contacto.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {team?.members?.map((member: any) => (
                                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900">
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                {member.full_name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{member.full_name}</p>
                                            <p className="text-sm text-muted-foreground">{member.cycle}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Mail className="h-3 w-3 text-muted-foreground" />
                                                <p className="text-xs text-muted-foreground">{member.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {!team?.members?.length && <p className="text-muted-foreground text-sm">No hay miembros aún.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
