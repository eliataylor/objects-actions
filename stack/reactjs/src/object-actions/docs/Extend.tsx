import React from 'react';
import { Box } from '@mui/material';
import { Command, StyledPaper, StyledTypography } from '../components/StyledComponents';
import EnvBuilder from '../forming/EnvBuilder';
import { useEnvContext } from '../forming/EnvProvider';

interface Task {
  description: string;
  link: string;
}

const Extend: React.FC = () => {
  const { envConfig } = useEnvContext();

  return (
    <Box>
      <StyledTypography variant="h1">Extend</StyledTypography>
      <StyledTypography variant="subtitle1">
        This will check out the source, clone the entire stack, and renaming
        everything according to your .env settings below
      </StyledTypography>

      <StyledPaper>
        <Command
          command="git clone git@github.com:eliataylor/object-actions.git --depth=1"
          help={
            <>
              <b>or</b> if you get SSL errors, use
              <code>
                {' '}
                <em>
                  git clone https://github.com/eliataylor/object-actions.git
                </em>
              </code>
            </>
          }
        />

        <Command command="cd object-actions" />
      </StyledPaper>

      <StyledPaper>
        <Command command="cp .env .env.myproject" />
      </StyledPaper>

      <StyledPaper>
        <StyledTypography variant="subtitle2" sx={{ mb: 3 }}>
          Edit your .env.myproject
        </StyledTypography>
        <EnvBuilder displayProperties={['PROJECT_NAME', 'STACK_PATH', 'TYPES_PATH', 'PERMISSIONS_PATH']} />
      </StyledPaper>

      <StyledPaper>
        <Command command="./clone.sh --env .env.myproject" />
      </StyledPaper>

      {envConfig.STACK_PATH != '.' && (
        <StyledPaper>
          <Command command={`cd ${envConfig.STACK_PATH}`} />
        </StyledPaper>
      )}

      <StyledPaper>
        <Command command="docker-compose up --build -d" />
      </StyledPaper>
    </Box>
  );
};

export default Extend;
