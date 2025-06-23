'use client';

import { useSession } from "next-auth/react"
import type { ReactNode } from "react"
import type { NavItem } from "~/types/types"
import { redirect } from "next/navigation"
import type { DefaultSession, User } from "next-auth"

declare module "next-auth" {
  interface User {
    role?: string;
  }

  interface Session {
    user: User & {
      id: string;
    } & DefaultSession["user"]
  }
}

interface PageLayoutProps {
  children: ReactNode
  navItem: NavItem
}

export default function PageLayout({ children, navItem }: PageLayoutProps) {
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"
  const isAdmin = session?.user?.role === "admin"

  // Handle permissions
  switch (navItem.permissions) {
    case "IsAuthenticated":
      if (!isAuthenticated) {
        redirect("/api/auth/signin")
      }
      break

    case "IsAdmin":
      if (!isAuthenticated || !isAdmin) {
        redirect("/")
      }
      break

    case "IsAuthenticatedOrReadOnly":
      // Read-only checks are handled by the middleware
      break

    case "AllowAny":
    default:
      break
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {children}
    </div>
  )
} 