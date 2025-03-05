import React from "react";
import { MenuItem, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { SchemaVersions } from "./generator-types";

interface Props {
  worksheet: SchemaVersions;
}

const MAX_RESPONSE_LENGTH = 200;

const WorksheetSelector: React.FC<Props> = ({ worksheet }) => {
  const navigate = useNavigate();

  function shortenName(node: SchemaVersions["version_tree"]) {
    const str = `#${node.id}`;
    if (!node.name) return str;
    if (node.name.length > MAX_RESPONSE_LENGTH) {
      return `${str} ${node.name.substring(0, MAX_RESPONSE_LENGTH)}...`;
    }
    return `${str} ${node.name}`;
  }

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedId = event.target.value as number;
    navigate(`/oa/schemas/${selectedId}`);
  };

  // Recursively push MenuItem elements into the array
  const renderVersionTree = (
    node: SchemaVersions["version_tree"],
    depth = 0,
    elements: JSX.Element[] = []
  ) => {
    if (!node) return elements;

    elements.push(
      <MenuItem
        key={node.id}
        value={node.id}
        sx={{ pl: depth * 2 }}
        selected={node.id === worksheet.id}
        disabled={node.id === worksheet.id}
        onClick={() => navigate(`/oa/schemas/${node.id}`)}
      >
        {shortenName(node)}
      </MenuItem>
    );

    node.children.forEach((child) => renderVersionTree(child, depth + 1, elements));

    return elements;
  };

  return (
    <TextField
      select
      fullWidth
      id="VersionSelector"
      label="Select Version"
      value={worksheet.id}
      onChange={handleChange}
      variant="filled"
    >
      {worksheet.version_tree && renderVersionTree(worksheet.version_tree)}
    </TextField>
  );
};

export default WorksheetSelector;
