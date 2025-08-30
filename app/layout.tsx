import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { TopLoader } from './RootLayout';
import { Analytics } from "@vercel/analytics/next"
import './globals.css'


export const metadata: Metadata = {
  title: 'TPI - Veterans Overwatch ',
  icons: {
    icon: '/fav.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
    html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body suppressHydrationWarning={true}>
        {children}
        <TopLoader />
        <Analytics/>
      </body>
    </html>
  )
}