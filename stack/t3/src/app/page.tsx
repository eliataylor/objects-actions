import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  // Example of prefetching data for SSR
  // void api.post.getExample.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            <span className="text-[hsl(280,100%,70%)]">Object</span>{" "}
            <span className="text-[hsl(190,100%,70%)]">Actions</span>
          </h1>
          
          <div className="text-center">
            <p className="text-2xl">
              Spreadsheets to Full-Stack
            </p>
            <p className="mt-2 text-lg text-gray-300">
              Transform your data models into powerful applications
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <div className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20">
              <h3 className="text-2xl font-bold">T3 Stack Features →</h3>
              <div className="text-lg">
                <ul className="space-y-1 text-left">
                  <li>• Next.js App Router</li>
                  <li>• tRPC for API calls</li>
                  <li>• TypeScript support</li>
                  <li>• TanStack Query</li>
                </ul>
              </div>
            </div>
            
            <div className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20">
              <h3 className="text-2xl font-bold">External API Ready →</h3>
              <div className="text-lg">
                <ul className="space-y-1 text-left">
                  <li>• Django backend</li>
                  <li>• REST API integration</li>
                  <li>• Dynamic content types</li>
                  <li>• Search functionality</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-lg">
              Ready to build with external APIs
            </p>
            <a
              href="/drugs"
              className="rounded-full bg-white/10 px-8 py-3 font-semibold transition hover:bg-white/20"
            >
              Explore Data
            </a>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
