"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, CheckCircle, XCircle, Settings, Trophy, Plus, LifeBuoy } from "lucide-react"
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
