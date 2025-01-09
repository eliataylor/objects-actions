import React from "react";
import GenericForm from ".//GenericForm";
import { Box, Typography } from "@mui/material";
import { NavItem, NAVITEMS, RelEntity, TypeFieldSchema } from "../types/types";
import { canDo } from "../types/access";
import { useAuth } from "../../allauth/auth";
import { FormProvider } from "./FormProvider";
import * as MyForms from "./forms";
import { MyFormsKeys } from "./forms";
import PermissionError from "../../components/PermissionError";

interface NewFormDialog {
  newentity: RelEntity;
}

const NewFormDialog: React.FC<NewFormDialog> = ({ newentity }) => {
  const me = useAuth()?.data?.user;

  const allow = canDo("add", newentity, me);

  if (typeof allow === "string") {
    return <PermissionError error={allow} />
  }

  const hasUrl = NAVITEMS.find((nav) => nav.segment === newentity._type) as NavItem;
  const fields = Object.values(TypeFieldSchema[newentity._type]);

  const formKey = `OAForm${hasUrl.type}` as keyof typeof MyForms;
  const FormWrapper = formKey as MyFormsKeys in MyForms ? MyForms[formKey] : null;

  return (
    <Box sx={{ pt: 4, pl: 3 }}>
      {FormWrapper ?
        <FormProvider fields={fields} original={newentity} navItem={hasUrl}>
          <FormWrapper original={newentity} />
        </FormProvider>
        :
        <GenericForm fields={fields} navItem={hasUrl} original={newentity} />
      }
    </Box>
  );
};

export default NewFormDialog;
