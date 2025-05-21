import React from "react";
import { Box } from "@mui/material";
import { Command, StyledPaper, StyledTypography } from "../components/StyledComponents";
import EnvBuilder from "../forming/EnvBuilder";
import { useEnvContext } from "../forming/EnvProvider";
import { NeedHelp } from "./NeedHelp";

const Extend: React.FC = () => {
  const { envConfig } = useEnvContext();

  return (
    <Box>
      <StyledTypography variant="h1">Extend</StyledTypography>
      <StyledTypography variant="subtitle1">
        This will clones and renames everything according to your project name and settings below
      </StyledTypography>

      <StyledPaper>
        <StyledTypography variant="subtitle2" sx={{ mb: 3 }}>
          1. Name your project and any settings below, then click "Copy Settings"
        </StyledTypography>
        <EnvBuilder displayProperties={["PROJECT_NAME", "STACK_PATH", "TYPES_PATH", "PERMISSIONS_PATH"]} />
      </StyledPaper>

      <StyledPaper>
        <StyledTypography variant="subtitle2" sx={{ mb: 3 }}>
          2. Clone and rename "oaexample.com" as your own stack
        </StyledTypography>
        <Command command="bash clone.sh --env .env" />
      </StyledPaper>

      {envConfig.STACK_PATH !== "." && (
        <StyledPaper>
          <Command command={`cd ${envConfig.STACK_PATH}`} />
        </StyledPaper>
      )}

      <StyledPaper>
        <StyledTypography variant="subtitle2" sx={{ mb: 3 }}>
          3. Version control from the beginning to track your changes
        </StyledTypography>
        <Command command="git init" />
        <Command command="git commit -am 'initial objects/actions out-of-the-box'" />
      </StyledPaper>

      <StyledPaper>
        <StyledTypography variant="subtitle2" sx={{ mb: 3 }}>
          4. Start your stack
        </StyledTypography>
        <Command command="docker-compose up --build -d" />
      </StyledPaper>


      <Box sx={{ mt: 5, mb: 5, textAlign: "right" }}>
        <NeedHelp />
      </Box>

    </Box>
  );
};

export default Extend;
