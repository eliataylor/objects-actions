import React, { useState } from "react";
import { Alert, Box, Button, CircularProgress, LinearProgress, List, ListItem, ListItemText, Paper, TextField, Typography } from "@mui/material";
import { FormatQuote, ListAlt, Science as GenerateIcon } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import { Link, useNavigate } from "react-router-dom";
import ApiClient from "../../config/ApiClient";

interface WorksheetResponse {
  reasoning?: string;
  schema?: Record<string, unknown>;
  error?: string;
}

const WorksheetForm: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [promptInput, setPromptInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState<string[]>([]);
  const [schema, setSchema] = useState<Record<string, unknown> | null>(null);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!promptInput.trim()) {
      setError("Please enter at least one object name");
      return;
    }

    setLoading(true);
    setError(null);
    setReasoning([]);
    setSchema(null);

    await ApiClient.stream<WorksheetResponse>(
      "/api/worksheets/generate?stream=true",
      { prompt: promptInput },
      (parsed) => {
        if (parsed.reasoning) {
          // @ts-ignore
          setReasoning((prev) => [...prev, parsed.reasoning]);
        } else if (parsed.schema) {
          setSchema(parsed.schema);
        } else if (parsed.error) {
          setError(parsed.error);
        }
      },
      (errMsg) => {
        setError(errMsg);
        enqueueSnackbar("Error connecting to the server", { variant: "error" });
      }
    );

    setLoading(false);
  };

  return (
    <Box>
      <Grid container justifyContent="space-between" wrap="nowrap" alignItems="center">
        <Grid item>
          <Typography variant="h5">Generate object and field recommendations</Typography>
        </Grid>
        <Grid item>
          <IconButton component={Link} to="/oa/schemas"><ListAlt /></IconButton>
        </Grid>
      </Grid>

      <Paper sx={{ p: 1, mb: 4 }}>
        <TextField
          fullWidth
          variant="filled"
          multiline
          rows={5}
          label="Describe who your app is for and what it is supposed to do"
          placeholder="e.x., My app is a Task List tool that includes deadline dates and priorities and prerequisites"
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

      {reasoning.length > 0 && (
        <List>
          {reasoning.map((line, index) => (
            <ListItem key={index}>
              <ListItemText primary={line} />
            </ListItem>
          ))}
        </List>
      )}

      {schema && (
        <Paper sx={{ p: 2, mt: 2, backgroundColor: "#f5f5f5" }}>
          <Typography variant="subtitle1">Generated Schema:</Typography>
          <code style={{ display: "block", whiteSpace: "pre-wrap", overflowX: "auto" }}>
            {JSON.stringify(schema, null, 2)}
          </code>
        </Paper>
      )}
    </Box>
  );
};

export default WorksheetForm;
