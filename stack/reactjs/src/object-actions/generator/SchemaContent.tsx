import React, { useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Button, ButtonGroup, Typography } from "@mui/material";
import { ExpandLess, ExpandMore, FileDownload, OpenInNew } from "@mui/icons-material";
import { WorksheetModel } from "./generator-types";
import SchemaTables from "./SchemaTables";
import Grid from "@mui/material/Grid";
import LightDarkImg from "../../components/LightDarkImg";

const SchemaContent: React.FC<{ worksheet: WorksheetModel }> = ({ worksheet }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries((worksheet.schema?.content_types || []).map(ct => [ct.model_name, false]))
  );

  const toggleAll = (expand: boolean) => {
    setExpanded(Object.fromEntries((worksheet.schema?.content_types || []).map(ct => [ct.model_name, expand])));
  };

  return (
    <Grid>
      <Grid container alignItems={"center"} justifyContent={"space-between"} sx={{ mb: 1 }}>
        <Grid item>
          <ButtonGroup size={"small"} variant="outlined" color={"secondary"}>
            <Button startIcon={<ExpandMore />} onClick={() => toggleAll(true)}>Expand All</Button>
            <Button endIcon={<ExpandLess />} onClick={() => toggleAll(false)}>Collapse All</Button>
          </ButtonGroup>
        </Grid>
        <Grid item>
          {renderOpenAiLinks(worksheet.config)}
          <Button
            variant={"contained"}
            color={"primary"}
            endIcon={<FileDownload fontSize={"small"} />}
            onClick={() => window.alert("Feature coming soon!")}
            size="small"
          >
            Export to CSV
          </Button>
        </Grid>
      </Grid>
      {worksheet.schema?.content_types?.map((w) => (
        <Accordion variant={"outlined"} key={w.model_name} expanded={expanded[w.model_name]}
                   onChange={() => setExpanded({ ...expanded, [w.model_name]: !expanded[w.model_name] })}>
          <AccordionSummary
            style={{ margin: 0, minHeight: "auto" }}
            expandIcon={<ExpandMore />}>{w.name}</AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <SchemaTables {...w} />
          </AccordionDetails>
        </Accordion>
      )) || <Typography>{worksheet.response}</Typography>}
    </Grid>
  );
};

export default SchemaContent;

export function renderOpenAiLinks(config: any) {
  const linkConfig = {
    "vector_store_id": {
      url: "https://platform.openai.com/storage/vector_stores/__ID__",
      name: "Vector Store"
    },
    "assistant_id": {
      url: "https://platform.openai.com/assistants/__ID__",
      name: "Assistant"
    },
    "thread_id": {
      url: "https://platform.openai.com/threads/__ID__",
      name: "Thread"
    },
    /*
    "message_id": {
      url: "https://platform.openai.com/messages/__ID__",
      name: "Message"
    },
    "run_id": {
      url: "https://platform.openai.com/runs/__ID__",
      name: "Run"
    },
     */
    "file_id": {
      url: "https://platform.openai.com/storage/files/__ID__",
      name: "File"
    },
    "file_path": {
      url: "https://platform.openai.com/storage/files/__ID__",
      name: "File Path"
    }
  };

  return (
    <React.Fragment>
      {Object.entries(linkConfig).map(([key, { url, name }]) => (
        (!config[key]) ? null :
          <Button
            key={key}
            style={{ marginRight: 10 }}
            startIcon={<LightDarkImg light={"/oa-assets/openai-icon-black.svg"} dark={"/oa-assets/openai-icon-white.svg"} styles={{ height: 17 }} />}
            endIcon={<OpenInNew fontSize={"small"} />}
            variant={"outlined"}
            color={"inherit"}
            size="small"
            component="a"
            href={url.replace("__ID__", config[key])}
            target="_blank"
            rel="noopener noreferrer"
          >
            {name}
          </Button>
      ))}
    </React.Fragment>
  );
}
