import React from 'react';
import { Grid, MenuItem, TextField } from '@mui/material';
import { EnvConfig, useEnvContext } from '../EnvProvider';

const EnvEditor: React.FC = () => {
  const { envConfig, setEnvConfig } = useEnvContext();

  const handleChange = (key: keyof EnvConfig, value: string) => {
    setEnvConfig({ ...envConfig, [key]: value });
  };

  const renderEnv = () => {
    return `# The name of your project. The cloned directory will be derived from this name
PROJECT_NAME=${envConfig.PROJECT_NAME}

# By default this is the stack folder in this repo, but you can point it elsewhere
STACK_PATH=${envConfig.STACK_PATH}

# Your Worksheet's "Object Fields" sheet (required to customize, but not to run the default stack)
TYPES_PATH=${envConfig.TYPES_PATH}

#### Your API Server protocol:host:port ####
REACT_APP_API_HOST=${envConfig.REACT_APP_API_HOST}

#### Your Webapp Server protocol:host:port ####
REACT_APP_APP_HOST=${envConfig.REACT_APP_APP_HOST}

# Your API admin login
REACT_APP_LOGIN_EMAIL=${envConfig.REACT_APP_LOGIN_EMAIL}

# Your API admin password
REACT_APP_LOGIN_PASS=${envConfig.REACT_APP_LOGIN_PASS}

# the location of mysql server: docker | local | gcp
OA_ENV_DB=${envConfig.OA_ENV_DB}

# how are emails sent: console | files | gmail | sendgrid
OA_ENV_EMAIL=${envConfig.OA_ENV_EMAIL}

# where to store static files: gcp | local
OA_ENV_STORAGE=${envConfig.OA_ENV_STORAGE}
`;
  };

  return (
    <Grid container justifyContent={'space-between'} spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Project Name"
          required={true}
          value={envConfig.PROJECT_NAME}
          onChange={(e) => handleChange('PROJECT_NAME', e.target.value)}
          variant="outlined"
          size="small"
          helperText={'A machine name will be derived from this'}
          sx={{ mb: 2 }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Stack Path"
          required={true}
          value={envConfig.STACK_PATH}
          onChange={(e) => handleChange('STACK_PATH', e.target.value)}
          variant="outlined"
          size="small"
          helperText={
            'An absolute directory path to put the code. A period (.) will overwrite this project'
          }
          sx={{ mb: 2 }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Object Types CSV"
          required={true}
          value={envConfig.TYPES_PATH}
          onChange={(e) => handleChange('TYPES_PATH', e.target.value)}
          variant="outlined"
          size="small"
          helperText={
            'Absolute file path to your Object Fields CSV Spreadsheet'
          }
          sx={{ mb: 2 }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Permission Matrix CSV"
          required={true}
          value={envConfig.PERMISSIONS_PATH}
          onChange={(e) => handleChange('PERMISSIONS_PATH', e.target.value)}
          variant="outlined"
          size="small"
          helperText={
            'Absolute file path to your Permissions Matrix CSV Spreadsheet'
          }
          sx={{ mb: 2 }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Your API Server"
          value={envConfig.REACT_APP_API_HOST}
          onChange={(e) => handleChange('REACT_APP_API_HOST', e.target.value)}
          variant="outlined"
          size="small"
          helperText={'Your API WebServer URL'}
          sx={{ mb: 2 }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Your WebApp URL"
          value={envConfig.REACT_APP_APP_HOST}
          onChange={(e) => handleChange('REACT_APP_APP_HOST', e.target.value)}
          variant="outlined"
          size="small"
          helperText={'Your WebApp URL'}
          sx={{ mb: 2 }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Admin Email"
          value={envConfig.REACT_APP_LOGIN_EMAIL}
          onChange={(e) =>
            handleChange('REACT_APP_LOGIN_EMAIL', e.target.value)
          }
          variant="outlined"
          size="small"
          sx={{ mb: 2 }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Admin Password"
          value={envConfig.REACT_APP_LOGIN_PASS}
          onChange={(e) => handleChange('REACT_APP_LOGIN_PASS', e.target.value)}
          variant="outlined"
          size="small"
          sx={{ mb: 2 }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          select
          fullWidth
          label="Where do you want your database"
          value={envConfig.OA_ENV_DB}
          onChange={(e) => handleChange('OA_ENV_DB', e.target.value)}
          variant="outlined"
          size="small"
          sx={{ mb: 2 }}
          helperText={''}
        >
          <MenuItem value="docker">Inside Docker</MenuItem>
          <MenuItem value="local">
            Locally (first run `sudo docs/os-mysql-install.sh`)
          </MenuItem>
          <MenuItem value="gcp">
            Google Cloud Platform (first follow django/deploy/README.md)
          </MenuItem>
        </TextField>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          select
          fullWidth
          label="OA_ENV_EMAIL"
          value={envConfig.OA_ENV_EMAIL}
          onChange={(e) => handleChange('OA_ENV_EMAIL', e.target.value)}
          variant="outlined"
          size="small"
          sx={{ mb: 2 }}
        >
          <MenuItem value="console">console</MenuItem>
          <MenuItem value="files">files</MenuItem>
          <MenuItem value="gmail">gmail</MenuItem>
          <MenuItem value="sendgrid">sendgrid</MenuItem>
        </TextField>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          select
          fullWidth
          label="OA_ENV_STORAGE"
          value={envConfig.OA_ENV_STORAGE}
          onChange={(e) => handleChange('OA_ENV_STORAGE', e.target.value)}
          variant="outlined"
          size="small"
          sx={{ mb: 2 }}
        >
          <MenuItem value="gcp">gcp</MenuItem>
          <MenuItem value="local">local</MenuItem>
        </TextField>
      </Grid>

      <Grid item xs={12}>
        <TextField
          InputProps={{
            readOnly: true,
          }}
          fullWidth={true}
          multiline={true}
          rows={2}
          sx={{ mt: 3 }}
          helperText={'Copy and paste this into your .env.myproject'}
          value={renderEnv()}
        />
      </Grid>
    </Grid>
  );
};

export default EnvEditor;
