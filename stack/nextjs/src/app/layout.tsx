import { Inter } from "next/font/google";
import { TRPCReactProvider } from "~/trpc/react";
import ThemeContext from "../contexts/ThemeContext";
import { NavDrawerProvider } from "~/contexts/NavDrawerContext";
import AppLayout from "./_components/AppLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Object Actions",
  description: "Spreadsheets to Full-Stack",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <TRPCReactProvider>
          <ThemeContext>
              <NavDrawerProvider>
                <AppLayout>
                  {children}
                </AppLayout>
              </NavDrawerProvider>
          </ThemeContext>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
