import React from "react";
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";

interface JSONTreeViewProps {
  data: Record<string, any>;
}

const JSONTreeView: React.FC<JSONTreeViewProps> = ({ data }) => {
  // Helper function to generate a unique ID for each node
  const renderTree = (node: any, itemId = "root") => {
    if (typeof node === "object" && node !== null) {
      return Object.entries(node).map(([key, value], index) => {
        const id = `${itemId}-${index}`;
        return (
          <TreeItem key={id} itemId={id} label={key}>
            {renderTree(value, id)}
          </TreeItem>
        );
      });
    }
    return <TreeItem itemId={`${itemId}-value`} label={String(node)} />;
  };

  return (
    <SimpleTreeView>
      {renderTree(data)}
    </SimpleTreeView>
  );
};

export default JSONTreeView;
