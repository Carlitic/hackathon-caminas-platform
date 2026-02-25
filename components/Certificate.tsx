"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, Award, Users, Download } from "lucide-react"
import { jsPDF } from "jspdf"

interface CertificateProps {
    position: number
    teamName: string
    studentName: string
}

export function Certificate({ position, teamName, studentName }: CertificateProps) {
    const getCertificateData = () => {
        switch (position) {
            case 1:
                return {
                    title: "Certificado de Oro",
                    subtitle: "🏆 Primer Puesto",
                    subtitlePDF: "Primer Puesto", // Versión sin emoji para el PDF
                    icon: <Trophy className="h-16 w-16 text-yellow-500" />,
                    gradient: "bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600",
                    borderColor: "border-yellow-500"
                }
            case 2:
                return {
                    title: "Certificado de Plata",
                    subtitle: "🥈 Segundo Puesto",
                    subtitlePDF: "Segundo Puesto",
                    icon: <Medal className="h-16 w-16 text-slate-400" />,
                    gradient: "bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500",
                    borderColor: "border-slate-400"
                }
            case 3:
                return {
                    title: "Certificado de Bronce",
                    subtitle: "🥉 Tercer Puesto",
                    subtitlePDF: "Tercer Puesto",
                    icon: <Award className="h-16 w-16 text-orange-600" />,
                    gradient: "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600",
                    borderColor: "border-orange-500"
                }
            default:
                return {
                    title: "Certificado de Participación",
                    subtitle: "Participante Oficial",
                    subtitlePDF: "Participante Oficial",
                    icon: <Users className="h-16 w-16 text-blue-500" />,
                    gradient: "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600",
                    borderColor: "border-blue-500"
                }
        }
    }

    const data = getCertificateData()

    const downloadPDF = () => {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        })

        // Función auxiliar para limpiar caracteres especiales para el PDF
        const cleanText = (text: string) => {
            return text
                .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
                .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n')
                .replace(/Á/g, 'A').replace(/É/g, 'E').replace(/Í/g, 'I')
                .replace(/Ó/g, 'O').replace(/Ú/g, 'U').replace(/Ñ/g, 'N')
                .replace(/à/g, 'a').replace(/è/g, 'e').replace(/ì/g, 'i')
                .replace(/ò/g, 'o').replace(/ù/g, 'u')
        }

        // Establecer colores según la posición
        let primaryColor: [number, number, number] = [0, 158, 226] // Azul por defecto
        if (position === 1) primaryColor = [255, 215, 0] // Oro
        else if (position === 2) primaryColor = [192, 192, 192] // Plata
        else if (position === 3) primaryColor = [205, 127, 50] // Bronce

        // Fondo de la cabecera
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
        doc.rect(0, 0, 297, 40, 'F')

        // Título
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(32)
        doc.setFont('helvetica', 'bold')
        doc.text(cleanText(data.title), 148.5, 25, { align: 'center' })

        // Subtítulo
        doc.setFontSize(18)
        doc.text(data.subtitlePDF, 148.5, 35, { align: 'center' })

        // Cuerpo
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(24)
        doc.setFont('helvetica', 'bold')
        doc.text('Hackathon IES El Caminas', 148.5, 60, { align: 'center' })

        doc.setFontSize(14)
        doc.setFont('helvetica', 'normal')
        doc.text('Certifica que', 148.5, 75, { align: 'center' })

        // Nombre del estudiante
        doc.setFontSize(28)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
        doc.text(cleanText(studentName), 148.5, 95, { align: 'center' })

        // Información del equipo
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(16)
        doc.setFont('helvetica', 'normal')
        doc.text(`Como miembro del ${cleanText(teamName)}`, 148.5, 110, { align: 'center' })
        doc.text('Ha participado exitosamente en la Hackathon 2026', 148.5, 120, { align: 'center' })

        // Pie de página
        doc.setFontSize(12)
        doc.setTextColor(100, 100, 100)
        doc.text('IES El Caminas - Castellon', 148.5, 180, { align: 'center' })
        doc.text('Enero 2026', 148.5, 188, { align: 'center' })

        // Borde
        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
        doc.setLineWidth(2)
        doc.rect(10, 10, 277, 190)

        // Guardar PDF
        doc.save(`Certificado_${cleanText(studentName).replace(/\s+/g, '_')}_Hackathon2026.pdf`)
    }

    return (
        <Card className={`border-4 ${data.borderColor} shadow-2xl overflow-hidden`}>
            <div className={`${data.gradient} p-6 text-white text-center`}>
                <div className="flex justify-center mb-4">
                    {data.icon}
                </div>
                <h2 className="text-3xl font-bold mb-2">{data.title}</h2>
                <p className="text-xl font-semibold">{data.subtitle}</p>
            </div>
            <CardHeader className="text-center border-b">
                <CardTitle className="text-2xl">Hackathon IES El Caminàs</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">Certifica que</p>
            </CardHeader>
            <CardContent className="text-center py-8">
                <p className="text-3xl font-bold mb-4">{studentName}</p>
                <p className="text-lg text-muted-foreground mb-2">
                    Como miembro del <span className="font-semibold text-foreground">{teamName}</span>
                </p>
                <p className="text-md text-muted-foreground">
                    Ha participado exitosamente en la Hackathon 2026
                </p>
                <div className="mt-8 pt-6 border-t">
                    <p className="text-xs text-muted-foreground">
                        IES El Caminàs - Castellón
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Enero 2026
                    </p>
                </div>
                <div className="mt-6">
                    <Button
                        onClick={downloadPDF}
                        className="w-full gap-2"
                        variant="outline"
                    >
                        <Download className="h-4 w-4" />
                        Descargar Certificado (PDF)
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default Certificate
