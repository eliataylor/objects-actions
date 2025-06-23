"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button, Card, CardContent, Typography, Box, Chip } from "@mui/material";
import { createDjangoAuthClient, type DjangoAuthResponse } from "~/lib/django-auth";

interface DjangoAuthState {
  isAuthenticated: boolean;
  loading: boolean;
  data?: any;
  error?: string;
}

export default function AuthStatus() {
  const { data: session, status } = useSession();
  const [djangoAuth, setDjangoAuth] = useState<DjangoAuthState>({
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    const checkDjangoAuth = async () => {
      try {
        const client = createDjangoAuthClient();
        const response: DjangoAuthResponse = await client.getAuth();
        
        setDjangoAuth({
          isAuthenticated: response.meta?.is_authenticated || false,
          loading: false,
          data: response.data,
        });
      } catch (error) {
        setDjangoAuth({
          isAuthenticated: false,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to check Django auth",
        });
      }
    };

    if (status !== "loading") {
      checkDjangoAuth();
    }
  }, [status]);

  const handleSignOut = async () => {
    // Sign out from Django first if authenticated
    if (djangoAuth.isAuthenticated) {
      try {
        const client = createDjangoAuthClient();
        await client.logout();
      } catch (error) {
        console.error("Failed to logout from Django:", error);
      }
    }
    
    // Then sign out from NextAuth
    await signOut({ callbackUrl: "/" });
  };

  if (status === "loading" || djangoAuth.loading) {
    return (
      <Card sx={{ maxWidth: 600, margin: "auto", mt: 4 }}>
        <CardContent>
          <Typography>Loading authentication status...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ maxWidth: 600, margin: "auto", mt: 4 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Authentication Status
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            NextAuth.js Status
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Chip 
              label={session ? "Authenticated" : "Not Authenticated"}
              color={session ? "success" : "error"}
            />
            {session && (
              <Typography variant="body2">
                Provider: {session.user.id ? "Connected" : "Unknown"}
              </Typography>
            )}
          </Box>
          
          {session && (
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2"><strong>Name:</strong> {session.user.name}</Typography>
              <Typography variant="body2"><strong>Email:</strong> {session.user.email}</Typography>
              <Typography variant="body2"><strong>ID:</strong> {session.user.id}</Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Django Allauth Status
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Chip 
              label={djangoAuth.isAuthenticated ? "Authenticated" : "Not Authenticated"}
              color={djangoAuth.isAuthenticated ? "success" : "error"}
            />
            {djangoAuth.error && (
              <Chip 
                label="Error"
                color="warning"
                size="small"
              />
            )}
          </Box>
          
          {djangoAuth.error && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              Error: {djangoAuth.error}
            </Typography>
          )}
          
          {djangoAuth.data && (
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2">
                <strong>Available Flows:</strong> {djangoAuth.data.flows?.map((f: any) => f.id).join(", ")}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {session ? (
            <Button variant="contained" color="error" onClick={handleSignOut}>
              Sign Out (Both Systems)
            </Button>
          ) : (
            <Button variant="contained" href="/auth/signin">
              Sign In
            </Button>
          )}
        </Box>
        
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="caption" display="block">
            <strong>Integration Status:</strong>
          </Typography>
          <Typography variant="caption">
            • NextAuth.js handles OAuth flows with multiple providers<br/>
            • Django allauth receives and validates OAuth tokens<br/>
            • Sessions are maintained in both systems<br/>
            • Sign out clears both NextAuth.js and Django sessions
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
} 