import React from "react";
import { Box, Grid, List, ListItem, ListItemText, Typography } from "@mui/material";
import { CheckBoxOutlined, CheckCircleOutline } from "@mui/icons-material";
import ArrowCircleDownIcon from "@mui/icons-material/ArrowCircleDown";
import { TightButton } from "../../theme/StyledFields";
import Avatar from "@mui/material/Avatar";
import LightDarkImg from "../../components/LightDarkImg";
import OaStackCards from "./OaStackCards";
import SpreadsheetCards from "./SpreadsheetCards";
import { Link } from "react-router-dom";
import { NeedHelp } from "./NeedHelp";

const ReadMe: React.FC = () => {
  return (
    <>
      <Box>
        <Grid container spacing={0} sx={{ mb: 3, pl: 1, pr: 1 }}>
          <Grid
            item
            xs={12}
            container
            justifyContent={"space-between"}
            alignItems={"center"}
            sx={{ mb: 3 }}
            wrap={"nowrap"}
          >
            <Grid item>
              <Typography variant={"caption"} style={{ fontStyle: "italic" }}>
                {" "}
                Objects/Actions
              </Typography>
              <Typography variant="h1">
                From Spreadsheets to Full Stack
              </Typography>
            </Grid>
            <Grid item>
              <a
                href={"https://github.com/eliataylor/objects-actions"}
                target="_blank" rel="noreferrer"
              >
                <TightButton
                  size={"small"}
                  variant={"contained"}
                  startIcon={
                    <LightDarkImg
                      light={"/oa-assets/github-mark-white.svg"}
                      dark={"/oa-assets/github-mark-white.svg"}
                      styles={{ height: 20 }}
                    />
                  }
                >
                  Open Source
                </TightButton>
              </a>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ m: 0 }}>
              WHY
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <List dense={true} sx={{ p: 0, m: 0 }}>
              <ListItem sx={{ p: 0 }}>
                <CheckBoxOutlined
                  fontSize={"small"}
                  style={{ marginRight: 5, fontSize: 16 }}
                />
                <ListItemText primary={"Document your Idea and Database"} />
              </ListItem>

              <ListItem sx={{ p: 0 }}>
                <CheckBoxOutlined
                  fontSize={"small"}
                  style={{ marginRight: 5, fontSize: 16 }}
                />
                <ListItemText
                  primary={"Quickly scaffold scalable Apps & APIs. Including:"}
                />
              </ListItem>
              <ListItem sx={{ p: 0, pl: 3.5 }}>
                <CheckCircleOutline style={{ marginRight: 5, fontSize: 14 }} />
                <ListItemText
                  primary={
                    "Authentication with Email, SMS, and nearly every social network"
                  }
                />
              </ListItem>
              <ListItem sx={{ p: 0, pl: 3.5 }}>
                <CheckCircleOutline style={{ marginRight: 5, fontSize: 14 }} />
                <ListItemText
                  primary={
                    "Access Controls for User Groups and content ownership context"
                  }
                />
              </ListItem>
              <ListItem sx={{ p: 0, pl: 3.5 }}>
                <CheckCircleOutline style={{ marginRight: 5, fontSize: 14 }} />
                <ListItemText primary={"Content Management Systems"} />
              </ListItem>
              <ListItem sx={{ p: 0, pl: 3.5 }}>
                <CheckCircleOutline style={{ marginRight: 5, fontSize: 14 }} />
                <ListItemText
                  primary={"Web App interface with API connectivity"}
                />
              </ListItem>
              <ListItem sx={{ p: 0, pl: 3.5 }}>
                <CheckCircleOutline style={{ marginRight: 5, fontSize: 14 }} />
                <ListItemText
                  primary={
                    "Complete End-To-End tests for functionality and content permissions"
                  }
                />
              </ListItem>
              <ListItem sx={{ p: 0, pl: 3.5 }}>
                <CheckCircleOutline style={{ marginRight: 5, fontSize: 14 }} />
                <ListItemText
                  primary={
                    "Data generator to create unlimited content data to test and prototype, and the base data for your Cypress tests"
                  }
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Box>

      <Box>
        <Grid container spacing={0} sx={{ mb: 1, pl: 4 }}>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ m: 0 }}>
              HOW
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <ListItem sx={{ p: 0, m: 0 }}>
              <Avatar style={{ marginRight: 8 }}>
                <img
                  alt={'google sheets logo'}
                  src={"/oa-assets/Google_Sheets_2020_Logo.svg"}
                  height={25}
                />
              </Avatar>
              <ListItemText
                primary={"Fill out your Objects/Actions worksheets"}
                secondary={
                  "This becomes your database schema and clear documentation for your team and contracts."
                }
              />
            </ListItem>
            <ListItem sx={{ p: 0, m: 0 }} component={Link} to={"/oa/schemas/add"}>
              <Avatar style={{ marginRight: 8 }}>
                <LightDarkImg light={"/oa-assets/openai-icon-black.svg"} dark={"/oa-assets/openai-icon-white.svg"} styles={{ height: 25 }} />
              </Avatar>
              <ListItemText
                primary={"Get help with this pre-trained AI assistant."}
              />
            </ListItem>
          </Grid>
        </Grid>

        <SpreadsheetCards />
      </Box>

      <Box p={0} mt={2} mb={2} sx={{ textAlign: "center" }}>
        <ArrowCircleDownIcon />
        <Typography variant={"body2"}>
          <code>docker-compose up --build</code>
        </Typography>
        <Typography variant={"h6"}>Generates this whole stack:</Typography>
        <ArrowCircleDownIcon />
      </Box>

      <Box>
        <OaStackCards />
      </Box>

      <Box sx={{ mt: 5, mb: 5, textAlign: "right" }}>
        <NeedHelp />
      </Box>
    </>
  );
};

export default ReadMe;
