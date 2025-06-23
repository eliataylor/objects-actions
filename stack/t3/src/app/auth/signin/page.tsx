"use client";

import { signIn, getProviders } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { Google, GitHub } from "@mui/icons-material";

interface Provider {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
}

const providerIcons: Record<string, React.ReactNode> = {
  google: <Google />,
  github: <GitHub />,
  spotify: "🎵",
  linkedin: "💼",
  discord: "🎮",
};

export default function SignIn() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null);

  useEffect(() => {
    (async () => {
      const res = await getProviders();
      setProviders(res);
    })();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Sign In to <span className="text-[hsl(280,100%,70%)]">OA Example</span>
        </h1>
        
        <div className="flex flex-col items-center gap-4">
          <p className="text-xl text-white">Choose your preferred sign-in method:</p>
          
          <div className="flex flex-col gap-3 w-80">
            {providers &&
              Object.values(providers).map((provider) => (
                <Button
                  key={provider.name}
                  variant="contained"
                  size="large"
                  startIcon={providerIcons[provider.id]}
                  onClick={() => signIn(provider.id, { callbackUrl: "/" })}
                  sx={{
                    backgroundColor: "white",
                    color: "black",
                    "&:hover": {
                      backgroundColor: "#f0f0f0",
                    },
                    textTransform: "none",
                    fontSize: "1.1rem",
                    py: 1.5,
                  }}
                >
                  Sign in with {provider.name}
                </Button>
              ))}
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-400">
            <p>By signing in, you agree to authenticate with both NextAuth.js and our Django backend.</p>
            <p>Your session will be synchronized across both systems.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 