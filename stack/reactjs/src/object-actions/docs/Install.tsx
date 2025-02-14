import React from "react";
import { Box, Typography } from "@mui/material";
import { Command, StyledPaper, StyledTypography } from "../components/StyledComponents";
import { useEnvContext } from "../forming/EnvProvider";
import OutputLinks from "./OutputLinks";
import EnvBuilder from "../forming/EnvBuilder";

const Install: React.FC = () => {
  const { envConfig } = useEnvContext();

  function hasCustomDomain() {
    return (envConfig.REACT_APP_APP_HOST.indexOf("://localhost") < 0 && envConfig.REACT_APP_APP_HOST.indexOf("://127.0.0.1") < 0) ||
      (envConfig.REACT_APP_API_HOST.indexOf("://localhost") < 0 && envConfig.REACT_APP_API_HOST.indexOf("://127.0.0.1") < 0);
  }

  return (
    <Box>
      <StyledTypography variant="h1">Run Demo</StyledTypography>
      <StyledTypography variant="subtitle1">
        This will build the full stack based on an example application.
      </StyledTypography>


      <Command
        command="git clone git@github.com:eliataylor/object-actions.git --depth 1"
        help={
          <>
            <b>or</b> if you get SSL errors, try
            <code>
              {" "}
              <em>
                git clone https://github.com/eliataylor/object-actions.git
              </em>
            </code>
          </>
        }
      />

      <Command command="cd object-actions" />

      <StyledPaper>
        <Typography variant="body1" sx={{ marginBottom: 3 }}>
          Set your front and backend URLs, click "Copy Settings" and paste the clipboard into a .env in the project root
        </Typography>
        <EnvBuilder displayProperties={["REACT_APP_API_HOST", "REACT_APP_APP_HOST"]} />
      </StyledPaper>

      <Command command="sh set-env-vars.sh --env .env" />

      {hasCustomDomain() && <div style={{ marginTop: 20 }}><Command
        command="sudo bash docs/os-hosts-install.sh"
        help={
          <>
            This will add a entry to your computers `/etc/hosts` so that {envConfig.REACT_APP_APP_HOST} and {envConfig.REACT_APP_API_HOST} resolve to your local development
            environment.
            It will also backup the original as `/etc/hosts.bak.timestamp`
          </>
        }
      /></div>
      }

      <Command command="docker-compose up --build -d" />

      <div style={{ marginTop: 50 }}>

        <OutputLinks />

        <StyledTypography variant="subtitle2">
          All tools will be mounted locally, so you can make edits and test your changes immediately. For example, you can reskin the web app starting with your <a
          href={"https://github.com/eliataylor/objects-actions/blob/0426b1d48a5d59f0776a38a453a854a6c415a38f/stack/reactjs/src/theme/ThemeContext.js#L15"}
          target={"_blank"}>stack/reactjs/src/theme/ThemeContext.js</a>.

          Or you can change the default API permissions for any view starting here <a
          href={"https://github.com/eliataylor/objects-actions/blob/0fb527b9a8899cc5a5b42cf81d027b4b0a4a094f/stack/django/oaexample_app/views.py#L117"}
          target={"_blank"}>stack/django/oaexample_app/views.py#L117</a>
        </StyledTypography>
      </div>


    </Box>
  );
};

export default Install;
