"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUserProfile, logout } from "@/lib/auth"
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
            setStatus("Error de sesión. Cerrando sesión automáticamente...")

            // Auto logout to break loop
            try {
                await logout()
            } catch (e) {
                console.error("Logout failed:", e)
            }

            // Redirect after delay - DISABLED FOR DEBUGGING
            // setTimeout(() => {
            //     window.location.href = "/login"
            // }, 3000)
            setStatus("Error crítico: No se puede cargar tu perfil. Revisa el error arriba.")
        }
    }

    async function handleManualLogout() {
        await logout()
        window.location.href = "/login"
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="flex flex-col items-center gap-6 max-w-md text-center p-6 bg-white dark:bg-slate-900 shadow-lg rounded-xl border">
                {!error ? (
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                ) : (
                    <div className="text-red-500 text-5xl">⚠️</div>
                )}

                <div className="space-y-2">
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
                    <div className="flex flex-col gap-2 w-full">
                        <p className="text-xs text-muted-foreground">Si no te redirige automáticamente:</p>
                        <Button variant="destructive" onClick={handleManualLogout} className="w-full">
                            Forzar Cierre de Sesión
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
