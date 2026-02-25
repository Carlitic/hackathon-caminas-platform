"use client";

import Link from "next/link";
import versionData from "@/version.json";

/**
 * Componente que muestra la versión actual de la aplicación en la esquina inferior derecha.
 * Obtiene el número de versión desde el archivo estático /version.json
 */
export function VersionDisplay() {
  const version = versionData.version;

  // Si aún no hay versión cargada, no renderizar nada
  if (!version) return null;

  // Renderiza un enlace fijo en la parte inferior derecha que lleva al historial de cambios (/changelog)
  return (
    <Link href="/changelog" className="fixed bottom-4 right-4 z-50 group">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <span className="text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors">
          v{version}
        </span>
      </div>
    </Link>
  );
}
