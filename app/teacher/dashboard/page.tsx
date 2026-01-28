"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Users, CheckCircle, XCircle, GripVertical, ThumbsUp } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function TeacherDashboard() {
    // Mock Teams with vote counts
    const [teams, setTeams] = useState([
        { id: 1, name: "Equipo 1", status: "READY", votes: 3 },
        { id: 2, name: "Equipo 2", status: "PENDING", votes: 0 },
        { id: 3, name: "Equipo 3", status: "READY", votes: 5 },
        { id: 4, name: "Equipo 4", status: "READY", votes: 2 },
    ])

    // Track if teacher has voted and which team
    const [hasVoted, setHasVoted] = useState(false)
    const [votedTeamId, setVotedTeamId] = useState<number | null>(null)

    // Edit modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingStudent, setEditingStudent] = useState<any>(null)

    // Delete confirmation state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [studentToDelete, setStudentToDelete] = useState<number | null>(null)

    // Mock Students (approved) - now with state for CRUD operations
    const [myStudents, setMyStudents] = useState([
        { id: 1, name: "Carlos Castaños", cycle: "1º DAW", email: "carlos@alu.edu.gva.es", team: "Equipo 1", status: "READY" },
        { id: 2, name: "Ana García", cycle: "2º DAW", email: "ana@alu.edu.gva.es", team: "Equipo 2", status: "PENDING" },
        { id: 3, name: "Juan Pérez", cycle: "1º DAW", email: "juan@alu.edu.gva.es", team: "Equipo 1", status: "READY" },
        { id: 4, name: "María López", cycle: "2º DAW", email: "maria@alu.edu.gva.es", team: null, status: "SIN_EQUIPO" },
        { id: 5, name: "Pedro Sánchez", cycle: "1º DAW", email: "pedro@alu.edu.gva.es", team: "Equipo 3", status: "READY" },
    ])

    // Mock Pending Students (waiting approval)
    const [pendingStudents, setPendingStudents] = useState([
        { id: 1, name: "Laura Martínez", cycle: "1º DAW", email: "laura@alu.edu.gva.es", registeredAt: "Hace 2 horas" },
        { id: 2, name: "Diego Ruiz", cycle: "2º DAW", email: "diego@alu.edu.gva.es", registeredAt: "Hace 5 horas" },
        { id: 3, name: "Sofia Torres", cycle: "1º DAW", email: "sofia@alu.edu.gva.es", registeredAt: "Hace 1 día" },
    ])

    const handleApprove = (studentId: number) => {
        setPendingStudents(prev => prev.filter(s => s.id !== studentId))
        // In real app: API call to approve student
    }

    const handleDeny = (studentId: number) => {
        setPendingStudents(prev => prev.filter(s => s.id !== studentId))
        // In real app: API call to deny student
    }

    const handleVote = (teamId: number) => {
        if (hasVoted) return // Prevent multiple votes

        setTeams(prev => prev.map(team =>
            team.id === teamId
                ? { ...team, votes: team.votes + 1 }
                : team
        ))
        setHasVoted(true)
        setVotedTeamId(teamId)
        // In real app: API call to register vote (anonymous)
    }

    const handleDeleteStudent = (studentId: number) => {
        setStudentToDelete(studentId)
        setIsDeleteDialogOpen(true)
    }

    const confirmDeleteStudent = () => {
        if (studentToDelete !== null) {
            setMyStudents(prev => prev.filter(s => s.id !== studentToDelete))
            setIsDeleteDialogOpen(false)
            setStudentToDelete(null)
            // In real app: API call to delete student
        }
    }

    const handleEditStudent = (studentId: number) => {
        const student = myStudents.find(s => s.id === studentId)
        if (student) {
            setEditingStudent({ ...student })
            setIsEditModalOpen(true)
        }
    }

    const handleSaveStudent = () => {
        if (editingStudent) {
            setMyStudents(prev => prev.map(s =>
                s.id === editingStudent.id ? editingStudent : s
            ))
            setIsEditModalOpen(false)
            setEditingStudent(null)
            // In real app: API call to update student
        }
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Panel del Profesor</h1>
                    <p className="text-muted-foreground">Vota por los mejores proyectos y gestiona tus alumnos.</p>
                </div>
                {pendingStudents.length > 0 && (
                    <Badge variant="destructive" className="text-sm px-3 py-1">
                        {pendingStudents.length} solicitud(es) pendiente(s)
                    </Badge>
                )}
            </header>

            <Tabs defaultValue="evaluation" className="w-full">
                <TabsList className="grid w-full grid-cols-4 max-w-2xl">
                    <TabsTrigger value="evaluation">Votación</TabsTrigger>
                    <TabsTrigger value="students">Mis Alumnos</TabsTrigger>
                    <TabsTrigger value="pending" className="relative">
                        Solicitudes
                        {pendingStudents.length > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">
                                {pendingStudents.length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="builder">Formar Equipos</TabsTrigger>
                </TabsList>

                {/* Voting Tab */}
                <TabsContent value="evaluation" className="space-y-6">
                    <div>
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold mb-2">Vota por el Mejor Proyecto</h2>
                            <p className="text-sm text-muted-foreground">
                                Puedes votar <strong>una sola vez</strong> por el equipo que consideres ganador. Los votos son anónimos.
                            </p>
                            {hasVoted && (
                                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        <strong>Ya has votado.</strong> Tu voto ha sido registrado de forma anónima.
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {teams.map((team) => {
                                const isVotedTeam = votedTeamId === team.id
                                return (
                                    <Card key={team.id} className={`border-t-4 shadow-md ${isVotedTeam ? 'border-t-green-500 bg-green-50 dark:bg-green-900/10' : 'border-t-blue-500'}`}>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">
                                                {team.name}
                                            </CardTitle>
                                            {team.status === 'READY' ? (
                                                <Badge variant="default" className="bg-green-600">READY</Badge>
                                            ) : (
                                                <Badge variant="secondary">PENDING</Badge>
                                            )}
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-center py-4">
                                                <div className="flex items-center justify-center gap-2 mb-2">
                                                    <ThumbsUp className={`h-6 w-6 ${isVotedTeam ? 'text-green-600' : 'text-muted-foreground'}`} />
                                                    <span className="text-3xl font-bold">{team.votes}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {team.votes === 1 ? 'voto' : 'votos'}
                                                </p>
                                            </div>
                                            {isVotedTeam && (
                                                <div className="flex items-center justify-center gap-1 text-xs text-green-600 dark:text-green-500">
                                                    <CheckCircle className="h-3 w-3" />
                                                    <span>Tu voto</span>
                                                </div>
                                            )}
                                        </CardContent>
                                        <CardFooter>
                                            <Button
                                                className="w-full"
                                                variant={isVotedTeam ? "default" : "outline"}
                                                disabled={team.status !== 'READY' || hasVoted}
                                                onClick={() => handleVote(team.id)}
                                            >
                                                {isVotedTeam ? "✓ Votado" : hasVoted ? "Ya votaste" : "Votar"}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                </TabsContent>

                {/* Students Tab */}
                <TabsContent value="students" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Alumnos a mi Cargo como Tutor
                            </CardTitle>
                            <CardDescription>
                                Lista de estudiantes de DAW asignados a tu tutoría (aprobados)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {myStudents.map((student) => (
                                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900">
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                    {student.name.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{student.name}</p>
                                                <p className="text-sm text-muted-foreground">{student.cycle}</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Mail className="h-3 w-3 text-muted-foreground" />
                                                    <p className="text-xs text-muted-foreground">{student.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col items-end gap-2">
                                                {student.team ? (
                                                    <>
                                                        <Badge variant="outline" className="text-xs">
                                                            {student.team}
                                                        </Badge>
                                                        <Badge
                                                            variant={student.status === 'READY' ? 'default' : 'secondary'}
                                                            className={student.status === 'READY' ? 'bg-green-600 text-xs' : 'text-xs'}
                                                        >
                                                            {student.status}
                                                        </Badge>
                                                    </>
                                                ) : (
                                                    <Badge variant="destructive" className="text-xs">
                                                        SIN EQUIPO
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEditStudent(student.id)}
                                                    title="Editar alumno"
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDeleteStudent(student.id)}
                                                    title="Eliminar alumno"
                                                >
                                                    Eliminar
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary Stats */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Alumnos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{myStudents.length}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">En Equipos READY</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-green-600">
                                    {myStudents.filter(s => s.status === 'READY').length}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Sin Equipo</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-red-600">
                                    {myStudents.filter(s => s.status === 'SIN_EQUIPO').length}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Pending Students Tab */}
                <TabsContent value="pending" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-yellow-600" />
                                Solicitudes de Registro Pendientes
                            </CardTitle>
                            <CardDescription>
                                Aprueba o deniega el acceso de nuevos alumnos a la plataforma
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pendingStudents.length > 0 ? (
                                <div className="space-y-3">
                                    {pendingStudents.map((student) => (
                                        <div key={student.id} className="flex items-center justify-between p-4 border-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <Avatar>
                                                    <AvatarFallback className="bg-yellow-100 text-yellow-700 font-semibold">
                                                        {student.name.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">{student.name}</p>
                                                    <p className="text-sm text-muted-foreground">{student.cycle}</p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <Mail className="h-3 w-3 text-muted-foreground" />
                                                        <p className="text-xs text-muted-foreground">{student.email}</p>
                                                    </div>
                                                    <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                                                        Registrado: {student.registeredAt}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    className="bg-green-600 hover:bg-green-700 gap-1"
                                                    onClick={() => handleApprove(student.id)}
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                    Aprobar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="gap-1"
                                                    onClick={() => handleDeny(student.id)}
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                    Denegar
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                                    <p className="text-lg font-semibold">¡Todo al día!</p>
                                    <p className="text-sm text-muted-foreground">No hay solicitudes de registro pendientes.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Team Builder Tab */}
                <TabsContent value="builder" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GripVertical className="h-5 w-5" />
                                Constructor de Equipos (Drag & Drop)
                            </CardTitle>
                            <CardDescription>
                                Arrastra alumnos para formar equipos de 2+2+2 (DAW + DAM + ASIR)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center">
                                <GripVertical className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <p className="text-lg font-semibold mb-2">Interfaz de Drag & Drop</p>
                                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                    Esta funcionalidad permite arrastrar y soltar alumnos para formar equipos visualmente.
                                    Se implementará con una librería de drag-and-drop como <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">dnd-kit</code>.
                                </p>
                                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <p className="text-xs text-blue-600 dark:text-blue-400">
                                        💡 <strong>Próximamente:</strong> Podrás arrastrar alumnos desde un pool lateral hacia slots de equipos organizados por ciclo (1º/2º DAW, DAM, ASIR).
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Student Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Editar Alumno</DialogTitle>
                        <DialogDescription>
                            Modifica los datos del alumno. Los cambios se guardarán al hacer clic en "Guardar cambios".
                        </DialogDescription>
                    </DialogHeader>
                    {editingStudent && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Nombre Completo</Label>
                                <Input
                                    id="edit-name"
                                    value={editingStudent.name}
                                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-email">Correo Electrónico</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editingStudent.email}
                                    onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-cycle">Ciclo</Label>
                                <select
                                    id="edit-cycle"
                                    value={editingStudent.cycle}
                                    onChange={(e) => setEditingStudent({ ...editingStudent, cycle: e.target.value })}
                                    className="w-full p-2 border rounded-md bg-white dark:bg-slate-950"
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
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveStudent}>
                            Guardar cambios
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. El alumno será eliminado permanentemente de tu lista.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteStudent} className="bg-red-600 hover:bg-red-700">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
