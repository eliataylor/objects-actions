import { HydrateClient } from "~/trpc/server";
import { Grid, Typography, Divider } from "@mui/material";
import Link from "next/link";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import OALogo from "./_docs/OALogo";
import LogoGeneric from "./_docs/LogoGeneric";
import { TightButton } from "../styles/StyledFields";

export default async function Home() {

  return (
    <HydrateClient>
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
        <Grid>
          <Typography variant="h2" component={"h1"}>
            Your Brand
          </Typography>
          <Grid sx={{ width: 300, margin: "auto", marginTop: 3, marginBottom: 3 }}>
            <LogoGeneric size={60} />
          </Grid>
          <Typography variant="h2" component={Link} href={"/content"} style={{ textDecorationThickness: 1 }}>
            Your Content
          </Typography>
        </Grid>

        <Divider />

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
          <Grid style={{ textAlign: "left" }}>

            <Typography variant="overline" style={{ fontSize: 10 }}>Kick started by</Typography>
            <Grid container alignContent={"center"} alignItems={"flex-end"} gap={1}>
              <Grid>
                <OALogo size={90} />
              </Grid>
              <Grid>
                <Typography variant="h3" style={{ fontStyle: "italic" }}>Objects / Actions</Typography>
                <Typography variant="h2">Spreadsheets to Full Stack</Typography>
              </Grid>
            </Grid>
            <Link href={"/oa/readme"}>
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
    </HydrateClient>
  );
}
