import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import { LiveHelp } from "@mui/icons-material";
import React from "react";

export const NeedHelp: React.FC = () => {
  return (
    <Button
      size={"small"}
      component={Link}
      to={"/oa/consulting"}
      variant={"text"}
      endIcon={<LiveHelp fontSize={"small"} />}
    >
      Need Help
    </Button>);
};
