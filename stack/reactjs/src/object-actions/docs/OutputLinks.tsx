import React from 'react';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';
import CardHeader from '@mui/material/CardHeader';
import LightDarkImg from '../../components/LightDarkImg';
import { StyledTypography } from '../components/StyledComponents';
import { useEnvContext } from '../forming/EnvProvider';

const Install: React.FC = () => {
  const { envConfig } = useEnvContext();

  return (
    <Box>
      <StyledTypography variant="subtitle1">
        Once all Docker containers are running, these will be accessible in your browser:
      </StyledTypography>

      {envConfig.REACT_APP_APP_HOST.indexOf('https:') === 0 && (
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
          href={envConfig.REACT_APP_APP_HOST}
          action={<img src={'/oa-assets/logo-react.svg'} height={30} />}
          subheader={'ReactJS + Material-UI Frontend'}
          title={<u style={{wordBreak:"break-word"}}>{envConfig.REACT_APP_APP_HOST}</u>}
        />

        <CardHeader
          component={'a'}
          target={'_blank'}
          style={{ textDecoration: 'none' }}
          href={`${envConfig.REACT_APP_API_HOST}/admin/login`}
          action={<img src={'/oa-assets/logo-django.svg'} height={15} />}
          subheader={'Backend Content Manager'}
          title={
            <u style={{wordBreak:"break-word"}}>
              {`${envConfig.REACT_APP_API_HOST}/admin/login`}
            </u>
          }
        />

        <CardHeader
          component={'a'}
          target={'_blank'}
          style={{ textDecoration: 'none' }}
          href={`${envConfig.REACT_APP_API_HOST}/api/schema/swagger`}
          action={<img src={'/oa-assets/logo-drf.png'} height={20} />}
          subheader={'Backend API'}
          title={
            <u style={{wordBreak:"break-word"}}>
              {`${envConfig.REACT_APP_API_HOST}/api/schema/swagger`}
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
          title={'Frontend Test Suite'}
          to={
            'https://github.com/eliataylor/objects-actions/blob/main/stack/databuilder/README.md'
          }
        />
      </Box>
    </Box>
  );
};

export default Install;
