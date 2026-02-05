"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, Trophy } from "lucide-react"
import { getCurrentUserProfile, logout } from "@/lib/auth"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getRequirements, createRequirement, updateRequirement, deleteRequirement, castVote, getMyVote, getTeams } from "@/lib/teacher"
import { Edit, Trash2 } from "lucide-react"

export default function GeneralTeacherDashboard() {
    const router = useRouter()
    const [profile, setProfile] = useState<any>(null)
    const [actionToConfirm, setActionToConfirm] = useState<{
        type: 'vote',
        data: any,
        title: string,
        description: string
    } | null>(null)

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
    const [teams, setTeams] = useState<any[]>([])

    // Voting State
    const [myVote, setMyVote] = useState<number | null>(null)
    const [votingOpen, setVotingOpen] = useState(true)

    useEffect(() => {
        checkAuth()
        async function loadTeams() {
            try {
                const t = await getTeams(undefined) // Get all teams
                setTeams(t)
            } catch (e) { }
        }
        loadTeams()
    }, [])

    async function checkAuth() {
        const userProfile = await getCurrentUserProfile()
        if (!userProfile || userProfile.role !== 'teacher') {
            router.push('/login')
            return
        }

        if (userProfile.is_tutor) {
            router.push('/teacher/dashboard')
            return
        }

        setProfile(userProfile)
        try {
            const reqs = await getRequirements(userProfile.id)
            setRequirements(reqs || [])
            const savedVote = await getMyVote()
            setMyVote(savedVote)
        } catch (e) { console.error(e) }
    }

    async function handleSaveRequirement() {
        if (!reqForm.title || !reqForm.description) {
            toast.error("Rellena todos los campos")
            return
        }

        try {
            const reqData = {
                title: reqForm.title,
                description: reqForm.description,
                tag: profile.subjects[0] || "General",
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

    async function executeConfirmedAction() {
        if (!actionToConfirm) return

        try {
            if (actionToConfirm.type === 'vote') {
                await castVote(actionToConfirm.data)
                setMyVote(actionToConfirm.data)
                toast.success(`Voto registrado para el Equipo ${actionToConfirm.data}`)
            }
        } catch (error: any) {
            toast.error(`Error: ${error.message}`)
        } finally {
            setActionToConfirm(null)
        }
    }

    if (!profile) return null

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            <Dialog open={reqDialog} onOpenChange={setReqDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nuevo Requisito</DialogTitle>
                        <DialogDescription>Define un nuevo requisito para tu asignatura.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título</Label>
                            <Input
                                id="title"
                                placeholder="Ej: Diagrama de Clases"
                                value={reqForm.title}
                                onChange={(e) => setReqForm({ ...reqForm, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="desc">Descripción</Label>
                            <Input
                                id="desc"
                                placeholder="Detalles de lo que se debe entregar..."
                                value={reqForm.description}
                                onChange={(e) => setReqForm({ ...reqForm, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReqDialog(false)}>Cancelar</Button>
                        <Button onClick={handleSaveRequirement}>Crear Requisito</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
                        <h1 className="text-3xl font-bold tracking-tight">Panel de Profesor</h1>
                        <p className="text-muted-foreground">
                            {profile.full_name} - {profile.subjects?.join(', ')}
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
                                    {requirements.map((req) => (
                                        <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                                    {teams.map((team) => {
                                        const teamNum = team.id
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
