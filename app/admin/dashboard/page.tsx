"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, CheckCircle, XCircle, Settings, Trophy, Plus, LifeBuoy, LogOut, Shield } from "lucide-react"
import { getCurrentUserProfile } from "@/lib/auth"
import {
    getPendingTutors,
    getApprovedTutors,
    approveTutor,
    denyTutor,
    revokeTutorApproval,
    getEventConfig,
    updateEventPhase,
    getAllTeamsWithStats,
    createTeamAsAdmin
} from "@/lib/admin"
import { getSupportTickets, resolveSupportTicket } from "@/lib/wildcards"
import { invalidateAllSessions, invalidateSessionsByRole, getJWTInfo } from "@/lib/session"
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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function AdminDashboard() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [pendingTutors, setPendingTutors] = useState<any[]>([])
    const [approvedTutors, setApprovedTutors] = useState<any[]>([])
    const [eventConfig, setEventConfig] = useState<any>(null)
    const [teams, setTeams] = useState<any[]>([])
    const [supportTickets, setSupportTickets] = useState<any[]>([])

    // Dialog States
    const [actionToConfirm, setActionToConfirm] = useState<{
        type: 'deny' | 'revoke' | 'phase',
        data: any,
        title: string,
        description: string
    } | null>(null)

    const [createTeamDialog, setCreateTeamDialog] = useState(false)
    const [selectedYear, setSelectedYear] = useState<string>('1')

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
        setLoading(true)
        try {
            const pending = await getPendingTutors()
            const approved = await getApprovedTutors()
            const config = await getEventConfig()
            const allTeams = await getAllTeamsWithStats()
            const tickets = await getSupportTickets()

            setPendingTutors(pending)
            setApprovedTutors(approved)
            setEventConfig(config)
            setTeams(allTeams)
            setSupportTickets(tickets)
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
            await loadData()
            toast.success('Tutor aprobado')
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    async function handleDenyTutor(tutorId: string) {
        try {
            await denyTutor(tutorId)
            await loadData()
            toast.success('Solicitud denegada')
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    async function handleRevokeTutor(tutorId: string) {
        try {
            await revokeTutorApproval(tutorId)
            await loadData()
            toast.success('Aprobación revocada')
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    async function handlePhaseChange(newPhase: string) {
        try {
            await updateEventPhase(newPhase)
            await loadData()
            toast.success(`Fase cambiada a: ${newPhase}`)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    async function handleCreateTeam() {
        try {
            await createTeamAsAdmin(selectedYear)
            toast.success('Equipo creado exitosamente')
            setCreateTeamDialog(false)
            loadData()
        } catch (error: any) {
            toast.error(error.message || 'Error al crear equipo')
        }
    }

    // Session Management Functions
    async function handleInvalidateAllSessions() {
        try {
            await invalidateAllSessions()
            toast.success('Todas las sesiones han sido invalidadas. Los usuarios deberán hacer login de nuevo.')
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    async function handleInvalidateStudentSessions() {
        try {
            await invalidateSessionsByRole('student')
            toast.success('Sesiones de estudiantes invalidadas')
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    async function handleInvalidateTeacherSessions() {
        try {
            await invalidateSessionsByRole('teacher')
            toast.success('Sesiones de profesores invalidadas')
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    if (loading) return <div className="flex h-screen items-center justify-center">Cargando...</div>

    return (
        <div className="container mx-auto p-6 space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
                    <p className="text-muted-foreground">Gestiona tutores, equipos y el evento</p>
                </div>
                <Button variant="outline" onClick={async () => {
                    const { supabase } = await import("@/lib/supabase");
                    await supabase.auth.signOut();
                    router.push('/login')
                }}>
                    Cerrar Sesión
                </Button>
            </header>

            <div className="space-y-6">
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
                        <TabsTrigger value="support">
                            <LifeBuoy className="h-4 w-4 mr-2" />
                            Soporte ({supportTickets.filter(t => !t.resolved).length})
                        </TabsTrigger>
                        <TabsTrigger value="sessions">
                            <Shield className="h-4 w-4 mr-2" />
                            Sesiones JWT
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
                                    <div className="space-y-3">
                                        {pendingTutors.map((tutor) => (
                                            <div key={tutor.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div>
                                                    <p className="font-medium">{tutor.full_name}</p>
                                                    <p className="text-sm text-muted-foreground">{tutor.email}</p>
                                                    <Badge className="mt-1">{tutor.tutor_group}</Badge>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" onClick={() => handleApproveTutor(tutor.id)}>
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Aprobar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => setActionToConfirm({
                                                            type: 'deny',
                                                            data: tutor.id,
                                                            title: '¿Denegar solicitud?',
                                                            description: `¿Estás seguro de denegar la solicitud de ${tutor.full_name}?`
                                                        })}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-2" />
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
                                    Tutores activos en el sistema
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {approvedTutors.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">
                                        No hay tutores aprobados
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {approvedTutors.map((tutor) => (
                                            <div key={tutor.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div>
                                                    <p className="font-medium">{tutor.full_name}</p>
                                                    <p className="text-sm text-muted-foreground">{tutor.email}</p>
                                                    <Badge className="mt-1">{tutor.tutor_group}</Badge>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setActionToConfirm({
                                                        type: 'revoke',
                                                        data: tutor.id,
                                                        title: '¿Revocar aprobación?',
                                                        description: `¿Estás seguro de revocar la aprobación de ${tutor.full_name}?`
                                                    })}
                                                >
                                                    Revocar
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Event Tab */}
                    <TabsContent value="event" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Control de Fases del Evento</CardTitle>
                                <CardDescription>
                                    Gestiona la fase actual de la Hackathon
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium mb-2">Fase Actual:</p>
                                        <Badge className="text-lg py-2 px-4">
                                            {eventConfig?.phase?.toUpperCase() || 'INICIO'}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['inicio', 'desarrollo', 'votacion', 'finalizado'].map((phase) => (
                                            <Button
                                                key={phase}
                                                variant={eventConfig?.phase === phase ? 'default' : 'outline'}
                                                onClick={() => setActionToConfirm({
                                                    type: 'phase',
                                                    data: phase,
                                                    title: `¿Cambiar a fase ${phase}?`,
                                                    description: 'Esta acción afectará a todos los usuarios del sistema.'
                                                })}
                                            >
                                                {phase.charAt(0).toUpperCase() + phase.slice(1)}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Teams Tab */}
                    <TabsContent value="teams" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Equipos ({teams.length})</CardTitle>
                                        <CardDescription>
                                            Vista general de todos los equipos
                                        </CardDescription>
                                    </div>
                                    <Button onClick={() => setCreateTeamDialog(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Crear Equipo
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {teams.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">
                                        No hay equipos creados
                                    </p>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {teams.map((team) => (
                                            <Card key={team.id}>
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="text-lg">{team.name}</CardTitle>
                                                        <Badge variant={team.status === 'READY' ? 'default' : 'secondary'}>
                                                            {team.status}
                                                        </Badge>
                                                    </div>
                                                    <CardDescription>
                                                        Año {team.year_level} • {team.members_count || 0}/6 miembros
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    {team.github_url && (
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            GitHub: {team.github_url}
                                                        </p>
                                                    )}
                                                    <p className="text-sm mt-2">
                                                        Votos: {team.votes || 0}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Support Tickets Tab */}
                    <TabsContent value="support" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tickets de Soporte</CardTitle>
                                <CardDescription>
                                    Solicitudes de ayuda de los equipos (5 comodines por equipo/día)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {supportTickets.filter(t => !t.resolved).length === 0 ? (
                                        <p className="text-center text-muted-foreground py-8">
                                            No hay tickets pendientes
                                        </p>
                                    ) : (
                                        supportTickets.filter(t => !t.resolved).map(ticket => (
                                            <div key={ticket.id} className="border rounded-lg p-4">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Badge>{ticket.team?.name || 'Equipo'}</Badge>
                                                            <span className="text-sm text-muted-foreground">
                                                                {ticket.creator?.full_name || 'Estudiante'}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm mb-2">{ticket.message}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(ticket.created_at).toLocaleString('es-ES')}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={async () => {
                                                            try {
                                                                await resolveSupportTicket(ticket.id)
                                                                await loadData()
                                                                toast.success("Ticket resuelto")
                                                            } catch (error) {
                                                                toast.error("Error al resolver ticket")
                                                            }
                                                        }}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Resolver
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Sessions Tab */}
                    <TabsContent value="sessions" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Gestión de Sesiones JWT</CardTitle>
                                <CardDescription>
                                    Controla las sesiones de usuarios. Puedes invalidar sesiones para forzar que los usuarios vuelvan a hacer login.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* JWT Info */}
                                <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Shield className="h-4 w-4" />
                                        Información JWT
                                    </h3>
                                    <div className="text-sm space-y-1 text-muted-foreground">
                                        <p>• <strong>Proveedor:</strong> Supabase Auth</p>
                                        <p>• <strong>Tipo:</strong> JWT (JSON Web Token)</p>
                                        <p>• <strong>Almacenamiento:</strong> HTTP-only cookies (seguro)</p>
                                        <p>• <strong>Expiración por defecto:</strong> 1 hora (3600s)</p>
                                        <p>• <strong>Recomendado para Hackathon:</strong> 8 horas (28800s)</p>
                                    </div>
                                    <div className="pt-2 border-t">
                                        <p className="text-sm">
                                            <strong>Configurar expiración:</strong> Supabase Dashboard → Authentication → Settings → JWT Settings
                                        </p>
                                    </div>
                                </div>

                                {/* Session Controls */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Invalidar Sesiones</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Al invalidar sesiones, los usuarios deberán volver a iniciar sesión con sus credenciales.
                                        Útil cuando haces cambios importantes o por seguridad.
                                    </p>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        {/* Invalidate All */}
                                        <Card className="border-destructive/50">
                                            <CardHeader>
                                                <CardTitle className="text-base">Todas las Sesiones</CardTitle>
                                                <CardDescription>
                                                    Invalida sesiones de todos los usuarios (estudiantes, profesores y admins)
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" className="w-full">
                                                            <LogOut className="h-4 w-4 mr-2" />
                                                            Invalidar Todas
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esto cerrará la sesión de TODOS los usuarios (incluido tú).
                                                                Todos deberán hacer login de nuevo.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={handleInvalidateAllSessions}>
                                                                Confirmar
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </CardContent>
                                        </Card>

                                        {/* Invalidate Students */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">Sesiones de Estudiantes</CardTitle>
                                                <CardDescription>
                                                    Invalida solo las sesiones de los estudiantes
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="outline" className="w-full">
                                                            <LogOut className="h-4 w-4 mr-2" />
                                                            Invalidar Estudiantes
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Invalidar sesiones de estudiantes</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Todos los estudiantes deberán hacer login de nuevo.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={handleInvalidateStudentSessions}>
                                                                Confirmar
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </CardContent>
                                        </Card>

                                        {/* Invalidate Teachers */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">Sesiones de Profesores</CardTitle>
                                                <CardDescription>
                                                    Invalida solo las sesiones de los profesores
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="outline" className="w-full">
                                                            <LogOut className="h-4 w-4 mr-2" />
                                                            Invalidar Profesores
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Invalidar sesiones de profesores</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Todos los profesores deberán hacer login de nuevo.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={handleInvalidateTeacherSessions}>
                                                                Confirmar
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                {/* Warning */}
                                <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
                                    <h4 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2">
                                        ⚠️ Recomendaciones
                                    </h4>
                                    <ul className="text-sm space-y-1 text-yellow-700 dark:text-yellow-300">
                                        <li>• <strong>Durante el Hackathon:</strong> NO invalidar sesiones (puede interrumpir el trabajo)</li>
                                        <li>• <strong>Configurar expiración larga:</strong> 8-12 horas para el evento</li>
                                        <li>• <strong>Usar solo en emergencias:</strong> Problemas de seguridad o cambios críticos</li>
                                        <li>• <strong>Después del evento:</strong> Invalidar todas las sesiones y limpiar la BD</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={!!actionToConfirm} onOpenChange={() => setActionToConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{actionToConfirm?.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {actionToConfirm?.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            if (actionToConfirm?.type === 'deny') handleDenyTutor(actionToConfirm.data)
                            if (actionToConfirm?.type === 'revoke') handleRevokeTutor(actionToConfirm.data)
                            if (actionToConfirm?.type === 'phase') handlePhaseChange(actionToConfirm.data)
                            setActionToConfirm(null)
                        }}>
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Create Team Dialog */}
            <Dialog open={createTeamDialog} onOpenChange={setCreateTeamDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Crear Nuevo Equipo</DialogTitle>
                        <DialogDescription>
                            Selecciona el año para el nuevo equipo
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="year">Año del Equipo</Label>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un año" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1º Año</SelectItem>
                                    <SelectItem value="2">2º Año</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateTeamDialog(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleCreateTeam}>
                            Crear Equipo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}
