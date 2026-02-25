import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calendar, Package, Bug, Sparkles, Zap } from 'lucide-react';
import versionData from '@/version.json'; // Importamos directamente el JSON estático

// Metadatos para SEO y título de la pestaña del navegador
export const metadata: Metadata = {
  title: 'Changelog - Hackathon Caminàs',
  description: 'Historial de versiones y actualizaciones de la plataforma',
};

// Mapeo de tipos de cambio a iconos decorativos
const typeIcons = {
  feature: Sparkles, // ✨ Para nuevas funcionalidades
  fix: Bug,          // 🐛 Para correcciones de errores
  improvement: Zap,  // ⚡ Para mejoras de rendimiento o UI
};

// Traducciones legibles de los tipos de cambio para lectores de pantalla u otros usos
const typeLabels = {
  feature: 'Nueva Característica',
  fix: 'Corrección',
  improvement: 'Mejora',
};

// Mapeo de colores asociados a cada tipo de cambio (estilos Tailwind)
const typeColors = {
  feature: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30',
  fix: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30',
  improvement: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30',
};

/**
 * Página principal del Changelog.
 * Muestra el historial completo de versiones de la aplicación mediante un timeline visual.
 */
export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Sección de cabecera: Contiene el botón de retroceso y el título de la página */}
        <div className="mb-12">
          {/* Botón para volver a la página de inicio (landing) */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
          
          {/* Título y descripción principal */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Changelog</h1>
              <p className="text-muted-foreground mt-1">
                Historial de versiones y actualizaciones
              </p>
            </div>
          </div>

          {/* Indicador de la versión actual leyéndola del global versionData */}
          <div className="flex items-center gap-2 mt-6">
            <span className="text-sm text-muted-foreground">Versión actual:</span>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-sm font-semibold">
              v{versionData.version}
            </span>
          </div>
        </div>

        {/* Sección del Timeline: Renderiza iterativamente cada versión (release) de la plataforma */}
        <div className="relative">
          {/* Línea vertical */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />

          {/* Entradas de versión */}
          <div className="space-y-12">
            {versionData.changelog.map((release, index) => (
              <div key={release.version} className="relative pl-20">
                {/* Punto del timeline */}
                <div className="absolute left-6 top-2 w-5 h-5 rounded-full bg-primary border-4 border-background shadow-lg" />

                {/* Tarjeta de versión */}
                <div className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  {/* Cabecera de la tarjeta */}
                  <div className="px-6 py-4 border-b border-border bg-muted/30">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold font-mono">
                          v{release.version}
                        </h2>
                        {index === 0 && (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary text-primary-foreground">
                            Actual
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(release.date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                    {release.title && (
                      <p className="text-lg font-medium mt-2">{release.title}</p>
                    )}
                  </div>

                  {/* Cuerpo de la tarjeta */}
                  <div className="px-6 py-5">
                    <ul className="space-y-3">
                      {release.changes.map((change, changeIndex) => {
                        const Icon = typeIcons[change.type as keyof typeof typeIcons] || Sparkles;
                        const colorClass = typeColors[change.type as keyof typeof typeColors] || typeColors.feature;
                        
                        return (
                          <li key={changeIndex} className="flex gap-3 items-start group">
                            <div className={`p-1.5 rounded-lg ${colorClass} flex-shrink-0 mt-0.5`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 pt-0.5">
                              <p className="text-sm leading-relaxed group-hover:text-foreground transition-colors">
                                {change.description}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer: Pie de página con un enlace para reportar errores en GitHub Issues */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            ¿Encontraste un bug o tienes una sugerencia?{' '}
            <a
              href={versionData.repository + '/issues'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Repórtalo en GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
