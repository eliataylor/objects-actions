import React, { useRef, useState } from "react";
import { Alert, Box, Button, CircularProgress, Fab, MenuItem, Paper, TextField, Typography } from "@mui/material";
import { FormatQuote, ListAlt, Science as GenerateIcon } from "@mui/icons-material";
import ApiClient from "../../config/ApiClient";
import { AiSchemaResponse, SchemaVersions, StreamChunk } from "./generator-types";
import Grid from "@mui/material/Grid";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../allauth/auth";
import ReactMarkdown from "react-markdown";
import SchemaTables from "./SchemaTables";
import { useSnackbar } from "notistack";
import { extractJson } from "./WorksheetLoader";

const NewSchemaForm: React.FC = () => {

  const { enqueueSnackbar } = useSnackbar();
  const me = useAuth()?.data?.user;
  const navigate = useNavigate();
  const [promptInput, setPromptInput] = useState<string>("");
  const [privacy, setPrivacy] = useState<string>(me ? "authusers" : "public");
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
        const newWorksheet = response.data as SchemaVersions;
        const json = extractJson(newWorksheet.reasoning ?? "");
        if (Array.isArray(json)) {
          newWorksheet.schema = json[0] as AiSchemaResponse;
          newWorksheet.reasoning = newWorksheet.reasoning?.replace(json[1], "");
        }
        if (newWorksheet.schema && newWorksheet.reasoning) {
          enqueueSnackbar("Successful.", { variant: "success" });          
          return navigate(`/oa/schemas/${newWorksheet.id}`);
        }
        enqueueSnackbar("Incomplete answer. Use this page to try again, or click Request Edits to continue the thread.", { variant: "warning" });
        if (newWorksheet.schema || newWorksheet.reasoning) {
          navigate(`/oa/schemas/${newWorksheet.id}`);
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

    const toPass: any = {
      prompt: promptInput,
      privacy: privacy
    };
    if (versionId > 0) { // for retries
      toPass.version_id = versionId;
    }

    try {
      ApiClient.stream<StreamChunk>("/api/worksheets/generate", toPass,
        (chunk) => {
          if (chunk.error) {
            setError(chunk.error); 
          } else if (chunk.type === "error") {
            console.error("STREAM ERROR ", chunk);
            setError(chunk.content as string);
          } else if (chunk.type === "keep_alive") {
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
      <Grid container justifyContent={"space-between"} wrap={"nowrap"} alignItems={"center"}>
        <Grid item>
          <Typography variant="h4" component="h1">
            Generate the spreadsheet to document your app idea.
          </Typography>
          <Typography variant="subtitle2" component="h2">
            A trained AI agent will offer reasoning and structured tables for use with Objects/Actions
          </Typography>
        </Grid>
        <Grid item>
          <Button component={Link}
                  to={"/oa/schemas"}
                  variant={"contained"}
                  size={"small"}
                  color={"secondary"}
                  endIcon={<ListAlt />}>
            App Ideas
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
          label="Describe your app idea."
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

      {(loading || loadingSchema) &&
        <Box>
          <Typography variant="subtitle1" style={{ fontStyle: "italic", textAlign: "center" }} component="h3" gutterBottom>
            <FormatQuote fontSize={"small"} />
            {promptInput}
            <FormatQuote fontSize={"small"} />
          </Typography>

          <Fab
            color="primary"
            size="small"
            sx={{ position: "fixed", backgroundColor: "transparent", right: 20, bottom: 20 }}
          >
            <CircularProgress color={!loading ? "primary" : "secondary"} />
          </Fab>
        </Box>
      }

      {versionId > 0 && <Button variant={"contained"}
                                component={Link}
                                fullWidth={true}
                                to={`/oa/schemas/${versionId}`}>Request Edits</Button>}


      {reasoning && <ReactMarkdown>
        {reasoning}
      </ReactMarkdown>}

      {schema?.content_types?.map((w) =>
        <SchemaTables forceExpand={true}
                      key={`schematable-${w.model_name}`}
                      {...w} />)}

    </Box>
  );
};

export default NewSchemaForm;
