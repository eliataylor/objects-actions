import React, { useEffect, useState } from "react";
import GenericForm from "../object-actions/forming/GenericForm";
import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import { ModelName, ModelType, NavItem, NAVITEMS, TypeFieldSchema } from "../object-actions/types/types";
import { canDo } from "../object-actions/types/access";
import { useLocation, useParams } from "react-router-dom";
import ApiClient from "../config/ApiClient";
import { useAuth } from "../allauth/auth";
import { FormProvider } from "../object-actions/forming/FormProvider";
import * as MyForms from "../object-actions/forming/forms";
import { MyFormsKeys } from "../object-actions/forming/forms";
import PermissionError from "../components/PermissionError";

const EntityForm = () => {
  const { id, model } = useParams();
  const [entity, setEntity] = useState<ModelType<ModelName> | Partial<ModelType<ModelName>> | null>(null);
  const [error, setError] = useState("");
  const location = useLocation();
  const me = useAuth()?.data?.user;

  const navItem = NAVITEMS.find((nav) => nav.segment === model) as NavItem | undefined;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await ApiClient.get(`/api/${model}/${id}${location.search}`);
        if (result.success && result.data) {
          setEntity(result.data as ModelType<ModelName>);
        } else {
          setError(result.error || "Unknown Error");
        }
      } catch (err) {
        setError("Failed to fetch entity data");
      }
    };

    if (!navItem) {
      setError(`Invalid form URL pattern for ${model}`);
    } else if (id) {
      fetchData();
    } else {
      // Creating new entity
      setEntity({
        id: 0,
        _type: navItem.type
      });
    }
  }, [id, model, navItem, location.search]);

  if (!navItem) {
    return <Typography variant="h6">Invalid URL pattern for {model}</Typography>;
  }

  if (error) {
    return (
      <Grid container justifyContent="center" alignItems="center">
        <Typography variant="subtitle1">{error}</Typography>
      </Grid>
    );
  }

  if (!entity) {
    return (
      <Grid container justifyContent="center" alignItems="center">
        <CircularProgress />
      </Grid>
    );
  }

  // Check permissions
  const entityForPermissionCheck = entity.id && entity.id !== "0"
    ? entity as ModelType<ModelName>
    : { ...entity, _type: navItem.type } as ModelType<ModelName>;

  const action = entity.id && entity.id !== "0" ? "edit" : "add";
  const allow = canDo(action, entityForPermissionCheck, me);

  if (typeof allow === "string") {
    return <PermissionError error={allow} />;
  }

  // Get form fields and component
  const fields = Object.values(TypeFieldSchema[navItem.type]);
  const formKey = `OAForm${navItem.type}` as MyFormsKeys;
  const FormWrapper = formKey in MyForms ? MyForms[formKey as keyof typeof MyForms] : null;

  return (
    <Box sx={{ pt: 4, pl: 3 }}>
      {FormWrapper ? (
        <FormProvider
          fields={fields}
          original={entity as ModelType<ModelName>}
          navItem={navItem}
        >
          <FormWrapper />
        </FormProvider>
      ) : (
        <GenericForm
          fields={fields}
          navItem={navItem}
          original={entity as ModelType<ModelName>}
        />
      )}
    </Box>
  );
};

export default EntityForm;
