import React from 'react';
import { Box, Card, CardHeader, CardMedia, Grid } from '@mui/material';
import { TightButton } from '../../theme/StyledFields';

const SpreadsheetCards: React.FC = () => {
  return (
    <Grid container spacing={1}>
      <Grid item xs={12} sm={6}>
        <Card variant="outlined">
          <CardHeader
            sx={{ mb: 0, p: 1 }}
            title={'Define your Fields'}
            subheader={'for each Object type'}
          />
          <CardMedia
            height={320}
            component={'img'}
            alt={'Object Field Types'}
            src={
              'https://raw.githubusercontent.com/eliataylor/objects-actions/refs/heads/v3.2/docs/images/object-fields-demo.png'
            }
          />
          <Grid sx={{ p: 1 }} container justifyContent={'space-between'}>
            <a
              href={
                'https://docs.google.com/spreadsheets/d/14Ej7lu4g3i85BWJdHbi4JK2jM2xS5uDSgfzm3rIhx4o/edit?gid=845262387#gid=845262387'
              }
              target={'_blank'}
            >
              <TightButton
                size={'small'}
                startIcon={
                  <img
                    src={'/oa-assets/Google_Sheets_2020_Logo.svg'}
                    height={20}
                  />
                }
              >
                New Worksheet
              </TightButton>
            </a>

            <a
              href="https://docs.google.com/spreadsheets/d/1Jm15OeR6mS6vbJd7atHErOwBgq2SwKAagb4MH0D1aIw/edit?gid=12324120#gid=12324120"
              target="_blank"
              rel="noopener noreferrer"
            >
              <TightButton
                size={'small'}
                startIcon={
                  <img
                    src={'/oa-assets/Google_Sheets_2020_Logo.svg'}
                    height={20}
                  />
                }
              >
                Site Sample
              </TightButton>
            </a>
          </Grid>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Card>
          <CardHeader
            sx={{ mb: 0, p: 1 }}
            title={'Define your roles and permissions'}
            subheader={'for each Action on any Object'}
          />
          <CardMedia
            height={320}
            component={'img'}
            alt={'Permission Matrix'}
            src={
              'https://raw.githubusercontent.com/eliataylor/objects-actions/refs/heads/v3.2/docs/images/permissions-matrix-demo.png'
            }
          />
          <Grid sx={{ p: 1 }} container justifyContent={'space-between'}>
            <a
              href={
                'https://docs.google.com/spreadsheets/d/14Ej7lu4g3i85BWJdHbi4JK2jM2xS5uDSgfzm3rIhx4o/edit?gid=1619189607#gid=1619189607'
              }
              target={'_blank'}
            >
              <TightButton
                size={'small'}
                startIcon={
                  <img
                    src={'/oa-assets/Google_Sheets_2020_Logo.svg'}
                    height={20}
                  />
                }
              >
                New Worksheet
              </TightButton>
            </a>

            <a
              href="https://docs.google.com/spreadsheets/d/1Jm15OeR6mS6vbJd7atHErOwBgq2SwKAagb4MH0D1aIw/edit?gid=12324120#gid=12324120"
              target="_blank"
              rel="noopener noreferrer"
            >
              <TightButton
                size={'small'}
                startIcon={
                  <img
                    src={'/oa-assets/Google_Sheets_2020_Logo.svg'}
                    height={20}
                  />
                }
              >
                Site Sample
              </TightButton>
            </a>
          </Grid>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SpreadsheetCards;
