"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Users,
    CheckCircle,
    XCircle,
    UserPlus,
    Trash2,
    Edit,
    GripVertical,
    Trophy
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { getCurrentUserProfile, logout } from "@/lib/auth"
import {
    getPendingStudents,
    getMyStudents,
    approveStudent,
    denyStudent,
    deleteStudent,
    updateStudent,
    getTeams,
    getStudentsWithoutTeam,
    addStudentToTeam,
    removeStudentFromTeam,
    createTeam,
    getRequirements,
    createRequirement,
    updateRequirement,
    deleteRequirement,
    castVote,
    getMyVote
} from "@/lib/teacher"
import { getTeamCompositionSummary, validateTeamComposition } from "@/lib/wildcards"
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

export default function TeacherDashboard() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)
    const [pendingStudents, setPendingStudents] = useState<any[]>([])
    const [myStudents, setMyStudents] = useState<any[]>([])
    const [teams, setTeams] = useState<any[]>([])
    const [teamCompositions, setTeamCompositions] = useState<Record<string, any>>({})
    const [availableStudents, setAvailableStudents] = useState<any[]>([])

    // Voting State
    const [myVote, setMyVote] = useState<number | null>(null)
    const [votingOpen, setVotingOpen] = useState(true)

    // Edit dialog state
    const [editDialog, setEditDialog] = useState(false)
    const [editingStudent, setEditingStudent] = useState<any>(null)
    const [editForm, setEditForm] = useState({ full_name: "", email: "", cycle: "" })

    // Confirmation Dialog State
    const [actionToConfirm, setActionToConfirm] = useState<{
        type: 'deny' | 'delete' | 'remove_from_team' | 'vote',
        data: any,
        title: string,
        description: string
    } | null>(null)

    // Requirements State
    const [requirements, setRequirements] = useState<any[]>([])
    const [reqDialog, setReqDialog] = useState(false)
    const [editingReq, setEditingReq] = useState<any>(null)
    const [reqForm, setReqForm] = useState({
        title: "",
        description: "",
        target_cycles: [] as string[],
        for_all_students: true,
        target_students: [] as string[]
    })

    async function handleSaveRequirement() {
        if (!reqForm.title || !reqForm.description) {
            toast.error("Rellena todos los campos")
            return
        }

        try {
            const reqData = {
                title: reqForm.title,
                description: reqForm.description,
                tag: profile?.subjects?.[0] || "General",
                target_cycles: reqForm.target_cycles,
                target_students: reqForm.target_students,
                for_all_students: reqForm.for_all_students
            }

            if (editingReq) {
                await updateRequirement(editingReq.id, reqData)
                toast.success("Requisito actualizado")
            } else {
                await createRequirement(reqData)
                toast.success("Requisito creado correctamente")
            }

            const reqs = await getRequirements(profile.id)
            setRequirements(reqs)
            setReqDialog(false)
            setEditingReq(null)
            setReqForm({
                title: "",
                description: "",
                target_cycles: [],
                for_all_students: true,
                target_students: []
            })
        } catch (error: any) {
            toast.error("Error: " + error.message)
        }
    }

    function handleEditRequirement(req: any) {
        setEditingReq(req)
        setReqForm({
            title: req.title,
            description: req.description,
            target_cycles: req.target_cycles || [],
            for_all_students: req.for_all_students ?? true,
            target_students: req.target_students || []
        })
        setReqDialog(true)
    }

    function handleCloseReqDialog() {
        setReqDialog(false)
        setEditingReq(null)
        setReqForm({
            title: "",
            description: "",
            target_cycles: [],
            for_all_students: true,
            target_students: []
        })
    }

    useEffect(() => {
        checkAuth()
    }, [])

    async function checkAuth() {
        const userProfile = await getCurrentUserProfile()
        if (!userProfile || userProfile.role !== 'teacher') {
            router.push('/login')
            return
        }

        if (!userProfile.is_tutor) {
            router.push('/teacher/general')
            return
        }

        setProfile(userProfile)
        loadData(userProfile)
    }

    async function loadData(userProfile: any) {
        setLoading(true)
        try {
            const pending = await getPendingStudents(userProfile.id)
            const myStudentsData = await getMyStudents(userProfile.id)
            const teamsData = await getTeams(userProfile.tutor_group.charAt(0)) // Wait, getTeams in lib might not take args?
            const availableData = await getStudentsWithoutTeam(userProfile.tutor_group)

            setPendingStudents(pending)
            setMyStudents(myStudentsData)
            setTeams(teamsData)
            setAvailableStudents(availableData)

            // Load team compositions
            const compositions: Record<string, any> = {}
            for (const team of teamsData) {
                try {
                    const composition = await getTeamCompositionSummary(team.id)
                    compositions[team.id] = composition
                } catch (error) {
                    console.error(`Error loading composition for team ${team.id}:`, error)
                }
            }
            setTeamCompositions(compositions)

            const reqs = await getRequirements(userProfile.id)
            setRequirements(reqs)

            const savedVote = await getMyVote()
            setMyVote(savedVote)
        } catch (error) {
            console.error('Error loading teacher data:', error)
            toast.error('Error al cargar datos')
        } finally {
            setLoading(false)
        }
    }

    async function handleApprove(studentId: string) {
        try {
            await approveStudent(studentId)
            toast.success('Alumno aprobado exitosamente')
            loadData(profile)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    async function handleDeny(studentId: string) {
        try {
            await denyStudent(studentId)
            toast.success('Solicitud denegada')
            loadData(profile)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    function openEditDialog(student: any) {
        setEditingStudent(student)
        setEditForm({
            full_name: student.full_name,
            email: student.email,
            cycle: student.cycle
        })
        setEditDialog(true)
    }

    function confirmDelete(studentId: string, studentName: string) {
        setActionToConfirm({
            type: 'delete',
            data: studentId,
            title: '¿Eliminar alumno?',
            description: `¿Estás seguro de eliminar a ${studentName}? Esta acción no se puede deshacer.`
        })
    }

    async function executeConfirmedAction() {
        if (!actionToConfirm) return

        try {
            if (actionToConfirm.type === 'deny') {
                await denyStudent(actionToConfirm.data)
                toast.success('Solicitud denegada')
            } else if (actionToConfirm.type === 'delete') {
                await deleteStudent(actionToConfirm.data)
                toast.success('Alumno eliminado')
            } else if (actionToConfirm.type === 'vote') {
                await castVote(actionToConfirm.data)
                setMyVote(actionToConfirm.data)
                toast.success(`Voto registrado para el Equipo ${actionToConfirm.data}`)
            }
            loadData(profile)
        } catch (error: any) {
            toast.error(`Error: ${error.message}`)
        } finally {
            setActionToConfirm(null)
        }
    }



    async function handleEdit() {
        try {
            await updateStudent(editingStudent.id, editForm)
            toast.success('Alumno actualizado')
            setEditDialog(false)
            loadData(profile)
        } catch (error: any) {
            toast.error(`Error: ${error.message}`)
        }
    }

    async function handleDelete(studentId: string, studentName: string) {
        try {
            await deleteStudent(studentId)
            toast.success(`${studentName} eliminado`)
            loadData(profile)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    async function handleAddToTeam(studentId: string, teamId: string) {
        try {
            await addStudentToTeam(studentId, teamId)
            toast.success('Alumno añadido al equipo')
            loadData(profile)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    async function handleRemoveFromTeam(studentId: string) {
        try {
            await removeStudentFromTeam(studentId)
            toast.success('Alumno quitado del equipo')
            loadData(profile)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    async function handleCreateTeam() {
        const year = profile.tutor_group.charAt(0) // "1" or "2"
        try {
            await createTeam(year)
            toast.success('Equipo creado')
            loadData(profile)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>Cargando...</p>
            </div>
        )
    }

    if (!profile?.is_tutor) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Panel de Profesor</h1>
                            <p className="text-muted-foreground">
                                {profile?.full_name} - {profile?.subjects?.join(', ') || 'Departamento de Informática'}
                            </p>
                        </div>
                        <Button variant="outline" onClick={async () => { await logout(); window.location.href = "/login" }}>
                            Cerrar Sesión
                        </Button>
                    </div>

                    <Tabs defaultValue="requirements" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="requirements">Gestión de Requisitos</TabsTrigger>
                            <TabsTrigger value="voting">Votación de Proyectos</TabsTrigger>
                        </TabsList>

                        <TabsContent value="requirements" className="space-y-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Requisitos de la Asignatura</CardTitle>
                                        <CardDescription>Define los criterios que los alumnos deben cumplir para aprobar tu módulo.</CardDescription>
                                    </div>
                                    <Button onClick={() => setReqDialog(true)}>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Nuevo Requisito
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {requirements.length === 0 ? (
                                            <p className="text-muted-foreground text-center py-8">
                                                No hay requisitos creados aún
                                            </p>
                                        ) : (
                                            requirements.map((req) => (
                                                <div key={req.id} className="flex items-start justify-between p-4 border rounded-lg">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold">{req.title}</h4>
                                                        <p className="text-sm text-muted-foreground mt-1">{req.description}</p>
                                                        <div className="flex gap-2 mt-2 flex-wrap">
                                                            <Badge variant="outline">{req.tag}</Badge>
                                                            {req.target_cycles && req.target_cycles.length > 0 && (
                                                                req.target_cycles.map((cycle: string) => (
                                                                    <Badge key={cycle} variant="secondary">{cycle}</Badge>
                                                                ))
                                                            )}
                                                            {req.for_all_students ? (
                                                                <Badge variant="default" className="bg-blue-500">Todo el grupo</Badge>
                                                            ) : (
                                                                <Badge variant="default" className="bg-purple-500">
                                                                    {req.target_students?.length || 0} alumno(s)
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 ml-4">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleEditRequirement(req)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={async () => {
                                                                await deleteRequirement(req.id)
                                                                const reqs = await getRequirements(profile.id)
                                                                setRequirements(reqs)
                                                                toast.success('Requisito eliminado')
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="voting" className="space-y-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Evaluar Proyectos</CardTitle>
                                        <CardDescription>
                                            {votingOpen
                                                ? "La fase de votación está ABIERTA. Puedes cambiar tu voto."
                                                : "La fase de votación está CERRADA. Tu voto es definitivo."}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={votingOpen ? "default" : "destructive"}>
                                            {votingOpen ? "Votación Activa" : "Votación Finalizada"}
                                        </Badge>
                                        {/* SIMULATION TOGGLE */}
                                        <Button size="xs" variant="outline" onClick={() => setVotingOpen(!votingOpen)}>
                                            {votingOpen ? "Simular Cierre" : "Simular Apertura"}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {teams.length === 0 ? (
                                            <p className="text-muted-foreground col-span-3 text-center">No hay equipos registrados para votar.</p>
                                        ) : (
                                            teams.map((team) => {
                                                const teamNum = team.id // Assuming team has ID
                                                const isMyVote = myVote === teamNum
                                                return (
                                                    <Card key={teamNum} className={`transition-all ${isMyVote ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
                                                        <CardHeader>
                                                            <CardTitle className="text-lg flex justify-between items-center">
                                                                Equipo {teamNum}
                                                                {isMyVote && <Badge>Tu Voto</Badge>}
                                                            </CardTitle>
                                                            <CardDescription>Proyecto Hackathon</CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <Button
                                                                className="w-full"
                                                                variant={isMyVote ? "secondary" : "default"}
                                                                disabled={(!votingOpen && !isMyVote) || (votingOpen && isMyVote)}
                                                                onClick={() => {
                                                                    if (isMyVote) return
                                                                    setActionToConfirm({
                                                                        type: 'vote',
                                                                        data: teamNum,
                                                                        title: myVote ? '¿Cambiar Voto?' : 'Confirmar Voto',
                                                                        description: myVote
                                                                            ? `Vas a cambiar tu voto del Equipo ${myVote} al Equipo ${teamNum}. ¿Estás seguro?`
                                                                            : `Vas a votar al Equipo ${teamNum}. Podrás cambiarlo mientras la votación siga abierta.`
                                                                    })
                                                                }}
                                                            >
                                                                {isMyVote
                                                                    ? 'Votado'
                                                                    : (!votingOpen ? 'Votación Cerrada' : (myVote ? 'Cambiar Voto' : 'Votar por este equipo'))}
                                                            </Button>
                                                        </CardContent>
                                                    </Card>
                                                )
                                            })
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
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
                        <h1 className="text-3xl font-bold">Dashboard de Tutor</h1>
                        <p className="text-muted-foreground">
                            {profile.full_name} - {profile.tutor_group}
                        </p>
                    </div>
                    <Button variant="outline" onClick={async () => { await logout(); window.location.href = "/login" }}>
                        Cerrar Sesión
                    </Button>
                </div>

                <Tabs defaultValue="pending" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="pending">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Solicitudes ({pendingStudents.length})
                        </TabsTrigger>
                        <TabsTrigger value="students">
                            <Users className="h-4 w-4 mr-2" />
                            Mis Alumnos ({myStudents.length})
                        </TabsTrigger>
                        <TabsTrigger value="teams">
                            <Trophy className="h-4 w-4 mr-2" />
                            Formar Equipos
                        </TabsTrigger>
                        <TabsTrigger value="requirements">Requisitos</TabsTrigger>
                        <TabsTrigger value="voting">Votación</TabsTrigger>
                    </TabsList>

                    {/* Pending Students Tab */}
                    <TabsContent value="pending" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Solicitudes Pendientes</CardTitle>
                                <CardDescription>
                                    Alumnos de {profile.tutor_group} esperando tu aprobación
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {pendingStudents.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">
                                        No hay solicitudes pendientes
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingStudents.map((student) => (
                                            <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div>
                                                    <p className="font-semibold">{student.full_name}</p>
                                                    <p className="text-sm text-muted-foreground">{student.email}</p>
                                                    <Badge className="mt-2">{student.cycle}</Badge>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleApprove(student.id)}
                                                        className="gap-2"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                        Aprobar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDeny(student.id)}
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
                    </TabsContent>

                    {/* My Students Tab */}
                    <TabsContent value="students" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Mis Alumnos Aprobados</CardTitle>
                                <CardDescription>
                                    Gestiona los alumnos de {profile.tutor_group}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {myStudents.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">
                                        No tienes alumnos aprobados aún
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {myStudents.map((student) => (
                                            <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div>
                                                    <p className="font-semibold">{student.full_name}</p>
                                                    <p className="text-sm text-muted-foreground">{student.email}</p>
                                                    <div className="flex gap-2 mt-2">
                                                        <Badge>{student.cycle}</Badge>
                                                        {student.teams && (
                                                            <Badge variant="outline">{student.teams.name}</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openEditDialog(student)}
                                                        className="gap-2"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        Editar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDelete(student.id, student.full_name)}
                                                        className="gap-2"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Eliminar
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Teams Tab */}
                    <TabsContent value="teams" className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Available Students */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Alumnos Disponibles</CardTitle>
                                    <CardDescription>
                                        Alumnos de {profile.tutor_group} sin equipo
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {availableStudents.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-8">
                                            No hay alumnos disponibles
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {availableStudents.map((student) => (
                                                <div key={student.id} className="p-3 border rounded-lg flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium">{student.full_name}</p>
                                                        <p className="text-xs text-muted-foreground">{student.cycle}</p>
                                                    </div>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button size="sm" variant="ghost">Asignar</Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Asignar a Equipo</DialogTitle>
                                                                <DialogDescription>Elige un equipo para {student.full_name}</DialogDescription>
                                                            </DialogHeader>
                                                            <div className="grid gap-2">
                                                                {teams.map(team => (
                                                                    <Button key={team.id} variant="outline" onClick={() => handleAddToTeam(student.id, team.id)}>
                                                                        {team.name}
                                                                    </Button>
                                                                ))}
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Teams */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Equipos</CardTitle>
                                            <CardDescription>
                                                Arrastra alumnos a los equipos
                                            </CardDescription>
                                        </div>
                                        <Button size="sm" onClick={handleCreateTeam}>
                                            Crear Equipo
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        💡 Añade alumnos usando el botón "Asignar" en la lista de la izquierda.
                                    </p>
                                    {teams.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-8">
                                            No hay equipos creados
                                        </p>
                                    ) : (
                                        <div className="space-y-4">
                                            {teams.map((team) => (
                                                <div key={team.id} className="p-4 border rounded-lg">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="font-semibold">{team.name}</h3>
                                                        <Badge variant={team.status === 'READY' ? 'default' : 'secondary'}>
                                                            {team.status === 'READY' ? 'LISTO' : 'PENDIENTE'}
                                                        </Badge>
                                                    </div>
                                                    {teamCompositions[team.id] && (
                                                        <div className="flex gap-2 mb-2">
                                                            <Badge variant={teamCompositions[team.id].daw === 2 ? "default" : "destructive"}>
                                                                DAW: {teamCompositions[team.id].daw}/2
                                                            </Badge>
                                                            <Badge variant={teamCompositions[team.id].dam === 2 ? "default" : "destructive"}>
                                                                DAM: {teamCompositions[team.id].dam}/2
                                                            </Badge>
                                                            <Badge variant={teamCompositions[team.id].asir === 2 ? "default" : "destructive"}>
                                                                ASIR: {teamCompositions[team.id].asir}/2
                                                            </Badge>
                                                            <Badge variant="outline">
                                                                Total: {teamCompositions[team.id].total}/6
                                                            </Badge>
                                                        </div>
                                                    )}
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        Miembros: {team.members?.length || 0}/6
                                                    </p>
                                                    {team.members && team.members.length > 0 && (
                                                        <div className="space-y-1">
                                                            {team.members.map((member: any) => (
                                                                <div key={member.id} className="text-xs p-2 bg-slate-100 dark:bg-slate-800 rounded">
                                                                    {member.full_name} ({member.cycle})
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Requirements Tab */}
                <TabsContent value="requirements" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Requisitos de la Asignatura</CardTitle>
                                <CardDescription>Define los criterios que los alumnos deben cumplir.</CardDescription>
                            </div>
                            <Button onClick={() => setReqDialog(true)}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Nuevo Requisito
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {requirements.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">No hay requisitos creados aún</p>
                                ) : (
                                    requirements.map((req) => (
                                        <div key={req.id} className="flex items-start justify-between p-4 border rounded-lg">
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{req.title}</h4>
                                                <p className="text-sm text-muted-foreground mt-1">{req.description}</p>
                                                <div className="flex gap-2 mt-2 flex-wrap">
                                                    <Badge variant="outline">{req.tag}</Badge>
                                                    {req.target_cycles && req.target_cycles.length > 0 && req.target_cycles.map((cycle: string) => (
                                                        <Badge key={cycle} variant="secondary">{cycle}</Badge>
                                                    ))}
                                                    {req.for_all_students ? (
                                                        <Badge variant="default" className="bg-blue-500">Todo el grupo</Badge>
                                                    ) : (
                                                        <Badge variant="default" className="bg-purple-500">{req.target_students?.length || 0} alumno(s)</Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <Button size="sm" variant="ghost" onClick={() => handleEditRequirement(req)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={async () => {
                                                    await deleteRequirement(req.id)
                                                    const reqs = await getRequirements(profile.id)
                                                    setRequirements(reqs)
                                                    toast.success('Requisito eliminado')
                                                }}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Voting Tab */}
                <TabsContent value="voting" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Evaluar Proyectos</CardTitle>
                            <CardDescription>
                                {votingOpen ? "Votación abierta. Puedes cambiar tu voto." : "Votación cerrada."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {teams.length === 0 ? (
                                    <p className="text-muted-foreground col-span-3 text-center">No hay equipos para votar.</p>
                                ) : (
                                    teams.map((team) => {
                                        const isMyVote = myVote === team.id
                                        return (
                                            <Card key={team.id} className={isMyVote ? 'ring-2 ring-primary' : ''}>
                                                <CardHeader>
                                                    <CardTitle className="text-lg">{team.name}</CardTitle>
                                                    <CardDescription>{team.members?.length || 0}/6 miembros</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <Button className="w-full" variant={isMyVote ? "default" : "outline"} disabled={!votingOpen || isMyVote}
                                                        onClick={() => setActionToConfirm({
                                                            type: 'vote', data: team.id,
                                                            title: myVote ? 'Cambiar Voto' : 'Confirmar Voto',
                                                            description: myVote ? `Cambiar voto a ${team.name}?` : `Votar por ${team.name}?`
                                                        })}>
                                                        {isMyVote ? 'Votado' : (votingOpen ? 'Votar' : 'Cerrado')}
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        )
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Edit Dialog */}
                <Dialog open={editDialog} onOpenChange={setEditDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar Alumno</DialogTitle>
                            <DialogDescription>
                                Modifica los datos del alumno
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="edit-name">Nombre Completo</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.full_name}
                                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-cycle">Ciclo</Label>
                                <select
                                    id="edit-cycle"
                                    className="w-full p-2 border rounded-md"
                                    value={editForm.cycle}
                                    onChange={(e) => setEditForm({ ...editForm, cycle: e.target.value })}
                                >
                                    <option value="1º DAW">1º DAW</option>
                                    <option value="2º DAW">2º DAW</option>
                                    <option value="1º DAM">1º DAM</option>
                                    <option value="2º DAM">2º DAM</option>
                                    <option value="1º ASIR">1º ASIR</option>
                                    <option value="2º ASIR">2º ASIR</option>
                                </select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditDialog(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleEdit}>
                                Guardar Cambios
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                {/* Requirements Dialog */}
                <Dialog open={reqDialog} onOpenChange={handleCloseReqDialog}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingReq ? 'Editar Requisito' : 'Nuevo Requisito'}</DialogTitle>
                            <DialogDescription>
                                Define un requisito para tus alumnos. Puedes especificar para qué ciclos aplica.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="req-title">Título</Label>
                                <Input
                                    id="req-title"
                                    placeholder="Ej: Diagrama de Clases UML"
                                    value={reqForm.title}
                                    onChange={(e) => setReqForm({ ...reqForm, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="req-desc">Descripción</Label>
                                <textarea
                                    id="req-desc"
                                    className="w-full p-2 border rounded-md min-h-[80px]"
                                    placeholder="Detalles de lo que se debe entregar..."
                                    value={reqForm.description}
                                    onChange={(e) => setReqForm({ ...reqForm, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Ciclos Objetivo</Label>
                                <div className="flex gap-4">
                                    {['DAW', 'DAM', 'ASIR'].map(cycle => (
                                        <label key={cycle} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={reqForm.target_cycles.includes(cycle)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setReqForm({ ...reqForm, target_cycles: [...reqForm.target_cycles, cycle] })
                                                    } else {
                                                        setReqForm({ ...reqForm, target_cycles: reqForm.target_cycles.filter(c => c !== cycle) })
                                                    }
                                                }}
                                                className="h-4 w-4"
                                            />
                                            <span className="text-sm font-medium">{cycle}</span>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {reqForm.target_cycles.length === 0 ? 'Si no seleccionas ninguno, aplica para todos los ciclos' : `Aplica solo para: ${reqForm.target_cycles.join(', ')}`}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Destinatarios</Label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={reqForm.for_all_students}
                                            onChange={() => setReqForm({ ...reqForm, for_all_students: true, target_students: [] })}
                                            className="h-4 w-4"
                                        />
                                        <span className="text-sm">Todo el grupo</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={!reqForm.for_all_students}
                                            onChange={() => setReqForm({ ...reqForm, for_all_students: false })}
                                            className="h-4 w-4"
                                        />
                                        <span className="text-sm">Alumnos específicos</span>
                                    </label>
                                </div>

                                {!reqForm.for_all_students && (
                                    <div className="mt-2 p-3 border rounded-md bg-muted/50">
                                        <p className="text-xs text-muted-foreground mb-2">
                                            Selecciona los alumnos que deben completar este requisito:
                                        </p>
                                        <div className="max-h-40 overflow-y-auto space-y-1">
                                            {myStudents.map(student => (
                                                <label key={student.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-background rounded">
                                                    <input
                                                        type="checkbox"
                                                        checked={reqForm.target_students.includes(student.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setReqForm({ ...reqForm, target_students: [...reqForm.target_students, student.id] })
                                                            } else {
                                                                setReqForm({ ...reqForm, target_students: reqForm.target_students.filter(id => id !== student.id) })
                                                            }
                                                        }}
                                                        className="h-3 w-3"
                                                    />
                                                    <span className="text-xs">{student.full_name} - {student.cycle}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={handleCloseReqDialog}>Cancelar</Button>
                            <Button onClick={handleSaveRequirement}>
                                {editingReq ? 'Guardar Cambios' : 'Crear Requisito'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
