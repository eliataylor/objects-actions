import React from "react";
import { Box, Typography } from "@mui/material";
import WorksheetType, { SchemaContentType, WorksheetApiResponse } from "./WorksheetType";
import { FormatQuote } from "@mui/icons-material";

interface WorksheetDetailProps {
  worksheet: WorksheetApiResponse;
}

const WorksheetDetail: React.FC<WorksheetDetailProps> = ({ worksheet }) => {

  return (
    <Box>
      <Typography variant="subtitle1" style={{fontStyle:'italic', textAlign:'center'}} component="h3" gutterBottom>
         <FormatQuote fontSize={'small'} />
        {worksheet.prompt}
        <FormatQuote fontSize={'small'} />
      </Typography>

      {worksheet.schema?.content_types && Array.isArray(worksheet.schema?.content_types) ?
        worksheet.schema?.content_types.map((w: SchemaContentType, i:number) => {
          return <WorksheetType key={`worksheet-${w.model_name}-${i}`} model_name={w.model_name} fields={w.fields} />;
        })
        :
        <Typography>{worksheet.response}</Typography>
      }
    </Box>
  );
};

export default WorksheetDetail;
