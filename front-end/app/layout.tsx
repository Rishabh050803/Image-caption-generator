import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/lib/auth"

export const metadata: Metadata = {
  title: 'CaptionIt',
  description: 'Created by Rishabh K. Patel, Divyansh Pokharna, and Dhruv Parashar',
  generator: 'CaptionIt',
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
