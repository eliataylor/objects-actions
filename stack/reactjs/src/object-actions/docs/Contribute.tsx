import React from 'react';
import { Box } from '@mui/material';
import { StyledPaper, StyledTypography } from '../components/StyledComponents';
import Typography from '@mui/material/Typography';
import SponsorIcon from '@mui/icons-material/MonetizationOn';
import { TightButton } from '../../theme/StyledFields';

const Contribute: React.FC = () => {
  return (
    <Box>
      <StyledTypography variant="h1">Contribute</StyledTypography>
      <StyledTypography variant="subtitle1">
        Review our Issues on Github or the Development Roadmap below and get in
        where you fit in
      </StyledTypography>

      <StyledPaper>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Frontend
        </Typography>
        <Typography variant="body1" gutterBottom={true}>
          Help write interactive documentation. Start around{' '}
          <a
            href={
              'https://github.com/eliataylor/objects-actions/tree/main/stack/reactjs/src/object-actions'
            }
            target={'_blank'}
          >
            stack/reactjs/src/object-actions
          </a>
        </Typography>
        <Typography variant="body1" gutterBottom={true}>
          Improve React render checks against permissions. Start around{' '}
          <a
            href="https://github.com/eliataylor/object-actions/blob/main/stack/reactjs/src/object-actions/types/access.tsx#L72"
            target="_blank"
            rel="noopener noreferrer"
          >
            stack/reactjs/src/object-actions/types/access.tsx#L72
          </a>
        </Typography>
        <Typography variant="body1" gutterBottom={true}>
          Implement endless scrolling pagination. Start around{' '}
          <a
            href={
              'https://github.com/eliataylor/objects-actions/blob/main/stack/reactjs/src/screens/EntityList.tsx#L61'
            }
            target={'_blank'}
          >
            stack/reactjs/src/screens/EntityList.tsx#L61
          </a>
        </Typography>
        <Typography variant="body1" gutterBottom={true}>
          NextJS builder. Start a new folder in{' '}
          <a
            href="https://github.com/eliataylor/object-actions/blob/main/src"
            target="_blank"
            rel="noopener noreferrer"
          >
            src/
          </a>
        </Typography>
      </StyledPaper>

      <StyledPaper>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Backend
        </Typography>
        <Typography variant="body1" gutterBottom={true}>
          Improve CD pipeline for improving changelog and testing before releases. Start around{' '}
          <a
            href="https://github.com/eliataylor/objects-actions/blob/main/.github/workflows/release.yml"
            target="_blank"
            rel="noopener noreferrer"
          >
            .github/workflows/release.yml
          </a>
        </Typography>
        <Typography variant="body1" gutterBottom={true}>
          Split Users from other Entity Types. Start around{' '}
          <a
            href="https://github.com/eliataylor/objects-actions/blob/main/src/typescript/TypesBuilder.py#L183"
            target="_blank"
            rel="noopener noreferrer"
          >
            src/typescript/TypesBuilder.py#L183
          </a>
        </Typography>
        <Typography variant="body1" gutterBottom={true}>
          Implement Django User Groups and Permissions. Start around{' '}
          <a
            href="https://github.com/eliataylor/object-actions/blob/main/stack/django/oaexample_app/permissions.py"
            target="_blank"
            rel="noopener noreferrer"
          >
            stack/django/oaexample_app/permissions.py
          </a>
        </Typography>
        <Typography variant="body1" gutterBottom={true}>
          Finish K6 load tests in order to benchmark API performance changes
          against our releases. Start around{' '}
          <a
            href="https://github.com/eliataylor/object-actions/blob/main/stack/k6/localhost.js"
            target="_blank"
            rel="noopener noreferrer"
          >
            stack/k6/localhost.js
          </a>
        </Typography>
        <Typography variant="body1" gutterBottom={true}>
          Fix OAuth login with Google, Spotify, any others from AllAuth. Start
          here{' '}
          <a
            href="https://github.com/eliataylor/objects-actions/blob/main/stack/django/oaexample_base/settings/allauth.py"
            target="_blank"
            rel="noopener noreferrer"
          >
            stack/django/oaexample_base/settings/allauth.py
          </a>
        </Typography>
        <Typography variant="body1" gutterBottom={true}>
          Drupal builder. Start a new folder in{' '}
          <a
            href="https://github.com/eliataylor/object-actions/blob/main/src"
            target="_blank"
            rel="noopener noreferrer"
          >
            src/
          </a>
        </Typography>
        <Typography variant="body1" gutterBottom={true}>
          KeystoneJS builder. Start a new folder in{' '}
          <a
            href="https://github.com/eliataylor/object-actions/blob/main/src"
            target="_blank"
            rel="noopener noreferrer"
          >
            src/
          </a>
        </Typography>
      </StyledPaper>

      <Typography variant="h6" sx={{ mb: 1, mt: 2 }}>
        If you want to fast track development or need help with your
        spreadsheets, and reach out to eli @ taylormadetraffic.com. It also
        helps to <a
        href={'https://github.com/sponsors/eliataylor'}
        target={'_blank'}
        rel="noopener noreferrer"
      >
        <TightButton
          variant={'contained'}
          size={'small'}
          startIcon={<SponsorIcon fontSize={'small'} />}
        >
          Sponsor O/A
        </TightButton>
      </a>
      </Typography>


    </Box>
  );
};

export default Contribute;
