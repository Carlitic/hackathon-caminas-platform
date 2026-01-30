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
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function AdminDashboard() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [pendingTutors, setPendingTutors] = useState<any[]>([])
    const [approvedTutors, setApprovedTutors] = useState<any[]>([])
    const [eventConfig, setEventConfig] = useState<any>(null)
    const [teams, setTeams] = useState<any[]>([])

    // Dialog States
    const [actionToConfirm, setActionToConfirm] = useState<{
        type: 'deny' | 'revoke' | 'phase',
        data: any,
        title: string,
        description: string
    } | null>(null)

    useEffect(() => {
        checkAuth()
        loadData()
    }, [])

    async function checkAuth() {
        alert("DEBUG: Admin checkAuth executing...")
        const profile = await getCurrentUserProfile()
        if (!profile || profile.role !== 'admin') {
            alert("DEBUG: Admin check failed. Profile: " + JSON.stringify(profile))
            // router.push('/login') // Disable redirect for debug
        }
    }

    async function loadData() {
        setLoading(true)
        try {
            const pending = await getPendingTutors()
            const approved = await getApprovedTutors()
            const config = await getEventConfig()
            const allTeams = await getAllTeamsWithStats()

            setPendingTutors(pending)
            setApprovedTutors(approved)
            setEventConfig(config)
            setTeams(allTeams)
        } catch (error) {
            console.error('Error loading admin data:', error)
            toast.error('Error al cargar datos')
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
            toast.error(`Error: ${error.message}`)
        }
    }

    function confirmDenyTutor(tutorId: string) {
        setActionToConfirm({
            type: 'deny',
            data: tutorId,
            title: '¿Denegar solicitud?',
            description: '¿Estás seguro de denegar esta solicitud de tutor? Esta acción no se puede deshacer.'
        })
    }

    function confirmRevokeTutor(tutorId: string) {
        setActionToConfirm({
            type: 'revoke',
            data: tutorId,
            title: '¿Revocar aprobación?',
            description: '¿Estás seguro de revocar la aprobación de este tutor? Dejará de tener acceso al dashboard de profesor.'
        })
    }

    function confirmPhaseChange(phase: string) {
        setActionToConfirm({
            type: 'phase',
            data: phase,
            title: '¿Cambiar fase del evento?',
            description: `¿Estás seguro de cambiar la fase del evento a "${phase}"? Esto afectará a lo que pueden hacer los usuarios.`
        })
    }

    async function executeConfirmedAction() {
        if (!actionToConfirm) return

        try {
            if (actionToConfirm.type === 'deny') {
                await denyTutor(actionToConfirm.data)
                toast.success('Solicitud denegada')
            } else if (actionToConfirm.type === 'revoke') {
                await revokeTutorApproval(actionToConfirm.data)
                toast.success('Aprobación revocada')
            } else if (actionToConfirm.type === 'phase') {
                await updateEventPhase(actionToConfirm.data)
                toast.success(`Fase actualizada a ${actionToConfirm.data}`)
            }
            loadData()
        } catch (error: any) {
            toast.error(`Error: ${error.message}`)
        } finally {
            setActionToConfirm(null)
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
            <AlertDialog open={!!actionToConfirm} onOpenChange={(open) => !open && setActionToConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{actionToConfirm?.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {actionToConfirm?.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={executeConfirmedAction}>Continuar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

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
                                                <div className="flex flex-wrap gap-2 justify-end">
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
                                                        onClick={() => confirmDenyTutor(tutor.id)}
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
                                                        onClick={() => confirmRevokeTutor(tutor.id)}
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
                                        onClick={() => confirmPhaseChange('inicio')}
                                        variant={eventConfig?.phase === 'inicio' ? 'default' : 'outline'}
                                    >
                                        Inicio
                                    </Button>
                                    <Button
                                        onClick={() => confirmPhaseChange('desarrollo')}
                                        variant={eventConfig?.phase === 'desarrollo' ? 'default' : 'outline'}
                                    >
                                        Desarrollo
                                    </Button>
                                    <Button
                                        onClick={() => confirmPhaseChange('votacion')}
                                        variant={eventConfig?.phase === 'votacion' ? 'default' : 'outline'}
                                    >
                                        Votación
                                    </Button>
                                    <Button
                                        onClick={() => confirmPhaseChange('finalizado')}
                                        variant={eventConfig?.phase === 'finalizado' ? 'default' : 'outline'}
                                    >
                                        Finalizado
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Teams Tab */}
                    <TabsContent value="teams" className="space-y-8">
                        {/* JUNIORS SECTION (1º) */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Badge variant="secondary" className="text-base px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Juniors</Badge>
                                Equipos de 1º Curso
                            </h2>
                            <div className="grid gap-4">
                                {teams.filter(t => t.year === 1).length === 0 ? (
                                    <p className="text-muted-foreground italic">No hay equipos Junior registrados.</p>
                                ) : (
                                    teams.filter(t => t.year === 1).map((team) => (
                                        <Card key={team.id}>
                                            <CardContent className="p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="font-semibold text-lg">{team.name}</h3>
                                                    <div className="flex gap-2">
                                                        <Badge variant={team.status === 'READY' ? 'default' : 'secondary'}>
                                                            {team.status === 'READY' ? 'LISTO' : 'PENDIENTE'}
                                                        </Badge>
                                                        <Badge variant="outline">{team.votes} votos</Badge>
                                                    </div>
                                                </div>

                                                {team.members && team.members.length > 0 ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                        {team.members.map((member: any) => (
                                                            <div key={member.id} className="text-sm bg-slate-100 dark:bg-slate-900 p-2 rounded flex items-center gap-2">
                                                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                                    {member.full_name.charAt(0)}
                                                                </div>
                                                                <div className="overflow-hidden">
                                                                    <p className="font-medium truncate">{member.full_name}</p>
                                                                    <p className="text-xs text-muted-foreground">{member.cycle}</p>
                                                                </div>
                                                                {member.is_leader && (
                                                                    <Badge variant="secondary" className="text-[10px] h-4 ml-auto">Líder</Badge>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground italic">
                                                        Miembros: 0/6 (Sin alumnos asignados)
                                                    </p>
                                                )}

                                                {team.github_url && (
                                                    <p className="text-xs text-muted-foreground mt-4 pt-2 border-t">
                                                        GitHub: {team.github_url}
                                                    </p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* SENIORS SECTION (2º) */}
                        <div className="space-y-4 pt-4 border-t">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Badge variant="secondary" className="text-base px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">Seniors</Badge>
                                Equipos de 2º Curso
                            </h2>
                            <div className="grid gap-4">
                                {teams.filter(t => t.year === 2).length === 0 ? (
                                    <p className="text-muted-foreground italic">No hay equipos Senior registrados.</p>
                                ) : (
                                    teams.filter(t => t.year === 2).map((team) => (
                                        <Card key={team.id}>
                                            <CardContent className="p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="font-semibold text-lg">{team.name}</h3>
                                                    <div className="flex gap-2">
                                                        <Badge variant={team.status === 'READY' ? 'default' : 'secondary'}>
                                                            {team.status === 'READY' ? 'LISTO' : 'PENDIENTE'}
                                                        </Badge>
                                                        <Badge variant="outline">{team.votes} votos</Badge>
                                                    </div>
                                                </div>

                                                {team.members && team.members.length > 0 ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                        {team.members.map((member: any) => (
                                                            <div key={member.id} className="text-sm bg-slate-100 dark:bg-slate-900 p-2 rounded flex items-center gap-2">
                                                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                                    {member.full_name.charAt(0)}
                                                                </div>
                                                                <div className="overflow-hidden">
                                                                    <p className="font-medium truncate">{member.full_name}</p>
                                                                    <p className="text-xs text-muted-foreground">{member.cycle}</p>
                                                                </div>
                                                                {member.is_leader && (
                                                                    <Badge variant="secondary" className="text-[10px] h-4 ml-auto">Líder</Badge>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground italic">
                                                        Miembros: 0/6 (Sin alumnos asignados)
                                                    </p>
                                                )}

                                                {team.github_url && (
                                                    <p className="text-xs text-muted-foreground mt-4 pt-2 border-t">
                                                        GitHub: {team.github_url}
                                                    </p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
