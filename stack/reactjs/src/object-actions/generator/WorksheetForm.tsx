import React, { useState } from "react";
import { Alert, Box, Button, CircularProgress, LinearProgress, Paper, TextField, Typography } from "@mui/material";
import { FormatQuote, ListAlt, Science as GenerateIcon } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import ApiClient, { HttpResponse } from "../../config/ApiClient";
import { WorksheetApiResponse } from "./generator-types";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import { Link, useNavigate } from "react-router-dom";

const WorksheetForm: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [promptInput, setPromptInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
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
    try {
      const response: HttpResponse<WorksheetApiResponse> = await ApiClient.post("api/worksheets/generate", {
        prompt: promptInput
      });

      if (response.success && response.data) {
        if (response.data.success) {
          enqueueSnackbar("Fields generated successfully", { variant: "success" });
          return navigate(`/oa/worksheets/${response.data.data.id}`);
        }
      }
      setError(response.error || "Failed to generate fields");
      enqueueSnackbar("Error generating fields", { variant: "error" });
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
          <IconButton component={Link} to={"/oa/worksheets"}><ListAlt /></IconButton>
        </Grid>
      </Grid>

      <Paper sx={{ p: 1, mb: 4 }}>
        <TextField
          fullWidth
          variant={"filled"}
          name={"app_idea"}
          label="Describe who your app is for and what it is supposed to do"
          placeholder="e.x., My app is a Task List tool that includes deadline dates and priorities and prerequisites"
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          disabled={loading}
          sx={{ mb: 2 }}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={24} /> : <GenerateIcon />}
          onClick={handleGenerate}
          disabled={loading || !promptInput.trim()}
        >
          {loading ? "Generating..." : "Generate"}
        </Button>
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
    </Box>
  );
};

export default WorksheetForm;
