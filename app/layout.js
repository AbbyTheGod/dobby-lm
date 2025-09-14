import './globals.css'

export const metadata = {
  title: 'NotebookLM-lite',
  description: 'AI-powered notebook with grounded Q&A and study tools',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen transition-colors duration-200">
        {children}
      </body>
    </html>
  )
}
