import React, { useState, ChangeEvent, FormEvent } from 'react';
import { TextField, Button, Grid } from '@mui/material';
import {EntityView, FieldTypeDefinition} from "../types/types";

interface GenericFormProps {
  fields: FieldTypeDefinition[];
  original: EntityView;
}

const GenericForm: React.FC<GenericFormProps> = ({ fields, original }) => {
  const [entity, setEntity] = useState<EntityView>(original);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newEntity = {...entity}
    // @ts-ignore
    newEntity[name] = value
    setEntity(newEntity);
  };


  return (
    <form>
      <Grid container spacing={2}>
        {fields.map((field) => {
          return <Grid item xs={12} key={field.machine}>
            <TextField
                fullWidth
                name={field.machine}
                label={field.label}
                type={field.data_type}
                value={/* @ts-ignore */
                  entity[field.machine]
                }
                onChange={handleChange}
            />
          </Grid>
        })}
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default GenericForm;
