"use client"

import { useEffect, useState } from "react"
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications"
import { createClient } from "@/lib/supabase/client"

export function RealtimeProvider() {
    const [userId, setUserId] = useState<string | undefined>(undefined)
    const [role, setRole] = useState<string | undefined>(undefined)
    const [teamId, setTeamId] = useState<string | undefined>(undefined)

    useEffect(() => {
        // Fetch current user details on mount
        async function fetchUserProfile() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            
            if (user) {
                setUserId(user.id)
                
                // Get profile details (role and team_id)
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, team_id')
                    .eq('id', user.id)
                    .single()
                    
                if (profile) {
                    setRole(profile.role)
                    if (profile.team_id) {
                        setTeamId(profile.team_id)
                    }
                }
            }
        }
        
        fetchUserProfile()
    }, [])

    // Initialize the realtime listeners
    useRealtimeNotifications(userId, role, teamId)

    // This provider doesn't render any UI itself
    return null
}
