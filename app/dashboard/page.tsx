"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUserProfile, logout } from "@/lib/auth"
import { repairAdminProfile, repairTeacherProfile, repairStudentProfile } from "@/lib/admin"
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
                // Estado zombie: Auth existe pero el Perfil falta/es inaccesible
                throw new Error("No estás registrado en la base de datos (Perfil no encontrado).")
            }

            // Redirigir basado en el rol
            if (profile.role === 'admin') {
                router.push('/admin/dashboard')
            } else if (profile.role === 'teacher') {
                // Comprobar si es tutor o profesor regular
                if (profile.is_tutor) {
                    router.push('/teacher/dashboard')
                } else {
                    router.push('/teacher/general')
                }
            } else {
                // Estudiante
                router.push('/student/team')
            }

        } catch (error: any) {
            console.error("Routing error:", error)
            setError(error.message)
            setStatus("Error crítico: No se puede cargar tu perfil. Revisa el error arriba.")

            // Permitir logout/reparación manual pero NO redirigir automáticamente en modo debug
        }
    }

    async function handleManualLogout() {
        await logout()
        window.location.href = "/login"
    }

    async function handleRepair(role: 'admin' | 'teacher' | 'student') {
        const roleName = role === 'admin' ? 'Administrador' : role === 'teacher' ? 'Profesor' : 'Estudiante';

        setStatus(`Reparando perfil de ${roleName}...`)

        let result;
        try {
            if (role === 'admin') result = await repairAdminProfile();
            else if (role === 'teacher') result = await repairTeacherProfile();
            else result = await repairStudentProfile();

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
                            <span className="flex-shrink-0 mx-2 text-gray-400 text-xs">O RECUPERAR COMO</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        <Button variant="outline" onClick={() => handleRepair('admin')} className="w-full border-dashed border-red-500/50 text-red-600 hover:bg-red-50">
                            🛠️ Soy Admin
                        </Button>
                        <Button variant="outline" onClick={() => handleRepair('teacher')} className="w-full border-dashed border-blue-500/50 text-blue-600 hover:bg-blue-50">
                            👨‍🏫 Soy Profesor
                        </Button>
                        <Button variant="outline" onClick={() => handleRepair('student')} className="w-full border-dashed border-green-500/50 text-green-600 hover:bg-green-50">
                            🎓 Soy Alumno
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
