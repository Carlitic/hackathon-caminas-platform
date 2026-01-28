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

    useEffect(() => {
        checkAuth()
    }, [])

    async function checkAuth() {
        const userProfile = await getCurrentUserProfile()
        if (!userProfile || userProfile.role !== 'teacher') {
            router.push('/login')
            return
        }

        // Check if tutor is approved
        if (userProfile.is_tutor && !userProfile.tutor_approved) {
            alert('Tu solicitud de tutor está pendiente de aprobación por el administrador.')
            router.push('/')
            return
        }

        setProfile(userProfile)
        loadData(userProfile)
    }

    async function loadData(userProfile: any) {
        try {
            setLoading(true)

            if (userProfile.is_tutor) {
                const [pending, students, teamsData, available] = await Promise.all([
                    getPendingStudents(userProfile.id),
                    getMyStudents(userProfile.id),
                    getTeams(),
                    getStudentsWithoutTeam(userProfile.tutor_group)
                ])

                setPendingStudents(pending)
                setMyStudents(students)
                setTeams(teamsData)
                setAvailableStudents(available)
            }
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
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

    async function handleEdit() {
        try {
            await updateStudent(editingStudent.id, editForm)
            alert('Alumno actualizado')
            setEditDialog(false)
            loadData(profile)
        } catch (error: any) {
            alert(`Error: ${error.message}`)
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
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>Acceso Restringido</CardTitle>
                        <CardDescription>
                            Solo los tutores tienen acceso a este dashboard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push('/')}>
                            Volver al Inicio
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
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
                                                            {team.status}
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
