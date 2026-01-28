import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function LoginPage() {
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
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto bg-slate-100 p-3 rounded-full w-fit dark:bg-slate-800">
                        <Image src="/logo.jpg" alt="Logo" width={64} height={64} className="rounded-full" />
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Hackathon IES El Caminàs</CardTitle>
                        <CardDescription>
                            Introduce tus credenciales para acceder a la plataforma.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input id="email" type="email" placeholder="alumno@alu.edu.gva.es" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input id="password" type="password" />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full text-white font-semibold" size="lg">Iniciar Sesión</Button>
                    <p className="text-xs text-center text-muted-foreground">
                        ¿No tienes cuenta? <Link href="/register" className="text-primary hover:underline font-medium">Regístrate</Link> para que tu tutor te dé de alta.
                    </p>
                    <p className="text-xs text-center text-muted-foreground">
                        ¿Eres profesor? <Link href="/register/teacher" className="text-primary hover:underline font-medium">Crea tu cuenta aquí</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
