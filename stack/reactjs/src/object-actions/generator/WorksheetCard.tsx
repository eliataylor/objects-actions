import React from "react";
import { Card, CardHeader, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { SchemaVersions } from "./generator-types";
import IconButton from "@mui/material/IconButton";
import { ReadMore } from "@mui/icons-material";
import Avatar from "@mui/material/Avatar";

interface WorksheetCardProps {
  worksheet: SchemaVersions;
}

const WorksheetCard: React.FC<WorksheetCardProps> = ({ worksheet }) => {

  return (
    <Card sx={{ marginLeft: worksheet.parent ? 3 : 0 }}>
      <CardHeader
        avatar={<Avatar style={{ fontSize: 13 }}>#{worksheet.id}</Avatar>}
        subheader={
          <div>
            <Typography variant="subtitle2" gutterBottom>{worksheet.prompt}</Typography>
            <Typography variant="body2">{worksheet.versions_count} Revisions</Typography>
          </div>
        }
        title={<Typography variant="subtitle1">
          <b style={{ textTransform: "capitalize" }}>{worksheet.privacy}: </b>
          <small>{new Intl.DateTimeFormat("en-US", {
            dateStyle: "full",
            timeStyle: "long"
          }).format(new Date(worksheet.created_at))}</small>
        </Typography>}
        action={<IconButton color={"primary"} component={Link} to={`/oa/schemas/${worksheet.id}`}>
          <ReadMore />
        </IconButton>}
      />
    </Card>
  );
};

export default WorksheetCard;
