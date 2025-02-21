import React, { useState } from "react";
import { Alert, Box, Button, CircularProgress, Paper, TextField } from "@mui/material";
import { Science as GenerateIcon } from "@mui/icons-material";
import ApiClient, { HttpResponse } from "../../config/ApiClient";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { WorksheetApiResponse, WorksheetModel } from "./generator-types";
import WorksheetSelector from "./WorksheetSelector";

const WorksheetHeader: React.FC<{ worksheet: WorksheetModel }> = ({ worksheet }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [promptInput, setPromptInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleEnhance = async () => {
    if (!promptInput.trim()) {
      setError("Please enter at least one object name");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response: HttpResponse<WorksheetApiResponse> = await ApiClient.post(`api/worksheets/${worksheet.id}/enhance`, {
        prompt: promptInput,
        config_id: worksheet.assistantconfig
      });
      if (response.success && response.data) {
        enqueueSnackbar("Schema generated", { variant: "success" });
        setPromptInput("");
        return navigate(`/oa/worksheets/${response.data.data.id}`);
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
      <WorksheetSelector worksheet={worksheet} />
      <Paper sx={{ p: 1, mb: 4 }}>
        <TextField
          fullWidth
          variant="standard"
          name="app_idea"
          label="How do you want to change this schema"
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          disabled={loading}
          sx={{ mb: 2 }}
        />
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Button
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={24} /> : <GenerateIcon />}
          onClick={handleEnhance}
          disabled={loading || !promptInput.trim()}
        >
          {loading ? "Generating..." : "Rebuild"}
        </Button>
      </Paper>
    </Box>
  );
};

export default WorksheetHeader;
