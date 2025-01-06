import React from 'react';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';
import CardHeader from '@mui/material/CardHeader';
import LightDarkImg from '../../components/LightDarkImg';
import { StyledTypography } from '../components/StyledComponents';
import { useEnvContext } from '../EnvProvider';

const Install: React.FC = () => {
  const { envConfig } = useEnvContext();

  const method = envConfig.REACT_APP_APP_HOST;

  return (
    <Box>
      <StyledTypography variant="subtitle1">
        Once all Docker containers are running, these will be running your
        computer:
      </StyledTypography>

      {method.indexOf('https:') === 0 && (
        <StyledTypography variant="subtitle2">
          You will have to accept your browser's warnings about self-signed
          certificates
        </StyledTypography>
      )}

      <Box>
        <CardHeader
          component={'a'}
          target={'_blank'}
          style={{ textDecoration: 'none' }}
          href={method}
          action={<img src={'/oa-assets/logo-react.svg'} height={30} />}
          subheader={'ReactJS Front-End'}
          title={<u style={{wordBreak:"break-word"}}>{method}</u>}
        />

        <CardHeader
          component={'a'}
          target={'_blank'}
          style={{ textDecoration: 'none' }}
          href={
            method.indexOf('https:') === 0
              ? 'https://localapi.oaexample.com:8080/admin/login'
              : 'http://localhost:8080/admin/login'
          }
          action={<img src={'/oa-assets/logo-django.svg'} height={15} />}
          subheader={'Backend Content Manager'}
          title={
            <u style={{wordBreak:"break-word"}}>
              {method.indexOf('https:') === 0
                ? 'https://localapi.oaexample.com:8080/admin/login'
                : 'http://localhost:8080/admin/login'}
            </u>
          }
        />

        <CardHeader
          component={'a'}
          target={'_blank'}
          style={{ textDecoration: 'none' }}
          href={
            method.indexOf('https:') === 0
              ? 'https://localapi.oaexample.com:8080/api/schema/swagger'
              : 'http://localhost:8080/api/schema/swagger'
          }
          action={<img src={'/oa-assets/logo-drf.png'} height={20} />}
          subheader={'Backend-End API'}
          title={
            <u style={{wordBreak:"break-word"}}>
              {method.indexOf('https:') === 0
                ? 'https://localapi.oaexample.com:8080/api/schema/swagger'
                : 'http://localhost:8080/api/schema/swagger'}
            </u>
          }
        />

        <StyledTypography variant="subtitle1">
          And you can use these tools in the terminal to generate data and run
          end-to-end permissions tests:
        </StyledTypography>

        <CardHeader
          component={Link}
          style={{ textDecoration: 'none' }}
          action={<img src={'/oa-assets/logo-typescript.svg'} height={30} />}
          title={'Fake Data Generator'}
          subheader={<u>README</u>}
          to={
            'https://github.com/eliataylor/objects-actions/blob/main/stack/databuilder/README.md'
          }
        />

        <CardHeader
          component={Link}
          style={{ textDecoration: 'none' }}
          action={
            <LightDarkImg
              light={'/oa-assets/Cypress_Logomark_Dark-Color.svg'}
              dark={'/oa-assets/Cypress_Logomark_White-Color.svg'}
              styles={{ height: 30 }}
            />
          }
          subheader={<u>README</u>}
          title={'Front-End Test Suite'}
          to={
            'https://github.com/eliataylor/objects-actions/blob/main/stack/databuilder/README.md'
          }
        />
      </Box>
    </Box>
  );
};

export default Install;
