//---OBJECT-ACTIONS-OAFORM-STARTS---//
import React from "react";
import { Button, CircularProgress, Grid, Typography } from "@mui/material";
import { TypeFieldSchema } from "../../types/types";
import { OAFormProps, useForm } from "../FormProvider";
import { useSnackbar } from "notistack";
import { AlternatingList } from "../../../styles/StyledFields";
import { useRouter } from "next/navigation";

export const OAFormActionPlans: React.FC<OAFormProps<"ActionPlans">> = ({ onSuccess }) => {

  const { renderField, handleSubmit, handleDelete, errors, navItem, entity, syncing } = useForm<"ActionPlans">();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  async function saveEntity() {
    handleSubmit().then((newentity) => {
      if (onSuccess) {
        onSuccess(newentity);
      } else {
        router.push(`/${navItem.segment}/${newentity.id}`);
      }
      enqueueSnackbar(`ActionPlans saved`);
    }).catch(error => {
      console.error(error);
      enqueueSnackbar("Save failed");
    });
  }

  function deleteEntity() {
    handleDelete().then((msg) => {
      enqueueSnackbar(`ActionPlans saved`);
    }).catch(error => {
      console.error(error);
      enqueueSnackbar("Delete failed");
    });
  }

  return (
    <AlternatingList container spacing={4} p={1} justifyContent={"space-between"} wrap={"wrap"}>
      <Grid item xs={12}>
        {renderField(TypeFieldSchema["ActionPlans"]["title"], 0, { fullWidth: true })}
      </Grid>
      <Grid item xs={12}>
        {renderField(TypeFieldSchema["ActionPlans"]["recommendation"], 0, { fullWidth: true })}
      </Grid>
      <Grid item xs={12}>
        {renderField(TypeFieldSchema["ActionPlans"]["exe_summary"], 0, { fullWidth: true })}
      </Grid>
      <Grid item xs={12}>
        {renderField(TypeFieldSchema["ActionPlans"]["analysis"], 0, { fullWidth: true })}
      </Grid>
      <Grid item xs={12}>
        {renderField(TypeFieldSchema["ActionPlans"]["background"], 0, { fullWidth: true })}
      </Grid>
      <Grid item xs={12}>
        {renderField(TypeFieldSchema["ActionPlans"]["coauthors"], 0, { fullWidth: true })}
      </Grid>
      <Grid item xs={12}>
        {renderField(TypeFieldSchema["ActionPlans"]["pro_argument"], 0, { fullWidth: true })}
      </Grid>
      <Grid item xs={12}>
        {renderField(TypeFieldSchema["ActionPlans"]["con_argument"], 0, { fullWidth: true })}
      </Grid>
      <Grid item xs={12}>
        {renderField(TypeFieldSchema["ActionPlans"]["prerequisites"], 0, { fullWidth: true })}
      </Grid>
      <Grid item xs={12}>
        {renderField(TypeFieldSchema["ActionPlans"]["timeline"], 0, { fullWidth: true })}
      </Grid>
      <Grid item xs={12}>
        {renderField(TypeFieldSchema["ActionPlans"]["rally"], 0, { fullWidth: true })}
      </Grid>

      {errors["general"] && <Typography variant={"body1"} color={"error"}>{errors["general"]}</Typography>}

      <Grid container item xs={12} justifyContent="space-between">
        <Button startIcon={syncing ? <CircularProgress color={"inherit"} size={18} /> : null}
                disabled={syncing}
                aria-label={"Submit"}
                variant="contained" color="primary" onClick={saveEntity}>
          Save
        </Button>
        {entity.id && entity.id !== "0" ? <Button
          startIcon={syncing ? <CircularProgress color={"inherit"} size={18} /> : null}
          disabled={syncing}
          variant="outlined" color="secondary" onClick={deleteEntity}>
          Delete
        </Button> : null
        }
      </Grid>
    </AlternatingList>
  );

};

export default OAFormActionPlans;
//---OBJECT-ACTIONS-OAFORM-ENDS---//
