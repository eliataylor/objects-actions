import React, {ChangeEvent, FormEvent} from 'react';
import Input from '@mui/material/Input';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import LinkIcon from '@mui/icons-material/Link';
import {EntityTypes, FieldTypeDefinition, NAVITEMS, TypeFieldSchema} from "../types/types";
import {useLocation} from "react-router-dom";
import {Typography} from "@mui/material";


/*
function settingsToProps(field) {
    var obj = {};
    obj.name = field.field_name;

    if (field.field_type === 'textarea') {
        obj.multiline = true;
        obj.rows = 2;
    }

    if (field.required) {
        obj.required = true;
    }

    return obj;
}

function getDefaultValue(field, entry, index) {
  if (entry && typeof entry[index] !== 'undefined') {
   return (entry[index][propname] === null) ? '' : entry[index][propname];
  } else if (typeof field.default_value === 'string' || typeof field.default_value === 'number') {
   return field.default_value;
  } else if (field.default_value === null) {
   return '';
  } else if (typeof field.default_value === 'object' && typeof field.default_value[index] !== 'undefined' &&  typeof field.default_value[index][propname] !== 'undefined') {
   return field.default_value[index][propname];
  } else if (typeof field.default_value === 'object' && typeof field.default_value[index] !== 'undefined' && typeof field.default_value[index]['default_date'] !== 'undefined' && field.default_value[index]['default_date'] === 'now') {
   return moment().format('');
  }
  return '';
 }
 */

interface FormWrapperProps {
    onSubmit?: (e: FormEvent) => void;
    entityData: EntityTypes;
}

const FormWrapper: React.FC<FormWrapperProps> = ({onSubmit, entityData}) => {
    const location = useLocation();

    const hasUrl = NAVITEMS.find(nav => nav.type === entityData['_type']);
    if (!hasUrl) return <Typography>Unknown Type</Typography>
    const fields = Object.values(TypeFieldSchema[hasUrl.type])


    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(e);
        }
    };

    const handleFieldChange = (value: any, fieldName: string, index: number) => {
        // dispatch({type: 'changeFieldVal', payload: {value, fieldName, index}});
    };

    const renderLinkField = (field: FieldTypeDefinition, entry: any, index: number, sourceName: string) => {
        const inpProps = {id: 'test'}; // Adjust based on Form2Json.settingsToProps(field, entry, index)
        return (
            <Grid key={`${field.machine}_${index}_${sourceName}`} item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                    <InputLabel htmlFor={inpProps.id}>{field.singular}</InputLabel>
                    <Input
                        {...inpProps}
                        type="url"
                        endAdornment={
                            <InputAdornment position="end">
                                <LinkIcon/>
                            </InputAdornment>
                        }
                        onFocus={() => console.log('onFocused', sourceName, field.machine, entry)} // Implement onFocused logic
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            handleFieldChange(e.currentTarget.value, field.machine, index)
                        }
                        value={entry[field.machine]}
                    />
                </FormControl>
            </Grid>
        );
    };

    return (
        <Grid container spacing={2}>
            <form onSubmit={handleSubmit}>
                {/* Render other fields */}
                {/* Example of rendering link field */}
                {fields?.map((field, index) => renderLinkField(field, entityData, index, 'sourceName'))}
                <Grid item xs={12}>
                    <Button variant="contained" color="primary" type="submit">
                        Submit
                    </Button>
                </Grid>
            </form>
        </Grid>
    );
};

export default FormWrapper;