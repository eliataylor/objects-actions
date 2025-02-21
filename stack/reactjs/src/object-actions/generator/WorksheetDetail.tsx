import React, { useState } from "react";
import { Alert, Box, Button, CircularProgress, Paper, TextField, Typography } from "@mui/material";
import WorksheetType, { SchemaContentType, WorksheetApiResponse, WorksheetModel } from "./WorksheetType";
import { Science as GenerateIcon } from "@mui/icons-material";
import ApiClient, { HttpResponse } from "../../config/ApiClient";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import WorksheetSelector from "./WorksheetSelector";

interface WorksheetDetailProps {
  worksheet: WorksheetModel;
}

const WorksheetDetail: React.FC<WorksheetDetailProps> = ({ worksheet }) => {

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

    if (promptInput.length === 0) {
      setError("Please enter a prompt");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const toPass:any = {
        prompt: promptInput,
        config_id: worksheet.assistantconfig
      }
      // only for faster & cheaper debugging to trigger duplicate requests on the same thread / message / run / assistant

      if (error) {
        toPass.preserve = {run:1, thread:1, message:1, assistant:1}
      }

      const response: HttpResponse<WorksheetApiResponse> = await ApiClient.post(`api/worksheets/${worksheet.id}/enhance`, toPass);

      if (response.success && response.data) {
        if (response.data.success) {
          enqueueSnackbar("Schema generated", { variant: "success" });
          setPromptInput('')
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
      <Box>

        {worksheet.versions_count > 0 ?
          <WorksheetSelector worksheet={worksheet} />
          :
          <Typography variant="h6" component="h1">
            Start your Schema
          </Typography>
        }

      </Box>

      <Paper sx={{ p: 1, mb: 4 }}>
        <TextField
          fullWidth
          variant={"standard"}
          name={"app_idea"}
          label="How do you want to change this schema"
          placeholder="e.x., My app is a Task List tool that includes deadline dates and priorities and prerequisites"
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          disabled={loading}
          sx={{ mb: 2 }}
        />

        {error && (
          <Alert severity="error" sx={{ mb:2 }}>
            {error}
          </Alert>
        )}

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

      {worksheet.schema?.content_types && Array.isArray(worksheet.schema?.content_types) ?
        worksheet.schema?.content_types.map((w: SchemaContentType, i: number) => {
          return <WorksheetType key={`worksheet-${w.model_name}-${i}`} {...w} />;
        })
        :
        <Typography>{worksheet.response}</Typography>
      }
    </Box>
  );
};

export default WorksheetDetail;
