'use client'
import './globals.css'
import { Inter } from 'next/font/google'
import { usePathname } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const hideFooter = pathname === '/login'
  const currentYear = new Date().getFullYear()

  return (
    <html lang="en">
      <head>
        <title>OJT DTR System</title>
        <meta name="description" content="Daily Time Record for Interns" />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <div className="flex-1">
          {children}
        </div>
        
        {!hideFooter && (
          <footer className="py-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">
                © {currentYear} OJT Daily Time Monitoring System
              </p>
            </div>
          </footer>
        )}
      </body>
    </html>
  )
}