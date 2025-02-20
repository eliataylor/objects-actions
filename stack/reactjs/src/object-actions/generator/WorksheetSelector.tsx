import React from "react";
import { MenuItem, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { WorksheetModel } from "./WorksheetType";

interface Props {
  worksheet: WorksheetModel;
  currentWorksheetId?: number; // Currently selected worksheet
}

const WorksheetSelector: React.FC<Props> = ({ worksheet, currentWorksheetId }) => {
  const navigate = useNavigate();


  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedId = event.target.value as number;
    navigate(`/worksheets/${selectedId}`);
  };

  const renderOptions = (list: WorksheetModel[], depth = 0) =>
    list.map((worksheet) => (
      <React.Fragment key={worksheet.id}>
        <MenuItem value={worksheet.id} sx={{ pl: depth * 2 }}>
          {depth === 0 ? `📂 ${worksheet.id}` : `↳ ${worksheet.id}`}
        </MenuItem>
        {worksheet.versions && renderOptions(worksheet.versions, depth + 1)}
      </React.Fragment>
    ));

  if (!worksheet.versions || worksheet.versions.length === 0) return null;

  return (
    <TextField
      select
      fullWidth
      label="Select Worksheet"
      value={currentWorksheetId ?? ""}
      onChange={handleChange}
      variant="outlined"
    >
      {renderOptions(worksheet.versions)}
    </TextField>
  );
};

export default WorksheetSelector;
