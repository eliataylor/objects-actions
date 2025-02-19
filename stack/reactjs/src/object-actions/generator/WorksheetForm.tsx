// src/components/worksheets/GenerateFields.tsx
import React, { useState } from "react";
import { Alert, Box, Button, CircularProgress, Paper, TextField, Typography } from "@mui/material";
import { Science as GenerateIcon } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import ApiClient from "../../config/ApiClient";


const GenerateFields: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [promptInput, setPromptInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedFields, setGeneratedFields] = useState<string | null>(null);
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
      const response = await ApiClient.post("api/worksheet/generate", {
        prompt: promptInput
      });

      if (response.success && response.data) {
        setGeneratedFields(response.data as string);
        enqueueSnackbar("Fields generated successfully", { variant: "success" });
      } else {
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
      <Typography variant="h4" component="h1" gutterBottom>
        Generate Object Fields
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="body1" paragraph>
          Describe your app
        </Typography>

        <TextField
          fullWidth
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

      {generatedFields && (
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            Generated Fields
          </Typography>

          {JSON.stringify(generatedFields)}
        </Box>
      )}
    </Box>
  );
};

export default GenerateFields;
