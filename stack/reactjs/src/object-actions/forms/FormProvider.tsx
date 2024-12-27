import React, {createContext, ReactElement, ReactNode, useContext, useState} from 'react';
import {EntityTypes, FieldTypeDefinition, getProp, NavItem} from '../types/types';
import ApiClient from '../../config/ApiClient';
import {useNavigate} from 'react-router-dom';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {FormControlLabel, FormHelperText, MenuItem, TextField} from '@mui/material';
import ImageUpload from './ImageUpload';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {DateTimePicker} from '@mui/x-date-pickers/DateTimePicker';
import {isDayJs} from "../../utils";
import Switch from "@mui/material/Switch";

dayjs.extend(utc);

interface FormProviderProps<T extends EntityTypes> {
    children: ReactNode;
    fields: FieldTypeDefinition[];
    original: EntityTypes;
    navItem: NavItem;
}

interface FormContextValue<T extends EntityTypes> {
    entity: T;
    syncing: boolean;
    hasChanges: () => boolean;
    errors: { [key: string]: string[] };
    handleFieldChange: (name: string, value: any) => void;
    handleFieldIndexChange: (name: string, value: any, number: number) => void;
    renderField: (field: FieldTypeDefinition, index?:number, topass?: any) => ReactElement | null;
    handleSubmit: (tosend: any, apiUrl?: string | null) => Promise<EntityTypes | Record<string, any>>;
    handleDelete: () => Promise<Record<string, any>>;
}

const FormContext = createContext<FormContextValue<EntityTypes> | undefined>(undefined);

export const FormProvider = <T extends EntityTypes>({
                                                        children,
                                                        fields,
                                                        original,
                                                        navItem
                                                    }: FormProviderProps<T>) => {
    const navigate = useNavigate();
    const eid = original.id || 0;
    const [entity, setEntity] = useState<EntityTypes>(original);
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
    const [syncing, setSyncing] = useState(false);

    function hasChanges(): boolean {
        return JSON.stringify(original) !== JSON.stringify(entity);
    }

    const handleChange = (field:FieldTypeDefinition, value:any, index=0) => {
        if (field.cardinality && field.cardinality > 1) {
            handleFieldIndexChange(field.machine, index, value)
        } else {
            handleFieldChange(field.machine, value)
        }
    }

    const handleFieldChange = (name: string, value: any) => {
        setEntity((prev) => {
            const newState: any = {...prev};
            newState[name] = value
            return newState
        });
    };

    const handleFieldIndexChange = (name: string, value: any, index: number) => {
        setEntity((prev) => {
            const newState: any = {...prev};
            if (value === null && newState[name][index]) {
                newState[name].splice(index, 1);
            } else {
                if (!newState[name]) newState[name] = []
                newState[name][index] = value
            }
            return newState
        });
    };

    const structureToPost = async () => {

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

            if (isDayJs(val)) {
                const field = fields.find(f => f.machine === key)
                if (field && field.field_type === 'date') {
                    val = val.format("YYYY-MM-DD")
                } else {
                    val = val.format()
                }
            } else if (Array.isArray(val)) {
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
        return {headers, formData}
    }

    const handleSubmit = async (toPost: any = null, apiUrl: string | null = null): Promise<EntityTypes | Record<string, any>> => {
        return new Promise<EntityTypes | Record<string, any>>(async (resolve, reject) => {
            const tosend: Record<string, any> = toPost ? toPost : structureToPost();
            const headers: Record<string, string> = {accept: 'application/json'};
            if (tosend instanceof FormData) {
                headers['Content-Type'] = 'multipart/form-data';
            } else {
                headers['Content-Type'] = 'application/json';
            }
            setSyncing(true);
            let response = null;
            if (apiUrl) {
                response = await ApiClient.post(apiUrl, tosend, headers);
            } else if (eid > 0) {
                response = await ApiClient.patch(`${navItem.api}/${eid}`, tosend, headers)
            } else {
                response = await ApiClient.post(navItem.api, tosend, headers);
            }
            setSyncing(false);
            const id = response.data ? getProp(response.data as EntityTypes, 'id') : null
            if (response.success && id) {
                const newEntity = response.data as EntityTypes
                setErrors({});
                resolve(newEntity)
            } else {
                setErrors(response.errors || {general: [response.error]});
                reject(response.errors || {general: [response.error]})
            }
        });
    };

    const handleDelete = async (): Promise<Record<string, any>> => {
        return new Promise<Record<string, any>>(async (resolve, reject) => {
            if (window.confirm('Are you sure you want to delete this?')) {
                setSyncing(true);
                const response = await ApiClient.delete(`${navItem.api}/${eid}`);
                setSyncing(false);

                if (response.success) {
                    resolve(response)
                    navigate(navItem.screen);
                } else {
                    setErrors(response.errors || {general: [response.error]});
                    reject(response)
                }
            } else {
                reject({error: 'Not deleted'})
            }
        });
    };

    const renderField = (field: FieldTypeDefinition, index:number=0, topass: any = {}) => {
        const value: any = entity[field.machine as keyof EntityTypes];
        let input: ReactElement | null = null;
        const error = errors[field.machine as keyof EntityTypes];

        switch (field.field_type) {
            case 'enum':
                input = (
                    <TextField
                        select
                        name={field.machine}
                        label={field.singular}
                        value={value || ''}
                        onChange={(e) => handleChange(field, e.target.value, index)}
                        error={!!error}
                        {...topass}
                    >
                        {field.options?.map((opt) => (
                            <MenuItem key={opt.id} value={opt.id}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </TextField>
                );
                break;
            case 'date':
                input = (
                    <DatePicker
                        label={field.singular}
                        value={value || null}
                        onChange={(newValue) => handleChange(field, newValue, index)}
                        {...topass}
                    />
                );
                break;
            case 'date_time':
                input = (
                    <DateTimePicker
                        label={field.singular}
                        value={value || null}
                        onChange={(newValue) => handleChange(field, newValue, index)}
                        {...topass}
                    />
                );
                break;
            case 'image':
                input = (
                    <ImageUpload
                        index={index}
                        field_name={field.machine}
                        selected={value}
                        onSelect={(selected) => handleChange(field, selected.file, index)}
                        buttonProps={topass}
                    />
                );
                break;
            case 'boolean':
                input = (
                    <FormControlLabel
                        value="bottom"
                        control={<Switch
                            checked={value}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleChange(field, event.target.checked, index)}
                        />}
                        label={field.singular}
                        labelPlacement="top"
                        {...topass}
                    />

                );
                break;
            default:
                if (field.field_type === 'textarea') {
                    topass.multiline = true
                    topass.rows = 3
                }
                input = (
                    <TextField
                        name={field.machine}
                        label={field.singular}
                        value={value || ''}
                        onChange={(e) => handleChange(field, e.target.value, index)}
                        error={!!error}
                        {...topass}
                    />
                );
        }

        return (
            <React.Fragment>
                {input}
                {error && <FormHelperText error>{error.join(', ')}</FormHelperText>}
            </React.Fragment>
        );
    };

    return (
        <FormContext.Provider value={{
            entity,
            syncing,
            errors,
            hasChanges,
            handleFieldIndexChange,
            handleFieldChange,
            renderField,
            handleSubmit,
            handleDelete
        }}>
            {children}
        </FormContext.Provider>
    );
};

export const useForm = <T extends EntityTypes>(): FormContextValue<T> => {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error('useForm must be used within a FormProvider');
    }
    return context as FormContextValue<T>;
};
