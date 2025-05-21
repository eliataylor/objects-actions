import React, { useEffect, useState } from "react";
import { Alert, CircularProgress } from "@mui/material";
import { ReactComponent as Google } from "./logos/google.svg";
import { WifiPassword } from "@mui/icons-material";
import { ButtonPill } from "../theme/StyledFields";

interface AuthMessage {
  type: string;
  provider: string;
  error?: string;
  cookie?: string;
  token?: string;
}

const GoogleInAppButton: React.FC<{ isConnected: boolean }> = ({
                                                                 isConnected = false
                                                               }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to send a message to Flutter WebView
  const sendAuthRequest = () => {
    setLoading(true);
    const message: AuthMessage = {
      type: "auth-request",
      provider: "google"
    };

    // Send a message to Flutter WebView to initiate the OAuth process
    window.postMessage(JSON.stringify(message), process.env.REACT_APP_APP_HOST || "*");
  };

  // Function to handle messages from Flutter WebView
  const handleMessageFromFlutter = (event: MessageEvent) => {
    try {
      const message: AuthMessage =
        typeof event.data === "string" ? JSON.parse(event.data) : event.data;

      console.log("FROM FLUTTER: ", message);
      // Process the token received from Flutter
      if (
        typeof message === "object" &&
        message.provider === "google" &&
        message.type === "auth-response"
      ) {
        setLoading(false);
        setError(JSON.stringify(message)); // TODO: set cookie or token and navigate to "next" param or home
      }
    } catch (error) {
      // @ts-ignore
      setError("BAD PARSE" + error.toString());
      console.error("Error handling message from Flutter:", error);
    }
  };

  // Listen for messages from Flutter WebView
  useEffect(() => {
    window.addEventListener("message", handleMessageFromFlutter);

    return () => {
      window.removeEventListener("message", handleMessageFromFlutter);
    };
  }, []);

  return (
    <React.Fragment>
      <ButtonPill
        onClick={sendAuthRequest}
        startIcon={loading ? <CircularProgress size={20} /> : <Google />}
        disabled={loading}
        endIcon={isConnected ? <WifiPassword /> : undefined}
        fullWidth
        variant={"outlined"}
        color={"inherit"}
      >
        Google
      </ButtonPill>
      {error && <Alert severity="error">{error}</Alert>}
    </React.Fragment>
  );
};

export default GoogleInAppButton;
