// src/components/worksheets/GenerateFields.tsx
import React, { useState } from "react";
import { Alert, Box, Button, CircularProgress, LinearProgress, Paper, TextField, Typography } from "@mui/material";
import { FormatQuote, ListAlt, Science as GenerateIcon } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import ApiClient, { HttpResponse } from "../../config/ApiClient";
import { WorksheetApiResponse, WorksheetModel } from "./WorksheetType";
import WorksheetDetail from "./WorksheetDetail";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";

const GenerateFields: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [promptInput, setPromptInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<WorksheetModel | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      const response: HttpResponse<WorksheetApiResponse> = await ApiClient.post("api/worksheet/generate", {
        prompt: promptInput
      });

      if (response.success && response.data) {
        if (response.data.success) {
          setAiResponse(response.data.data as WorksheetModel);
          return enqueueSnackbar("Fields generated successfully", { variant: "success" });
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
      <Grid container justifyContent={"space-between"} wrap={"nowrap"}>
        <Grid item>
          <Typography variant="h4" component="h1" gutterBottom>
            Generate Object Fields
          </Typography>
        </Grid>
        <Grid item>
          <IconButton><ListAlt /></IconButton>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="body1" paragraph>
          Describe your app
        </Typography>

        <TextField
          fullWidth
          name={"app_idea"}
          label="What is your app meant to do?"
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

        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={24} /> : <GenerateIcon />}
            onClick={handleGenerate}
            disabled={loading || !promptInput.trim()}
          >
            {loading ? "Generating..." : "Generate Fields"}
          </Button>
        </Box>
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

      {aiResponse && <WorksheetDetail worksheet={aiResponse} />}
    </Box>
  );
};

export default GenerateFields;
