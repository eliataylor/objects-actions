import React, { useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, IconButton, Typography } from "@mui/material";
import { ExpandMore, OpenInNew } from "@mui/icons-material";
import { WorksheetModel } from "./generator-types";
import SchemaTables from "./SchemaTables";


const SchemaContent: React.FC<{ worksheet: WorksheetModel }> = ({ worksheet }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries((worksheet.schema?.content_types || []).map(ct => [ct.model_name, false]))
  );

  const toggleAll = (expand: boolean) => {
    setExpanded(Object.fromEntries((worksheet.schema?.content_types || []).map(ct => [ct.model_name, expand])));
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button variant="outlined" onClick={() => toggleAll(true)}>Expand All</Button>
        <Button variant="outlined" onClick={() => toggleAll(false)}>Collapse All</Button>

        <Button
                startIcon={<OpenInNew />}
                size={'small'}
                component="a"
                href={`https://platform.openai.com/playground/assistants?assistant=${worksheet.assistantconfig}`}
                target="_blank" rel="noopener noreferrer">
           Assistant
        </Button>
      </Box>
      {worksheet.schema?.content_types?.map((w) => (
        <Accordion sx={{ p: 0 }} variant={"outlined"} key={w.model_name} expanded={expanded[w.model_name]}
                   onChange={() => setExpanded({ ...expanded, [w.model_name]: !expanded[w.model_name] })}>
          <AccordionSummary expandIcon={<ExpandMore />}>{w.name}</AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <SchemaTables {...w} />
          </AccordionDetails>
        </Accordion>
      )) || <Typography>{worksheet.response}</Typography>}
    </Box>
  );
};

export default SchemaContent;



export function renderOpenAiLinks(config:any) {
    const linkKeys = {
        'vector_store_id': 'https://platform.openai.com/storage/vector_stores/__ID__',
        'assistant_id': 'https://platform.openai.com/assistants/__ID__',
        'thread_id': 'https://platform.openai.com/threads/__ID__',
        'file_id': 'https://platform.openai.com/storage/files/__ID__',
        'file_path': 'https://platform.openai.com/storage/files/__ID__'
    }
    return <React.Fragment>
        {Object.entries(linkKeys).map(([key, value]) => {

            // const bool = value.toString().toUpperCase()
            return <Button
                startIcon={<OpenInNew />}
                size={'small'}
                component="a"
                href={value.replaceAll('__ID__', config)}
                target="_blank" rel="noopener noreferrer">
           Assistant
        </Button>

        })}
    </React.Fragment>
}
