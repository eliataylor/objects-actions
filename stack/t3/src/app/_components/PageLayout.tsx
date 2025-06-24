'use client';

import type { ReactNode } from "react"
import type { NavItem } from "~/types/types"

// Mock session data type
interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface MockSession {
  user: MockUser;
}

// Mock session data - replace with real auth when allauth is integrated
function getMockSession(): MockSession {
  return {
    user: {
      id: "mock-user-1",
      name: "Mock User",
      email: "mock@example.com",
      role: "admin" // Change to "user" to test different permission levels
    }
  };
}

interface PageLayoutProps {
  children: ReactNode
  navItem: NavItem
}

export default function PageLayout({ children, navItem }: PageLayoutProps) {
  // Use mock session for development - permissions are handled in middleware
  const session = getMockSession();

  return (
    <div className="container mx-auto px-4 py-8">
      {children}
    </div>
  )
} 