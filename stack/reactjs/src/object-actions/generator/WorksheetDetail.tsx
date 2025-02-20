import React, { useState } from "react";
import { Alert, Box, Button, CircularProgress, Pagination, Paper, TextField, Typography } from "@mui/material";
import WorksheetType, { SchemaContentType, WorksheetApiResponse, WorksheetModel } from "./WorksheetType";
import { Science as GenerateIcon } from "@mui/icons-material";
import ApiClient, { HttpResponse } from "../../config/ApiClient";
import { useSnackbar } from "notistack";
import Grid from "@mui/material/Grid";
import { useNavigate } from "react-router-dom";
import WorksheetSelector from "./WorksheetSelector";

interface WorksheetDetailProps {
  worksheet: WorksheetModel;
  version?: number;
}

const WorksheetDetail: React.FC<WorksheetDetailProps> = ({ worksheet, version }) => {


  // TODO: write nary tree search
  const activeWrk = worksheet.versions?.find(w => w.id === version) ?? worksheet

  const { enqueueSnackbar } = useSnackbar();
  const [promptInput, setPromptInput] = useState<string>(activeWrk.prompt);
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
      const response: HttpResponse<WorksheetApiResponse> = await ApiClient.post(`api/worksheets/${activeWrk.id}/enhance`, {
        prompt: promptInput,
        config_id: activeWrk.assistantconfig
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
            Review and Refine your Schema
          </Typography>

        </Grid>

        {activeWrk.versions &&
          <Grid sx={{minWidth:150}}><WorksheetSelector version={version} worksheet={worksheet} /></Grid>
        }

      </Grid>

      <Paper sx={{ p: 1, mb: 4 }}>
        <TextField
          fullWidth
          variant={"filled"}
          name={"app_idea"}
          label="How do you want to change this schema"
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
          onClick={handleEnhance}
          disabled={loading || !promptInput.trim()}
        >
          {loading ? "Generating..." : "Rebuild"}
        </Button>
      </Paper>

      {activeWrk.schema?.content_types && Array.isArray(activeWrk.schema?.content_types) ?
        activeWrk.schema?.content_types.map((w: SchemaContentType, i: number) => {
          return <WorksheetType key={`worksheet-${w.model_name}-${i}`} {...w} />;
        })
        :
        <Typography>{activeWrk.response}</Typography>
      }
    </Box>
  );
};

export default WorksheetDetail;
