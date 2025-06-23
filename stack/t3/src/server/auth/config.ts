import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import SpotifyProvider from "next-auth/providers/spotify";
import LinkedInProvider from "next-auth/providers/linkedin";
import NextAuth from "next-auth";

import { db } from "~/server/db";
import { env } from "~/env";

import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "~/server/db/schema";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
  }
}

/**
 * Authenticate user with Django allauth after OAuth success
 */
async function authenticateWithDjango(
  account: any, 
  profile: any
): Promise<{ sessionToken?: string; error?: string }> {
  try {
    // Use direct process.env access on server-side
    const djangoApiUrl = process.env.REACT_APP_API_HOST || process.env.NEXT_PUBLIC_API_HOST || "https://localapi.oaexample.com:8081";
    
    // Prepare the provider token data for Django allauth
    const providerData = {
      provider: account.provider,
      access_token: account.access_token,
      refresh_token: account.refresh_token,
      expires_at: account.expires_at,
      token_type: account.token_type,
      scope: account.scope,
      id_token: account.id_token,
    };

    // Use Django allauth's provider token endpoint
    const response = await fetch(`${djangoApiUrl}/_allauth/browser/v1/auth/provider/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        provider: account.provider,
        token: providerData,
        process: 'login'
      }),
    });

    const result = await response.json();
    
    if (result.status === 200 && result.meta?.session_token) {
      return { sessionToken: result.meta.session_token };
    } else {
      console.error('Django authentication failed:', result);
      return { error: result.message || 'Django authentication failed' };
    }
  } catch (error) {
    console.error('Error authenticating with Django:', error);
    return { error: 'Failed to authenticate with Django' };
  }
}

/**
 * Build providers array conditionally based on environment variables
 */
function buildProviders() {
  const providers: any[] = [];

  // Always include Discord for now
  providers.push(
    DiscordProvider({
      clientId: env.AUTH_DISCORD_ID,
      clientSecret: env.AUTH_DISCORD_SECRET,
    })
  );

  // Add Google if configured
  if (env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: env.GOOGLE_OAUTH_CLIENT_ID,
        clientSecret: env.GOOGLE_OAUTH_SECRET,
        authorization: {
          params: {
            scope: "profile email",
            access_type: "offline",
            prompt: "consent",
          },
        },
      })
    );
  }

  // Add GitHub if configured
  if (env.GITHUB_CLIENT_ID && env.GITHUB_SECRET) {
    providers.push(
      GitHubProvider({
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_SECRET,
        authorization: {
          params: {
            scope: "user:email",
          },
        },
      })
    );
  }

  // Add Spotify if configured
  if (env.SPOTIFY_CLIENT_ID && env.SPOTIFY_SECRET) {
    providers.push(
      SpotifyProvider({
        clientId: env.SPOTIFY_CLIENT_ID,
        clientSecret: env.SPOTIFY_SECRET,
        authorization: {
          params: {
            scope: "user-read-email",
          },
        },
      })
    );
  }

  // Add LinkedIn if configured
  if (env.LINKEDIN_CLIENT_ID && env.LINKEDIN_SECRET) {
    providers.push(
      LinkedInProvider({
        clientId: env.LINKEDIN_CLIENT_ID,
        clientSecret: env.LINKEDIN_SECRET,
        authorization: {
          params: {
            scope: "r_liteprofile r_emailaddress",
          },
        },
      })
    );
  }

  return providers;
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: buildProviders(),
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  callbacks: {
    async signIn({ user, account, profile }) {
      // For OAuth providers, authenticate with Django
      if (account?.type === "oauth" && account.provider !== "credentials") {
        const djangoAuth = await authenticateWithDjango(account, profile);
        
        if (djangoAuth.error) {
          console.error("Django authentication failed:", djangoAuth.error);
          // You might want to handle this differently based on your requirements
          // For now, we'll continue with NextAuth.js only
        }
        
        // Store Django session token in user session (you can customize this storage)
        if (djangoAuth.sessionToken) {
          console.log("Django session token received:", djangoAuth.sessionToken);
          // You can store this in your database or handle it as needed
        }
      }
      
      return true;
    },
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        role: user.role,
      },
    }),
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
} satisfies NextAuthConfig;

/**
 * Full configuration for NextAuth.js with database adapter
 * This is only used in Node.js environment (API routes, Server actions)
 */
export const { auth, handlers } = NextAuth(authConfig);

// Helper to get server-side session
export const getServerAuthSession = () => auth();
