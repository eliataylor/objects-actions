import React, {ReactNode, useState} from 'react';
import {Box, FormHelperText, IconButton, MenuItem, Paper, styled, Typography,} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import {Link} from "react-router-dom";

const StyledPaper = styled(Paper)(({theme}) => ({
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
}));

const StyledTypography = styled(Typography)(({theme}) => ({
    fontFamily: theme.typography.fontFamily,
    margin: 0,
}));

const CodeTypography = styled('code')(({theme}) => ({
    fontFamily: 'courier',
    margin: 0,
}));

const CommandContainer = styled(Box)(({theme}) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
}));

const Command: React.FC<{ command: string, help?: ReactNode }> = ({command, help}) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(command);
        console.log(`Copied command: ${command}`);
    };

    return (
        <Box>
            <CommandContainer>
                <IconButton onClick={handleCopy}>
                    <ContentCopyIcon sx={{height: 15}}/>
                </IconButton>
                <Typography variant="body2">
                    <CodeTypography>{command}</CodeTypography>
                </Typography>
            </CommandContainer>
            {help && <FormHelperText sx={{marginLeft: 5, marginTop: 0, marginBottom: 3}}>{help}</FormHelperText>}
        </Box>
    );
};

const Install: React.FC = () => {
    const [method, setMethod] = useState(sessionStorage.getItem("targetDomain") ?? 'http://localhost:3000');

    return (
        <Box>
            <StyledTypography variant="h2">Install</StyledTypography>
            <StyledTypography variant="h5">
                This will check out the source code and build the full stack based on an example application.
            </StyledTypography>

            <FormControl sx={{marginTop: 3, marginBottom: 3}} variant={'filled'} fullWidth={true}
                         size={"small"}>
                <InputLabel id="domain-label">Target Domain</InputLabel>
                <Select
                    labelId="domain-label"
                    id="domain"
                    color={'secondary'}
                    fullWidth={true}
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                >
                    <MenuItem value={'https://localhost.oaexample.com:3000'}>
                        https://localhost.oaexample.com:3000
                    </MenuItem>
                    <MenuItem value={'http://localhost:3000'}>
                        http://localhost:3000
                    </MenuItem>
                </Select>
                <FormHelperText>Start with `https:localhost.oaexample.com` if you want test 3rd party authentication
                    (Google / Linkedin / Github / ... sign). See <Link to={'/oa/extend'}>Extending</Link> to build on
                    your own domain</FormHelperText>
            </FormControl>

            <StyledPaper>
                <Command command="git clone git@github.com:eliataylor/object-actions.git"
                         help={<>
                             <b>or</b> if you get SSL errors, use
                             <code> <em>git clone https://github.com/eliataylor/object-actions.git</em></code>
                         </>}
                />


                <Command command="cd object-actions"/>

                {method === 'https://localhost.oaexample.com:3000' &&
                    <Command command="sudo bash docs/os-hosts-install"
                             help={<>This will add a entry to your computers `/etc/hosts` so that localhost.oxample.com
                                 resolves to your localhost development environment</>}/>
                }

                <Command command="docker-compose up --build -d"/>
            </StyledPaper>
        </Box>
    );
};

export default Install;
