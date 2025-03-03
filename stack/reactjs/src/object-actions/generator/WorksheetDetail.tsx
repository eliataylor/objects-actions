import React, { useRef, useState } from "react";
import { Alert, Box, Button, LinearProgress } from "@mui/material";
import WorksheetHeader from "./WorksheetHeader";
import SchemaContent from "./SchemaContent";
import { AiSchemaResponse, WorksheetModel } from "./generator-types";
import { Link, useNavigate } from "react-router-dom";
import { StreamChunk } from "./StreamingOutput";
import ApiClient from "../../config/ApiClient";
import ReactMarkdown from "react-markdown";
import SchemaTables from "./SchemaTables";
import { useSnackbar } from "notistack";

interface WorksheetDetailProps {
  worksheet: WorksheetModel;
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
    ApiClient.get(`/api/worksheets/${versionIdRef.current}`).then(response => {
      if (response.success && response.data) {
        const newWorksheet = response.data as WorksheetModel;
        let hasErrors = 0;
        if (newWorksheet.response !== reasoningRef.current) {
          hasErrors++;
          enqueueSnackbar("Reasoning not correctly saved in database", { variant: "warning" });
        }
        if (JSON.stringify(newWorksheet.schema) !== JSON.stringify(schemaRef.current)) {
          hasErrors++;
          enqueueSnackbar("Schema not correctly saved in database", { variant: "warning" });
        }
        if (hasErrors === 0) {
          setReasoning("");
          setSchema(null);
          navigate(`/oa/schemas/${versionIdRef.current}`);
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
        config_id: worksheet.config.id,
        stream: true,
        privacy: privacy,
        thread_id: worksheet.config.thread_id
      };

      ApiClient.stream<StreamChunk>(`/api/worksheets/${worksheet.id}/enhance?stream=true`, toPass,
        (chunk) => {
          if (chunk.error) {
            setError(chunk.error);
          }
          if (chunk.type === "message" && chunk.content) {
            setReasoning((prev) => {
              const newReasoning = prev + chunk.content as string;
              reasoningRef.current = newReasoning; // Update the ref with the new value
              return newReasoning;
            });
          }
          if (chunk.schema) {
            setSchema(chunk.schema);
            schemaRef.current = chunk.schema;
            setLoadingSchema(false);
          }
          if (chunk.version_id) {
            setVersionId(chunk.version_id as number);
            versionIdRef.current = chunk.version_id as number;
          }
          if (chunk.type === "done") {
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!schema && reasoning.length === 0 && <SchemaContent worksheet={worksheet} />}

      {reasoning.length > 0 && <ReactMarkdown>
        {reasoning}
      </ReactMarkdown>}

      {loadingSchema && <LinearProgress />}

      {schema?.content_types?.map((w) =>
        <SchemaTables forceExpand={true}
                      key={`schematable-${w.model_name}`}
                      {...w} />)}

      {schema && !loadingSchema && <Button variant={"contained"}
                                           component={Link}
                                           fullWidth={true}
                                           sx={{ mt: 3, mb: 4 }}
                                           to={`/oa/schemas/${versionId}`}>Request Edits</Button>}


    </Box>
  );
};

export default WorksheetDetail;
