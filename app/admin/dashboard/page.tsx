"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, CheckCircle, XCircle, Settings, Trophy } from "lucide-react"
import { getCurrentUserProfile } from "@/lib/auth"
import {
    getPendingTutors,
    getApprovedTutors,
    approveTutor,
    denyTutor,
    revokeTutorApproval,
    getEventConfig,
    updateEventPhase,
    getAllTeamsWithStats
} from "@/lib/admin"

export default function AdminDashboard() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [pendingTutors, setPendingTutors] = useState<any[]>([])
    const [approvedTutors, setApprovedTutors] = useState<any[]>([])
    const [eventConfig, setEventConfig] = useState<any>(null)
    const [teams, setTeams] = useState<any[]>([])

    useEffect(() => {
        checkAuth()
        loadData()
    }, [])

    async function checkAuth() {
        const profile = await getCurrentUserProfile()
        if (!profile || profile.role !== 'admin') {
            router.push('/login')
        }
    }

    async function loadData() {
        try {
            const [pending, approved, config, teamsData] = await Promise.all([
                getPendingTutors(),
                getApprovedTutors(),
                getEventConfig(),
                getAllTeamsWithStats()
            ])

            setPendingTutors(pending)
            setApprovedTutors(approved)
            setEventConfig(config)
            setTeams(teamsData)
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleApproveTutor(tutorId: string) {
        try {
            await approveTutor(tutorId)
            alert('Tutor aprobado exitosamente')
            loadData()
        } catch (error: any) {
            alert(`Error: ${error.message}`)
        }
    }

    async function handleDenyTutor(tutorId: string) {
        if (!confirm('¿Estás seguro de denegar esta solicitud de tutor?')) return

        try {
            await denyTutor(tutorId)
            alert('Solicitud denegada')
            loadData()
        } catch (error: any) {
            alert(`Error: ${error.message}`)
        }
    }

    async function handleRevokeTutor(tutorId: string) {
        if (!confirm('¿Estás seguro de revocar la aprobación de este tutor?')) return

        try {
            await revokeTutorApproval(tutorId)
            alert('Aprobación revocada')
            loadData()
        } catch (error: any) {
            alert(`Error: ${error.message}`)
        }
    }

    async function handlePhaseChange(phase: string) {
        if (!confirm(`¿Cambiar la fase del evento a "${phase}"?`)) return

        try {
            await updateEventPhase(phase)
            alert('Fase actualizada')
            loadData()
        } catch (error: any) {
            alert(`Error: ${error.message}`)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>Cargando...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Panel de Administración</h1>
                        <p className="text-muted-foreground">Gestión de tutores y evento</p>
                    </div>
                    <Button variant="outline" onClick={() => router.push('/')}>
                        Volver al Inicio
                    </Button>
                </div>

                <Tabs defaultValue="tutors" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="tutors">
                            <Users className="h-4 w-4 mr-2" />
                            Tutores
                        </TabsTrigger>
                        <TabsTrigger value="event">
                            <Settings className="h-4 w-4 mr-2" />
                            Evento
                        </TabsTrigger>
                        <TabsTrigger value="teams">
                            <Trophy className="h-4 w-4 mr-2" />
                            Equipos
                        </TabsTrigger>
                    </TabsList>

                    {/* Tutors Tab */}
                    <TabsContent value="tutors" className="space-y-4">
                        {/* Pending Tutors */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Solicitudes Pendientes ({pendingTutors.length})</CardTitle>
                                <CardDescription>
                                    Profesores que solicitan ser tutores de un grupo
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {pendingTutors.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">
                                        No hay solicitudes pendientes
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingTutors.map((tutor) => (
                                            <div key={tutor.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div>
                                                    <p className="font-semibold">{tutor.full_name}</p>
                                                    <p className="text-sm text-muted-foreground">{tutor.email}</p>
                                                    <Badge className="mt-2">{tutor.tutor_group}</Badge>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Asignaturas: {tutor.subjects?.join(', ')}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleApproveTutor(tutor.id)}
                                                        className="gap-2"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                        Aprobar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDenyTutor(tutor.id)}
                                                        className="gap-2"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                        Denegar
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Approved Tutors */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Tutores Aprobados ({approvedTutors.length})</CardTitle>
                                <CardDescription>
                                    Tutores activos que pueden gestionar alumnos
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {approvedTutors.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">
                                        No hay tutores aprobados
                                    </p>
                                ) : (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {approvedTutors.map((tutor) => (
                                            <div key={tutor.id} className="p-4 border rounded-lg">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-semibold">{tutor.full_name}</p>
                                                        <p className="text-sm text-muted-foreground">{tutor.email}</p>
                                                        <Badge className="mt-2" variant="default">{tutor.tutor_group}</Badge>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleRevokeTutor(tutor.id)}
                                                    >
                                                        Revocar
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Event Tab */}
                    <TabsContent value="event">
                        <Card>
                            <CardHeader>
                                <CardTitle>Gestión del Evento</CardTitle>
                                <CardDescription>
                                    Controla las fases de la Hackathon
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium mb-2">Fase Actual:</p>
                                    <Badge variant="default" className="text-lg px-4 py-2">
                                        {eventConfig?.phase || 'inicio'}
                                    </Badge>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4 mt-6">
                                    <Button
                                        onClick={() => handlePhaseChange('inicio')}
                                        variant={eventConfig?.phase === 'inicio' ? 'default' : 'outline'}
                                    >
                                        Inicio
                                    </Button>
                                    <Button
                                        onClick={() => handlePhaseChange('desarrollo')}
                                        variant={eventConfig?.phase === 'desarrollo' ? 'default' : 'outline'}
                                    >
                                        Desarrollo
                                    </Button>
                                    <Button
                                        onClick={() => handlePhaseChange('votacion')}
                                        variant={eventConfig?.phase === 'votacion' ? 'default' : 'outline'}
                                    >
                                        Votación
                                    </Button>
                                    <Button
                                        onClick={() => handlePhaseChange('finalizado')}
                                        variant={eventConfig?.phase === 'finalizado' ? 'default' : 'outline'}
                                    >
                                        Finalizado
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Teams Tab */}
                    <TabsContent value="teams">
                        <Card>
                            <CardHeader>
                                <CardTitle>Equipos ({teams.length})</CardTitle>
                                <CardDescription>
                                    Vista general de todos los equipos
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {teams.map((team) => (
                                        <div key={team.id} className="p-4 border rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-semibold">{team.name}</h3>
                                                <div className="flex gap-2">
                                                    <Badge variant={team.status === 'READY' ? 'default' : 'secondary'}>
                                                        {team.status}
                                                    </Badge>
                                                    <Badge variant="outline">{team.votes} votos</Badge>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Miembros: {team.members?.length || 0}/6
                                            </p>
                                            {team.github_url && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    GitHub: {team.github_url}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
