import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ReactQueryProvider } from "@/components/providers/react-query-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Navigation } from "@/components/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Crypto Analytics Dashboard",
  description: "Multi-chain crypto portfolio and whale tracking powered by Nodit API",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ReactQueryProvider>
            <Navigation />
            {children}
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
