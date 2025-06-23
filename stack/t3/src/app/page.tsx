import { auth } from "~/server/auth";
import AuthStatus from "./_components/auth/AuthStatus";
import { SessionProvider } from "next-auth/react";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  // Prefetch some data for SSR if needed
  if (session?.user) {
    // You can prefetch tRPC queries here if you have any
    // void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <SessionProvider session={session}>
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
          <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
              <span className="text-[hsl(280,100%,70%)]">NextAuth.js</span> + 
              <span className="text-[hsl(190,100%,70%)]"> Django Allauth</span>
            </h1>
            
            <div className="text-center">
              <p className="text-2xl">
                Integrated Authentication System
              </p>
              <p className="mt-2 text-lg text-gray-300">
                OAuth providers managed by NextAuth.js, sessions synchronized with Django allauth
              </p>
            </div>

            <AuthStatus />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
              <div className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20">
                <h3 className="text-2xl font-bold">NextAuth.js Features →</h3>
                <div className="text-lg">
                  <ul className="space-y-1 text-left">
                    <li>• Multiple OAuth providers</li>
                    <li>• JWT session management</li>
                    <li>• TypeScript support</li>
                    <li>• Database adapter</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20">
                <h3 className="text-2xl font-bold">Django Allauth Features →</h3>
                <div className="text-lg">
                  <ul className="space-y-1 text-left">
                    <li>• User management</li>
                    <li>• Email verification</li>
                    <li>• MFA support</li>
                    <li>• Social account linking</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <p className="text-lg">
                {session
                  ? `Welcome back, ${session.user?.name ?? "User"}!`
                  : "Sign in to see the integration in action"}
              </p>
              {!session && (
                <a
                  href="/auth/signin"
                  className="rounded-full bg-white/10 px-8 py-3 font-semibold transition hover:bg-white/20"
                >
                  Sign In
                </a>
              )}
            </div>
          </div>
        </main>
      </SessionProvider>
    </HydrateClient>
  );
}
