"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { HomeButton } from "@/components/home-button"
import { GithubLink } from "@/components/github-link"

/**
 * Componente principal de la cabecera (Header) estática en la parte superior de la aplicación.
 */
export function SiteHeader() {
    return (
        // Cabecera pegajosa (sticky) con desenfoque de fondo al hacer scroll
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 w-full items-center justify-between px-4">
                <div className="flex items-center">
                    <HomeButton />
                </div>
                
                <div className="flex items-center gap-2">
                    
                    <GithubLink />
                    <ThemeToggle />
                </div>
            </div>
        </header>
    )
}
