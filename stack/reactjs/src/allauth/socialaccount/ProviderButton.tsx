import { AuthProcess, redirectToProvider } from "../lib/allauth";
import { Button, SvgIcon } from "@mui/material";
import React from "react";
import { ReactComponent as Spotify } from "../logos/spotify.svg";
import { ReactComponent as AppleMusic } from "../logos/applemusic.svg";
import { ReactComponent as Apple } from "../logos/apple.svg";
import { ReactComponent as Google } from "../logos/google.svg";
import { WifiPassword } from "@mui/icons-material";
import GoogleInAppButton from "../GoogleInAppButton";

interface ProviderButtonProps {
  provider: any;
  connected: boolean;
}

const ProviderButton: React.FC<ProviderButtonProps> = ({
                                                         provider,
                                                         connected
                                                       }) => {
  function getIcon(provider: string) {
    if (provider === "apple") {
      return <SvgIcon fontSize={"large"} component={Apple} inheritViewBox />;
    } else if (provider === "applemusic") {
      return (
        <SvgIcon
          viewBox="0 0 136.46001 162.0049"
          component={AppleMusic}
          inheritViewBox
        />
      );
    } else if (provider === "google") {
      return <Google />;
    } else if (provider === "spotify") {
      return (
        <SvgIcon viewBox="0 0 496 512" component={Spotify} inheritViewBox />
      );
    }
    return null;
  }

  if (localStorage.getItem("appOS") && provider.id === "google") {
    if (window.location.search.indexOf("useOauth") > -1) {
      return <GoogleInAppButton isConnected={connected} />;
    } else {
      return null; // doesn't work in webview
    }
  }

  // @ts-ignore
  return (
    <Button
      startIcon={getIcon(provider.id)}
      endIcon={connected ? <WifiPassword /> : undefined}
      key={provider.id}
      fullWidth
      variant={"outlined"}
      color={"inherit"}
      onClick={() =>
        redirectToProvider(
          provider.id,
          "/account/provider/callback",
          /* @ts-ignore */
          AuthProcess.CONNECT
        )
      }
    >
      {provider.name}
    </Button>
  );
};

export default ProviderButton;
