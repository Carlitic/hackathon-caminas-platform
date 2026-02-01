"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUserProfile, logout } from "@/lib/auth"
import { repairAdminProfile } from "@/lib/admin"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export default function DashboardRouter() {
    const router = useRouter()
    const [status, setStatus] = useState("Cargando perfil...")
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        routeUser()
    }, [])

    async function routeUser() {
        try {
            const profile = await getCurrentUserProfile()

            if (!profile) {
                // Zombie state: Auth exists but Profile missing/unreachable
                throw new Error("No estás registrado en la base de datos (Perfil no encontrado).")
            }

            // Redirect based on role
            if (profile.role === 'admin') {
                router.push('/admin/dashboard')
            } else if (profile.role === 'teacher') {
                // Check if tutor or regular teacher
                if (profile.is_tutor) {
                    router.push('/teacher/dashboard')
                } else {
                    router.push('/teacher/general')
                }
            } else {
                // Student
                router.push('/student/team')
            }

        } catch (error: any) {
            console.error("Routing error:", error)
            setError(error.message)
            setStatus("Error crítico: No se puede cargar tu perfil. Revisa el error arriba.")

            // Allow manual logout/repair but DO NOT redirect automatically in debug mode
        }
    }

    async function handleManualLogout() {
        await logout()
        window.location.href = "/login"
    }

    async function handleRepairAdmin() {
        if (!confirm("¿Seguro que eres el Administrador? Esto restaurará tu perfil como Admin.")) return

        setStatus("Reparando perfil de Administrador...")
        try {
            const result = await repairAdminProfile()

            if (result.success) {
                toast.success("Perfil reparado. Redirigiendo...")
                setStatus("¡Reparado! Recargando...")
                setTimeout(() => window.location.reload(), 1500)
            } else {
                toast.error("Error al reparar: " + result.error)
                setStatus("Fallo al reparar. Intenta contactar soporte.")
            }
        } catch (e: any) {
            toast.error("Error inesperado: " + e.message)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="flex flex-col items-center gap-6 max-w-md text-center p-6 bg-white dark:bg-slate-900 shadow-lg rounded-xl border">
                {!error ? (
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                ) : (
                    <div className="text-red-500 text-5xl">⚠️</div>
                )}

                <div className="space-y-4">
                    <p className={`text-lg transition-colors ${error ? 'text-red-600 font-bold' : 'text-muted-foreground animate-pulse'}`}>
                        {status}
                    </p>
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-100 dark:border-red-900/50">
                            <p className="text-sm text-red-800 dark:text-red-200 font-mono break-all">
                                {error}
                            </p>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="flex flex-col gap-3 w-full border-t pt-4 mt-2">
                        <p className="text-xs text-muted-foreground">Opciones de recuperación:</p>

                        <Button variant="destructive" onClick={handleManualLogout} className="w-full">
                            Forzar Cierre de Sesión
                        </Button>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink-0 mx-2 text-gray-400 text-xs">O</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        <Button
                            variant="outline"
                            onClick={handleRepairAdmin}
                            className="w-full border-dashed border-primary/50 text-primary hover:bg-primary/5"
                        >
                            🛠️ Soy el Admin (Autoreparar Cuenta)
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
