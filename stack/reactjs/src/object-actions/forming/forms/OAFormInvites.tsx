//---OBJECT-ACTIONS-OAFORM-STARTS---//
import React from "react";
import { Button, CircularProgress, Grid, Typography } from "@mui/material";
import { EntityTypes, TypeFieldSchema } from "../../types/types";
import { OAFormProps, useForm } from "../FormProvider";
import { useSnackbar } from "notistack";
import { AlternatingList } from "../../../theme/StyledFields";
import { useNavigate } from "react-router-dom";

export const OAFormInvites: React.FC<OAFormProps> = ({ onSuccess }) => {

  const { renderField, handleSubmit, handleDelete, errors, navItem, entity, syncing } = useForm<EntityTypes>();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  async function saveEntity() {
    handleSubmit().then((newentity) => {
      if (onSuccess) {
        onSuccess(newentity);
      } else {
        navigate(`/${navItem.segment}/${newentity.id}`);
      }
      enqueueSnackbar(`${entity._type} saved`);
    }).catch(error => {
      console.error(error);
      enqueueSnackbar("Save failed");
    });
  }

  function deleteEntity() {
    handleDelete().then((msg) => {
      enqueueSnackbar(`${entity._type} saved`);
    }).catch(error => {
      console.error(error);
      enqueueSnackbar("Delete failed");
    });
  }

  return (
    <AlternatingList container spacing={4} p={1} justifyContent={'space-between'} wrap={"wrap"} >
      			<Grid item xs={12} >
				{renderField(TypeFieldSchema["Invites"]["meeting"], 0, {fullWidth:true})}
			</Grid>
			<Grid item xs={12} >
				{renderField(TypeFieldSchema["Invites"]["user"], 0, {fullWidth:true})}
			</Grid>
			<Grid item xs={12} >
				{renderField(TypeFieldSchema["Invites"]["invited_by"], 0, {fullWidth:true})}
			</Grid>
			<Grid item xs={12} >
				{renderField(TypeFieldSchema["Invites"]["status"], 0, {fullWidth:true})}
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

export default OAFormInvites;
//---OBJECT-ACTIONS-OAFORM-ENDS---//