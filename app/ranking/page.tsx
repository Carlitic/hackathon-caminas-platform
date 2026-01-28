import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function RankingPage() {
    // Mock teams sorted by votes (descending)
    const rankedTeams = [
        { id: 3, name: "Equipo 3", votes: 12, members: 6, certificate: "gold" },
        { id: 1, name: "Equipo 1", votes: 8, members: 6, certificate: "silver" },
        { id: 4, name: "Equipo 4", votes: 5, members: 6, certificate: "bronze" },
        { id: 2, name: "Equipo 2", votes: 2, members: 6, certificate: "participant" },
        { id: 5, name: "Equipo 5", votes: 1, members: 6, certificate: "participant" },
    ]

    const getCertificateInfo = (position: number) => {
        switch (position) {
            case 1:
                return {
                    icon: <Trophy className="h-12 w-12 text-yellow-500" />,
                    badge: "🥇 Oro",
                    color: "bg-gradient-to-br from-yellow-400 to-yellow-600",
                    textColor: "text-yellow-600"
                }
            case 2:
                return {
                    icon: <Medal className="h-12 w-12 text-slate-400" />,
                    badge: "🥈 Plata",
                    color: "bg-gradient-to-br from-slate-300 to-slate-500",
                    textColor: "text-slate-600"
                }
            case 3:
                return {
                    icon: <Award className="h-12 w-12 text-orange-600" />,
                    badge: "🥉 Bronce",
                    color: "bg-gradient-to-br from-orange-400 to-orange-600",
                    textColor: "text-orange-600"
                }
            default:
                return {
                    icon: <Users className="h-12 w-12 text-blue-500" />,
                    badge: "Participante",
                    color: "bg-gradient-to-br from-blue-400 to-blue-600",
                    textColor: "text-blue-600"
                }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
            <div className="container mx-auto max-w-4xl space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <Trophy className="h-20 w-20 text-yellow-500 mx-auto" />
                    <h1 className="text-4xl font-bold tracking-tight">Ranking en Vivo</h1>
                    <p className="text-lg text-muted-foreground">
                        Hackathon IES El Caminàs - Resultados Actualizados
                    </p>
                    <p className="text-sm text-muted-foreground">
                        🔴 Los votos se actualizan en tiempo real
                    </p>
                    <Link href="/">
                        <Button variant="outline" className="mt-4">
                            Volver al Inicio
                        </Button>
                    </Link>
                </div>

                {/* Podium - Top 3 */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {/* 2nd Place */}
                    {rankedTeams[1] && (
                        <div className="md:order-1 flex flex-col items-center">
                            <div className="w-full">
                                <Card className="border-4 border-slate-400 shadow-xl">
                                    <CardHeader className="text-center pb-2">
                                        <div className="flex justify-center mb-2">
                                            {getCertificateInfo(2).icon}
                                        </div>
                                        <CardTitle className="text-2xl">2º Puesto</CardTitle>
                                        <Badge className="bg-slate-400 text-white mt-2">
                                            {getCertificateInfo(2).badge}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="text-center">
                                        <p className="text-xl font-bold mb-2">{rankedTeams[1].name}</p>
                                        <p className="text-3xl font-bold text-slate-600">{rankedTeams[1].votes}</p>
                                        <p className="text-sm text-muted-foreground">votos</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* 1st Place */}
                    {rankedTeams[0] && (
                        <div className="md:order-2 flex flex-col items-center md:-mt-8">
                            <div className="w-full">
                                <Card className="border-4 border-yellow-500 shadow-2xl">
                                    <CardHeader className="text-center pb-2">
                                        <div className="flex justify-center mb-2">
                                            {getCertificateInfo(1).icon}
                                        </div>
                                        <CardTitle className="text-3xl">🏆 1º Puesto</CardTitle>
                                        <Badge className="bg-yellow-500 text-white mt-2">
                                            {getCertificateInfo(1).badge}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="text-center">
                                        <p className="text-2xl font-bold mb-2">{rankedTeams[0].name}</p>
                                        <p className="text-4xl font-bold text-yellow-600">{rankedTeams[0].votes}</p>
                                        <p className="text-sm text-muted-foreground">votos</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* 3rd Place */}
                    {rankedTeams[2] && (
                        <div className="md:order-3 flex flex-col items-center">
                            <div className="w-full">
                                <Card className="border-4 border-orange-500 shadow-xl">
                                    <CardHeader className="text-center pb-2">
                                        <div className="flex justify-center mb-2">
                                            {getCertificateInfo(3).icon}
                                        </div>
                                        <CardTitle className="text-2xl">3º Puesto</CardTitle>
                                        <Badge className="bg-orange-500 text-white mt-2">
                                            {getCertificateInfo(3).badge}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="text-center">
                                        <p className="text-xl font-bold mb-2">{rankedTeams[2].name}</p>
                                        <p className="text-3xl font-bold text-orange-600">{rankedTeams[2].votes}</p>
                                        <p className="text-sm text-muted-foreground">votos</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>

                {/* Rest of teams */}
                {rankedTeams.length > 3 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Otros Participantes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {rankedTeams.slice(3).map((team, index) => {
                                    const position = index + 4
                                    const info = getCertificateInfo(position)
                                    return (
                                        <div key={team.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 font-bold text-lg">
                                                    {position}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-lg">{team.name}</p>
                                                    <Badge variant="outline" className="mt-1">
                                                        {info.badge}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold {info.textColor}">{team.votes}</p>
                                                <p className="text-xs text-muted-foreground">votos</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
