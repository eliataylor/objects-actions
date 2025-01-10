import React from "react";
import GenericForm from ".//GenericForm";
import { Button, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { EntityTypes, NavItem, NAVITEMS, TypeFieldSchema } from "../types/types";
import { canDo } from "../types/access";
import { useAuth } from "../../allauth/auth";
import { FormProvider } from "./FormProvider";
import * as MyForms from "./forms";
import { MyFormsKeys } from "./forms";
import PermissionError from "../../components/PermissionError";

interface NewFormDialog {
  entity: EntityTypes;
  onClose: () => void;
  onCreated: (newentity: EntityTypes) => void;
}

const NewFormDialog: React.FC<NewFormDialog> = ({ entity, onClose, onCreated }) => {
  const me = useAuth()?.data?.user;

  const onSuccess =  (entity: EntityTypes) => {
    onCreated(entity);
    onClose();
  }

  const allow = canDo("add", entity, me);

  if (typeof allow === "string") {
    return <PermissionError error={allow} />;
  }

  const hasUrl = NAVITEMS.find((nav) => nav.type === entity._type) as NavItem;
  const fields = Object.values(TypeFieldSchema[entity._type]);

  const formKey = `OAForm${hasUrl.type}` as keyof typeof MyForms;
  const FormWrapper = formKey as MyFormsKeys in MyForms ? MyForms[formKey] : null;

  return (
    <Dialog open={true} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Add a {hasUrl.singular}
        <Button
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          Close
        </Button>
      </DialogTitle>
      <DialogContent>
        {FormWrapper ? (
          <FormProvider fields={fields} original={entity} navItem={hasUrl}>
            <FormWrapper onSuccess={onSuccess} />
          </FormProvider>
        ) : (
          <GenericForm
            onSuccess={onSuccess}
            fields={fields}
            navItem={hasUrl}
            original={entity}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewFormDialog;
