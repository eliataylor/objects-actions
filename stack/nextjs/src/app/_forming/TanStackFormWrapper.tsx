"use client";

import React from "react";
import { useForm } from "@tanstack/react-form";
import { type FieldApi } from "@tanstack/react-form";
import { Box, Button, Typography, Paper, Alert } from "@mui/material";
import { Save, Delete, Cancel } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { FieldRenderer, getFormFields, createInitialValues } from "./FieldRenderer";
import { type ModelName, type ModelType, type NavItem, TypeFieldSchema, NAVITEMS } from "~/types/types";
import { api } from "~/trpc/react";

interface TanStackFormProps<T extends ModelName> {
  navItem: NavItem<T>;
  initialData?: Partial<ModelType<T>>;
  verb: 'add' | 'edit' | 'delete';
}

/**
 * - TanStack Form: Handles state, validation, submission
 * - FieldRenderer: Pure schema-to-UI mapping
 * - tRPC: API integration with proper invalidation
 */
export default function TanStackFormExample<T extends ModelName>({
  navItem,
  initialData,
  verb
}: TanStackFormProps<T>) {
  const router = useRouter();
  const fields = getFormFields(TypeFieldSchema[navItem.type]);

  const capitalized = verb.charAt(0).toUpperCase() + verb.slice(1);

  // 🚀 tRPC utils for invalidation
  const utils = api.useUtils();

  // 🚀 tRPC mutations
  const createMutation = api.entities.create.useMutation({
    onSuccess: (result) => {
      // Invalidate the list to show the new item
      utils.entities.list.invalidate({ entityType: navItem.type });
      
      // Navigate to the new entity's detail page
      router.push(`/${navItem.segment}/${result.id}`);
    },
    onError: (error) => {
      console.error('Create error:', error);
    }
  });

  const updateMutation = api.entities.update.useMutation({
    onSuccess: (result) => {
      // Invalidate both the list and the specific entity
      utils.entities.list.invalidate({ entityType: navItem.type });
      utils.entities.byId.invalidate({ 
        entityType: navItem.type, 
        id: initialData!.id!
      });
      
      // Navigate to the entity's detail page
      router.push(`/${navItem.segment}/${result.id}`);
    },
    onError: (error) => {
      console.error('Update error:', error);
    }
  });

  const deleteMutation = api.entities.delete.useMutation({
    onSuccess: () => {
      // Invalidate the list to remove the deleted item
      utils.entities.list.invalidate({ entityType: navItem.type });
      
      // Navigate back to the list
      router.push(`/${navItem.segment}`);
    },
    onError: (error) => {
      console.error('Delete error:', error);
    }
  });

  // Handle delete action
  const handleDelete = async () => {
    if (!initialData?.id) return;
    
    if (window.confirm(`Are you sure you want to delete this ${navItem.singular.toLowerCase()}?`)) {
      await deleteMutation.mutateAsync({
        entityType: navItem.type,
        id: initialData.id,
      });
    }
  };

  // Handle cancel action
  const handleCancel = () => {
    if (initialData?.id && verb !== 'add') {
      // Go back to entity detail page
      router.push(`/${navItem.segment}/${initialData.id}`);
    } else {
      // Go back to list
      router.push(`/${navItem.segment}`);
    }
  };

  // 🎯 TanStack Form setup
  const form = useForm({
    defaultValues: createInitialValues(fields, initialData),
    onSubmit: async ({ value }) => {
      try {
        if (verb === 'edit') {
          await updateMutation.mutateAsync({
            entityType: navItem.type,
            id: initialData!.id!,
            data: value as Record<string, any>,
          });
        } else if (verb === 'add') {
          await createMutation.mutateAsync({
            entityType: navItem.type,
            data: value as Record<string, any>,
          });
        }
      } catch (error) {
        console.error('Form submission error:', error);
      }
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const submitError = createMutation.error || updateMutation.error || deleteMutation.error;

  // For delete confirmation screen
  if (verb === 'delete') {
    return (
      <Paper sx={{ p: 3, mx: 'auto', maxWidth: 600 }}>
        <Typography variant="h5" gutterBottom color="error">
          Delete {navItem.singular}
        </Typography>

        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError.message}
          </Alert>
        )}

        <Typography variant="body1" sx={{ mb: 3 }}>
          Are you sure you want to delete this {navItem.singular.toLowerCase()}? This action cannot be undone.
        </Typography>

        {initialData && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>ID:</strong> {initialData.id}
            </Typography>
            {/* Add other identifying fields here based on the entity type */}
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            startIcon={<Delete />}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    );
  }

  // Regular form (add/edit)
  return (
    <Paper sx={{ p: 3, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        {capitalized} {navItem.singular}
      </Typography>

      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError.message}
        </Alert>
      )}

      <Box component="form" onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}>
        {/* 🎨 Render each field using pure FieldRenderer */}
        {fields.map((field) => (
          <form.Field
            key={field.machine}
            name={field.machine as any}
            validators={{
              onChange: field.required
                ? ({ value }) => !value ? `${field.singular} is required` : undefined
                : undefined,
            }}
            children={(fieldApi) => (
              <FieldFormField<T> fieldApi={fieldApi} field={field} />
            )}
          />
        ))}

        {/* Form Actions */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={<Save />}
          >
            {isSubmitting ? 'Saving...' : capitalized}
          </Button>
          
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={isSubmitting}
            startIcon={<Cancel />}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

/**
 * Helper component that bridges TanStack Form field API with FieldRenderer
 */
function FieldFormField<T extends ModelName>({
  fieldApi,
  field,
}: {
  fieldApi: any; // Simplified to avoid complex TanStack Form generics
  field: any;
}) {
  return (
    <FieldRenderer<T>
      field={field}
      value={fieldApi.state.value}
      onChange={fieldApi.handleChange}
      onBlur={fieldApi.handleBlur}
      error={fieldApi.state.meta.errors?.join(', ') || ''}
      required={field.required}
    />
  );
}