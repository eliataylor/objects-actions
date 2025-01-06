import React, {useState} from 'react';
import {Box, MenuItem, Paper, TextField, Typography} from '@mui/material';

const EnvEditor: React.FC = () => {
    const [projectName, setProjectName] = useState('oaexample');
    const [stackPath, setStackPath] = useState('.');
    const [typesPath, setTypesPath] = useState('src/examples/democrasee-objects.csv');
    const [permsPath, setPermsPath] = useState('src/examples/democrasee-permissions.csv');
    const [reactAppApiHost, setReactAppApiHost] = useState('https://localapi.oaexample.com:8080');
    const [reactAppAppHost, setReactAppAppHost] = useState('https://localhost.oaexample.com:3000');
    const [loginEmail, setLoginEmail] = useState('info@oaexample.com');
    const [loginPass, setLoginPass] = useState('APasswordYouShouldChange');
    const [oaEnvDb, setOaEnvDb] = useState('docker');
    const [oaEnvEmail, setOaEnvEmail] = useState('django');
    const [oaEnvStorage, setOaEnvStorage] = useState('local');

    const renderEnv = () => {
        const asJson = {
            "PROJECT_NAME": projectName,
            "STACK_PATH": stackPath,
            "TYPES_PATH": typesPath,
            "PERMISSIONS_PATH": permsPath,
            "REACT_APP_API_HOST": reactAppApiHost,
            "REACT_APP_APP_HOST": reactAppAppHost,
            "REACT_APP_LOGIN_EMAIL": loginEmail,
            "REACT_APP_LOGIN_PASS": loginPass,
            "OA_ENV_DB": oaEnvDb,
            "OA_ENV_EMAIL": oaEnvEmail,
            "OA_ENV_STORAGE": oaEnvStorage,
        }

        return `# The name of your project. The cloned directory will be derived from this name
PROJECT_NAME=${projectName}

# By default this is the stack folder in this repo, but you can point it elsewhere
STACK_PATH=${stackPath}

# Your Worksheet's "Object Fields" sheet (required to customize, but not to run the default stack)
TYPES_PATH=${typesPath}

#### Your API Server protocol:host:port ####
REACT_APP_API_HOST=${reactAppApiHost}

#### Your Webapp Server protocol:host:port ####
REACT_APP_APP_HOST=${reactAppAppHost}

# Your API admin login
REACT_APP_LOGIN_EMAIL=${loginEmail}

# Your API admin password
REACT_APP_LOGIN_PASS=${loginPass}

# the location of mysql server: docker | local | gcp
OA_ENV_DB=${oaEnvDb}

# how are emails sent: django | gmail | sendgrid
OA_ENV_EMAIL=${oaEnvEmail}

# where to store static files: gcp | local
OA_ENV_STORAGE=${oaEnvStorage}
`;
    };

    return (
        <Box>
            <TextField
                fullWidth
                label="Project Name"
                required={true}
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                variant="outlined"
                size="small"
                sx={{mb: 2}}
            />

            <TextField
                fullWidth
                label="Stack Path"
                required={true}
                value={stackPath}
                onChange={(e) => setStackPath(e.target.value)}
                variant="outlined"
                size="small"
                helperText={'An absolute directory path to put the code. A period (.) will overwrite this project'}
                sx={{mb: 2}}
            />

            <TextField
                fullWidth
                label="Object Types CSV"
                required={true}
                value={typesPath}
                onChange={(e) => setTypesPath(e.target.value)}
                variant="outlined"
                size="small"
                helperText={'Absolute file path to your Object Fields CSV Spreadsheet'}
                sx={{mb: 2}}
            />

            <TextField
                fullWidth
                label="Permission Matrix CSV"
                required={true}
                value={permsPath}
                onChange={(e) => setPermsPath(e.target.value)}
                variant="outlined"
                size="small"
                helperText={'Absolute file path to your Permissions Matrix CSV Spreadsheet'}
                sx={{mb: 2}}
            />

            <TextField
                fullWidth
                label="Your API Server"
                value={reactAppApiHost}
                onChange={(e) => setReactAppApiHost(e.target.value)}
                variant="outlined"
                size="small"
                helperText={'Absolute file path to your Permission Matrix CSV Spreadsheet (optional)'}
                sx={{mb: 2}}
            />

            <TextField
                fullWidth
                label="Your WebApp URL"
                value={reactAppAppHost}
                onChange={(e) => setReactAppAppHost(e.target.value)}
                variant="outlined"
                size="small"
                sx={{mb: 2}}
            />

            <TextField
                fullWidth
                label="Admin Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                variant="outlined"
                size="small"
                sx={{mb: 2}}
            />

            <TextField
                fullWidth
                label="Admin Password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                variant="outlined"
                size="small"
                sx={{mb: 2}}
            />

            <TextField
                select
                fullWidth
                label="Where do you want your database"
                value={oaEnvDb}
                onChange={(e) => setOaEnvDb(e.target.value)}
                variant="outlined"
                size="small"
                sx={{mb: 2}}
                helperText={''}
            >
                <MenuItem value="docker">Inside Docker</MenuItem>
                <MenuItem value="local">Locally (first run `sudo docs/os-mysql-install.sh`)</MenuItem>
                <MenuItem value="gcp">Google Cloud Platform (first follow django/deploy/README.md)</MenuItem>
            </TextField>

            <TextField
                select
                fullWidth
                label="OA_ENV_EMAIL"
                value={oaEnvEmail}
                onChange={(e) => setOaEnvEmail(e.target.value)}
                variant="outlined"
                size="small"
                sx={{mb: 2}}
            >
                <MenuItem value="django">django</MenuItem>
                <MenuItem value="gmail">gmail</MenuItem>
                <MenuItem value="sendgrid">sendgrid</MenuItem>
            </TextField>

            <TextField
                select
                fullWidth
                label="OA_ENV_STORAGE"
                value={oaEnvStorage}
                onChange={(e) => setOaEnvStorage(e.target.value)}
                variant="outlined"
                size="small"
                sx={{mb: 2}}
            >
                <MenuItem value="gcp">gcp</MenuItem>
                <MenuItem value="local">local</MenuItem>
            </TextField>

            <TextField
                InputProps={{
                    readOnly: true,
                }}
                fullWidth={true}
                multiline={true}
                rows={2}
                sx={{mt: 3}}
                helperText={'Copy and paste this into your .env.myproject'}
                value={renderEnv()}/>
        </Box>
    );
};

export default EnvEditor;
