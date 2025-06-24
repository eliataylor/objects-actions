import React, { createContext, ReactNode, useEffect, useState } from "react";
import { getAuth, getConfig } from "../lib/allauth";
import Snackbar from "@mui/material/Snackbar";
import SplashScreen from "../../screens/SplashScreen";

// these are only to allow navigating the site when the backend is down
const DEFAULT_SESSION = {
  status: 401,
  data: {
    flows: [
      { id: "login" },
      { id: "login_by_code" },
      { id: "signup" },
      {
        id: "provider_redirect",
        providers: ["spotify", "google", "github", "openid_connect"]
      },
      { id: "provider_token", providers: ["google"] },
      { id: "mfa_login_webauthn" }
    ]
  },
  meta: { is_authenticated: false }
};

// these are only to allow navigating the site when the backend is down
const DEFAULT_CONFIG = {
  status: 200,
  data: {
    account: {
      authentication_method: "email",
      is_open_for_signup: true,
      email_verification_by_code_enabled: false,
      login_by_code_enabled: true
    },
    socialaccount: {
      providers: [
        {
          id: "github",
          name: "GitHub",
          flows: ["provider_redirect"],
          client_id: "Ov23liMt9OSwBWUx3K2B"
        },
        {
          id: "google",
          name: "Google",
          flows: ["provider_redirect", "provider_token"],
          client_id:
            "121404103584-ffcklo3m08j9q8i1bgofietqufckeoq3.apps.googleusercontent.com"
        },
        {
          id: "linkedin",
          name: "LinkedIn",
          flows: ["provider_redirect"],
          client_id: "86dmw4dtb2ru2c"
        },
        {
          id: "spotify",
          name: "Spotify",
          flows: ["provider_redirect"],
          client_id: "5be53fb5c7d843d18d1eac8176cea7ff"
        }
      ]
    },
    mfa: {
      supported_types: ["totp", "recovery_codes", "webauthn"],
      passkey_login_enabled: true
    },
    usersessions: { track_activity: false }
  }
};

interface AuthContextType {
  auth: any;
  config: any;
}

interface Props {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | null>(null);

function Loading({ msg = "" }) {
  return <SplashScreen loading={msg} />;
}

function LoadingError({ msg = "" }) {
  return <SplashScreen loading={msg} />;
}

export function AuthContextProvider({ children }: Props) {
  const [auth, setAuth] = useState<any | undefined>(undefined);
  const [config, setConfig] = useState<any | undefined>(undefined);
  const [snack, showSnackBar] = useState<string>("");
  const [error, setError] = useState<string>("");

  const closeSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    showSnackBar("");
  };

  useEffect(() => {
    const onAuthChanged = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setAuth((prevAuth: any) => {
        if (typeof prevAuth === "undefined") {
          console.log("Authentication status loaded", detail);
        } else {
          if (
            detail?.meta.is_authenticated === false &&
            Array.isArray(detail?.data?.flows)
          ) {
            const pending: string[] = [];
            detail.data.flows.forEach((flow: { [key: string]: any }) => {
              if (flow.is_pending === true) {
                if (flow.id === "verify_email") {
                  pending.push(`Please verify your email`);
                } else {
                  pending.push(`${flow.id} is pending`);
                }
              }
            });
            if (pending.length > 0) {
              showSnackBar(pending.join(", \n"));
            }
          }
          // check if something is pending !
          console.log("Authentication status updated", detail);
        }
        return detail;
      });
    };

    document.addEventListener("allauth.auth.change", onAuthChanged);

    getAuth()
      .then((data) => {
        setError("");
        setAuth(data);
      })
      .catch((e) => {
        console.error(e);
        setError(e.message);
        setAuth(DEFAULT_SESSION);
      });

    getConfig()
      .then((data) => {
        setError("");
        setConfig(data);
      })
      .catch((e) => {
        console.error(e);
        setError(e.message);
        setConfig(DEFAULT_CONFIG);
      });

    return () => {
      document.removeEventListener("allauth.auth.change", onAuthChanged);
    };
  }, []);

  const loading = typeof auth === "undefined" || config?.status !== 200;

  return (
    <AuthContext.Provider value={{ auth, config }}>
      <Snackbar
        sx={{ color: "primary.main" }}
        open={snack.length > 0}
        autoHideDuration={8000}
        onClose={closeSnackbar}
        message={snack}
      />
      {loading ? (
        <Loading msg={error} />
      ) : auth === false ? (
        <LoadingError msg={error} />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
