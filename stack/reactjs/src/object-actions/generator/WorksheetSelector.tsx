import React from "react";
import { MenuItem, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { WorksheetModel } from "./WorksheetType";

interface Props {
  worksheet: WorksheetModel;
  version?: number; // Currently selected worksheet
}

const WorksheetSelector: React.FC<Props> = ({ worksheet, version }) => {
  const navigate = useNavigate();


  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedId = event.target.value as number;
    navigate(`/oa/worksheets/${worksheet.id}/versions/${version}`);
  };

  const renderOptions = (list: WorksheetModel[], depth = 0) => {
    return list.map((wrk) => (
      <React.Fragment key={wrk.id}>
        <MenuItem onClick={(e) => navigate(`/oa/worksheets/${worksheet.id}/versions/${e.currentTarget.value}`)}
                  value={wrk.id}
                  sx={{ pl: depth * 2 }}>
          #{wrk.id}: {wrk.prompt.substring(0, 20)}...
        </MenuItem>
        {wrk.versions && renderOptions(wrk.versions, depth + 1)}
      </React.Fragment>
    ));
  }

  if (!worksheet.versions || worksheet.versions.length === 0) return null;

  return (
    <TextField
      select
      fullWidth
      label="Select Version"
      value={version ?? ""}
      onChange={handleChange}
      variant="standard"
    >
      {renderOptions(worksheet.versions)}
    </TextField>
  );
};

export default WorksheetSelector;
