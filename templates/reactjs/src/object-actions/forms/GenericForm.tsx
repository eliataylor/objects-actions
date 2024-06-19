import React, { useState, ChangeEvent, FormEvent } from 'react';
import { TextField, Button, Grid } from '@mui/material';
import {EntityView, FieldTypeDefinition} from "../types/types";

interface GenericFormProps<T> {
  fields: FieldTypeDefinition[];
  entity: EntityView;
}

const GenericForm = <T extends {}>({ fields, entity }: GenericFormProps<T>) => {
  const [entity, setEntity] = useState<EntityView>(entity);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newEntity = {...entity}
    newEntity[name] = value
    setEntity(newEntity);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        {fields.map((field) => (
          <Grid item xs={12} key={field.field_name}>
            <TextField
              fullWidth
              name={field.field_name}
              label={field.field_label}
              type={field.data_type}
              value={entity[field.field_name]}
              onChange={handleChange}
            />
          </Grid>
        ))}
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
