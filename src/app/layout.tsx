'use client'
import { Inter } from 'next/font/google'
import { usePathname } from 'next/navigation'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Tago footer pag nasa / or /login
  const hideFooter = pathname === '/' || pathname === '/login'

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full flex flex-col`}>
        <div className="flex-1">
          {children}
        </div>
        
        {!hideFooter && (
          <footer className="text-center py-4 text-gray-500 text-sm border-t border-gray-200 bg-white">
            © {new Date().getFullYear()} OJT Daily Time Monitoring System
          </footer>
        )}
      </body>
    </html>
  )
}