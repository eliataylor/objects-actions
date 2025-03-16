import React from "react";
import { Grid, Typography } from "@mui/material";
import OALogo from "../object-actions/docs/OALogo";

interface PrivacyProps {
  section?: string;
}

const Privacy: React.FC<PrivacyProps> = ({ section = "privacy" }) => {
  return (
    <Grid id={"PrivacyScreen"} container direction={"column"} spacing={4}>
      <Grid item>
        <OALogo height={80} />
        <Typography variant={"h4"}>Objects / Actions</Typography>
      </Grid>
      <Grid item>
        <Typography variant={"subtitle1"}>
          We do not sell any data, to anyone, for any reason, ever.
        </Typography>
      </Grid>
      <Grid item>
        <Typography variant={"subtitle1"}>
          We use cookies to track how visitors navigate this site and to track
          your session if you log in.
        </Typography>
      </Grid>
      <Grid item>
        <Typography variant={"subtitle1"}>
          Objects/Actions is distributed with a Google Analytics tag installed. You can remove it from your <a target="_blank" rel="noreferrer"
                                                                                                               href={"https://github.com/eliataylor/objects-actions/blob/main/stack/reactjs/public/index.html#L12"}>stack/reactjs/public/index.html</a> file
          and also the tracking consent for from <a target="_blank" rel="noreferrer"
                                                    href={"https://github.com/eliataylor/objects-actions/blob/main/stack/reactjs/src/theme/Layout.tsx"}>stack/reactjs/src/theme/Layout.tsx</a>
        </Typography>
      </Grid>
    </Grid>
  );
};

export default Privacy;
