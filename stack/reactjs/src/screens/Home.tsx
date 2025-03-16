import React from "react";
import { CircularProgress, Divider, Grid, Typography } from "@mui/material";
import { TightButton } from "../theme/StyledFields";
import { Link } from "react-router-dom";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import OALogo from "../object-actions/docs/OALogo";
import Logo from "../theme/Logo";

interface HomeProps {
  loading?: boolean;
}

const Home: React.FC<HomeProps> = ({ loading = false }) => {

  return (
    <Grid
      id={"HomeScreen"}
      container
      direction={"column"}
      gap={4}
      p={2}
      justifyContent={"space-between"}
      sx={{
        textAlign: "center",
        maxWidth: 900,
        margin: "70px auto",
        minHeight: "70vh"
      }}
    >
      <Grid item>
        <Typography variant="h2" component={"h1"}>
          Your Brand
        </Typography>
        <Grid sx={{ width: 300, margin: "auto", marginTop: 3, marginBottom: 3 }}>
          <Logo height={60} />
        </Grid>
        <Typography variant="h2" component={Link} to={"/content"} style={{ textDecorationThickness: 1 }}>
          Your Content
        </Typography>
      </Grid>

      <Divider />

      {loading && (
        <Grid item>
          <CircularProgress sx={{ height: 100 }} />
        </Grid>
      )}

      <Typography variant="h2" component={"a"} style={{ textDecorationThickness: 1 }} href={"https://github.com/eliataylor/objects-actions"}
                  target="_blank" rel="noreferrer">
        Your CodeBase
      </Typography>

      <Grid
        container
        wrap={"nowrap"}
        justifyContent={"center"}
        alignItems={"center"}
        alignContent={"center"}
      >
        <Grid item style={{ textAlign: "left" }}>

          <Typography variant="overline" style={{ fontSize: 10 }}>Kick started by</Typography>
          <Grid container alignContent={"center"} alignItems={"flex-end"} gap={1}>
            <Grid item>
              <OALogo height={90} />
            </Grid>
            <Grid item>
              <Typography variant="h3" style={{ fontStyle: "italic" }}>Objects / Actions</Typography>
              <Typography variant="h2">Spreadsheets to Full Stack</Typography>
            </Grid>
          </Grid>
          <Link to={"/oa/readme"}>
            <TightButton
              style={{ marginTop: 10 }}
              startIcon={<LocalLibraryIcon />}
              fullWidth={true}
              color={"primary"}
              size={"small"}
              variant={"contained"}
            >
              Open Source Documentation
            </TightButton>

          </Link>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Home;
