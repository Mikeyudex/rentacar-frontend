import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/hooks/use-auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Erp Totalmotors",
  description: "Erp Totalmotors",
  icons: {
    icon: "https://www.totalmotors.cl/wp-content/uploads/2022/08/cropped-Circulo1-180x180.png",
  },
}

// Envolver el contenido con AuthProvider:
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            {children}
            <Toaster />
            {/* <SessionMonitor showInDevelopment={false} /> */}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

