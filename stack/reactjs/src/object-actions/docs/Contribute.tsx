import React from "react";
import { Box } from "@mui/material";
import { StyledPaper, StyledTypography } from "../components/StyledComponents";
import Typography from "@mui/material/Typography";

const Contribute: React.FC = () => {
  return (
    <Box>
      <StyledTypography variant="h1">Contribute</StyledTypography>
      <StyledTypography variant="subtitle1">
        Review our <a href="https://github.com/eliataylor/objects-actions/issues"
                      target="_blank"
                      rel="noopener noreferrer"
      >Issues on Github</a> or the Development Roadmap below and get in
        where you fit in.
      </StyledTypography>


      <StyledPaper>
        <Typography variant="h5" sx={{ mb: 1 }}>
          New Backends
        </Typography>
        <Typography variant="body1" component={"li"} gutterBottom={true}>
          Any framework worth using can be scaffolded from these Spreadsheets. You can follow <a
          href="https://github.com/eliataylor/objects-actions/tree/main/src"
          target="_blank"
          rel="noopener noreferrer"
        >these scripts</a> for how we do it for Django.
        </Typography>
        <Typography variant={"body2"}>
          Drupal, KeystoneJS, and ExpressJS all seem like easy next targets.
        </Typography>
      </StyledPaper>

      <StyledPaper>
        <Typography variant="h5" sx={{ mb: 1 }}>
          New Frontends
        </Typography>
        <Typography variant="body1" component={"li"} gutterBottom={true}>
          This just mean building a web app entirely driven by these constants and TypeScript definitions: <a
          href="https://github.com/eliataylor/objects-actions/tree/main/stack/reactjs/src/object-actions/types"
          target="_blank"
          rel="noopener noreferrer"
        >github.com/eliataylor/objects-actions/tree/main/stack/reactjs/src/object-actions/types</a>.
          NextJS, Vue, Angular, Svelt would all be great alternatives. And/or just replacing MUI with Tailwind, SCSS, Bootstrap, or another CSS framework.
        </Typography>
      </StyledPaper>


      <StyledPaper>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Objects/Actions Source
        </Typography>
        <Typography variant="body1" component={"li"} gutterBottom={true}>
          Help write interactive documentation. Start around{" "}
          <a
            href={
              "https://github.com/eliataylor/objects-actions/tree/main/stack/reactjs/src/object-actions"
            }
            target={"_blank"}
          >
            stack/reactjs/src/object-actions
          </a>.
        </Typography>
        <Typography variant="body1" component={"li"} gutterBottom={true}>
          Improve React render checks against permissions. Start around{" "}
          <a
            href="https://github.com/eliataylor/object-actions/blob/main/stack/reactjs/src/object-actions/types/access.tsx#L72"
            target="_blank"
            rel="noopener noreferrer"
          >
            stack/reactjs/src/object-actions/types/access.tsx#L72
          </a>.
        </Typography>
        <Typography variant="body1" component={"li"} gutterBottom={true}>
          Implement endless scrolling pagination. Start around{" "}
          <a
            href={
              "https://github.com/eliataylor/objects-actions/blob/main/stack/reactjs/src/screens/EntityList.tsx#L61"
            }
            target={"_blank"}
          >
            stack/reactjs/src/screens/EntityList.tsx#L61
          </a>.
        </Typography>
        <Typography variant="body1" component={"li"} gutterBottom={true}>
          Improve CD pipeline for improving changelog and testing before releases. Start around{" "}
          <a
            href="https://github.com/eliataylor/objects-actions/blob/main/.github/workflows/release.yml"
            target="_blank"
            rel="noopener noreferrer"
          >
            .github/workflows/release.yml
          </a>.
        </Typography>
        <Typography variant="body1" component={"li"} gutterBottom={true}>
          Split Users from other Entity Types. Start around{" "}
          <a
            href="https://github.com/eliataylor/objects-actions/blob/main/src/typescript/TypesBuilder.py#L183"
            target="_blank"
            rel="noopener noreferrer"
          >
            src/typescript/TypesBuilder.py#L183
          </a>.
        </Typography>
        <Typography variant="body1" component={"li"} gutterBottom={true}>
          Implement Django User Groups and Permissions. Start around{" "}
          <a
            href="https://github.com/eliataylor/object-actions/blob/main/stack/django/oaexample_app/permissions.py"
            target="_blank"
            rel="noopener noreferrer"
          >
            stack/django/oaexample_app/permissions.py
          </a>.
        </Typography>
        <Typography variant="body1" component={"li"} gutterBottom={true}>
          Finish K6 load tests in order to benchmark API performance changes
          against our releases. Start around{" "}
          <a
            href="https://github.com/eliataylor/object-actions/blob/main/stack/k6/localhost.js"
            target="_blank"
            rel="noopener noreferrer"
          >
            stack/k6/localhost.js
          </a>.
        </Typography>
        <Typography variant="body1" component={"li"} gutterBottom={true}>
          Fix OAuth login with Google, Spotify, any others from AllAuth. Start
          here{" "}
          <a
            href="https://github.com/eliataylor/objects-actions/blob/main/stack/django/oaexample_base/settings/allauth.py"
            target="_blank"
            rel="noopener noreferrer"
          >
            stack/django/oaexample_base/settings/allauth.py
          </a>.
        </Typography>
      </StyledPaper>

    </Box>
  );
};

export default Contribute;
