"use client"

import { useState } from "react"
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { NAVITEMS } from "~/types/types"

const DRAWER_WIDTH = 240

interface MobileDrawerProps {
  isAuthenticated?: boolean
  isAdmin?: boolean
  userName?: string
}

export function MobileDrawer({ 
  isAuthenticated = false, 
  isAdmin = false,
  userName 
}: MobileDrawerProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  // Filter nav items based on permissions (same logic as main nav)
  const visibleNavItems = NAVITEMS.filter(item => item.model_type !== 'vocabulary')

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        🧬 Object Actions
      </Typography>
      <List>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            href="/search"
            selected={pathname === "/search"}
          >
            <ListItemText primary="Search" />
          </ListItemButton>
        </ListItem>
        {visibleNavItems.map((item) => (
          <ListItem key={item.segment} disablePadding>
            <ListItemButton
              component={Link}
              href={`/${item.segment}`}
              selected={pathname === `/${item.segment}`}
            >
              <ListItemText primary={item.plural} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            href={isAuthenticated ? "/api/auth/signout" : "/api/auth/signin"}
          >
            <ListItemText
              primary={isAuthenticated ? `Sign Out (${userName})` : "Sign In"}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  )

  return (
    <>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{ mr: 2, display: { md: "none" } }}
      >
        <MenuIcon />
      </IconButton>

      <Box component="nav">
        <Drawer
          aria-label="Main Navigation"
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </>
  )
} 