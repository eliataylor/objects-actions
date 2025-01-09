import React from "react";
import { LocalLibrary } from "@mui/icons-material";
import InstallIcon from "@mui/icons-material/Download";
import CustomizeIcon from "@mui/icons-material/Build";
import ExtendIcon from "@mui/icons-material/Extension";
import ContributeIcon from "@mui/icons-material/VolunteerActivism";
import { NavBarItem } from "../../components/AuthMenu";
import LightDarkImg from "../../components/LightDarkImg";

const OaMenu: React.FC<{ handleClick: () => void }> = ({ handleClick }) => {

  return (
    <React.Fragment>

      <NavBarItem
        to={"/oa/readme"}
        icon={<LocalLibrary fontSize={"small"} />}
        name={"About O/A"}
      />
      <NavBarItem
        to={"/oa/install"}
        icon={<InstallIcon fontSize={"small"} />}
        name={"Install"}
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
    </React.Fragment>
  );
};

export default OaMenu;
