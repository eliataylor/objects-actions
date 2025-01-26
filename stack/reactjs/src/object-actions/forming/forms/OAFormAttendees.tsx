//---OBJECT-ACTIONS-OAFORM-STARTS---//
import React from "react";
import { Button, CircularProgress, Grid, Typography } from "@mui/material";
import { Attendees, TypeFieldSchema } from "../../types/types";
import { OAFormProps, useForm } from "../FormProvider";
import { useSnackbar } from "notistack";
import { AlternatingList } from "../../../theme/StyledFields";
import { useNavigate } from "react-router-dom";

export const OAFormAttendees: React.FC<OAFormProps<Attendees>> = ({ onSuccess }) => {

  const { renderField, handleSubmit, handleDelete, errors, navItem, entity, syncing } = useForm<Attendees>();
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
				{renderField(TypeFieldSchema["Attendees"]["room_id"], 0, {fullWidth:true})}
			</Grid>
			<Grid item xs={12} >
				{renderField(TypeFieldSchema["Attendees"]["display_name"], 0, {fullWidth:true})}
			</Grid>
			<Grid item xs={12} >
				{renderField(TypeFieldSchema["Attendees"]["display_bg"], 0, {fullWidth:true})}
			</Grid>
			<Grid item xs={12} >
				{renderField(TypeFieldSchema["Attendees"]["role"], 0, {fullWidth:true})}
			</Grid>
			<Grid item xs={12} >
				{renderField(TypeFieldSchema["Attendees"]["stream"], 0, {fullWidth:true})}
			</Grid>
			<Grid item xs={12} >
				{renderField(TypeFieldSchema["Attendees"]["is_muted"], 0, {fullWidth:true})}
			</Grid>
			<Grid item xs={12} >
				{renderField(TypeFieldSchema["Attendees"]["sharing_video"], 0, {fullWidth:true})}
			</Grid>
			<Grid item xs={12} >
				{renderField(TypeFieldSchema["Attendees"]["sharing_audio"], 0, {fullWidth:true})}
			</Grid>
			<Grid item xs={12} >
				{renderField(TypeFieldSchema["Attendees"]["sharing_screen"], 0, {fullWidth:true})}
			</Grid>
			<Grid item xs={12} >
				{renderField(TypeFieldSchema["Attendees"]["hand_raised"], 0, {fullWidth:true})}
			</Grid>
			<Grid item xs={12} >
				{renderField(TypeFieldSchema["Attendees"]["is_typing"], 0, {fullWidth:true})}
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

export default OAFormAttendees;
//---OBJECT-ACTIONS-OAFORM-ENDS---//