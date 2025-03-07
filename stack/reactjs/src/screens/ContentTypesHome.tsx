import React from "react";
import { Card, CardHeader, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { NAVITEMS } from "../object-actions/types/types";
import MuiIcon from "../components/MuiIcon";
import IconButton from "@mui/material/IconButton";
import { Add } from "@mui/icons-material";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";

interface ContentTypesHomeProps {
  loading?: string;
}

const ContentTypesHome: React.FC<ContentTypesHomeProps> = ({ loading = undefined }) => {

  return <React.Fragment>
    <Typography variant={"h5"} gutterBottom={true}>These content types and their forms can be customized following <Link to={"/oa/customize"}>this tutorial</Link></Typography>
    <Grid container spacing={1} justifyContent={'stretch'} >
      {NAVITEMS.map((item) => {
        return <Grid item xs={6} sm={4} md={3} key={`ContentTypeCard-${item.segment}`}> <CardHeader
          avatar={item.icon && <Avatar><MuiIcon fontSize={"small"} icon={item.icon} /></Avatar>}
          title={<Link to={`/${item.segment}`}>{item.plural}</Link>}
          action={<IconButton color={"primary"}
                              size={"small"}
                              component={Link}
                              to={`/forms/${item.segment}/0/add`}><Add /></IconButton>} /></Grid>;
      })}
    </Grid>
  </React.Fragment>;
};

export default ContentTypesHome;
