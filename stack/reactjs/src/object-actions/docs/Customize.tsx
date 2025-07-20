import React from "react";
import { Box, FormHelperText, Typography } from "@mui/material";
import { Command, StyledPaper, StyledTypography } from "../components/StyledComponents";
import EnvBuilder from "../forming/EnvBuilder";
import SpreadsheetCards from "./SpreadsheetCards";
import { NeedHelp } from "./NeedHelp";

const Customize: React.FC = () => {

  return (
    <Box>
      <StyledTypography variant="h1"> Customize </StyledTypography>
      <StyledTypography variant="subtitle1">
        Follow these steps replace the demo data structure and permissions with your app idea
      </StyledTypography>

      <StyledPaper>
        <Typography variant="h6">
          1. Document your data structures and user permissions
        </Typography>
        <FormHelperText>
          You do not to need to finish them before continuing. You can rebuild
          you stack at any time as you refine your idea.
        </FormHelperText>

        <SpreadsheetCards />
      </StyledPaper>

      <StyledPaper>
        <Typography variant="h6" sx={{ marginBottom: 2 }}>
          2. Adjust the settings below, then click "Copy Settings"
        </Typography>
        <EnvBuilder displayProperties={["TYPES_PATH", "PERMISSIONS_PATH"]} />
      </StyledPaper>

      <StyledPaper>
        <Typography variant="h6">3. Rebuild the whole stack with your models and access rules:</Typography>
        <Command
          command="bash builder/load-sheets.sh --env .env"
        />
      </StyledPaper>

      <StyledPaper>
        <Typography variant="h6">4. Rebuild all containers:</Typography>
        <Command
          command="docker-compose up --build -d"
        />
      </StyledPaper>


      <Box sx={{ mt: 5, mb: 5, textAlign: "right" }}>
        <NeedHelp />
      </Box>

    </Box>
  );
};

export default Customize;
