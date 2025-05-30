"use client"

import type { ReactNode } from "react"
import { SessionProvider } from "next-auth/react"
import type { Session } from "next-auth"

type Props = {
    children: ReactNode
    session: Session | null
}

export function Providers({ children, session }: Props) {
    return (
        <SessionProvider
            // pass in the session from the server if you want SSR/SSG
            session={session}
            refetchInterval={5 * 60}
        >
            {children}
        </SessionProvider>
    )
}