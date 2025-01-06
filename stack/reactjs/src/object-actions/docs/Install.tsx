import React from 'react';
import { Box, FormHelperText, MenuItem } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import { Link } from 'react-router-dom';
import { Command, StyledPaper, StyledTypography } from '../components/StyledComponents';
import { useEnvContext } from '../EnvProvider';
import OutputLinks from './OutputLinks';

const Install: React.FC = () => {
  const { envConfig, setConfigItem } = useEnvContext();

  const method = envConfig.REACT_APP_APP_HOST;

  function changeDomain(url: string) {
    setConfigItem('REACT_APP_APP_HOST', url);
    if (url.indexOf('https:')) {
      setConfigItem(
        'REACT_APP_API_HOST',
        'https://localapi.oaxexample.com:8080',
      );
    } else {
      setConfigItem('REACT_APP_API_HOST', 'http://localhost:8080');
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
        variant={'filled'}
        fullWidth={true}
        size={'small'}
      >
        <InputLabel id="domain-label">Development Domain</InputLabel>
        <Select
          labelId="domain-label"
          id="domain"
          color={'secondary'}
          fullWidth={true}
          value={method}
          onChange={(e) => changeDomain(e.target.value)}
        >
          <MenuItem value={'https://localhost.oaexample.com:3000'}>
            https://localhost.oaexample.com:3000
          </MenuItem>
          <MenuItem value={'http://localhost:3000'}>
            http://localhost:3000
          </MenuItem>
        </Select>
        <FormHelperText>
          Start with `https:localhost.oaexample.com` if you want test 3rd party
          authentication (Google / Linkedin / Github / ... sign). See{' '}
          <Link to={'/oa/extend'}>Extending</Link> to build on your own domain
        </FormHelperText>
      </FormControl>

      <StyledPaper>
        <Command
          command="git clone git@github.com:eliataylor/object-actions.git"
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

        {method === 'https://localhost.oaexample.com:3000' && (
          <Command
            command="sudo bash docs/os-hosts-install.sh"
            help={
              <>
                This will add a entry to your computers `/etc/hosts` so that localhost.oxample.com and localapi.oxample.com resolves to your local development environment. It will also backup the original as `/etc/hosts.bak.timestamp`
              </>
            }
          />
        )}

        <Command command="docker-compose up --build -d" />
      </StyledPaper>

      <OutputLinks />
    </Box>
  );
};

export default Install;
