"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { registerStudent, getTutors } from "@/lib/auth"
import { toast } from "sonner"

export default function RegisterPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [tutors, setTutors] = useState<any[]>([])
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        cycle: "",
        tutorId: "",
        password: "",
        confirmPassword: ""
    })

    useEffect(() => {
        loadTutors()
    }, [])

    async function loadTutors() {
        try {
            const data = await getTutors()
            setTutors(data)
        } catch (error) {
            console.error('Error loading tutors:', error)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        // Validar Email
        const isAdminEmail = formData.email === 'carloscastanosblanco@gmail.com'
        const isConselleria = formData.email.endsWith('@alu.edu.gva.es')

        if (!isAdminEmail && !isConselleria) {
            toast.error('Debes usar tu correo corporativo de alumno (@alu.edu.gva.es)')
            return
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Las contraseñas no coinciden')
            return
        }

        if (!formData.tutorId) {
            toast.error('Debes seleccionar un tutor')
            return
        }

        setLoading(true)

        const result = await registerStudent({
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            cycle: formData.cycle,
            tutorId: formData.tutorId
        })

        setLoading(false)

        if (result.success) {
            toast.success('Registro exitoso! Tu tutor debe aprobar tu cuenta antes de que puedas iniciar sesión.')
            router.push('/login')
        } else {
            toast.error(result.error)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
            <div className="absolute top-4 left-4 md:top-8 md:left-8">
                <Link href="/">
                    <Button variant="ghost" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Volver
                    </Button>
                </Link>
            </div>

            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-secondary">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl font-bold">Registro de Estudiante</CardTitle>
                    <CardDescription>
                        Crea tu cuenta para participar en la Hackathon.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullname">Nombre Completo</Label>
                            <Input
                                id="fullname"
                                placeholder="Ej. Ana García"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Corporativo</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="usuario@alu.edu.gva.es"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cycle">Ciclo Formativo</Label>
                            <select
                                id="cycle"
                                className="w-full p-2 border rounded-md bg-white dark:bg-slate-950"
                                value={formData.cycle}
                                onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}
                                required
                            >
                                <option value="">Selecciona tu curso</option>
                                <option value="1º DAW">1º DAW</option>
                                <option value="2º DAW">2º DAW</option>
                                <option value="1º DAM">1º DAM</option>
                                <option value="2º DAM">2º DAM</option>
                                <option value="1º ASIR">1º ASIR</option>
                                <option value="2º ASIR">2º ASIR</option>
                            </select>
                            <p className="text-xs text-muted-foreground">
                                Tu nivel (Junior/Senior) se asignará automáticamente
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tutor">Tutor/a</Label>
                            <select
                                id="tutor"
                                className="w-full p-2 border rounded-md bg-white dark:bg-slate-950"
                                value={formData.tutorId}
                                onChange={(e) => setFormData({ ...formData, tutorId: e.target.value })}
                                required
                            >
                                <option value="">Selecciona tu tutor/a</option>
                                {tutors.map((tutor) => (
                                    <option key={tutor.id} value={tutor.id}>
                                        {tutor.full_name} {tutor.tutor_group ? `(${tutor.tutor_group})` : ''}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-muted-foreground">
                                Selecciona el profesor/a tutor de tu grupo
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            type="submit"
                            className="w-full text-white font-semibold bg-secondary hover:bg-secondary/90"
                            size="lg"
                            disabled={loading}
                        >
                            {loading ? 'Registrando...' : 'Registrarse'}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                            ¿Ya tienes cuenta? <Link href="/login" className="text-primary hover:underline">Inicia Sesión</Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
