// app/layout.tsx
import "~/styles/globals.css"
import { TRPCReactProvider } from "~/trpc/react"
import { Providers } from "./providers"
import { auth } from "~/server/auth"  // Import the type-safe session getter

export const metadata = {
  title: "Create T3 App",
  description: "Generated by create-t3-app",
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