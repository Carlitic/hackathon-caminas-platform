"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft } from "lucide-react"
import { registerTeacher } from "@/lib/auth"

export default function RegisterTeacherPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        isTutor: false,
        tutorGroup: "",
        subjects: [] as string[]
    })

    const availableSubjects = [
        "Desarrollo Web",
        "Bases de Datos",
        "Programación",
        "Sistemas Informáticos",
        "Redes",
        "Seguridad Informática",
        "Desarrollo Móvil",
        "Lenguajes de Marcas"
    ]

    function toggleSubject(subject: string) {
        setFormData(prev => ({
            ...prev,
            subjects: prev.subjects.includes(subject)
                ? prev.subjects.filter(s => s !== subject)
                : [...prev.subjects, subject]
        }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        // Validate Conselleria email
        if (!formData.email.endsWith('@edu.gva.es')) {
            alert('Debes usar tu correo corporativo de profesor (@edu.gva.es)')
            return
        }

        if (formData.password !== formData.confirmPassword) {
            alert('Las contraseñas no coinciden')
            return
        }

        if (formData.subjects.length === 0) {
            alert('Debes seleccionar al menos una asignatura')
            return
        }

        if (formData.isTutor && !formData.tutorGroup) {
            alert('Si eres tutor, debes especificar tu grupo')
            return
        }

        setLoading(true)

        const result = await registerTeacher({
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            isTutor: formData.isTutor,
            tutorGroup: formData.isTutor ? formData.tutorGroup : undefined,
            subjects: formData.subjects
        })

        setLoading(false)

        if (result.success) {
            if (formData.isTutor) {
                alert('Registro exitoso! Un administrador debe aprobar tu solicitud de tutor antes de que puedas gestionar alumnos.')
            } else {
                alert('Registro exitoso! Ya puedes iniciar sesión.')
            }
            router.push('/login')
        } else {
            alert(`Error: ${result.error}`)
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

            <Card className="w-full max-w-2xl shadow-xl border-t-4 border-t-primary">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl font-bold">Registro de Profesor</CardTitle>
                    <CardDescription>
                        Crea tu cuenta como profesor/tutor de la Hackathon.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullname">Nombre Completo</Label>
                                <Input
                                    id="fullname"
                                    placeholder="Ej. Juan Martínez"
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
                                    placeholder="profesor@edu.gva.es"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Solo correos @edu.gva.es
                                </p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
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
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is-tutor"
                                    checked={formData.isTutor}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isTutor: checked as boolean })}
                                />
                                <Label htmlFor="is-tutor" className="cursor-pointer">
                                    Soy tutor de un grupo
                                </Label>
                            </div>
                        </div>

                        {formData.isTutor && (
                            <div className="space-y-2">
                                <Label htmlFor="tutor-group">Grupo del que eres tutor</Label>
                                <select
                                    id="tutor-group"
                                    className="w-full p-2 border rounded-md bg-white dark:bg-slate-950"
                                    value={formData.tutorGroup}
                                    onChange={(e) => setFormData({ ...formData, tutorGroup: e.target.value })}
                                    required={formData.isTutor}
                                >
                                    <option value="">Selecciona tu grupo</option>
                                    <option value="1º DAW">1º DAW</option>
                                    <option value="2º DAW">2º DAW</option>
                                    <option value="1º DAM">1º DAM</option>
                                    <option value="2º DAM">2º DAM</option>
                                    <option value="1º ASIR">1º ASIR</option>
                                    <option value="2º ASIR">2º ASIR</option>
                                </select>
                                <p className="text-xs text-muted-foreground">
                                    Solo podrás aprobar alumnos de este grupo
                                </p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Asignaturas que impartes</Label>
                            <div className="grid md:grid-cols-2 gap-2">
                                {availableSubjects.map((subject) => (
                                    <div key={subject} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={subject}
                                            checked={formData.subjects.includes(subject)}
                                            onCheckedChange={() => toggleSubject(subject)}
                                        />
                                        <Label htmlFor={subject} className="cursor-pointer text-sm">
                                            {subject}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Solo podrás crear requisitos de estas asignaturas
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            type="submit"
                            className="w-full font-semibold"
                            size="lg"
                            disabled={loading}
                        >
                            {loading ? 'Registrando...' : 'Registrarse como Profesor'}
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
