import React, { useState } from "react";
import { Box, Collapse, Grid, MenuItem, TextField } from "@mui/material";
import { EnvConfig, useEnvContext } from "./EnvProvider";
import { TightButton } from "../../theme/StyledFields";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CopyToClipboard from "../../components/CopyToClipboard";

interface EnvEditorProps {
  displayProperties?: (keyof EnvConfig)[];
}

const EnvEditor: React.FC<EnvEditorProps> = ({ displayProperties = [] }) => {
  const { envConfig, setEnvConfig } = useEnvContext();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (key: keyof EnvConfig, value: string) => {
    setEnvConfig({ ...envConfig, [key]: value });
  };

  const renderTextField = (
    key: keyof EnvConfig,
    label: string,
    helperText: string,
    additionalProps: any = {}
  ) => (
    <Grid item xs={12} sm={6} key={key}>
      <TextField
        fullWidth
        label={label}
        value={envConfig[key] || ""}
        onChange={(e) => handleChange(key, e.target.value)}
        variant="outlined"
        size="small"
        helperText={helperText}
        sx={{ mb: 2 }}
        {...additionalProps}
      />
    </Grid>
  );

  const fields = [
    {
      key: "PROJECT_NAME",
      label: "Project Name",
      helperText: "A machine name will be derived from this",
      required: true
    },
    {
      key: "STACK_PATH",
      label: "Stack Path",
      helperText:
        "Directory path to put the code. A period (.) will overwrite this project",
      required: true
    },
    {
      key: "TYPES_PATH",
      label: "Object Types CSV",
      helperText: "File path to your Object Fields .csv"
    },
    {
      key: "PERMISSIONS_PATH",
      label: "Permission Matrix CSV",
      helperText: "File path to your Permissions Matrix .csv"
    },
    {
      key: "REACT_APP_API_HOST",
      label: "Your API Server",
      helperText: "Your API WebServer URL"
    },
    {
      key: "REACT_APP_APP_HOST",
      label: "Your WebApp URL",
      helperText: "Your WebApp URL"
    },
    {
      key: "REACT_APP_LOGIN_EMAIL",
      label: "Admin Email",
      helperText: ""
    },
    {
      key: "REACT_APP_LOGIN_PASS",
      label: "Admin Password",
      helperText: ""
    },
    {
      key: "DEFAULT_PERMS",
      label: "Default Permission",
      helperText: "used when no matches are found from permissions matrix",
      select: true,
      options: [
        { value: "IsAuthenticatedOrReadOnly", label: "Is Authenticated Or Read-Only" },
        {
          value: "IsAuthenticated",
          label: "Is Authenticated"
        },
        {
          value: "AllowAll",
          label: "Allow All"
        }
      ]
    },
    {
      key: "OA_ENV_DB",
      label: "Where do you want your database",
      helperText: "",
      select: true,
      options: [
        { value: "docker", label: "Inside Docker" },
        {
          value: "local",
          label: "Locally (first run `sudo docs/os-mysql-install.sh`)"
        },
        {
          value: "gcp",
          label: "Google Cloud Platform (first follow django/deploy/README.md)"
        }
      ]
    },
    {
      key: "OA_ENV_EMAIL",
      label: "OA_ENV_EMAIL",
      helperText: "",
      select: true,
      options: [
        { value: "console", label: "console" },
        { value: "files", label: "files" },
        { value: "gmail", label: "gmail" },
        { value: "sendgrid", label: "sendgrid" }
      ]
    },
    {
      key: "OA_ENV_STORAGE",
      label: "OA_ENV_STORAGE",
      helperText: "",
      select: true,
      options: [
        { value: "gcp", label: "gcp" },
        { value: "local", label: "local" }
      ]
    }
  ];

  const visibleFields = fields.filter(
    (field) =>
      displayProperties.length === 0 ||
      displayProperties.includes(field.key as keyof EnvConfig)
  );

  const advancedFields = fields.filter(
    (field) =>
      displayProperties.length > 0 &&
      !displayProperties.includes(field.key as keyof EnvConfig)
  );

  function makeEnvFile() {
    return fields
      .map((field) => {
        const key = field.key as keyof EnvConfig;
        const value = envConfig[key] || "";
        const comments: string[] = [];

        // Add the help text as a comment
        if (field.helperText) {
          comments.push(`# ${field.helperText}`);
        }

        // Add the options as comments (if applicable)
        if (field.select && field.options) {
          const optionsComment = field.options
            .map((option) => `${option.value}`)
            .join(", ");
          comments.push(`# Possible values: ${optionsComment}`);
        }

        // Combine comments and the key-value pair
        return `${comments.join("\n")}\n${key}=${value}`;
      })
      .join("\n\n");
  }

  return (
    <Grid container justifyContent={"space-between"} spacing={2}>
      {visibleFields.map((field) =>
        renderTextField(
          field.key as keyof EnvConfig,
          field.label,
          field.helperText,
          field.select
            ? {
              select: true,
              children: field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))
            }
            : {}
        )
      )}

      {advancedFields.length > 0 && (
        <Grid item xs={12}>

          <CopyToClipboard textToCopy={makeEnvFile()}>
            <TightButton
              size={"small"}
              variant="outlined"
              startIcon={<ContentCopyIcon color={"warning"} />}
            >
              {"Copy .env config"}
            </TightButton>
          </CopyToClipboard>

          <TightButton
            size={"small"}
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="outlined"
          >
            {showAdvanced ? "Hide Advanced Options" : "Show Advanced Options"}
          </TightButton>

          <Collapse in={showAdvanced}>
            <Box mt={2}>
              <Grid container spacing={2}>
                {advancedFields.map((field) =>
                  renderTextField(
                    field.key as keyof EnvConfig,
                    field.label,
                    field.helperText,
                    field.select
                      ? {
                        select: true,
                        children: field.options?.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))
                      }
                      : {}
                  )
                )}
              </Grid>
            </Box>
          </Collapse>
        </Grid>
      )}
    </Grid>
  );
};

export default EnvEditor;
