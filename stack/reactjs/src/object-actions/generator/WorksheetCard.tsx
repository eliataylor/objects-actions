import React from "react";
import { Card, CardContent, CardHeader, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { WorksheetModel } from "./WorksheetType";
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
        title={worksheet.prompt}
        subheader={new Intl.DateTimeFormat("en-US", {
          dateStyle: "full",
          timeStyle: "long"
        }).format(new Date(worksheet.created_at))}
        action={<IconButton color={"primary"} component={Link} to={`/oa/worksheets/${worksheet.id}`}>
          <ReadMore />
        </IconButton>}
      />
      <CardContent>
        <Typography variant="body1">ID: {worksheet.id}</Typography>
        {worksheet.parent && (
          <Typography variant="body1">Parent: {worksheet.parent}</Typography>
        )}
        <Typography variant="body1">Versions: {worksheet.versions_count}</Typography>
        <Typography variant="body1">Response: {truncatedResponse}</Typography>
      </CardContent>
    </Card>
  );
};

export default WorksheetCard;
