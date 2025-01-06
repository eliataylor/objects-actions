import React, {useState} from 'react';
import {Box, FormHelperText, MenuItem,} from '@mui/material';
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import {Link} from "react-router-dom";
import CardHeader from "@mui/material/CardHeader";
import LightDarkImg from "../../components/LightDarkImg";
import {Command, StyledPaper, StyledTypography} from "../components/StyledComponents";


const Install: React.FC = () => {
    const [method, setMethod] = useState(sessionStorage.getItem("targetDomain") ?? 'http://localhost:3000');

    return (
        <Box>
            <StyledTypography variant="h1">Install</StyledTypography>
            <StyledTypography variant="subtitle1">
                This will check out the source code, build site website, and your full stack based on an example
                application.
            </StyledTypography>

            <FormControl sx={{marginTop: 3, marginBottom: 3}} variant={'filled'} fullWidth={true}
                         size={"small"}>
                <InputLabel id="domain-label">Development Domain</InputLabel>
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

            <StyledTypography variant="subtitle1">
                Once all Docker containers are running, these will be running your computer:
            </StyledTypography>

            {method.indexOf('https:') === 0 &&
            <StyledTypography variant="subtitle2">
                You will have to accept your browser's warnings about self-signed certificates
            </StyledTypography>
            }


            <Box>

                <CardHeader
                    component={"a"}
                    target={"_blank"}
                    style={{textDecoration: 'none'}}
                    href={method}
                    action={<img src={'/oa-assets/logo-react.svg'} height={30}/>}
                    subheader={'ReactJS Front-End'}
                    title={<u>{method}</u>}
                />

                <CardHeader
                    component={"a"}
                    target={"_blank"}
                    style={{textDecoration: 'none'}}
                    href={method.indexOf('https:') === 0 ? 'https://localapi.oaexample.com:8080/admin/login' : 'http://localhost:8080/admin/login'}
                    action={<img src={'/oa-assets/logo-django.svg'} height={30}/>}
                    subheader={'Backend Content Manager'}
                    title={
                        <u>{method.indexOf('https:') === 0 ? 'https://localapi.oaexample.com:8080/admin/login' : 'http://localhost:8080/admin/login'}</u>}
                />

                <CardHeader
                    component={"a"}
                    target={"_blank"}
                    style={{textDecoration: 'none'}}
                    href={method.indexOf('https:') === 0 ? 'https://localapi.oaexample.com:8080/api/schema/swagger' : 'http://localhost:8080/api/schema/swagger'}
                    action={<img src={'/oa-assets/logo-drf.png'} height={30}/>}
                    subheader={'Backend-End API'}
                    title={
                        <u>{method.indexOf('https:') === 0 ? 'https://localapi.oaexample.com:8080/api/schema/swagger' : 'http://localhost:8080/api/schema/swagger'}</u>}
                />

                <StyledTypography variant="subtitle1">
                    And you can use these tools in the terminal to generate data and run end-to-end permissions tests:
                </StyledTypography>


                <CardHeader
                    component={Link}
                    style={{textDecoration: 'none'}}
                    action={<img src={'/oa-assets/logo-typescript.svg'} height={30}/>}
                    title={'Fake Data Generator'}
                    subheader={<u>README</u>}
                    to={'https://github.com/eliataylor/objects-actions/blob/main/stack/databuilder/README.md'}
                />

                <CardHeader
                    component={Link}
                    style={{textDecoration: 'none'}}
                    action={<LightDarkImg light={'/oa-assets/Cypress_Logomark_Dark-Color.svg'}
                                          dark={'/oa-assets/Cypress_Logomark_White-Color.svg'}
                                          styles={{height: 30}}/>}
                    subheader={<u>README</u>}
                    title={'Front-End Test Suite'}
                    to={'https://github.com/eliataylor/objects-actions/blob/main/stack/databuilder/README.md'}
                />
            </Box>
        </Box>
    );
};

export default Install;
