// app/layout.tsx
import "~/styles/globals.css"
import { TRPCReactProvider } from "~/trpc/react"
import { Providers } from "./providers"
import { auth } from "~/server/auth"  // Import the type-safe session getter

export const metadata = {
  title: "Website Migration Command Center",
  description: "centralized place to manage website migrations using t3 app",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // If you want to hydrate the session on first load, fetch it here:
  const session = await auth()

  return (
    <html lang="en">
      <body>
        <TRPCReactProvider>
          <Providers session={session}>
            {children}
          </Providers>
        </TRPCReactProvider>
      </body>
    </html>
  )
}