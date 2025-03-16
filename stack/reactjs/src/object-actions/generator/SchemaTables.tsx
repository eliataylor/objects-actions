import React, { useEffect, useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { SchemaContentType } from "./generator-types";
import { ExpandMore } from "@mui/icons-material";

const WorksheetType: React.FC<SchemaContentType> = ({ model_name, name, fields, forceExpand = false }) => {

  const [expanded, setExpanded] = useState<boolean>(forceExpand);

  useEffect(() => {
    setExpanded(forceExpand);
  }, [forceExpand]);

  const getCardinalityDisplay = (cardinality: number | typeof Infinity | undefined) => {
    if (cardinality === undefined) return "-";
    if (cardinality === Infinity || cardinality > 999) return "∞";
    return cardinality.toString();
  };

  return (
    <Accordion variant={"outlined"} expanded={expanded}
               onChange={() => setExpanded(!expanded)}>
      <AccordionSummary
        style={{ margin: 0, minHeight: "auto" }}
        expandIcon={<ExpandMore />}>{model_name}</AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <TableContainer>
          <Table aria-label={`${model_name} fields table`} size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "secondary.main" }}>
                <TableCell sx={{ fontWeight: "bold", color: "white" }}>Field Label</TableCell>
                {/* <TableCell sx={{ fontWeight: "bold", color: "white" }}>Field Name</TableCell> */}
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
                  {/* <TableCell>
                  <code>{field.machine_name || "-"}</code>
                </TableCell> */}
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
      </AccordionDetails>
    </Accordion>


  );
};

export default WorksheetType;
