import React from "react";
import { Box, FormHelperText, MenuItem } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import { Link } from "react-router-dom";
import { Command, StyledPaper, StyledTypography } from "../components/StyledComponents";
import { useEnvContext } from "../forming/EnvProvider";
import OutputLinks from "./OutputLinks";

const Install: React.FC = () => {
  const { envConfig, setConfigItem } = useEnvContext();

  const method = envConfig.REACT_APP_APP_HOST;

  function changeDomain(url: string) {
    setConfigItem("REACT_APP_APP_HOST", url);
    if (url.indexOf("https:")) {
      setConfigItem(
        "REACT_APP_API_HOST",
        "https://localapi.oaxexample.com:8080"
      );
    } else {
      setConfigItem("REACT_APP_API_HOST", "http://localhost:8080");
    }
  }

  return (
    <Box>
      <StyledTypography variant="h1">Install</StyledTypography>
      <StyledTypography variant="subtitle1">
        This will check out the source code, build site website, and your full
        stack based on an example application.
      </StyledTypography>

      <FormControl
        sx={{ marginTop: 3, marginBottom: 3 }}
        variant={"filled"}
        fullWidth={true}
        size={"small"}
      >
        <InputLabel id="domain-label">Development Domain</InputLabel>
        <Select
          labelId="domain-label"
          id="domain"
          color={"secondary"}
          fullWidth={true}
          value={method}
          onChange={(e) => changeDomain(e.target.value)}
        >
          <MenuItem value={"https://localhost.oaexample.com:3000"}>
            https://localhost.oaexample.com:3000
          </MenuItem>
          <MenuItem value={"http://localhost:3000"}>
            http://localhost:3000
          </MenuItem>
        </Select>
        <FormHelperText>
          Start with `https:localhost.oaexample.com` if you want test 3rd party
          authentication (Google / Linkedin / Github / ... sign). See{" "}
          <Link to={"/oa/extend"}>Extending</Link> to build on your own domain
        </FormHelperText>
      </FormControl>

      <StyledPaper>
        <Command
          command="git clone git@github.com:eliataylor/object-actions.git --depth 1"
          help={
            <>
              <b>or</b> if you get SSL errors, use
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

        {method === "https://localhost.oaexample.com:3000" ? (
            <Command
              command="sudo bash docs/os-hosts-install.sh"
              help={
                <>
                  This will add a entry to your computers `/etc/hosts` so that localhost.oaexample.com and localapi.oaexample.com resolve to your local development environment.
                  It will also backup the original as `/etc/hosts.bak.timestamp`
                </>
              }
            />
          ) :
          <FormHelperText style={{ marginLeft: 20 }}>
            <div><b>Update full URL for `REACT_APP_API_HOST` and `REACT_APP_APP_HOST` in these files:</b></div>
            <div>`stack/django/.env`</div>
            <div>`stack/reactjs/.env.public` and/or `stack/reactjs/.env`</div>
            <br />
            <div><b>Just update to http:// for `REACT_APP_API_HOST` and `REACT_APP_APP_HOST` in these files:</b></div>
            <div>`stack/databuilder/.env.public` and/or `stack/reactjs/.env`</div>
            <div>`stack/cypress.public.json` and/or `stack/cypress.env.json`</div>
          </FormHelperText>
        }

        <Command command="docker-compose up --build -d" />
      </StyledPaper>

      <OutputLinks />

      <StyledTypography variant="subtitle1">
        All tools will be mounted locally, so you can make edits and test your changes immediately. For example, you can reskin the web app starting with your
        <a href={"https://github.com/eliataylor/objects-actions/blob/0426b1d48a5d59f0776a38a453a854a6c415a38f/stack/reactjs/src/theme/ThemeContext.js#L15"} target={"_blank"}>stack/reactjs/src/theme/ThemeContext.js</a>.

        Or you can change the default API permissions for any view starting here <a href={"https://github.com/eliataylor/objects-actions/blob/0fb527b9a8899cc5a5b42cf81d027b4b0a4a094f/stack/django/oaexample_app/views.py#L117"} target={"_blank"}>stack/django/oaexample_app/views.py#L117</a>
      </StyledTypography>


    </Box>
  );
};

export default Install;
