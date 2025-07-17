import React, { useRef, useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, Fab } from "@mui/material";
import WorksheetHeader from "./WorksheetHeader";
import SchemaContent from "./SchemaContent";
import { AiSchemaResponse, SchemaVersions, StreamChunk } from "./generator-types";
import { Link, useNavigate } from "react-router-dom";
import ApiClient from "../../config/ApiClient";
import ReactMarkdown from "react-markdown";
import SchemaTables from "./SchemaTables";
import { useSnackbar } from "notistack";

interface WorksheetDetailProps {
  worksheet: SchemaVersions;
  refetchWorksheet: (versionId: number) => void;
}

const WorksheetDetail: React.FC<WorksheetDetailProps> = ({ worksheet, refetchWorksheet }) => {

  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [versionId, setVersionId] = useState<number>(0);
  const [schema, setSchema] = useState<AiSchemaResponse | null>(null);
  const [reasoning, setReasoning] = useState<string>("");

  const versionIdRef = useRef(0); // don't trigger redraw until completely done

  const handleEnhance = (promptInput: string, privacy: string) => {
    if (!promptInput.trim()) {
      setError("Please describe your app or changes you want in this schema");
      return;
    }

    setLoading(true);
    setError(null);
    setSchema(null);
    setReasoning("");

    try {
      const toPass: any = {
        prompt: promptInput,
        privacy: privacy,
        version_id: worksheet.id
      };

      ApiClient.stream<StreamChunk>(`/api/worksheets/${worksheet.id}/enhance`, toPass,
        (chunk) => {
          if (chunk.error) {
            setError(chunk.error);
          } else if (chunk.type === "keep_alive") {
            enqueueSnackbar("Still working...", { variant: "info" });
          } else if (chunk.type === "reasoning" && chunk.content) {
            setReasoning(chunk.content);
          } else if (chunk.type === "message" && chunk.content) {
            setReasoning((prev) => {
              const newReasoning = prev + chunk.content as string;
              return newReasoning;
            });
          } else {
            console.log("CHUNK ", chunk);
          }
          if (chunk.schema) {
            console.log("SETTING SCHEMA ", chunk);
            setSchema(chunk.schema);
          }
          if (chunk.version_id) {
            console.log("SETTING VERSION ID ", chunk);
            setVersionId(chunk.version_id as number);
            versionIdRef.current = chunk.version_id as number;
          }
          if (chunk.type === "done") {
            console.log("SETTING DONE ", chunk);
          }
        },
        (error) => {
          console.error(error);
          setError(error);
        },
        () => {
          setLoading(false);
          if (versionIdRef.current > 0) {
            navigate(`/oa/schemas/${versionIdRef.current}`);
          }
        }
      );
    } catch (err) {
      setError(`An unexpected error occurred ${err?.toString()}`);
    }
  };

  return (
    <Box>
      <WorksheetHeader worksheet={worksheet} loading={loading} handleEnhance={handleEnhance} />

      {versionIdRef.current !== versionId && <Button variant={"contained"}
        component={Link}
        fullWidth={true}
        sx={{ mt: 3, mb: 4 }}
        onClick={() => {
          setVersionId(0);
          setReasoning("");
          setSchema(null);
        }}
        to={`/oa/schemas/${versionId}`}>Request Edits</Button>}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <SchemaContent loading={loading} worksheet={worksheet} />

      {loading && <React.Fragment>
        {reasoning.length > 0 && <ReactMarkdown>
          {reasoning}
        </ReactMarkdown>}

        <Fab
          color="primary"
          size="small"
          sx={{ position: "fixed", backgroundColor: "transparent", right: 20, bottom: 20 }}
        >
          <CircularProgress color={!loading ? "primary" : "secondary"} />
        </Fab>

        {schema?.content_types?.map((w) =>
          <SchemaTables forceExpand={true}
            key={`schematable-${w.model_name}`}
            {...w} />)}
      </React.Fragment>}


    </Box>
  );
};

export default WorksheetDetail;
