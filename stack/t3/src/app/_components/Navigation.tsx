"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { NAVITEMS } from "~/types/types"
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  Divider,
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"

const DRAWER_WIDTH = 240

export default function Navigation() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const isAuthenticated = status === "authenticated"
  const isAdmin = session?.user?.role === "admin"
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [mobileOpen, setMobileOpen] = useState(false)

  // Filter nav items based on permissions
  const visibleNavItems = NAVITEMS.filter(item => {
    switch (item.permissions) {
      case "IsAdmin":
        return isAuthenticated && isAdmin
      case "IsAuthenticated":
        return isAuthenticated
      case "IsAuthenticatedOrReadOnly":
      case "AllowAny":
      default:
        return true
    }
  })

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const navigationLinks = (
    <>
      <Link href="/search" passHref>
        <Button color="inherit" sx={{ textTransform: "none" }}>
          Search
        </Button>
      </Link>
      <Divider orientation="vertical" flexItem />
      {visibleNavItems.map((item) => (
        <Link key={item.segment} href={`/${item.segment}`} passHref aria-label={item.plural}>
          <Button
            color="inherit"
            sx={{
              textTransform: "none",
              borderBottom: pathname === `/${item.segment}` ? 2 : 0,
              borderColor: "white",
            }}
          >
            {item.plural}
          </Button>
        </Link>
      ))}
    </>
  )

  const authButton = !isAuthenticated ? (
    <Link href="/api/auth/signin" passHref>
      Sign In
    </Link>
  ) : (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Typography variant="body2">
        Welcome, {session.user.name}
      </Typography>
      <Link href="/api/auth/signout" passHref>
        Sign Out
      </Link>
    </Box>
  )

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        🧬 Helix.AI
      </Typography>
      <List>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            href={`/search`}
            selected={pathname === `/search`}
          >
            <ListItemText primary={'Search'} />
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
              primary={isAuthenticated ? "Sign Out" : "Sign In"}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  )

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: "grey.900" }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Link href="/"><Typography
            variant="h6"
            component="div"
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            🧬
          </Typography>
          </Link>
          <Box
            aria-label="Main Navigation"
            sx={{
              ml: 2,
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              gap: 2,
            }}
          >
            {navigationLinks}
          </Box>
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            {authButton}
          </Box>
        </Toolbar>
      </AppBar>

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