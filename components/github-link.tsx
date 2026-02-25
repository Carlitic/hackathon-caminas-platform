'use client';

import { Github } from 'lucide-react';
import { useState, useEffect } from 'react';

/**
 * Componente que renderiza un icono de GitHub con un enlace al repositorio del proyecto.
 * La URL del repositorio se obtiene de /version.json para centralizar la configuración.
 */
export function GithubLink() {
  // Estado para almacenar la URL del repositorio
  const [repoUrl, setRepoUrl] = useState<string>('');

  // Hook para cargar la URL desde version.json al montar el componente
  useEffect(() => {
    fetch('/version.json')
      .then((res) => res.json())
      .then((data) => setRepoUrl(data.repository))
      // En caso de error, usar una URL de respaldo por defecto
      .catch(() => setRepoUrl('https://github.com/Carlitic/hackathon-caminas-platform'));
  }, []);

  // Renderizar un enlace estilizado como un botón de icono
  return (
    <a
      href={repoUrl}
      target="_blank" // Abre en nueva pestaña
      rel="noopener noreferrer" // Por seguridad al abrir pestañas nuevas
      className="inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
      title="Ver código en GitHub"
    >
      <Github className="h-5 w-5" />
      <span className="sr-only">GitHub Repository</span>
    </a>
  );
}
