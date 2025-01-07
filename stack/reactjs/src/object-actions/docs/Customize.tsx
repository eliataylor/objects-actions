import React from 'react';
import { Box, FormHelperText, Typography } from '@mui/material';
import { Command, StyledPaper, StyledTypography } from '../components/StyledComponents';
import { useEnvContext } from '../EnvProvider';
import EnvBuilder from '../components/EnvBuilder';
import SpreadsheetCards from './SpreadsheetCards';

const Customize: React.FC = () => {
  const { envConfig, setConfigItem } = useEnvContext();

  const method = envConfig.REACT_APP_APP_HOST;
  return (
    <Box>
      <StyledTypography variant="h1"> Customize </StyledTypography>
      <StyledTypography variant="subtitle1">
        Follow these steps to customize your setup:
      </StyledTypography>

      <StyledPaper>
        <Typography variant="h6">
          Copy and customize your spreadsheets:
        </Typography>
        <FormHelperText>
          You do not to need to finish them before continuing. You can rebuild
          you stack as you refine your idea.
        </FormHelperText>

        <SpreadsheetCards />
      </StyledPaper>

      <StyledPaper>
        <Typography variant="h6" >
          Set the CSV paths in your .env below:
        </Typography>
        <FormHelperText sx={{ mb: 3 }}>
          The permissions matrix is optional. The server's default permission is
          `Is Authenticated or Read only`
        </FormHelperText>
        <EnvBuilder />
      </StyledPaper>

      <StyledPaper>
        <Typography variant="h6">3. Run the load script:</Typography>
        <Command
          command="./load-sheets.sh --env .env.myproject"
          help={
            <span>
              Reference your <code>.env</code> file for setup.
            </span>
          }
        />

        <Typography variant="h6">Additional Notes:</Typography>
        <FormHelperText>
          If you want to build from source, see{' '}
          <a
            href="https://github.com/eliataylor/objects-actions/blob/main/docs/FROMSOURCE.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            FROMSOURCE.md
          </a>
          . If you only want to generate code, visit{' '}
          <a
            href="https://github.com/eliataylor/objects-actions/blob/main/docs/COMMANDS.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            COMMANDS.md
          </a>
          .
        </FormHelperText>
      </StyledPaper>
    </Box>
  );
};

export default Customize;
