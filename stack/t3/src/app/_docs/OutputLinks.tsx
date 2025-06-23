import React from "react";
import { Box, Typography } from "@mui/material";
import CardHeader from "@mui/material/CardHeader";
import LightDarkImg from "../../components/LightDarkImg";
import { StyledTypography } from "../components/StyledComponents";
import { useEnvContext } from "../forming/EnvProvider";

const Install: React.FC = () => {
  const { envConfig } = useEnvContext();

  return (
    <Box>
      <StyledTypography variant="subtitle1">
        Once all Docker containers are running, these will be accessible in your browser:
      </StyledTypography>

      {(envConfig.REACT_APP_APP_HOST.indexOf("https:") === 0 || envConfig.REACT_APP_API_HOST.indexOf("https:") === 0) && (
        <StyledTypography variant="subtitle2">
          You will have to accept your browser's warnings about self-signed
          certificates
        </StyledTypography>
      )}

      <Box>
        <CardHeader
          style={{ textDecoration: "none" }}
          avatar={<img alt={'react logo'} src={"/oa-assets/logo-react.svg"} height={30} />}
          subheader={"ReactJS + Material-UI Frontend"}
          title={
            <Typography variant={"subtitle1"} style={{ wordBreak: "break-word" }}>
              {envConfig.REACT_APP_APP_HOST}</Typography>}
        />

        <CardHeader
          style={{ textDecoration: "none" }}
          avatar={<img alt={'django logo'} src={"/oa-assets/logo-django.svg"} height={15} />}
          subheader={"Backend Content Manager"}
          title={
            <Typography variant={"subtitle1"} style={{ wordBreak: "break-word" }}>
              {`${envConfig.REACT_APP_API_HOST}/admin/login`}
            </Typography>
          }
        />

        <CardHeader
          style={{ textDecoration: "none" }}
          avatar={<img alt={'drf logo'}  src={"/oa-assets/logo-drf.png"} height={20} />}
          subheader={"Backend API"}
          title={
            <Typography variant={"subtitle1"} style={{ wordBreak: "break-word" }}>
              {`${envConfig.REACT_APP_API_HOST}/api/schema/swagger`}
            </Typography>
          }
        />

        <CardHeader
          style={{ textDecoration: "none" }}
          avatar={<LightDarkImg
            light={"/oa-assets/openai-icon-black.svg"}
            dark={"/oa-assets/openai-icon-white.svg"}
            styles={{ height: 20 }}
          />}
          subheader={"AI Agent"}
          title={
            <Typography variant={"subtitle1"} style={{ wordBreak: "break-word" }}>
              {`${envConfig.REACT_APP_API_HOST}/api/schema/swagger#/api/api_worksheets_generate_create`}
            </Typography>
          }
        />


        <StyledTypography variant="subtitle2">
          And you can use these tools in the terminal to generate data and run
          end-to-end permissions tests:
        </StyledTypography>

        <CardHeader
          avatar={<img alt={'typescript logo'}  src={"/oa-assets/logo-typescript.svg"} height={30} />}
          title={<Typography variant={"subtitle1"} style={{ wordBreak: "break-word" }}>Fake Data Generator</Typography>}
          subheader={<a href="https://github.com/eliataylor/objects-actions/blob/main/stack/databuilder/README.md"
                        target="_blank" rel="noreferrer">README</a>}
        />

        <CardHeader
          avatar={
            <LightDarkImg
              light={"/oa-assets/Cypress_Logomark_Dark-Color.svg"}
              dark={"/oa-assets/Cypress_Logomark_White-Color.svg"}
              styles={{ height: 30 }}
            />
          }
          subheader={<a href={"https://github.com/eliataylor/objects-actions/blob/main/stack/databuilder/README.md"}
                        target="_blank" rel="noreferrer">README</a>}
          title={<Typography variant={"subtitle1"} style={{ wordBreak: "break-word" }}>Frontend Test Suite</Typography>}
        />
      </Box>
    </Box>
  );
};

export default Install;
