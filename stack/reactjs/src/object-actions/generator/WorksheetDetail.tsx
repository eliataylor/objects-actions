// src/components/worksheets/WorksheetDetail.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  CloudUpload as ExportIcon,
  Code as CodeIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreIcon
} from "@mui/icons-material";
import { useSnackbar } from "notistack";

import ApiClient, { HttpResponse } from "../../config/ApiClient";
import { ExportResponse, Worksheet } from "../types/worksheets";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`worksheet-tabpanel-${index}`}
      aria-labelledby={`worksheet-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `worksheet-tab-${index}`,
    "aria-controls": `worksheet-tabpanel-${index}`
  };
}

const WorksheetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);

  const [actionsAnchorEl, setActionsAnchorEl] = useState<null | HTMLElement>(null);
  const actionsMenuOpen = Boolean(actionsAnchorEl);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [exportDialogOpen, setExportDialogOpen] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);

  const [showSchemaDialog, setShowSchemaDialog] = useState<boolean>(false);

  useEffect(() => {
    const fetchWorksheet = async () => {
      setLoading(true);
      try {
        const response = await ApiClient.get<Worksheet>(`api/worksheet/${id}`);
        if (response.success && response.data) {
          setWorksheet(response.data);
          setError(null);
        } else {
          setError(response.error || "Failed to fetch worksheet");
          enqueueSnackbar("Error loading worksheet details", { variant: "error" });
        }
      } catch (err) {
        setError("An unexpected error occurred");
        enqueueSnackbar("Error loading worksheet details", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchWorksheet();
    }
  }, [id]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleActionsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setActionsAnchorEl(event.currentTarget);
  };

  const handleActionsClose = () => {
    setActionsAnchorEl(null);
  };

  const handleEdit = () => {
    navigate(`/worksheets/${id}/edit`);
    handleActionsClose();
  };

  const openDeleteDialog = () => {
    setDeleteDialogOpen(true);
    handleActionsClose();
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const confirmDelete = async () => {
    try {
      const response = await ApiClient.delete<void>(`api/worksheet/${id}`);
      if (response.success) {
        enqueueSnackbar("Worksheet deleted successfully", { variant: "success" });
        navigate("/worksheets");
      } else {
        enqueueSnackbar(response.error || "Failed to delete worksheet", { variant: "error" });
      }
    } catch (err) {
      enqueueSnackbar("An error occurred while deleting", { variant: "error" });
    } finally {
      closeDeleteDialog();
    }
  };

  const openExportDialog = () => {
    setExportDialogOpen(true);
    handleActionsClose();
  };

  const closeExportDialog = () => {
    setExportDialogOpen(false);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response: HttpResponse<ExportResponse> = await ApiClient.post(`api/worksheet/${id}/export_to_sheets`, {});
      if (response.success) {
        enqueueSnackbar("Worksheet exported to Google Sheets successfully", { variant: "success" });
        if (response.data?.fileUrl) {
          window.open(response.data.fileUrl, "_blank");
        }
      } else {
        enqueueSnackbar(response.error || "Export failed", { variant: "error" });
      }
    } catch (err) {
      enqueueSnackbar("Failed to export worksheet", { variant: "error" });
    } finally {
      setExporting(false);
      closeExportDialog();
    }
  };

  const showSchemaCode = () => {
    setShowSchemaDialog(true);
    handleActionsClose();
  };

  // Derived data
  const objectNames = worksheet
    ? [...new Set(worksheet.objectFields.map(field => field.objectName))]
    : [];

  const getObjectFields = (objectName: string) => {
    return worksheet?.objectFields.filter(field => field.objectName === objectName) || [];
  };

  const getObjectPermissions = (objectName: string) => {
    return worksheet?.permissionRules.filter(rule => rule.objectName === objectName) || [];
  };

  // Function to generate simplified schema code
  const generateSchemaCode = (): string => {
    if (!worksheet) return "";

    const objects = objectNames.map(objectName => {
      const fields = getObjectFields(objectName);

      const fieldDefinitions = fields.map(field => {
        let fieldDef = `    ${field.fieldName}: ${field.fieldType.toLowerCase()}`;
        if (field.isRequired) fieldDef += "!";
        return fieldDef;
      }).join(",\n");

      return `type ${objectName} {\n${fieldDefinitions}\n}`;
    }).join("\n\n");

    return objects;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !worksheet) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="error">
          {error || "Unable to load worksheet details"}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/worksheets")}
          sx={{ mt: 2 }}
        >
          Back to Worksheets
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => navigate("/worksheets")} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {worksheet.name}
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            sx={{ mr: 2 }}
          >
            Edit
          </Button>
          <IconButton
            onClick={handleActionsClick}
            size="large"
          >
            <MoreIcon />
          </IconButton>
          <Menu
            anchorEl={actionsAnchorEl}
            open={actionsMenuOpen}
            onClose={handleActionsClose}
          >
            <MenuItem onClick={openExportDialog}>
              <ExportIcon sx={{ mr: 1 }} />
              Export to Google Sheets
            </MenuItem>
            <MenuItem onClick={showSchemaCode}>
              <CodeIcon sx={{ mr: 1 }} />
              View Schema Code
            </MenuItem>
            <Divider />
            <MenuItem onClick={openDeleteDialog} sx={{ color: "error.main" }}>
              <DeleteIcon sx={{ mr: 1 }} />
              Delete Worksheet
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Paper sx={{ mb: 4 }}>
        <Box p={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body1">
                {worksheet.description || "No description provided"}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                Created By
              </Typography>
              <Typography variant="body1">
                {worksheet.createdBy}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                Last Updated
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Paper sx={{ width: "100%", mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="worksheet detail tabs"
            variant="fullWidth"
          >
            <Tab label="Objects & Fields" {...a11yProps(0)} />
            <Tab label="Permissions Matrix" {...a11yProps(1)} />
          </Tabs>
        </Box>

        {/* Objects & Fields Tab */}
        <TabPanel value={tabValue} index={0}>
          {objectNames.length === 0 ? (
            <Alert severity="info">
              No objects defined in this worksheet.
            </Alert>
          ) : (
            objectNames.map((objectName) => {
              const fields = getObjectFields(objectName);
              return (
                <Card key={objectName} sx={{ mb: 4 }}>
                  <CardHeader
                    title={objectName}
                    subheader={`${fields.length} fields`}
                    sx={{
                      backgroundColor: "primary.light",
                      color: "primary.contrastText",
                      "& .MuiCardHeader-subheader": {
                        color: "rgba(255, 255, 255, 0.7)"
                      }
                    }}
                  />
                  <CardContent>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Field Name</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Required</TableCell>
                            <TableCell>Unique</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {fields.map((field) => (
                            <TableRow key={field.id}>
                              <TableCell>{field.fieldName}</TableCell>
                              <TableCell>
                                <Chip
                                  label={field.fieldType}
                                  size="small"
                                  sx={{
                                    backgroundColor:
                                      field.fieldType.includes("Text") ? "info.light" :
                                        field.fieldType.includes("Number") || field.fieldType.includes("Integer") ? "success.light" :
                                          field.fieldType.includes("Date") ? "warning.light" :
                                            field.fieldType.includes("Boolean") ? "secondary.light" :
                                              "default",
                                    fontSize: "0.75rem"
                                  }}
                                />
                              </TableCell>
                              <TableCell>{field.description || "-"}</TableCell>
                              <TableCell>
                                {field.isRequired ? (
                                  <CheckIcon color="success" fontSize="small" />
                                ) : (
                                  <CloseIcon color="action" fontSize="small" />
                                )}
                              </TableCell>
                              <TableCell>
                                {field.isUnique ? (
                                  <CheckIcon color="success" fontSize="small" />
                                ) : (
                                  <CloseIcon color="action" fontSize="small" />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabPanel>

        {/* Permissions Matrix Tab */}
        <TabPanel value={tabValue} index={1}>
          {worksheet.permissionRules.length === 0 ? (
            <Alert severity="info">
              No permissions defined in this worksheet.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Object</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Permission</TableCell>
                    <TableCell>Conditions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {worksheet.permissionRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>{rule.objectName}</TableCell>
                      <TableCell>
                        <Chip
                          label={rule.action}
                          size="small"
                          sx={{
                            backgroundColor:
                              rule.action === "create" ? "success.light" :
                                rule.action === "read" ? "info.light" :
                                  rule.action === "update" ? "warning.light" :
                                    rule.action === "delete" ? "error.light" :
                                      "default",
                            fontSize: "0.75rem"
                          }}
                        />
                      </TableCell>
                      <TableCell>{rule.role}</TableCell>
                      <TableCell>
                        <Chip
                          label={rule.isAllowed ? "Allowed" : "Denied"}
                          color={rule.isAllowed ? "success" : "error"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{rule.conditions || "None"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the worksheet "{worksheet.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog
        open={exportDialogOpen}
        onClose={closeExportDialog}
      >
        <DialogTitle>Export to Google Sheets</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will export the worksheet data to Google Sheets. You'll be able to edit and share the spreadsheet.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeExportDialog} disabled={exporting}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            color="primary"
            variant="contained"
            disabled={exporting}
            startIcon={exporting ? <CircularProgress size={20} /> : <ExportIcon />}
          >
            {exporting ? "Exporting..." : "Export"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schema Code Dialog */}
      <Dialog
        open={showSchemaDialog}
        onClose={() => setShowSchemaDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Schema Definition</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              backgroundColor: "grey.900",
              color: "grey.100",
              p: 2,
              borderRadius: 1,
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
              overflowX: "auto"
            }}
          >
            {generateSchemaCode()}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<CopyIcon />}
            onClick={() => {
              navigator.clipboard.writeText(generateSchemaCode());
              enqueueSnackbar("Schema code copied to clipboard", { variant: "success" });
            }}
          >
            Copy to Clipboard
          </Button>
          <Button onClick={() => setShowSchemaDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
