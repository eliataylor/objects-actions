import React from "react";
import { Grid, Typography } from "@mui/material";
import OALogo from "./OALogo";

interface PrivacyProps {
  section?: string;
}

const Privacy: React.FC<PrivacyProps> = ({ section = "privacy" }) => {
  return (
    <Grid id={"OAPrivacyScreen"} container direction={"column"}>
      <Grid item>
        <OALogo height={80} />
      </Grid>
      <Grid item>
        <Typography variant={"h4"}>Objects / Actions</Typography>
        <Typography variant={"body1"}>
          We do not sell any data, to anyone, for any reason, ever.
        </Typography>
        <Typography variant={"body2"}>
          We use cookies to track how visitors navigate this site and to track
          your session if you log in.
        </Typography>
      </Grid>
    </Grid>
  );
};

export default Privacy;
