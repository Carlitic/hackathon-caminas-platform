"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUserProfile } from "@/lib/auth"
import { toast } from "sonner"

export default function DashboardRouter() {
    const router = useRouter()

    useEffect(() => {
        routeUser()
    }, [])

    async function routeUser() {
        try {
            const profile = await getCurrentUserProfile()

            if (!profile) {
                // Not logged in or error
                router.push("/login")
                return
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
            // Show error state instead of infinite loop
            toast.error("Error al obtener perfil: " + error.message)
            // Allow manual redirect to login after delay or user action
            setTimeout(() => router.push("/login"), 3000)
        }
    }

    // Add state to show error
    const [status, setStatus] = useState("Cargando perfil...")

    // Update render to show status
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-muted-foreground animate-pulse">{status}</p>
            </div>
        </div>
    )
}
