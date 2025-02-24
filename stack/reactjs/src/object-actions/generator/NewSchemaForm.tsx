import React, { useState } from "react";
import { Alert, Box, Button, CircularProgress, LinearProgress, List, ListItem, ListItemText, MenuItem, Paper, TextField, Typography } from "@mui/material";
import { FormatQuote, ListAlt, Science as GenerateIcon } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import ApiClient, { HttpResponse } from "../../config/ApiClient";
import { WorksheetApiResponse, WorksheetStreamResponse } from "./generator-types";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../allauth/auth";

const NewSchemaForm: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const me = useAuth()?.data?.user;
  const [promptInput, setPromptInput] = useState<string>("");
  const [privacy, setPrivacy] = useState<string>("public");
  const [useStream, setUseStream] = useState<boolean>(window.location.search.indexOf("stream") > -1);
  const [loading, setLoading] = useState<boolean>(false);
  const [reasoning, setReasoning] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
        ApiClient.stream<WorksheetStreamResponse>("/api/worksheets/generate?stream=true", toPass,
          (chunk) => {
            if (!chunk || (!chunk.reasoning && !chunk.schema && !chunk.error)) {
              setError("Unknown server error");
            } else if (chunk.error) {
              setError(chunk.error);
            } else if (chunk.reasoning) {
              setReasoning([...reasoning, chunk.reasoning]);
            }
            if (chunk.config_id) {
              enqueueSnackbar("Fields generated successfully", { variant: "success" });
              return navigate(`/oa/schemas/${chunk.config_id}`);
            }
          }, (error) => {
            setError(error);
          });
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
            Generate object and field recommendations for any app idea
          </Typography>
        </Grid>
        <Grid item>
          <IconButton component={Link} to={"/oa/schemas"}><ListAlt /></IconButton>
        </Grid>
      </Grid>

      <Paper sx={{ p: 1, mb: 4 }}>
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

      {reasoning.length > 0 && (
        <List>
          {reasoning.map((line, index) => (
            <ListItem key={index}>
              <ListItemText primary={line} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default NewSchemaForm;
