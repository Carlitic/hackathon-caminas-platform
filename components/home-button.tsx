"use client"

import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

export function HomeButton() {
    const router = useRouter()
    const pathname = usePathname()

    if (pathname === "/") {
        return null
    }

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/")}
            aria-label="Volver al Inicio"
        >
            <Home className="h-[1.2rem] w-[1.2rem]" />
        </Button>
    )
}
