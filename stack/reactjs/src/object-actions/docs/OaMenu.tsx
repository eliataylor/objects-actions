import React from "react";
import { AutoAwesome, LocalLibrary } from "@mui/icons-material";
import InstallIcon from "@mui/icons-material/Download";
import CustomizeIcon from "@mui/icons-material/Build";
import ExtendIcon from "@mui/icons-material/Extension";
import ContributeIcon from "@mui/icons-material/VolunteerActivism";
import { NavBarItem } from "../../components/AuthMenu";
import LightDarkImg from "../../components/LightDarkImg";
import { Box } from "@mui/material";
import ThemeSwitcher from "../../theme/ThemeSwitcher";

const OaMenu: React.FC<{ handleClick: () => void }> = ({ handleClick = undefined }) => {

  return (
    <React.Fragment>

      <NavBarItem
        to={"/oa/readme"}
        icon={<LocalLibrary fontSize={"small"} />}
        name={"About O/A"}
      />
      <NavBarItem
        to={"/oa/schemas/add"}
        icon={<AutoAwesome fontSize={"small"} />}
        name={"AI Assistant"}
      />
      <NavBarItem
        to={"/oa/run"}
        icon={<InstallIcon fontSize={"small"} />}
        name={"Run Demo"}
      />
      <NavBarItem
        to={"/oa/customize"}
        icon={<CustomizeIcon fontSize={"small"} />}
        name={"Customize"}
      />
      <NavBarItem
        to={"/oa/extend"}
        icon={<ExtendIcon fontSize={"small"} />}
        name={"Extend"}
      />
      <NavBarItem
        to={"/oa/contribute"}
        icon={<ContributeIcon fontSize={"small"} />}
        name={"Contribute"}
      />
      {/*
      <NavBarItem
        to={"/oa/consulting"}
        icon={<LiveHelpIcon fontSize={"small"} />}
        name={"Need Help?"}
      />
      */}
      <NavBarItem
        to={"https://github.com/eliataylor/objects-actions"}
        icon={
          <LightDarkImg
            light={"/oa-assets/github-mark.svg"}
            dark={"/oa-assets/github-mark-white.svg"}
            styles={{ height: 18 }}
          />
        }
        name={"Open Source"}
      />

      <Box p={1} ml={2} style={{ textAlign: "center" }}>
        <ThemeSwitcher />
      </Box>
    </React.Fragment>
  );
};

export default OaMenu;
