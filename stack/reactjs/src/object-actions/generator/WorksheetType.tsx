import React from "react";
import { Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { ModelName, ModelType } from "../types/types";

interface AIFieldDefinition {
  label?: string;
  machine_name?: string;
  field_type?: string;
  cardinality?: number | typeof Infinity;
  required?: boolean;
  relationship?: string;
  default?: string;
  example?: string;
}

export interface AiSchemaResponse {
  content_types: SchemaContentType[];
}

export interface SchemaContentType {
  model_name: string;
  name: string;
  fields: AIFieldDefinition[];
}

export interface WorksheetApiResponse {
  data:WorksheetModel;
  success:boolean;
  errors?: string[]
}

export interface WorksheetApiResponse {
  data:WorksheetModel;
  success:boolean;
  errors?: string[]
}

export interface WorksheetListResponse {
    count: number;
    offset: number;
    limit: number;
    meta: any;
    error: string | null;
    results: WorksheetModel[]
}

export interface WorksheetModel {
  id: number;
  prompt: string;
  response: string;
  schema: AiSchemaResponse;
  created_at: string;
  modified_at: string;

  assistantconfig: number;
  // Version tracking fields
  parent: number | null;
  version: number;
  version_notes: string | null;
  is_latest: boolean;
  versions_count: number;
}

const WorksheetType: React.FC<SchemaContentType> = ({ model_name, name, fields }) => {
  const getCardinalityDisplay = (cardinality: number | typeof Infinity | undefined) => {
    if (cardinality === undefined) return "-";
    if (cardinality === Infinity || cardinality > 999) return "∞";
    return cardinality.toString();
  };

  return (
    <Paper sx={{ mb: 2, p: 1 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {name}
      </Typography>
      <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
        <Table aria-label={`${model_name} fields table`} size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "secondary.main" }}>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>Field Label</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>Field Name</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>Field Type</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>How Many</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>Required</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>Relationship</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>Default</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>Example</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((field, index) => (
              <TableRow
                key={field.machine_name || index}
                sx={{ "&:nth-of-type(odd)": { backgroundColor: "action.hover" } }}
              >
                <TableCell>{field.label || "-"}</TableCell>
                <TableCell>
                  <code>{field.machine_name || "-"}</code>
                </TableCell>
                <TableCell>
                  {field.field_type ? (
                    <Chip
                      label={field.field_type}
                      size="small"
                      color="secondary"
                      variant="filled"
                    />
                  ) : "-"}
                </TableCell>
                <TableCell>{getCardinalityDisplay(field.cardinality)}</TableCell>
                <TableCell>
                  {field.required !== undefined ? (
                    <Chip
                      label={field.required ? "Yes" : "No"}
                      size="small"
                      color={field.required ? "secondary" : "default"}
                      variant={field.required ? "outlined" : "outlined"}
                    />
                  ) : "-"}
                </TableCell>
                <TableCell>{field.relationship || "-"}</TableCell>
                <TableCell>
                  {field.default !== undefined ? (
                    <code>{field.default}</code>
                  ) : "-"}
                </TableCell>
                <TableCell>
                  {field.example ? (
                    <Typography variant="body2" component="div" sx={{ fontStyle: "italic" }}>
                      {field.example}
                    </Typography>
                  ) : "-"}
                </TableCell>
              </TableRow>
            ))}
            {fields.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No fields defined for this content type
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default WorksheetType;
