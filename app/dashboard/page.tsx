"use client"

import { useEffect } from "react"
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

        } catch (error) {
            console.error("Routing error:", error)
            router.push("/login")
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-muted-foreground animate-pulse">Redirigiendo a tu panel...</p>
            </div>
        </div>
    )
}
