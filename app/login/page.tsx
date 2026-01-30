"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { login } from "@/lib/auth"

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        const result = await login({
            email: formData.email,
            password: formData.password
        })

        setLoading(false)

        if (result.success && result.profile) {
            // Force full page reload to ensure cookies are seen by middleware
            const target = result.profile.role === 'admin' ? '/admin/dashboard' :
                result.profile.role === 'teacher' ? '/teacher/dashboard' :
                    '/student/team';

            window.location.href = target;
        } else {
            console.error('Login error:', result.error)
            alert(`Error: ${result.error || 'No se pudo cargar el perfil del usuario. Verifica tu conexión o contacta con soporte.'}`)
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

            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
                    <CardDescription>
                        Accede a tu cuenta de la Hackathon.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="usuario@edu.gva.es"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
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
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            type="submit"
                            className="w-full font-semibold"
                            size="lg"
                            disabled={loading}
                        >
                            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                            ¿No tienes cuenta? <Link href="/register" className="text-primary hover:underline">Regístrate como Estudiante</Link>
                        </p>
                        <p className="text-xs text-center text-muted-foreground">
                            ¿Eres profesor? <Link href="/register/teacher" className="text-primary hover:underline">Regístrate aquí</Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
