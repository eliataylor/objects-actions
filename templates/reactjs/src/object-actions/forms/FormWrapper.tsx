import React, {ChangeEvent, FormEvent} from 'react';
import {useFormContext} from './FormContext'; // Adjust the path if needed
import Input from '@mui/material/Input';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import LinkIcon from '@mui/icons-material/Link';

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

interface FormWrapperProps {
    onSubmit?: (e: FormEvent) => void;
}

const FormWrapper: React.FC<FormWrapperProps> = ({onSubmit}) => {
    const {state, dispatch} = useFormContext();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(e);
        }
    };

    const handleFieldChange = (value: any, fieldName: string, index: number, propName: string) => {
        dispatch({type: 'changeFieldVal', payload: {value, fieldName, index, propName}});
    };

    const renderLinkField = (field: any, entry: any, index: number, sourceName: string) => {
        const inpProps = {}; // Adjust based on Form2Json.settingsToProps(field, entry, index)
        return (
            <Grid key={`${field.field_name}_${index}_${sourceName}`} item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                    <InputLabel htmlFor={inpProps.id}>{field.label}</InputLabel>
                    <Input
                        {...inpProps}
                        type="url"
                        endAdornment={
                            <InputAdornment position="end">
                                <LinkIcon/>
                            </InputAdornment>
                        }
                        onFocus={() => console.log('onFocused', sourceName, field.field_name, entry)} // Implement onFocused logic
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            handleFieldChange(e.currentTarget.value, field.field_name, index, field['data-propname'])
                        }
                        value={entry[index] ? entry[index][field['data-propname']] : ''}
                    />
                    {field.description ? <FormHelperText>{field.description}</FormHelperText> : ''}
                </FormControl>
            </Grid>
        );
    };

    return (
        <Grid container spacing={2}>
            <form onSubmit={handleSubmit}>
                {/* Render other fields */}
                {/* Example of rendering link field */}
                {state.fields?.map((field, index) => renderLinkField(field, state.entries, index, 'sourceName'))}
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