import React from 'react';
import { Box, Card, CardHeader, CardMedia, Grid } from '@mui/material';
import { TightButton } from '../../theme/StyledFields';
import LightDarkImg from '../../components/LightDarkImg';

const OaStackCards: React.FC = () => {
  const mediaHeight = 250;

  return (
    <Grid
      container
      spacing={1}
      justifyContent={'space-between'}
      alignContent={'flex-start'}
      alignItems={'flex-start'}
    >
      <Grid item xs={12} sm={6}>
        <Card sx={{ position: 'relative' }} variant="outlined">
          <CardHeader
            sx={{ mb: 0, p: 1 }}
            avatar={
              <LightDarkImg
                light={'/oa-assets/Cypress_Logomark_Dark-Color.svg'}
                dark={'/oa-assets/Cypress_Logomark_White-Color.svg'}
                styles={{ height: 30 }}
              />
            }
            subheader={'Cypress.io'}
            title={'Front-End Test Suite'}
          />
          <CardMedia sx={{ height: mediaHeight, position: 'relative' }}>
            <video
              autoPlay
              muted
              loop={true}
              style={{ width: '100%' }}
              controls={true}
            >
              <source src={'/oa-assets/cypress-demo.mp4'} type="video/mp4" />
            </video>
          </CardMedia>
          <Box sx={{ textAlign: 'right', p: 1, alignContent: 'flex-end' }}>
            <a
              href={
                'https://github.com/eliataylor/objects-actions/blob/main/stack/cypress/cypress/e2e/read-only/load-form.cy.ts#L20'
              }
              target={'_blank'}
            >
              <TightButton
                size={'small'}
                variant={'outlined'}
                startIcon={
                  <LightDarkImg
                    light={'/oa-assets/github-mark.svg'}
                    dark={'/oa-assets/github-mark-white.svg'}
                    styles={{ height: 20 }}
                  />
                }
              >
                View Source
              </TightButton>
            </a>
          </Box>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Card variant="outlined">
          <CardHeader
            sx={{ mb: 0, p: 1 }}
            avatar={<img src={'/oa-assets/logo-django.svg'} height={30} />}
            title={'Backend Content Manager'}
            subheader={'Django Admin'}
          />
          <CardMedia
            height={mediaHeight}
            sx={{ position: 'relative' }}
            component={'img'}
            alt={'Backend API'}
            src={
              'https://github.com/eliataylor/objects-actions/raw/main/docs/images/demo-backend_admin.png'
            }
          />
          <Box sx={{ textAlign: 'right', p: 1, alignContent: 'flex-end' }}>
            <a
              href={
                'https://github.com/eliataylor/objects-actions/blob/main/stack/django/oaexample_app/admin.py'
              }
              target={'_blank'}
            >
              <TightButton
                size={'small'}
                variant={'outlined'}
                startIcon={
                  <LightDarkImg
                    light={'/oa-assets/github-mark.svg'}
                    dark={'/oa-assets/github-mark-white.svg'}
                    styles={{ height: 20 }}
                  />
                }
              >
                View Source
              </TightButton>
            </a>
          </Box>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Card variant="outlined">
          <CardHeader
            sx={{ mb: 0, p: 1 }}
            avatar={<img src={'/oa-assets/logo-react.svg'} height={30} />}
            title={'Front-End WebApp'}
            subheader={'React.JS'}
          />
          <CardMedia
            height={mediaHeight}
            component={'img'}
            alt={'Front-End WebApp'}
            src={
              'https://github.com/eliataylor/objects-actions/raw/main/docs/images/demo-reactjs.png'
            }
          />
          <Box sx={{ textAlign: 'right', p: 1, alignContent: 'flex-end' }}>
            <a
              href={
                'https://github.com/eliataylor/objects-actions/blob/main/stack/reactjs/src/theme/ThemeContext.js'
              }
              target={'_blank'}
            >
              <TightButton
                size={'small'}
                variant={'outlined'}
                startIcon={
                  <LightDarkImg
                    light={'/oa-assets/github-mark.svg'}
                    dark={'/oa-assets/github-mark-white.svg'}
                    styles={{ height: 20 }}
                  />
                }
              >
                View Source
              </TightButton>
            </a>
          </Box>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Card variant="outlined">
          <CardHeader
            sx={{ mb: 0, p: 1 }}
            avatar={<img src={'/oa-assets/logo-drf.png'} height={30} />}
            title={'Backend API'}
            subheader={'Django DRF'}
          />
          <CardMedia
            height={mediaHeight}
            component={'img'}
            alt={'Backend API'}
            src={
              'https://github.com/eliataylor/objects-actions/raw/main/docs/images/demo-backend_swagger.png'
            }
          />
          <Box sx={{ textAlign: 'right', p: 1, alignContent: 'flex-end' }}>
            <a
              href={
                'https://github.com/eliataylor/objects-actions/blob/main/stack/django/oaexample_app/urls.py'
              }
              target={'_blank'}
            >
              <TightButton
                size={'small'}
                variant={'outlined'}
                startIcon={
                  <LightDarkImg
                    light={'/oa-assets/github-mark.svg'}
                    dark={'/oa-assets/github-mark-white.svg'}
                    styles={{ height: 20 }}
                  />
                }
              >
                View Source
              </TightButton>
            </a>
          </Box>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Card variant="outlined">
          <CardHeader
            sx={{ mb: 0, p: 1 }}
            avatar={<img src={'/oa-assets/logo-typescript.svg'} height={30} />}
            title={'Fake Data Generator'}
            subheader={'NodeJS'}
          />
          <CardMedia
            height={mediaHeight}
            component={'img'}
            alt={'Databuilder'}
            src={
              'https://github.com/eliataylor/objects-actions/raw/main/docs/images/databuilder.png'
            }
          />
          <Box sx={{ textAlign: 'right', p: 1, alignContent: 'flex-end' }}>
            <a
              href={
                'https://github.com/eliataylor/objects-actions/blob/main/stack/databuilder/src/main.ts'
              }
              target={'_blank'}
            >
              <TightButton
                size={'small'}
                variant={'outlined'}
                startIcon={
                  <LightDarkImg
                    light={'/oa-assets/github-mark.svg'}
                    dark={'/oa-assets/github-mark-white.svg'}
                    styles={{ height: 20 }}
                  />
                }
              >
                View Source
              </TightButton>
            </a>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
};

export default OaStackCards;
