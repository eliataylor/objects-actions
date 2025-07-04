"use client";

import React from "react";
import { 
  TextField, 
  Switch, 
  FormControlLabel, 
  MenuItem, 
  Chip, 
  Box,
  Typography,
  type TextFieldProps 
} from "@mui/material";
import { type FieldTypeDefinition, type ModelName, type ModelType } from "~/types/types";
import AutocompleteField from "./AutocompleteField";
import AutocompleteMultipleField from "./AutocompleteMultipleField";
import ImageUpload from "./ImageUpload";

export interface FieldRendererProps<T extends ModelName> {
  field: FieldTypeDefinition;
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

/**
 * Pure schema-to-UI renderer - no state management, just field type → component mapping
 * This can be used with ANY form library (TanStack Form, Formik, React Hook Form, etc.)
 */
export function FieldRenderer<T extends ModelName>({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
}: FieldRendererProps<T>) {
  
  const baseProps: Partial<TextFieldProps> = {
    fullWidth: true,
    margin: "normal",
    label: field.singular,
    value: value || "",
    onChange: (e) => onChange(e.target.value),
    onBlur,
    error: !!error,
    helperText: error || field.example,
    required: required || field.required,
    disabled,
  };

  // 🎨 Field type to component mapping
  switch (field.field_type) {
    case "string":
    case "slug":
      return <TextField {...baseProps} />;
      
    case "text":
    case "html":
      return (
        <TextField 
          {...baseProps} 
          multiline 
          rows={4}
          placeholder={`Enter ${field.singular.toLowerCase()}...`}
        />
      );
      
    case "email":
      return <TextField {...baseProps} type="email" />;
      
    case "url":
      return <TextField {...baseProps} type="url" />;
      
    case "phone":
      return <TextField {...baseProps} type="tel" />;
      
    case "password":
      return <TextField {...baseProps} type="password" />;
      
    case "integer":
    case "number":
      return (
        <TextField 
          {...baseProps} 
          type="number"
          onChange={(e) => onChange(Number(e.target.value) || 0)}
        />
      );
      
    case "boolean":
      return (
        <FormControlLabel
          control={
            <Switch
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
            />
          }
          label={field.singular}
        />
      );
      
    case "date":
      return <TextField {...baseProps} type="date" InputLabelProps={{ shrink: true }} />;
      
    case "date_time":
      return <TextField {...baseProps} type="datetime-local" InputLabelProps={{ shrink: true }} />;
      
    case "time":
      return <TextField {...baseProps} type="time" InputLabelProps={{ shrink: true }} />;
      
    case "json":
      return (
        <TextField 
          {...baseProps} 
          multiline 
          rows={6}
          placeholder="Enter valid JSON..."
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              onChange(parsed);
            } catch {
              onChange(e.target.value); // Keep as string if invalid JSON
            }
          }}
          value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
        />
      );
      
    case "select":
      return (
        <TextField
          {...baseProps}
          select
          onChange={(e) => onChange(e.target.value)}
        >
          {field.options?.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      );
      
    case "multi_select":
      return (
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {field.singular}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {field.options?.map((option) => (
              <Chip
                key={option.id}
                label={option.label}
                clickable
                color={value?.includes(option.id) ? "primary" : "default"}
                onClick={() => {
                  const newValue = value?.includes(option.id)
                    ? value.filter((v: any) => v !== option.id)
                    : [...(value || []), option.id];
                  onChange(newValue);
                }}
              />
            ))}
          </Box>
        </Box>
      );
      
    case "image":
    case "file":
      return (
        <ImageUpload
          value={value}
          onChange={onChange}
          label={field.singular}
          accept={field.field_type === "image" ? "image/*" : undefined}
        />
      );
      
    case "relationship":
      if (field.cardinality && field.cardinality > 1) {
        return (
          <AutocompleteMultipleField
            label={field.plural}
            value={value || []}
            onChange={onChange}
            relationship={field.relationship!}
            required={required || field.required}
            disabled={disabled}
          />
        );
      } else {
        return (
          <AutocompleteField
            label={field.singular}
            value={value}
            onChange={onChange}
            relationship={field.relationship!}
            required={required || field.required}
            disabled={disabled}
          />
        );
      }
      
    default:
      // Fallback for unknown field types
      return (
        <TextField 
          {...baseProps} 
          placeholder={`Unknown field type: ${field.field_type}`}
        />
      );
  }
}

/**
 * Utility to get all renderable fields from a schema
 */
export function getFormFields<T extends ModelName>(
  schema: Record<string, FieldTypeDefinition>,
  excludeFields: string[] = ['id', '_type', 'created_at', 'modified_at', 'author']
): FieldTypeDefinition[] {
  return Object.values(schema).filter(
    field => !excludeFields.includes(field.machine)
  );
}

/**
 * Utility to create initial form values from schema
 */
export function createInitialValues<T extends ModelName>(
  fields: FieldTypeDefinition[],
  existingData?: Partial<ModelType<T>>
): Partial<ModelType<T>> {
  const initialValues: any = { ...existingData };
  
  fields.forEach(field => {
    if (initialValues[field.machine] === undefined) {
      switch (field.field_type) {
        case "boolean":
          initialValues[field.machine] = false;
          break;
        case "integer":
        case "number":
          initialValues[field.machine] = 0;
          break;
        case "multi_select":
        case "relationship":
          if (field.cardinality && field.cardinality > 1) {
            initialValues[field.machine] = [];
          }
          break;
        default:
          initialValues[field.machine] = "";
      }
    }
  });
  
  return initialValues;
}