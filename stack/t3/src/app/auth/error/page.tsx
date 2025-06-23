"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@mui/material";
import Link from "next/link";

const errors: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification token has expired or has already been used.",
  Default: "Unable to sign in.",
};

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-[3rem]">
            Authentication Error
          </h1>
          <p className="mt-4 text-xl text-red-400">
            {error && errors[error] ? errors[error] : errors.Default}
          </p>
          {error && (
            <p className="mt-2 text-sm text-gray-400">
              Error code: {error}
            </p>
          )}
        </div>
        
        <div className="flex flex-col gap-4">
          <p className="text-center text-white">
            There was a problem signing you in. This could be due to:
          </p>
          <ul className="text-left text-gray-300 space-y-2">
            <li>• Network connectivity issues</li>
            <li>• OAuth provider configuration problems</li>
            <li>• Django backend authentication failure</li>
            <li>• Expired or invalid tokens</li>
          </ul>
        </div>
        
        <div className="flex gap-4">
          <Button
            component={Link}
            href="/auth/signin"
            variant="contained"
            sx={{
              backgroundColor: "white",
              color: "black",
              "&:hover": {
                backgroundColor: "#f0f0f0",
              },
            }}
          >
            Try Again
          </Button>
          <Button
            component={Link}
            href="/"
            variant="outlined"
            sx={{
              borderColor: "white",
              color: "white",
              "&:hover": {
                borderColor: "#f0f0f0",
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
} 