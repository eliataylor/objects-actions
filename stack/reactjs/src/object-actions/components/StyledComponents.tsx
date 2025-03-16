import { Box, FormHelperText, Paper, styled, Typography } from "@mui/material";
import React, { ReactNode } from "react";
import CopyToClipboard from "../../components/CopyToClipboard";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

export const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  backgroundColor: theme.palette.background.default
}));

export const StyledTypography = styled(Typography)(({ theme }) => ({
  fontFamily: theme.typography.fontFamily,
  margin: 0
}));

export const CodeTypography = styled("code")(({ theme }) => ({
  fontFamily: "courier",
  margin: 0,
  fontWeight: 600,
  fontSize: 15
}));

export const CommandContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start"
}));

export const Command: React.FC<{ command: string; help?: ReactNode }> = ({
                                                                           command,
                                                                           help
                                                                         }) => {
  return (
    <Box>
      <CommandContainer>
        <CopyToClipboard textToCopy={command}>
          <ContentCopyIcon sx={{ height: 11 }} color={"warning"} />
        </CopyToClipboard>
        <Typography variant="body2">
          <CodeTypography>{command}</CodeTypography>
        </Typography>
      </CommandContainer>
      {help && (
        <FormHelperText sx={{ marginLeft: 5, marginTop: 0, marginBottom: 3 }}>
          {help}
        </FormHelperText>
      )}
    </Box>
  );
};
