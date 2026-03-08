import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LecturePilot',
  description: 'A modern learning workspace for students',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-900 bg-[#f5f5f7]">
        {children}
      </body>
    </html>
  )
}