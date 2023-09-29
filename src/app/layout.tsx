import { AppBar, Toolbar, Typography } from '@mui/material'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { HankoLogout } from './components/HankoLogout'
import HankoProfile from './components/HankoProfile'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Permit - Hanko Example App',
  description: 'Example app for Hanko authentication and Permit.io fine-grained authorization',
}

const hankoApi = process.env.NEXT_PUBLIC_HANKO_API_KEY || '';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Hankomit Notes
            </Typography>
            <HankoLogout />
            <HankoProfile />
          </Toolbar>
        </AppBar>
        {children}
      </body>
    </html>
  )
}
