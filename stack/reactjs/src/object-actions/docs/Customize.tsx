import React from 'react';
import { Box, FormHelperText, Typography } from '@mui/material';
import { Command, StyledPaper, StyledTypography } from '../components/StyledComponents';
import EnvBuilder from '../forming/EnvBuilder';
import SpreadsheetCards from './SpreadsheetCards';

const Customize: React.FC = () => {

  return (
    <Box>
      <StyledTypography variant="h1"> Customize </StyledTypography>
      <StyledTypography variant="subtitle1">
        Follow these steps to customize your setup:
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
        <Typography variant="h6" sx={{marginBottom:2}} >
          2. Adjust the settings below, then click "Copy Settings"
        </Typography>
        <EnvBuilder  displayProperties={['TYPES_PATH', 'PERMISSIONS_PATH']} />
      </StyledPaper>

      <StyledPaper>
        <Typography variant="h6">3. Rebuild the whole stack with your models and access rules:</Typography>
        <Command
          command="bash load-sheets.sh --env .env"
        />
      </StyledPaper>
    </Box>
  );
};

export default Customize;
