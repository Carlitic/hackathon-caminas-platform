import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site-header";
import { VersionDisplay } from "@/components/version-display";
import { RealtimeProvider } from "@/components/providers/realtime-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hackathon IES El Caminàs",
  description: "Plataforma de gestión para la Hackathon presencial del IES El Caminàs.",
  icons: {
    icon: "/app-icon.png",
  },
};



/**
 * Layout principal ("Root Layout") de la aplicación.
 * Este componente envuelve a todas las páginas y define la estructura HTML base,
 * los proveedores de contexto (tema) y los componentes globales (Header, Version Display).
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* ThemeProvider maneja el cambio entre modo claro y oscuro */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Cabecera superior de la web, persistente en todas las páginas */}
          <SiteHeader />
          
          <div className="pt-4"> {/* Añade espaciado para que el contenido no quede pegado a la cabecera */}
            {children}
          </div>
          
          {/* Muestra la versión de la app permanentemente abajo a la derecha */}
          <VersionDisplay />
          
          {/* Proveedor de notificaciones en tiempo real para Comodines */}
          <RealtimeProvider />
          
          {/* Toaster se encarga de mostrar pequeñas notificaciones (toasts) al usuario */}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
