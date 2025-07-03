import type { ReactNode } from "react"
import type { NavItem } from "~/types/types"


interface PageLayoutProps {
  children: ReactNode
  navItem: NavItem
}

export default function PageLayout({ children, navItem }: PageLayoutProps) {

  return (
    <div className="container mx-auto px-4 py-8">
      {children}
    </div>
  )
} 