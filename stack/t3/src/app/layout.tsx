import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { TRPCReactProvider } from "~/trpc/react";
import Navigation from "./_components/Navigation";
import ThemeRegistry from "./_components/ThemeRegistry";
import { SelectionProvider } from "~/contexts/SelectionContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Object Actions",
  description: "Spreadsheets to Full-Stack",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

// Mock session data - replace with real auth when allauth is integrated
function getMockSession() {
  return {
    user: {
      id: "mock-user-1",
      name: "Mock User",
      email: "mock@example.com",
      role: "admin" // Change to "user" to test different permission levels
    }
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Use mock session for development
  const session = getMockSession();

  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <TRPCReactProvider>
          <ThemeRegistry>
            <SelectionProvider>
              <Navigation 
                isAuthenticated={!!session}
                isAdmin={session?.user?.role === 'admin'}
                userName={session?.user?.name}
              />
              <main>
                {children}
              </main>
            </SelectionProvider>
          </ThemeRegistry>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
