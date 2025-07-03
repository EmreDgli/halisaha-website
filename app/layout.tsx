import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from "@/components/AuthProvider"

export const metadata: Metadata = {
  title: 'HalıSaha Pro',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
