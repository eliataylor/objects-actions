import React, { useEffect, useRef } from "react";
import { Box, Card, CardHeader, CardMedia, Grid, styled } from "@mui/material";
import { TightButton } from "../../theme/StyledFields";
import LightDarkImg from "../../components/LightDarkImg";

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  '& .MuiCardHeader-title': {
    fontSize: '1.5rem', // Custom title font size
  },
  '& .MuiCardHeader-subheader': {
    fontSize: '1rem', // Custom subheader font size
    fontWeight: 600,
  },
}));

const OaStackCards: React.FC = () => {
  const mediaHeight = 250;

  // Create a ref for the video element
  const videoRef = useRef<HTMLVideoElement>(null);

  // Set the playbackRate when the component mounts
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
    }
  }, []);

  return (
    <Grid
      container
      spacing={1}
      justifyContent={"space-between"}
      alignContent={"flex-start"}
      alignItems={"flex-start"}
    >

      <Grid item xs={12} sm={6} data-label={"ReactWebApp"}>
        <Card variant="outlined">
          <StyledCardHeader
            sx={{ mb: 0, p: 1 }}
            avatar={<img alt={'react logo'} src={"/oa-assets/logo-react.svg"} height={30} />}
            title={"This Web App"}
            subheader={"React.JS"}
          />
          <CardMedia sx={{ height: mediaHeight, position: "relative", overflowY: "hidden" }}>
            <video
              autoPlay
              muted
              playsInline={true}
              loop={true}
              poster={"https://github.com/eliataylor/objects-actions/raw/main/docs/images/demo-reactjs.png"}
              style={{ width: "100%" }}
              controls={true}
            >
              <source src={"/oa-assets/walkthrough.mp4"} type="video/mp4" />
            </video>
          </CardMedia>
          <Box sx={{ textAlign: "right", p: 1, alignContent: "flex-end" }}>
            <a
              href={
                "https://github.com/eliataylor/objects-actions/tree/main/stack/reactjs"
              }
              target="_blank" rel="noreferrer"
            >
              <TightButton
                size={"small"}
                variant={"outlined"}
                startIcon={
                  <LightDarkImg
                    light={"/oa-assets/github-mark.svg"}
                    dark={"/oa-assets/github-mark-white.svg"}
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

      <Grid item xs={12} sm={6} data-label={"CypressIO"}>
        <Card sx={{ position: "relative" }} variant="outlined">
          <StyledCardHeader
            sx={{ mb: 0, p: 1 }}
            avatar={
              <LightDarkImg
                light={"/oa-assets/Cypress_Logomark_Dark-Color.svg"}
                dark={"/oa-assets/Cypress_Logomark_White-Color.svg"}
                styles={{ height: 30 }}
              />
            }
            subheader={"Cypress.io"}
            title={"End-To-End Test Suite"}
          />
          <CardMedia sx={{ height: mediaHeight, position: "relative", overflowY: "hidden" }}>
            <video
              ref={videoRef} // Attach the ref to the video element
              autoPlay
              playsInline={true}
              muted
              loop={true}
              style={{ width: "100%" }}
              controls={true}
            >
              <source src={"/oa-assets/cypress-demo.mp4"} type="video/mp4" />
            </video>
          </CardMedia>
          <Box sx={{ textAlign: "right", p: 1, alignContent: "flex-end" }}>
            <a
              href={
                "https://github.com/eliataylor/objects-actions/blob/main/stack/cypress/cypress/e2e/read-only/load-form.cy.ts#L20"
              }
              target="_blank" rel="noreferrer"
            >
              <TightButton
                size={"small"}
                variant={"outlined"}
                startIcon={
                  <LightDarkImg
                    light={"/oa-assets/github-mark.svg"}
                    dark={"/oa-assets/github-mark-white.svg"}
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

      <Grid item xs={12} sm={6} data-label={"OpenAIAgent"}>
        <Card variant="outlined">
          <StyledCardHeader
            sx={{ mb: 0, p: 1 }}
            avatar={<LightDarkImg
              light={"/oa-assets/openai-icon-black.svg"}
              dark={"/oa-assets/openai-icon-white.svg"}
              styles={{ height: 30 }}
            />}
            title={"AI Agent"}
            subheader={"OpenAI"}
          />
          <CardMedia sx={{ height: mediaHeight, position: "relative", overflowY: "hidden" }}>
            <video
              autoPlay
              playsInline={true}
              muted
              loop={true}
              style={{ width: "100%" }}
              controls={true}
            >
              <source src={"/oa-assets/openai-demo.mp4"} type="video/mp4" />
            </video>
          </CardMedia>
          <Box sx={{ textAlign: "right", p: 1, alignContent: "flex-end" }}>
            <a
              href={
                "https://github.com/eliataylor/objects-actions/tree/main/stack/django/oasheets_app"
              }
              target="_blank" rel="noreferrer"
            >
              <TightButton
                size={"small"}
                variant={"outlined"}
                startIcon={
                  <LightDarkImg
                    light={"/oa-assets/github-mark.svg"}
                    dark={"/oa-assets/github-mark-white.svg"}
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

      <Grid item xs={12} sm={6} data-label={"DjangoAdmin"}>
        <Card variant="outlined">
          <StyledCardHeader
            sx={{ mb: 0, p: 1 }}
            avatar={<img alt={'django logo'} src={"/oa-assets/logo-django.svg"} height={30} />}
            title={"Backend Content Manager"}
            subheader={"Django Admin"}
          />
          <div style={{ overflow: "hidden", height: mediaHeight }}>
            <img
              style={{ width: "100%" }}
              alt={"Backend API"}
              src={
                "https://github.com/eliataylor/objects-actions/raw/main/docs/images/demo-backend_admin.png"
              }
            />
          </div>
          <Box sx={{ textAlign: "right", p: 1, alignContent: "flex-end" }}>
            <a
              href={
                "https://github.com/eliataylor/objects-actions/blob/main/stack/django/oaexample_app/admin.py"
              }
              target="_blank" rel="noreferrer"
            >
              <TightButton
                size={"small"}
                variant={"outlined"}
                startIcon={
                  <LightDarkImg
                    light={"/oa-assets/github-mark.svg"}
                    dark={"/oa-assets/github-mark-white.svg"}
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

      <Grid item xs={12} sm={6} data-label={"DjangoDRF"}>
        <Card variant="outlined">
          <StyledCardHeader
            sx={{ mb: 0, p: 1 }}
            avatar={<img alt={'django drf logo'}  src={"/oa-assets/logo-drf.png"} height={30} />}
            title={"Backend API"}
            subheader={"Django DRF"}
          />
          <div style={{ overflow: "hidden", height: mediaHeight }}>
            <img
              style={{ width: "100%" }}
              alt={"Backend API"}
              src={
                "https://github.com/eliataylor/objects-actions/raw/main/docs/images/demo-backend_swagger.png"
              }
            />
          </div>
          <Box sx={{ textAlign: "right", p: 1, alignContent: "flex-end" }}>
            <a
              href={
                "https://github.com/eliataylor/objects-actions/blob/main/stack/django/oaexample_app/urls.py"
              }
              target="_blank" rel="noreferrer"
            >
              <TightButton
                size={"small"}
                variant={"outlined"}
                startIcon={
                  <LightDarkImg
                    light={"/oa-assets/github-mark.svg"}
                    dark={"/oa-assets/github-mark-white.svg"}
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

      <Grid item xs={12} sm={6} data-label={"Databuilder"}>
        <Card variant="outlined">
          <StyledCardHeader
            sx={{ mb: 0, p: 1 }}
            avatar={<img alt={'typescript logo'} src={"/oa-assets/logo-typescript.svg"} height={30} />}
            title={"Fake Data Generator"}
            subheader={"NodeJS"}
          />
          <div style={{ overflow: "hidden", height: mediaHeight }}>
            <img
              style={{ width: "100%" }}
              alt={"Databuilder"}
              src={
                "https://github.com/eliataylor/objects-actions/raw/eli/docs/images/databuilder.png"
              }
            />
          </div>
          <Box sx={{ textAlign: "right", p: 1, alignContent: "flex-end" }}>
            <a
              href={
                "https://github.com/eliataylor/objects-actions/blob/main/stack/databuilder"
              }
              target="_blank" rel="noreferrer"
            >
              <TightButton
                size={"small"}
                variant={"outlined"}
                startIcon={
                  <LightDarkImg
                    light={"/oa-assets/github-mark.svg"}
                    dark={"/oa-assets/github-mark-white.svg"}
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

      <Grid item xs={12} sm={6} data-label={"K6Tester"}>
        <Card variant="outlined">
          <StyledCardHeader
            sx={{ mb: 0, p: 1 }}
            avatar={<img alt={'k6 logo'} src={"/oa-assets/logo-k6.svg"} height={30} />}
            title={"API Speed Tests"}
            subheader={"K6"}
          />
          <div style={{ overflow: "hidden", height: mediaHeight }}>
            <img
              style={{ width: "100%" }}
              alt={"K6 Test Results"}
              src={
                "https://github.com/eliataylor/objects-actions/raw/eli/docs/images/k6-speed-test.png"
              }
            />
          </div>
          <Box sx={{ textAlign: "right", p: 1, alignContent: "flex-end" }}>
            <a
              href={
                "https://github.com/eliataylor/objects-actions/tree/main/stack/k6"
              }
              target="_blank" rel="noreferrer"
            >
              <TightButton
                size={"small"}
                variant={"outlined"}
                startIcon={
                  <LightDarkImg
                    light={"/oa-assets/github-mark.svg"}
                    dark={"/oa-assets/github-mark-white.svg"}
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
