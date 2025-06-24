"use client";

import React from "react";
import { Dialog, DialogTitle, DialogContent, Button } from "@mui/material";
import { type ModelName, type ModelType, NAVITEMS } from "~/types/types";

interface NewFormDialogProps<T extends ModelName> {
  entity: ModelType<T>;
  onClose: () => void;
  onCreated: (entity: ModelType<T>) => void;
}

export default function NewFormDialog<T extends ModelName>({ 
  entity, 
  onClose, 
  onCreated 
}: NewFormDialogProps<T>) {
  const navItem = NAVITEMS.find(item => item.type === entity._type);
  
  if (!navItem) {
    return null;
  }

  // For now, this is a placeholder - in a full implementation, 
  // this would contain a form for creating new entities
  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Create New {navItem.singular}
        <Button
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          Close
        </Button>
      </DialogTitle>
      <DialogContent>
        <p>Form for creating new {navItem.singular} would go here.</p>
        <Button onClick={() => {
          // Placeholder - would normally create and return new entity
          onCreated(entity);
          onClose();
        }}>
          Create
        </Button>
      </DialogContent>
    </Dialog>
  );
} 