import React, { useState } from "react";
import { Alert, Box, Button, CircularProgress, Divider, LinearProgress, MenuItem, Paper, TextField, Typography } from "@mui/material";
import { FormatQuote, ListAlt, Science as GenerateIcon } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import ApiClient, { HttpResponse } from "../../config/ApiClient";
import { WorksheetApiResponse } from "./generator-types";
import Grid from "@mui/material/Grid";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../allauth/auth";
import StreamingOutput, { StreamChunk } from "./StreamingOutput";

const NewSchemaForm: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const me = useAuth()?.data?.user;
  const [promptInput, setPromptInput] = useState<string>("");
  const [privacy, setPrivacy] = useState<string>("public");
  const [useStream, setUseStream] = useState<boolean>(window.location.search.indexOf("stream") > -1);
  const [loading, setLoading] = useState<boolean>(false);
  const [streamedChunk, setStreamedChunk] = useState<StreamChunk | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [schema, setSchema] = useState<string | null>(null);
  const [loadingSchema, setLoadingSchema] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSchema = (chunk: StreamChunk) => {
    let str = chunk.content;
    if (typeof str === "object") {
      str = JSON.stringify(str);
    }
    setSchema(str);
    setLoadingSchema(false);
  };

  const handleNewVersion = (chunk: StreamChunk) => {
    setLoadingSchema(true);
  };

  const handleGenerate = async () => {
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
      stream: useStream,
      privacy: privacy
    };

    try {
      if (useStream === true) {
        ApiClient.stream<StreamChunk>("/api/worksheets/generate?stream=true", toPass,
          (chunk) => {
            setStreamedChunk(chunk); // Directly pass new chunk
          },
          (error) => {
            console.error(error);
          }
        );
      } else {
        const response: HttpResponse<WorksheetApiResponse> = await ApiClient.post("api/worksheets/generate", toPass);
        if (response.success && response.data) {
          if (response.data.success) {
            enqueueSnackbar("Fields generated successfully", { variant: "success" });
            return navigate(`/oa/schemas/${response.data.data.id}`);
          }
        }
        setError(response.error || "Failed to generate fields");
        enqueueSnackbar("Error generating fields", { variant: "error" });
      }
    } catch (err) {
      setError("An unexpected error occurred");
      enqueueSnackbar("Error connecting to the server", { variant: "error" });
    } finally {
      setLoading(false);
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
            </TextField></Grid>
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

      {streamedChunk && <StreamingOutput chunk={streamedChunk} onSchema={handleSchema} onVersionComplete={handleNewVersion} />}

      <Divider />

      {loadingSchema === true && <LinearProgress />}

      {schema &&
        <Typography
          component="pre"
          sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}
        >
          {schema}
        </Typography>}
    </Box>
  );
};

export default NewSchemaForm;
