import './globals.css'

export const metadata = {
  title: 'Literature Survey Tracker',
  description: 'Track and manage research papers for your team',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
