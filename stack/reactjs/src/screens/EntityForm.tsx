import React, { useEffect, useState } from "react";
import GenericForm from "../object-actions/forming/GenericForm";
import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import { EntityTypes, NAVITEMS, NewEntity, TypeFieldSchema } from "../object-actions/types/types";
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
    const [entity, setEntity] = useState<EntityTypes | NewEntity | null>(null);
    const [error, setError] = useState("");
    const location = useLocation();
    const me = useAuth()?.data?.user;

    const hasUrl = NAVITEMS.find((nav) => nav.segment === model);

    useEffect(() => {
      const fetchData = async () => {
        const result = await ApiClient.get(`/api/${model}/${id}${location.search}`);
        if (result.success && result.data) {
          setEntity(result.data as EntityTypes);
        } else {
          setError(result.error || "Unknown Error");
        }
      };

      if (!hasUrl) {
        setError(`Invalid form URL pattern for ${model}`);
      } else if (id) {
        fetchData();
      } else {
        setEntity({ id: id ? id : 0, type: hasUrl.type } as NewEntity);
      }
    }, [id, model]);

    if (!hasUrl) {
      return <Typography variant={"h6"}>Invalid URL pattern for {model}</Typography>;
    }

    if (error.length > 0) {
      return <Grid container justifyContent="center" alignItems="center">
        <Typography variant="subtitle1">{error}</Typography>
      </Grid>;
    }

    if (!entity) {
      return <Grid container justifyContent="center" alignItems="center">
        <CircularProgress />
      </Grid>;
    }

    let allow: boolean | string;
    if (entity.id && entity.id !== "0") {
      allow = canDo("edit", entity as EntityTypes, me);
    } else {
      allow = canDo("add", Object.assign({}, entity, { _type: hasUrl.type }), me);
    }

    if (typeof allow === "string") {
      return <PermissionError error={allow} />;
    }

    const fields = Object.values(TypeFieldSchema[hasUrl.type]);
    const formKey = `OAForm${hasUrl.type}` as keyof typeof MyForms;
    const FormWrapper = formKey as MyFormsKeys in MyForms ? MyForms[formKey] : null;

    return (
      <Box sx={{ pt: 4, pl: 3 }}>
        {FormWrapper ?
          <FormProvider fields={fields} original={entity as EntityTypes} navItem={hasUrl}>
            <FormWrapper />
          </FormProvider>
          :
          <GenericForm fields={fields} navItem={hasUrl} original={entity as EntityTypes} />
        }
      </Box>
    );
  }
;

export default EntityForm;
