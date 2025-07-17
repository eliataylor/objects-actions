import React, { useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Button, ButtonGroup, Typography } from "@mui/material";
import { ExpandLess, ExpandMore, FileDownload, OpenInNew } from "@mui/icons-material";
import { SchemaVersions } from "./generator-types";
import SchemaTables from "./SchemaTables";
import Grid from "@mui/material/Grid";
import LightDarkImg from "../../components/LightDarkImg";
import ReactMarkdown from "react-markdown";

const SchemaContent: React.FC<{ worksheet: SchemaVersions, loading: boolean }> = ({ worksheet, loading }) => {
  const [reasoningExpanded, setReasoningExpanded] = useState<boolean>(true);
  const [forceExpanded, setForceExpanded] = useState<boolean>(true);

  const toggleAll = (expand: boolean) => {
    setForceExpanded(!forceExpanded);
  };

  const handleDownload = () => {
    const url = `${process.env.REACT_APP_API_HOST}/api/worksheets/${worksheet.id}/download`;
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `worksheet_${worksheet.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return renderOpenAiLinks(worksheet)
  }


  return (
    <Grid>
      <Grid container alignItems={"center"} justifyContent={"space-between"} sx={{ mb: 1 }}>
        {worksheet.schema &&
          <Grid item>
            <ButtonGroup size={"small"} variant="outlined" color={"secondary"}>
              <Button startIcon={<ExpandMore />} onClick={() => toggleAll(true)}>Expand All</Button>
              <Button endIcon={<ExpandLess />} onClick={() => toggleAll(false)}>Collapse All</Button>
            </ButtonGroup>
          </Grid>
        }
        <Grid item>
          {renderOpenAiLinks(worksheet)}
          <Button
            variant={"contained"}
            color={"primary"}
            endIcon={<FileDownload fontSize={"small"} />}
            onClick={handleDownload}
            size="small"
          >
            Export to CSV
          </Button>
        </Grid>
      </Grid>
      <Accordion variant={"elevation"} expanded={reasoningExpanded}
        sx={{ mb: 2, mt: 2 }}
        onChange={() => setReasoningExpanded(!reasoningExpanded)}>
        <AccordionSummary expandIcon={<ExpandMore />}>AI Reasoning</AccordionSummary>
        <AccordionDetails>
          <ReactMarkdown>
            {worksheet.reasoning}
          </ReactMarkdown>
        </AccordionDetails>
      </Accordion>
      {worksheet.schema?.content_types?.map((w) => (
        <SchemaTables forceExpand={forceExpanded} key={`schematable-${w.model_name}`}  {...w} />
      ))}
    </Grid>
  );
};

export default SchemaContent;

export function renderOpenAiLinks(worksheet: SchemaVersions) {
  const linkConfig = {
    "assistant_id": {
      url: "https://platform.openai.com/assistants/__ID__",
      name: "Assistant"
    },
    "thread_id": {
      url: "https://platform.openai.com/threads/__ID__",
      name: "Thread"
    }
    /*
    "message_id": {
      url: "https://platform.openai.com/messages/__ID__",
      name: "Message"
    },
    "vector_store_id": {
      url: "https://platform.openai.com/storage/vector_stores/__ID__",
      name: "Vector Store"
    },
    "run_id": {
      url: "https://platform.openai.com/runs/__ID__",
      name: "Run"
    },
    "file_id": {
      url: "https://platform.openai.com/storage/files/__ID__",
      name: "File"
    },
    "file_path": {
      url: "https://platform.openai.com/storage/files/__ID__",
      name: "File Path"
    }
     */
  };

  return (
    <React.Fragment>
      {Object.entries(linkConfig).map(([key, { url, name }]) => {
        // Use type assertion to tell TypeScript this is a valid key
        if (key in worksheet) {
          // Type guard to ensure the key exists in worksheet
          const worksheetKey = key as keyof typeof worksheet;
          const idValue = worksheet[worksheetKey];

          // Check if the value is a string
          if (typeof idValue === "string") {
            return (
              <Button
                key={key}
                style={{ marginRight: 10 }}
                startIcon={<LightDarkImg light={"/oa-assets/openai-icon-black.svg"} dark={"/oa-assets/openai-icon-white.svg"} styles={{ height: 17 }} />}
                endIcon={<OpenInNew fontSize={"small"} />}
                variant={"outlined"}
                color={"inherit"}
                size="small"
                component="a"
                href={url.replace("__ID__", idValue)}
                target="_blank"
                rel="noreferrer"
              >
                {name}
              </Button>
            );
          }
        }

        return null;
      })}
    </React.Fragment>
  );
}
