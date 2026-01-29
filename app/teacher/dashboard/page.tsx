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
} from "@/components/ui/dialog"
import { getCurrentUserProfile } from "@/lib/auth"
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
    createTeam
} from "@/lib/teacher"
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
    const [availableStudents, setAvailableStudents] = useState<any[]>([])

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
    const [requirements, setRequirements] = useState<any[]>([
        { id: 1, title: "Script SQL Normalizado", desc: "El proyecto debe incluir el script de creación de la BBDD con al menos 3 tablas relacionadas.", tag: "Bases de Datos" },
        { id: 2, title: "Diagrama E-R", desc: "Se debe entregar el diagrama entidad-relación en formato PDF.", tag: "Bases de Datos" }
    ])
    const [reqDialog, setReqDialog] = useState(false)
    const [reqForm, setReqForm] = useState({ title: "", description: "" })

    function handleCreateRequirement() {
        if (!reqForm.title || !reqForm.description) {
            toast.error("Rellena todos los campos")
            return
        }

        const newReq = {
            id: Date.now(),
            title: reqForm.title,
            desc: reqForm.description,
            tag: profile?.subjects?.[0] || "General"
        }

        setRequirements([...requirements, newReq])
        setReqDialog(false)
        setReqForm({ title: "", description: "" })
        toast.success("Requisito creado correctamente")
    }

    useEffect(() => {
        checkAuth()
    }, [])

    async function checkAuth() {
        // BYPASS AUTH FOR SCREENSHOTS
        // const userProfile = await getCurrentUserProfile()
        // if (!userProfile || userProfile.role !== 'teacher') {
        //     router.push('/login')
        //     return
        // }

        // Mock Profile
        const mockProfile = {
            id: 'mock-id',
            full_name: 'Prof. Juan Martínez',
            email: 'juan.martinez@edu.gva.es',
            role: 'teacher',
            tutor_group: '1º DAW',
            is_tutor: true,
            tutor_approved: false, // PENDING: Shows blocking screen
            subjects: ['Programación', 'Entornos de Desarrollo']
        }

        if (!mockProfile.is_tutor) {
            router.push('/teacher/general')
            return
        }

        setProfile(mockProfile)
        loadData(mockProfile)
    }

    async function loadData(userProfile: any) {
        setLoading(true)

        // MOCK DATA FOR SCREENSHOTS
        const mockPending = [
            { id: '1', full_name: 'David Gil', email: 'david@alu.edu.gva.es', cycle: '1º DAW' },
            { id: '2', full_name: 'Elena Rostova', email: 'elena@alu.edu.gva.es', cycle: '1º DAW' }
        ]

        const mockStudents = [
            { id: '3', full_name: 'Carlos Castaños', email: 'carlos@alu.edu.gva.es', cycle: '1º DAW', teams: { name: 'Equipo 1' } },
            { id: '4', full_name: 'Ana García', email: 'ana@alu.edu.gva.es', cycle: '1º DAW', teams: { name: 'Equipo 1' } }
        ]

        const mockTeams = [
            {
                id: 't1',
                name: 'Equipo 1',
                status: 'READY',
                members: [
                    { id: '3', full_name: 'Carlos Castaños', cycle: '1º DAW' },
                    { id: '4', full_name: 'Ana García', cycle: '1º DAW' },
                    { id: '5', full_name: 'Juan Pérez', cycle: '1º DAM' },
                    { id: '6', full_name: 'María López', cycle: '1º DAM' },
                    { id: '7', full_name: 'Pedro Sánchez', cycle: '1º ASIR' },
                    { id: '8', full_name: 'Laura Martín', cycle: '1º ASIR' }
                ]
            }
        ]

        const mockAvailable = []

        setPendingStudents(mockPending)
        setMyStudents(mockStudents)
        setTeams(mockTeams)
        setAvailableStudents(mockAvailable)
        setLoading(false)
    }

    async function handleApprove(studentId: string) {
        try {
            await approveStudent(studentId)
            alert('Alumno aprobado exitosamente')
            loadData(profile)
        } catch (error: any) {
            alert(`Error: ${error.message}`)
        }
    }

    async function handleDeny(studentId: string) {
        if (!confirm('¿Estás seguro de denegar esta solicitud?')) return

        try {
            await denyStudent(studentId)
            alert('Solicitud denegada')
            loadData(profile)
        } catch (error: any) {
            alert(`Error: ${error.message}`)
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
                // Mock vote submission
                setMyVote(actionToConfirm.data)
                toast.success(`Voto registrado para el Equipo ${actionToConfirm.data}`)
                // In real app, we would save this to DB and disable further voting
            }
            loadData(profile)
        } catch (error: any) {
            toast.error(`Error: ${error.message}`)
        } finally {
            setActionToConfirm(null)
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
        if (!confirm(`¿Estás seguro de eliminar a ${studentName}? Esta acción no se puede deshacer.`)) return

        try {
            await deleteStudent(studentId)
            alert('Alumno eliminado')
            loadData(profile)
        } catch (error: any) {
            alert(`Error: ${error.message}`)
        }
    }

    async function handleAddToTeam(studentId: string, teamId: string) {
        try {
            await addStudentToTeam(studentId, teamId)
            loadData(profile)
        } catch (error: any) {
            alert(`Error: ${error.message}`)
        }
    }

    async function handleRemoveFromTeam(studentId: string) {
        if (!confirm('¿Quitar este alumno del equipo?')) return

        try {
            await removeStudentFromTeam(studentId)
            loadData(profile)
        } catch (error: any) {
            alert(`Error: ${error.message}`)
        }
    }

    async function handleCreateTeam() {
        const year = profile.tutor_group.charAt(0) // "1" or "2"
        try {
            await createTeam(year)
            alert('Equipo creado')
            loadData(profile)
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
                        <Button variant="outline" onClick={() => router.push('/')}>
                            Volver al Inicio
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
                                        {requirements.map((req, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div>
                                                    <h4 className="font-semibold">{req.title}</h4>
                                                    <p className="text-sm text-muted-foreground">{req.desc}</p>
                                                </div>
                                                <Badge variant="outline">{req.tag}</Badge>
                                            </div>
                                        ))}
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
                                        {[1, 2, 3, 4, 5].map((teamNum) => {
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
                                        })}
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
                    <Button variant="outline" onClick={() => router.push('/')}>
                        Volver al Inicio
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
                                                <div key={student.id} className="p-3 border rounded-lg">
                                                    <p className="font-medium">{student.full_name}</p>
                                                    <p className="text-xs text-muted-foreground">{student.cycle}</p>
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
                                    <p className="text-sm text-amber-600 mb-4">
                                        ⚠️ Drag & drop próximamente. Por ahora usa el sistema manual.
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
            </div>
        </div>
    )
}
