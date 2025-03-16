import React from "react";
import { CircularProgress, Grid, SvgIcon } from "@mui/material";
import { ReactComponent as LOGO } from "../logo.svg";

interface SplashScreenProps {
  loading?: string;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ loading = undefined }) => {
  const toPass = {
    sx: {
      height: "auto!important",
      filter: `drop-shadow(0 2px 2px rgba(114, 134, 71, 0.6))`,
      fontSize: 100
    }
  };

  return (
    <Grid
      id={"SplashScreen"}
      container
      direction={"column"}
      gap={4}
      justifyContent={"space-around"}
      sx={{
        textAlign: "center",
        height: "100vh",
        maxWidth: 400,
        margin: "0 auto"
      }}
    >
      <Grid item>{loading}</Grid>
      <Grid item>
        <SvgIcon
          viewBox="0 0 292 116"
          component={LOGO}
          {...toPass}
          inheritViewBox
        />
      </Grid>
      <Grid item>
        <CircularProgress style={{ marginTop: 50, marginBottom: 50 }} />
      </Grid>
    </Grid>
  );
};

export default SplashScreen;
