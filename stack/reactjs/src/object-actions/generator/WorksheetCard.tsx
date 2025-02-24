import React from "react";
import { Card, CardContent, CardHeader, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { WorksheetModel } from "./generator-types";
import IconButton from "@mui/material/IconButton";
import { ReadMore } from "@mui/icons-material";

interface WorksheetCardProps {
  worksheet: WorksheetModel;
}

const MAX_RESPONSE_LENGTH = 120;

const WorksheetCard: React.FC<WorksheetCardProps> = ({ worksheet }) => {

  const truncatedResponse =
    worksheet.response.length > MAX_RESPONSE_LENGTH
      ? `${worksheet.response.substring(0, MAX_RESPONSE_LENGTH)}...`
      : worksheet.response;

  return (
    <Card sx={{ marginLeft: worksheet.parent ? 3 : 0 }}>
      <CardHeader
        title={<Typography variant="subtitle1">[#{worksheet.id}] {worksheet.prompt}</Typography>}
        subheader={new Intl.DateTimeFormat("en-US", {
          dateStyle: "full",
          timeStyle: "long"
        }).format(new Date(worksheet.created_at))}
        action={<IconButton color={"primary"} component={Link} to={`/oa/schemas/${worksheet.id}`}>
          <ReadMore />
        </IconButton>}
      />
      <CardContent>
        <Typography variant="body2">Descending Versions {worksheet.versions_count}</Typography>
      </CardContent>
    </Card>
  );
};

export default WorksheetCard;
