import './globals.css'

export const metadata = {
  title: 'NotebookLM-lite',
  description: 'AI-powered notebook with grounded Q&A and study tools',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-secondary-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}
