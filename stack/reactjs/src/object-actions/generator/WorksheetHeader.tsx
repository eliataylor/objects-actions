import React, { useEffect, useState } from "react";
import { Box, Button, CircularProgress, MenuItem, Paper, TextField } from "@mui/material";
import { Add, Science as GenerateIcon } from "@mui/icons-material";
import { SchemaVersions } from "./generator-types";
import WorksheetSelector from "./WorksheetSelector";
import Grid from "@mui/material/Grid";
import { useAuth } from "../../allauth/auth";
import { Link } from "react-router-dom";

interface WorksheetHeaderProps {
  worksheet: SchemaVersions;
  handleEnhance: (prompt: string, privacy: string) => void;
  loading: boolean;
}

const WorksheetHeader: React.FC<WorksheetHeaderProps> = ({ worksheet, handleEnhance, loading }) => {
  const me = useAuth()?.data?.user;
  const [promptInput, setPromptInput] = useState<string>("");
  const [privacy, setPrivacy] = useState<string>(worksheet.privacy);

  useEffect(() => {
    setPromptInput("");
  }, [worksheet]);

  return (
    <Box>
      <Box style={{ textAlign: "right", marginBottom: 10 }}>
        <Button
          color="secondary"
          variant={"text"}
          endIcon={<Add />}
          component={Link}
          to={`/oa/schemas/add`}
          data-href={`/oa/schemas/add`}
        >
          Start a new Thread
        </Button>
      </Box>
      <WorksheetSelector worksheet={worksheet} />
      <Paper sx={{ p: 1, mb: 4 }}>
        <TextField
          fullWidth
          variant="standard"
          name="app_idea"
          label="How do you want to change refine this idea?"
          multiline={true}
          rows={5}
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          disabled={loading}
          sx={{ mb: 2 }}
        />

        <Grid container alignItems={"center"} justifyContent={"space-between"}>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={24} /> : <GenerateIcon />}
              onClick={() => handleEnhance(promptInput, privacy)}
              disabled={loading || !promptInput.trim()}
            >
              {loading ? "Generating..." : "Rebuild"}
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


    </Box>
  );
};

export default WorksheetHeader;
