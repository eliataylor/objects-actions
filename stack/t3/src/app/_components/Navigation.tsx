import Link from "next/link"
import { NAVITEMS } from "~/types/types"
import {
  AppBar,
  Box,
  Toolbar,
  Typography
} from "@mui/material"
import { MobileDrawer } from "./MobileDrawer"
import StyledButton from "~/styles/StyledButton"

import LogoGeneric from "../_docs/LogoGeneric"

interface NavigationProps {
  isAuthenticated?: boolean
  isAdmin?: boolean
  userName?: string
}

export default function Navigation({ 
  isAuthenticated = false, 
  isAdmin = false,
  userName 
}: NavigationProps) {
  
  // Filter nav items based on permissions (server-side logic)
  const visibleNavItems = NAVITEMS.filter(item => {
    // For now, show all items since permissions might be custom
    // This would be implemented based on your permission system
    return true
  })

  return (
    <AppBar
      position="fixed"
      sx={{
        width: "100%",
        zIndex: 1201, // Above drawer (1200)
      }}
    >
      <Toolbar>
        {/* Mobile Drawer - only renders on mobile */}
        <MobileDrawer 
          isAuthenticated={isAuthenticated}
          isAdmin={isAdmin}
          userName={userName}
        />

        {/* Desktop Navigation */}
        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{
            flexGrow: 1,
            color: "inherit",
            textDecoration: "none",
            display: { xs: "none", md: "block" }
          }}
        >
          <LogoGeneric height={24} width={24} />
        </Typography>

        {/* Mobile Title - shown when drawer hamburger is present */}
        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{
            flexGrow: 1,
            color: "inherit", 
            textDecoration: "none",
            display: { xs: "block", md: "none" }
          }}
        >
          🧬 OA
        </Typography>

        <Box sx={{ display: { xs: "none", md: "flex" } }}>
          <StyledButton
            color="inherit"
            component={Link}
            href="/search"
          >
            Search
          </StyledButton>
          {visibleNavItems.map((item) => (
            <StyledButton
              key={item.segment}
              color="inherit"
              component={Link}
              href={`/${item.segment}`}
            >
              {item.plural}
            </StyledButton>
          ))}
          <StyledButton
            color="inherit"
            component={Link}
            href={isAuthenticated ? "/api/auth/signout" : "/api/auth/signin"}
          >
            {isAuthenticated ? `Sign Out (${userName})` : "Sign In"}
          </StyledButton>
        </Box>
      </Toolbar>
    </AppBar>
  )
} 