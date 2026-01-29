"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, Trophy } from "lucide-react"
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
    const [reqForm, setReqForm] = useState({ title: "", description: "" })

    // Voting State
    const [myVote, setMyVote] = useState<number | null>(null)
    const [votingOpen, setVotingOpen] = useState(true)

    useEffect(() => {
        // Mock Profile for Non-Tutor Teacher
        const mockProfile = {
            id: 'mock-id-2',
            full_name: 'Prof. Ana Martínez',
            email: 'ana.martinez@edu.gva.es',
            role: 'teacher',
            tutor_group: null,
            is_tutor: false,
            subjects: ['Bases de Datos']
        }
        setProfile(mockProfile)

        // Mock Initial Requirements
        setRequirements([
            { id: 1, title: "Script SQL Normalizado", desc: "El proyecto debe incluir el script de creación de la BBDD con al menos 3 tablas relacionadas.", tag: "Bases de Datos" },
            { id: 2, title: "Diagrama E-R", desc: "Se debe entregar el diagrama entidad-relación en formato PDF.", tag: "Bases de Datos" }
        ])
    }, [])

    function handleCreateRequirement() {
        if (!reqForm.title || !reqForm.description) {
            toast.error("Rellena todos los campos")
            return
        }

        const newReq = {
            id: Date.now(),
            title: reqForm.title,
            desc: reqForm.description,
            tag: profile.subjects[0] || "General"
        }

        setRequirements([...requirements, newReq])
        setReqDialog(false)
        setReqForm({ title: "", description: "" })
        toast.success("Requisito creado correctamente")
    }

    async function executeConfirmedAction() {
        if (!actionToConfirm) return

        try {
            if (actionToConfirm.type === 'vote') {
                // Mock vote submission
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
                        <Button onClick={handleCreateRequirement}>Crear Requisito</Button>
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
