import React, {createContext, ReactElement, ReactNode, useContext, useState} from 'react';
import {EntityTypes, FieldTypeDefinition, getProp, NavItem} from '../types/types';
import ApiClient from '../../config/ApiClient';
import {useNavigate} from 'react-router-dom';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {FormHelperText, MenuItem, TextField} from '@mui/material';
import ImageUpload from './ImageUpload';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {DateTimePicker} from '@mui/x-date-pickers/DateTimePicker';

dayjs.extend(utc);

interface FormProviderProps<T extends EntityTypes> {
    children: ReactNode;
    fields: FieldTypeDefinition[];
    original: EntityTypes;
    navItem: NavItem;
}

interface FormContextValue<T extends EntityTypes> {
    entity: T;
    handleFieldChange: (name: string, value: any) => void;
    renderField: (field: FieldTypeDefinition, topass?: any) => ReactElement | null;
    handleSubmit: () => Promise<void>;
    handleDelete: () => Promise<void>;
}

const FormContext = createContext<FormContextValue<EntityTypes> | undefined>(undefined);

export const FormProvider = <T extends EntityTypes>({ children, fields, original, navItem }: FormProviderProps<T>) => {
    const navigate = useNavigate();
    const eid = original.id || 0;
    const [entity, setEntity] = useState<EntityTypes>(original);
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
    const [syncing, setSyncing] = useState(false);

    const handleChange = (name: string, value: any) => {
        setEntity((prev) => ({...prev, [name]: value}));
    };

    const handleFieldChange = (name: string, value: any) => {
        handleChange(name, value);
    };

    const handleSubmit = async () => {
        const tosend: Record<string, any> = {id: eid};
        let hasImage = false;

        for (const key in entity) {
            const val: any = entity[key as keyof EntityTypes];
            const was = original[key as keyof EntityTypes];
            if (JSON.stringify(was) === JSON.stringify(val)) continue;

            if (val instanceof Blob) hasImage = true;

            if (dayjs.isDayjs(val)) {
                const field = fields.find((f) => f.machine === key);
                tosend[key] = field?.field_type === 'date' ? val.format('YYYY-MM-DD') : val.format();
            } else if (Array.isArray(val)) {
                tosend[key] = val.map((v) => v.id);
            } else if (val?.id) {
                tosend[key] = val.id;
            } else {
                tosend[key] = val;
            }
        }

        if (Object.keys(tosend).length === 1) {
            alert("You haven't changed anything");
            return;
        }

        const headers: Record<string, string> = {accept: 'application/json'};
        if (hasImage) {
            const formData = new FormData();
            for (const key in tosend) {
                formData.append(key, tosend[key]);
            }
            headers['Content-Type'] = 'multipart/form-data';
        } else {
            headers['Content-Type'] = 'application/json';
        }

        setSyncing(true);
        const response = eid > 0
            ? await ApiClient.patch(`${navItem.api}/${eid}`, tosend, headers)
            : await ApiClient.post(navItem.api, tosend, headers);
        setSyncing(false);

        const id = getProp(response.data as EntityTypes, 'id')
        if (response.success && id) {
            navigate(`${navItem.screen}/${id}`);
            setErrors({});
        } else {
            setErrors(response.errors || {general: [response.error]});
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this?')) {
            setSyncing(true);
            const response = await ApiClient.delete(`${navItem.api}/${eid}`);
            setSyncing(false);

            if (response.success) {
                alert('Deleted');
                navigate(navItem.screen);
            } else {
                setErrors(response.errors || {general: [response.error]});
            }
        }
    };

    const renderField = (field: FieldTypeDefinition, topass: any = {}) => {
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
                        onChange={(e) => handleFieldChange(field.machine, e.target.value)}
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
                        onChange={(newValue) => handleFieldChange(field.machine, newValue)}
                        {...topass}
                    />
                );
                break;
            case 'date_time':
                input = (
                    <DateTimePicker
                        label={field.singular}
                        value={value || null}
                        onChange={(newValue) => handleFieldChange(field.machine, newValue)}
                        {...topass}
                    />
                );
                break;
            case 'image':
                // TODO: get correct index
                input = (
                    <ImageUpload
                        index={0}
                        field_name={field.machine}
                        selected={value}
                        onSelect={(selected) => handleFieldChange(field.machine, selected.file)}
                        buttonProps={topass}
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
                        onChange={(e) => handleFieldChange(field.machine, e.target.value)}
                        error={!!error}
                        {...topass}
                    />
                );
        }

        return (
            <div>
                {input}
                {error && <FormHelperText error>{error.join(', ')}</FormHelperText>}
            </div>
        );
    };

    return (
        <FormContext.Provider value={{entity, handleFieldChange, renderField, handleSubmit, handleDelete}}>
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
