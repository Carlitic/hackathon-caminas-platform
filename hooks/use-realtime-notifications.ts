"use client"

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

/**
 * Hook personalizado que se suscribe a los eventos en tiempo real de Supabase
 * para la tabla `help_requests` (comodines).
 * 
 * - Si el usuario es PROFESOR: Recibe notificaciones cuando un estudiante crea una nueva solicitud (INSERT).
 * - Si el usuario es ESTUDIANTE: Recibe notificaciones cuando un profesor resuelve su solicitud (UPDATE).
 */
export function useRealtimeNotifications(userId: string | undefined, role: string | undefined, teamId: string | undefined) {
    const supabase = createClient()

    useEffect(() => {
        if (!userId || !role) {
            return
        }

        let channelName = ''
        let filterString = ''
        let eventType: 'INSERT' | 'UPDATE' | '*' = '*'

        // Configurar la suscripción dependiendo del rol
        if (role === 'teacher' || role === 'admin') {
            // Los profesores escuchan nuevos comodines (INSERT)
            channelName = 'teacher_help_requests'
            eventType = 'INSERT'
            // Podríamos filtrar solo los de su ciclo, pero por ahora mostramos todos
            // ya que un 'comodín' implica que cualquier profesor puede ayudar
        } else if (role === 'student' && teamId) {
            // Los estudiantes escuchan actualizaciones de su propio equipo (UPDATE)
            channelName = `student_help_requests_${teamId}`
            eventType = 'UPDATE'
            filterString = `team_id=eq.${teamId}`
        } else {
            return; // Otros roles o estudiantes sin equipo no escuchan
        }

        // Crear y suscribirse al canal
        const channel = supabase
            .channel(channelName)
            .on(
                // @ts-ignore - Supabase types are sometimes strict with realtime filter strings
                'postgres_changes',
                {
                    event: eventType,
                    schema: 'public',
                    table: 'help_requests',
                    filter: filterString || undefined,
                },
                (payload) => {
                    // Manejar la notificación recibida
                    
                    if (role === 'teacher' || role === 'admin') {
                        // Nueva solicitud de ayuda recibida
                        const newRequest = payload.new as any;
                        
                        toast.info('Nueva Solicitud de Ayuda 🙋‍♂️', {
                            description: `Mensaje: "${newRequest.message}"`,
                            action: {
                                label: 'Ver',
                                onClick: () => {
                                    // Podríamos hacer scroll a la sección de solicitudes
                                    const element = document.getElementById('support-tickets-section');
                                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                                }
                            },
                            duration: 8000,
                        })

                    } else if (role === 'student') {
                        // Solicitud de ayuda actualizada (resuelta)
                        const updatedRequest = payload.new as any;
                        
                        if (updatedRequest.status === 'resolved') {
                            toast.success('¡Comodín Resuelto! ✅', {
                                description: 'Un profesor ha marcado tu solicitud de ayuda como resuelta.',
                                duration: 8000,
                            })
                        }
                    }
                }
            )
            .subscribe()

        // Cleanup: Desuscribirse cuando el componente se desmonte o el rol cambie
        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId, role, teamId, supabase])
}
