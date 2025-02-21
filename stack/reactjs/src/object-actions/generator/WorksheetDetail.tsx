import React from "react";
import { Box } from "@mui/material";
import WorksheetHeader from "./WorksheetHeader";
import SchemaContent from "./SchemaContent";
import { WorksheetModel } from "./generator-types";

interface WorksheetDetailProps {
  worksheet: WorksheetModel;
}

const WorksheetDetail: React.FC<WorksheetDetailProps> = ({ worksheet }) => {
  return (
    <Box>
      <WorksheetHeader worksheet={worksheet} />
      <SchemaContent worksheet={worksheet} />
    </Box>
  );
};

export default WorksheetDetail;
