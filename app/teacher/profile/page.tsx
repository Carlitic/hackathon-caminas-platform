"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Save, ArrowLeft } from "lucide-react"
import { getCurrentUserProfile } from "@/lib/auth"
import { updateTeacherProfile } from "@/lib/profile"
import { toast } from "sonner"

export default function TeacherProfilePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)
    const [formData, setFormData] = useState({
        full_name: "",
        email: ""
    })

    useEffect(() => {
        loadProfile()
    }, [])

    async function loadProfile() {
        setLoading(true)
        try {
            const userProfile = await getCurrentUserProfile()
            if (!userProfile || userProfile.role !== 'teacher') {
                router.push('/login')
                return
            }

            setProfile(userProfile)
            setFormData({
                full_name: userProfile.full_name || "",
                email: userProfile.email || ""
            })
        } catch (error) {
            console.error(error)
            toast.error("Error al cargar perfil")
        } finally {
            setLoading(false)
        }
    }

    async function handleSave() {
        try {
            await updateTeacherProfile(profile.id, formData)
            toast.success("Perfil actualizado correctamente")
            loadProfile()
        } catch (error: any) {
            toast.error(error.message || "Error al actualizar perfil")
        }
    }

    if (loading) return <div className="flex h-screen items-center justify-center">Cargando...</div>

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-2xl">
            <header className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
                    <p className="text-muted-foreground">Gestiona tu información personal</p>
                </div>
            </header>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <CardTitle>{profile?.full_name}</CardTitle>
                            <CardDescription>{profile?.email}</CardDescription>
                            <div className="flex gap-2 mt-2">
                                <Badge>{profile?.role}</Badge>
                                {profile?.is_tutor && (
                                    <Badge variant="secondary">Tutor - {profile?.tutor_group}</Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="full_name">Nombre Completo</Label>
                        <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            disabled
                        />
                        <p className="text-xs text-muted-foreground">El email no se puede cambiar</p>
                    </div>

                    {profile?.is_tutor && (
                        <>
                            <div className="grid gap-2">
                                <Label>Grupo de Tutoría</Label>
                                <Input value={profile?.tutor_group || ""} disabled />
                                <p className="text-xs text-muted-foreground">El grupo no se puede cambiar</p>
                            </div>

                            <div className="grid gap-2">
                                <Label>Estado de Aprobación como Tutor</Label>
                                <Badge variant={profile?.tutor_approved ? 'default' : 'secondary'}>
                                    {profile?.tutor_approved ? 'Aprobado' : 'Pendiente'}
                                </Badge>
                            </div>
                        </>
                    )}

                    <Button className="w-full" onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Cambios
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
