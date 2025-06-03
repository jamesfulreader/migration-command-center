import Link from "next/link";

import { LatestPost } from "~/app/_components/post";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">

          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-center text-2xl text-white">
              {session && <span>Logged in as {session.user?.name}</span>}
            </p>
            <Link
              href={session ? "/api/auth/signout" : "/api/auth/signin"}
              className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
              legacyBehavior>
              {session ? "Sign out" : "Sign in"}
            </Link>

            {session?.user && <LatestPost />}
          </div>

          <div className="flex flex-col items-center justify-center gap-4">
            <Link href="/websites/new" className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20">
              Create New Website
            </Link>
            <Link href="/websites" className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20">
              Manage Websites
            </Link>

          </div>
        </div>
      </main>
    </HydrateClient >
  );
}
