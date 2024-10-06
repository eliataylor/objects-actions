import React, {ChangeEvent, ReactElement, useState} from 'react';
import {Button, Grid, MenuItem, TextField, Typography} from '@mui/material';
import {EntityTypes, FieldTypeDefinition, NavItem, NAVITEMS, RelEntity} from "../types/types";
import AutocompleteField from "./AutocompleteField";
import ApiClient from "../../config/ApiClient";
import AutocompleteMultipleField from "./AutocompleteMultipleField";
import ImageUpload, {Upload} from "./ImageUpload";
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
// import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import {DateTimePicker} from '@mui/x-date-pickers/DateTimePicker';
import dayjs, {Dayjs} from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {useNavigate} from "react-router-dom";
import ListItemText from "@mui/material/ListItemText";

dayjs.extend(utc)

interface GenericFormProps {
    fields: FieldTypeDefinition[];
    original: EntityTypes;
    navItem: NavItem;
}

const GenericForm: React.FC<GenericFormProps> = ({fields, navItem, original}) => {

    const eid = typeof original['id' as keyof EntityTypes] !== 'undefined' ? original['id' as keyof EntityTypes] : 0;
    const [entity, setEntity] = useState<EntityTypes>(original);
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
    const navigate = useNavigate()
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        const newEntity = {...entity}
        // @ts-ignore
        newEntity[name] = value
        setEntity(newEntity);
    };

    const handleTimeChange = (newValue: Dayjs | null, name: string) => {
        const newEntity = {...entity}
        // @ts-ignore
        newEntity[name] = newValue
        setEntity(newEntity);
    };

    const handleSelect = (value: RelEntity[] | RelEntity | null, name: string) => {
        const newEntity = {...entity}
        // @ts-ignore
        newEntity[name] = value
        setEntity(newEntity);
    };

    const handleImage = (selected: Upload, field_name: string, index: number) => {
        const newEntity = {...entity}
        // @ts-ignore
        newEntity[field_name] = selected.file
        // todo: handle multiple images
        setEntity(newEntity);
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this?")) {
            const apiUrl = `${process.env.REACT_APP_API_HOST}${navItem.api}/${eid}/`
            const response = await ApiClient.delete(apiUrl);

            if (response.success) {
                navigate(navItem.screen)
                alert('Submitted deleted');
            } else if (response.error) {
                // @ts-ignore
                setErrors(response.error)
            }
        }
    }

    const handleSubmit = async () => {
        let response = null;

        const tosend: any = {id: eid};
        let hasImage = false;
        for (let key in entity) {
            let val: any = entity[key as keyof EntityTypes];
            let was: any = original[key as keyof EntityTypes];
            if (JSON.stringify(was) === JSON.stringify(val)) {
                continue;
            }
            if (val instanceof Blob) {
                hasImage = true;
            }

            if (Array.isArray(val)) {
                val = val.map(v => v.id)
            } else if (val && typeof val === 'object' && val.id) {
                val = val.id
            }
            tosend[key as keyof EntityTypes] = val
        }
        if (Object.keys(tosend).length === 1) {
            return alert("You haven't changed anything")
        }

        const formData: EntityTypes | FormData = tosend;
        const headers: any = {
            'accept': 'application/json'
        }
        if (hasImage) {
            const formData = new FormData()
            for (let key in tosend) {
                // @ts-ignore
                formData.append(key, tosend[key])
            }
            headers["Content-Type"] = `multipart/form-data`
        } else {
            headers["Content-Type"] = "application/json"
        }

        const apiUrl = `${process.env.REACT_APP_API_HOST}${navItem.api}/`
        if (eid > 0) {
            response = await ApiClient.patch(`${apiUrl}${eid}/`, formData, headers);
        } else {
            response = await ApiClient.post(apiUrl, formData, headers);
        }
        if (response.success && response.data) {
            const newEntity = response.data as EntityTypes
            navigate(`/forms${navItem.screen}/${newEntity.id}/edit`)
            alert('Submitted successfully');
            setErrors({})
            return
        }
        if (response.error) {
            // @ts-ignore
            setErrors(response.error)
        }
    };

    function errToString(err: any) {
        if (!err) return null;
        return Array.isArray(err) ? err.join(', ') : err
    }


    const errorcopy = {...errors}
    return (
        <Grid container spacing={2}>
            {fields.map((field) => {
                let error: string[] | undefined = errors[field.machine]
                if (error) {
                    delete errorcopy[field.machine]
                }
                const baseVal: any = entity[field.machine as keyof EntityTypes]
                let input: ReactElement | null = null;
                if (field.field_type === 'enum') {
                    input = <TextField
                        fullWidth
                        select
                        name={field.machine}
                        label={field.singular}
                        type={field.data_type}
                        value={baseVal}
                        onChange={handleChange}
                        error={typeof error !== 'undefined'}
                    >
                        {field.options && field.options.map(opt => <MenuItem key={field.machine + opt.id} value={opt.id}>
                            <ListItemText primary={opt.label}/>
                        </MenuItem>)}

                    </TextField>
                } else if (field.field_type === 'date_time') {
                    input = <React.Fragment>
                        <Typography variant='caption' component={'div'}>{field.singular}</Typography>
                        <DateTimePicker
                            format="MMMM D, YYYY h:mm A"
                            value={typeof baseVal === 'string' ?
                                dayjs.utc(baseVal).local()
                                : baseVal}
                            onChange={(newVal) => handleTimeChange(newVal, field.machine)}/>
                    </React.Fragment>
                } else if (field.field_type === 'date') {
                    input = <React.Fragment>
                        <Typography variant='caption' component={'div'}>{field.singular}</Typography>
                        <DatePicker
                            format="MMMM D, YYYY"
                            value={typeof baseVal === 'string' ?
                                dayjs.utc(baseVal).local()
                                : baseVal}
                            onChange={(newVal) => handleTimeChange(newVal, field.machine)}/>
                    </React.Fragment>
                } else if (field.field_type === 'image') {
                    input = <ImageUpload onSelect={handleImage} index={0}
                                         field_name={field.machine}
                                         selected={baseVal}
                    />
                } else if (field.data_type === 'RelEntity') {
                    const subUrl = NAVITEMS.find(nav => nav.type === field.relationship);
                    input = field?.cardinality && field?.cardinality > 1 ?
                        <AutocompleteMultipleField type={field.relationship || ""}
                                                   search_fields={subUrl?.search_fields || []}
                                                   onSelect={handleSelect}
                                                   field_name={field.machine}
                                                   field_label={field.plural}
                                                   selected={!baseVal ? [] : (Array.isArray(baseVal) ? baseVal : [baseVal])}
                        />
                        :
                        <AutocompleteField type={field.relationship || ""}
                                           search_fields={subUrl?.search_fields || []}
                                           onSelect={handleSelect}
                                           field_name={field.machine}
                                           field_label={field.singular}
                                           selected={baseVal}/>

                } else {
                    input = <TextField
                        fullWidth
                        name={field.machine}
                        label={field.singular}
                        type={field.data_type}
                        value={baseVal}
                        onChange={handleChange}
                        error={typeof error !== 'undefined'}
                    />
                }


                return <Grid item xs={12} key={field.machine}>
                    {input}
                    {error && <Typography variant="body2" color="error">{errToString(error)}</Typography>}
                </Grid>
            })}

            {Object.values(errorcopy).length > 0 && Object.values(errorcopy).map((err, i) => {
                const errstr = errToString(err);
                return <Typography variant="body2" key={errstr} color="error">{errstr}</Typography>
            })}

            <Grid container item xs={12} justifyContent={'space-between'}>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Submit
                </Button>

                {eid > 0 && <Button onClick={handleDelete} variant="outlined" color="inherit">
                  Delete
                </Button>}
            </Grid>
        </Grid>
    );
};

export default GenericForm;
