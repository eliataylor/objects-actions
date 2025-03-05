import React, { useRef, useState } from "react";
import { Alert, Box, Button, CircularProgress, LinearProgress, MenuItem, Paper, TextField, Typography } from "@mui/material";
import { FormatQuote, ListAlt, Science as GenerateIcon } from "@mui/icons-material";
import ApiClient from "../../config/ApiClient";
import { AiSchemaResponse, WorksheetModel, StreamChunk } from "./generator-types";
import Grid from "@mui/material/Grid";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../allauth/auth";
import ReactMarkdown from "react-markdown";
import SchemaTables from "./SchemaTables";
import { useSnackbar } from "notistack";

const NewSchemaForm: React.FC = () => {

  const { enqueueSnackbar } = useSnackbar();
  const me = useAuth()?.data?.user;
  const navigate = useNavigate();
  const [promptInput, setPromptInput] = useState<string>("");
  const [privacy, setPrivacy] = useState<string>("public");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
        const newWorksheet = response.data as WorksheetModel;
        if (newWorksheet.schema && newWorksheet.response) {
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

  const handleGenerate = () => {
    if (!promptInput.trim()) {
      setError("Please enter at least one object name");
      return;
    }

    if (promptInput.length === 0) {
      setError("Please enter a prompt");
      return;
    }

    setLoading(true);
    setError(null);

    const toPass = {
      prompt: promptInput,
      stream: true,
      privacy: privacy
    };

    try {
      ApiClient.stream<StreamChunk>("/api/worksheets/generate?stream=true", toPass,
        (chunk) => {
          if (chunk.error) {
            setError(chunk.error);
          }
          if (chunk.type === "reasoning" && chunk.content) {
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
          if (chunk.type === "done") {
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
      <Grid container justifyContent={"space-between"} wrap={"nowrap"} alignItems={"center"}>
        <Grid item>
          <Typography variant="h5" component="h1">
            Generate schema recommendations for any app idea
          </Typography>
        </Grid>
        <Grid item>
          <Button component={Link}
                  to={"/oa/schemas"}
                  variant={"contained"}
                  size={"small"}
                  color={"secondary"}
                  endIcon={<ListAlt />}>
            View App Schemas
          </Button>
        </Grid>
      </Grid>

      <Paper sx={{ p: 1, mb: 4, mt: 1 }}>
        <TextField
          fullWidth
          variant={"filled"}
          name={"app_idea"}
          multiline={true}
          rows={5}
          label="Describe who your app is for and what it is supposed to do"
          placeholder="e.x., My app is a Task List tool that includes deadline dates and priorities and prerequisites"
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          disabled={loading}
          sx={{ mb: 2 }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container alignItems={"center"} justifyContent={"space-between"}>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={24} /> : <GenerateIcon />}
              onClick={handleGenerate}
              disabled={loading || !promptInput.trim()}
            >
              {loading ? "Generating..." : "Generate"}
            </Button>
          </Grid>

          <Grid item xs={6}>
            <TextField
              select
              fullWidth
              id="privacySelector"
              label={!me ? "Login to control the privacy of your prompts" : "Select the privacy of this version"}
              value={privacy}
              disabled={!me}
              onChange={(e) => setPrivacy(e.target.value)}
              variant="filled"
            >
              <MenuItem value={"public"}>Public</MenuItem>
              <MenuItem value={"unlisted"}>Unlisted</MenuItem>
              <MenuItem value={"inviteonly"}>Invite Only</MenuItem>
              <MenuItem value={"authusers"}>Authenticated Users</MenuItem>
              <MenuItem value={"onlyme"}>Only Me</MenuItem>
            </TextField>
          </Grid>
        </Grid>

      </Paper>

      {loading &&
        <Box>
          <Typography variant="subtitle1" style={{ fontStyle: "italic", textAlign: "center" }} component="h3" gutterBottom>
            <FormatQuote fontSize={"small"} />
            {promptInput}
            <FormatQuote fontSize={"small"} />
          </Typography>

          <LinearProgress />
        </Box>
      }

      {versionId > 0 && <Button variant={"contained"}
                                component={Link}
                                fullWidth={true}
                                to={`/oa/schemas/${versionId}`}>Request Edits</Button>}


      {reasoning && <ReactMarkdown>
        {reasoning}
      </ReactMarkdown>}

      {loadingSchema && <LinearProgress />}

      {schema?.content_types?.map((w) =>
        <SchemaTables forceExpand={true}
                      key={`schematable-${w.model_name}`}
                      {...w} />)}

    </Box>
  );
};

export default NewSchemaForm;
