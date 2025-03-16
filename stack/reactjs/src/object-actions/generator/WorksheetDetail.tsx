import React, { useRef, useState } from "react";
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
}

const WorksheetDetail: React.FC<WorksheetDetailProps> = ({ worksheet }) => {

  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [versionId, setVersionId] = useState<number>(0);
  const [schema, setSchema] = useState<AiSchemaResponse | null>(null);
  const [loadingSchema, setLoadingSchema] = useState<boolean>(false);
  const [reasoning, setReasoning] = useState<string>("");

  // because onDone won't have the latest version in state!
  const versionIdRef = useRef(0);
  const reasoningRef = useRef("");
  const schemaRef = useRef<AiSchemaResponse | null>(null);

  const onDone = async () => {
    if (versionIdRef.current === 0) {
      console.warn("Never got the version id!?");
      return false;
    }
    ApiClient.get(`/api/worksheets/${versionIdRef.current}`).then(response => {
      if (response.success && response.data) {
        const newWorksheet = response.data as SchemaVersions;
        if (newWorksheet.schema && newWorksheet.reasoning) {
          setVersionId(0);
          setReasoning("");
          setSchema(null);
          enqueueSnackbar("Successful.", { variant: "success" });
          return navigate(`/oa/schemas/${newWorksheet.id}`);
        } else {
          enqueueSnackbar("Incomplete answer. Use this page to try again, or click Request Edits to continue the thread.", { variant: "warning" });
        }
      } else {
        setError("Got invalid worksheet from database.");
      }
    }).catch((err) => {
      setError("Failed to load saved worksheet from database.");
    }).finally(() => {
      setLoading(false);
      setLoadingSchema(false);
    });

  };

  const handleEnhance = (promptInput: string, privacy: string) => {
    if (!promptInput.trim()) {
      setError("Please describe your app or changes you want in this schema");
      return;
    }

    setLoading(true);
    setError(null);

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
          }
          if (chunk.type === "keep_alive") {
            enqueueSnackbar("Still working...", { variant: "info" });
          } else if (chunk.type === "reasoning" && chunk.content) {
            setReasoning(chunk.content);
            reasoningRef.current = chunk.content;
          } else if (chunk.type === "message" && chunk.content) {
            setReasoning((prev) => {
              const newReasoning = prev + chunk.content as string;
              reasoningRef.current = newReasoning; // Update the ref with the new value
              return newReasoning;
            });
          } else {
            console.log("CHUNK ", chunk);
          }
          if (chunk.schema) {
            console.log("SETTING SCHEMA ", chunk);
            setSchema(chunk.schema);
            schemaRef.current = chunk.schema;
            setLoadingSchema(false);
          }
          if (chunk.version_id) {
            console.log("SETTING VERSION ID ", chunk);
            setVersionId(chunk.version_id as number);
            versionIdRef.current = chunk.version_id as number;
          }
          if (chunk.type === "done" || (versionIdRef.current > 0 && schemaRef.current)) {
            console.log("SETTING DONE ", chunk);
            setLoadingSchema(true);
          }
        },
        (error) => {
          console.error(error);
          setError(error);
        },
        () => {
          onDone();
        }
      );
    } catch (err) {
      setError(`An unexpected error occurred ${err?.toString()}`);
    }
  };

  return (
    <Box>
      <WorksheetHeader worksheet={worksheet} loading={loading} handleEnhance={handleEnhance} />

      {versionId > 0 && <Button variant={"contained"}
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

      {!schema && reasoning.length === 0 && <SchemaContent worksheet={worksheet} />}

      {reasoning.length > 0 && <ReactMarkdown>
        {reasoning}
      </ReactMarkdown>}

      {(loading || loadingSchema) &&
        <Fab
          color="primary"
          size="small"
          sx={{ position: "fixed", backgroundColor: "transparent", right: 20, bottom: 20 }}
        >
          <CircularProgress color={!loading ? "primary" : "secondary"} />
        </Fab>
      }

      {schema?.content_types?.map((w) =>
        <SchemaTables forceExpand={true}
                      key={`schematable-${w.model_name}`}
                      {...w} />)}


    </Box>
  );
};

export default WorksheetDetail;
