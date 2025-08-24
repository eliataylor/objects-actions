import React, {createContext, ReactElement, ReactNode, useContext, useState} from "react";
import {FieldTypeDefinition, ModelName, ModelType, NavItem, NAVITEMS, RelEntity} from "../types/types";
import ApiClient, {HttpResponse} from "../../config/ApiClient";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {FormControlLabel, FormHelperText, MenuItem, TextField} from "@mui/material";
import ImageUpload from "./ImageUpload";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import {DateTimePicker} from "@mui/x-date-pickers/DateTimePicker";
import {isDayJs} from "../../utils";
import Switch from "@mui/material/Switch";
import ProviderButton from "../../allauth/socialaccount/ProviderButton";
import AutocompleteMultipleField from "./AutocompleteMultipleField";
import AutocompleteField from "./AutocompleteField";
import FlatListField from "./FlatListField";


dayjs.extend(utc);

export interface OAFormProps<T extends ModelName> {
    onSuccess?: (newEntity: ModelType<T>) => void;
    onError?: (response: HttpResponse<ModelType<T>>) => void;
}

interface FormProviderProps<T extends ModelName> {
    children: ReactNode;
    fields: FieldTypeDefinition[];
    original: Partial<ModelType<T>>;
    navItem: NavItem<T>;
}

interface FormContextValue<T extends ModelName> {
    entity: Partial<ModelType<T>>;
    syncing: boolean;
    navItem: NavItem<T>;
    hasChanges: () => boolean;
    errors: { [key: string]: string[] };
    handleFieldChange: <K extends keyof ModelType<T>>(name: K, value: ModelType<T>[K]) => void;
    handleFieldIndexChange: <K extends keyof ModelType<T>>(name: K, value: ModelType<T>[K], index: number) => void;
    renderField: (
        field: FieldTypeDefinition,
        index?: number,
        topass?: any
    ) => ReactElement | null;
    setErrors: (errors: { [key: string]: string[] }) => void;
    handleSubmit: (toPost?: Partial<ModelType<T>>) => Promise<ModelType<T>>;
    handleDelete: () => Promise<Record<string, any>>;
    addFieldValue: <K extends keyof ModelType<T>>(field_name: K) => void;
    removeFieldValue: <K extends keyof ModelType<T>>(field_name: K, index: number) => void;
}

const FormContext = createContext<FormContextValue<ModelName> | undefined>(undefined);

export const FormProvider = <T extends ModelName>({
                                                      children,
                                                      fields,
                                                      original,
                                                      navItem
                                                  }: FormProviderProps<T>) => {
    const eid: string | number = original.id || 0;
    const [entity, setEntity] = useState<Partial<ModelType<T>>>(original);
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
    const [syncing, setSyncing] = useState(false);

    function hasChanges(): boolean {
        return JSON.stringify(original) !== JSON.stringify(entity);
    }

    const handleChange = <K extends keyof ModelType<T>>(
        field: FieldTypeDefinition,
        value: ModelType<T>[K],
        index = 0
    ) => {
        // For flat_list fields, always use handleFieldChange since they return a single string value
        // regardless of cardinality (multiple values are stored as comma-separated string)
        if (field.field_type === "flat_list") {
            handleFieldChange(field.machine as K, value);
        } else if (field.cardinality && field.cardinality > 1) {
            handleFieldIndexChange(field.machine as K, value, index);
        } else {
            handleFieldChange(field.machine as K, value);
        }
    };

    const handleFieldChange = <K extends keyof ModelType<T>>(
        name: K,
        value: ModelType<T>[K]
    ) => {
        setEntity((prev: Partial<ModelType<T>>) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFieldIndexChange = <K extends keyof ModelType<T>>(
        name: K,
        value: ModelType<T>[K],
        index: number
    ) => {
        setEntity((prev) => {
            const newState = {...prev};
            const currentValue = newState[name];

            if (Array.isArray(currentValue)) {
                if (value === null) {
                    currentValue.splice(index, 1);
                } else {
                    if (!currentValue) {
                        newState[name] = undefined;
                    }
                    (currentValue as any)[index] = value;
                }
            }

            return newState;
        });
    };

    function addFieldValue<K extends keyof ModelType<T>>(field_name: K) {
        const currentValue = entity[field_name];
        if (Array.isArray(currentValue)) {
            handleFieldIndexChange(
                field_name,
                "" as any,
                currentValue.length
            );
        }
    }

    function removeFieldValue<K extends keyof ModelType<T>>(field_name: K, index: number) {
        handleFieldIndexChange(field_name, null as any, index);
    }

    const structureToPost = (): Partial<ModelType<T>> => {
        const tosend = {id: eid, _type: navItem.type as T} as unknown as Partial<ModelType<T>>;

        for (const key in entity) {

            const typedKey = key as keyof ModelType<T>;
            let val: any = entity[typedKey];
            const was = original[typedKey];

            if (JSON.stringify(was) === JSON.stringify(val)) {
                continue;
            }

            const fieldDef = fields.find((f) => f.machine === key);

            if (isDayJs(val)) {
                if (fieldDef?.field_type === "date") {
                    val = val.format("YYYY-MM-DD") as any;
                } else {
                    val = val.format() as any;
                }
            } else if (fieldDef?.field_type === "flat_list") {
                val = Array.isArray(val) ? val.join(',') : val;
            } else if (Array.isArray(val)) {
                val = val.map((v) => v.id) as any;
            } else if (val && typeof val === "object" && "id" in val) {
                val = (val as RelEntity).id as any;
            }

            tosend[typedKey] = val;
        }

        return tosend;
    };

    const handleSubmit = async (
        toPost?: Partial<ModelType<T>>
    ): Promise<ModelType<T>> => {
        return new Promise<ModelType<T>>(async (resolve, reject) => {
            const tosend = toPost ? toPost : structureToPost();

            if (Object.keys(tosend).length <= 2) { // Accounting for id and _type
                return reject({general: ["You haven't changed anything"]});
            }

            const headers: Record<string, string> = {
                accept: "application/json"
            };

            const hasImage = Object.values(tosend).some((val) => val instanceof Blob);

            let formData: any = tosend;
            if (hasImage) {
                formData = new FormData();
                for (const key in tosend) {
                    formData.append(key, tosend[key as keyof typeof tosend]);
                }
                headers["Content-Type"] = "multipart/form-data";
            } else {
                headers["Content-Type"] = "application/json";
            }

            setSyncing(true);
            let response = null;

            try {
                if (eid && eid !== 0) {
                    response = await ApiClient.patch(
                        `${navItem.api}/${eid}`,
                        tosend,
                        headers
                    );
                } else {
                    response = await ApiClient.post(navItem.api, tosend, headers);
                }

                setSyncing(false);

                if (response.success && response.data) {
                    const newEntity = response.data as ModelType<T>;
                    setErrors({});
                    resolve(newEntity);
                } else {
                    setErrors(response.errors || {general: [response.error]});
                    reject(response.errors || {general: [response.error]});
                }
            } catch (error) {
                setSyncing(false);
                reject({general: ["An error occurred while saving"]});
            }
        });
    };

    const handleDelete = async (): Promise<Record<string, any>> => {
        return new Promise<Record<string, any>>(async (resolve, reject) => {
            if (window.confirm("Are you sure you want to delete this?")) {
                setSyncing(true);
                try {
                    const response = await ApiClient.delete(`${navItem.api}/${eid}`);
                    setSyncing(false);

                    if (response.success) {
                        resolve(response);
                    } else {
                        setErrors(response.errors || {general: [response.error]});
                        reject(response);
                    }
                } catch (error) {
                    setSyncing(false);
                    reject({error: "Delete failed"});
                }
            } else {
                reject({error: "Not deleted"});
            }
        });
    };

    const renderField = (
        field: FieldTypeDefinition,
        index = 0,
        topass: any = {}
    ): ReactElement | null => {
        const value = entity[field.machine as keyof ModelType<T>];
        const error = errors[field.machine];
        let input: ReactElement | null = null;

        const baseProps = {
            name: field.machine,
            label: field.singular,
            value: value || "",
            error: !!error,
        } as any;

        switch (field.field_type) {
            case "enum":
                input = (
                    <TextField
                        select
                        {...baseProps}
                        onChange={(e) => handleChange(field, e.target.value as any, index)}
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

            case "date":
                input = (
                    <DatePicker
                        {...baseProps}
                        value={typeof value === "string" ? dayjs(value).local() : value}
                        onChange={(newValue) => handleChange(field, newValue as any, index)}
                        slotProps={{
                            textField: {
                                ...topass
                            }
                        }}
                    />
                );
                break;

            case "date_time":
                input = (
                    <DateTimePicker
                        format="MMMM D, YYYY h:mm A"
                        {...baseProps}
                        value={typeof value === "string" ? dayjs(value).local() : value}
                        onChange={(newVal) => handleChange(field, newVal as any, index)}
                        slotProps={{
                            textField: {
                                ...topass
                            }
                        }}
                    />
                );
                break;

            case "provider_url":
                const id = field.machine === "link_spotify" ? "spotify" : "applemusic";
                input = (
                    <ProviderButton
                        connected={!!value}
                        provider={{name: field.singular, id}}
                        {...topass}
                    />
                );
                break;

            case "image":
            case "audio":
            case "video":
                input = (
                    <ImageUpload
                        mime_type={field.field_type}
                        index={index}
                        field_name={field.machine}
                        selected={value as string}
                        onSelect={(selected) => handleChange(field, selected.file as any, index)}
                        buttonProps={topass}
                    />
                );
                break;

            case "price":
                input = (
                    <TextField
                        {...baseProps}
                        onChange={(e) => handleChange(field, e.target.value as any, index)}
                        {...topass}
                    />
                );
                break;

            case "flat_list":
                input = (
                    <FlatListField
                        field={field}
                        value={value}
                        onChange={(newValue) => handleChange(field, newValue as any, index)}
                        topass={topass}
                        index={index}
                    />
                );
                break;

            case "boolean":
                input = (
                    <FormControlLabel
                        value="bottom"
                        control={
                            <Switch
                                checked={value as boolean}
                                name={field.machine}
                                onChange={(event) =>
                                    handleChange(field, event.target.checked as any, index)
                                }
                            />
                        }
                        label={field.singular}
                        labelPlacement="top"
                        {...topass}
                    />
                );
                break;

            case "RelEntity":
            case "type_reference":
            case "vocabulary_reference":
                const rel = field.relationship as ModelName;
                const subUrl = NAVITEMS.find((nav) => nav.type === rel) as NavItem<T>;
                input = field.cardinality && field.cardinality > 1 ? (
                    <AutocompleteMultipleField
                        type={rel}
                        search_fields={subUrl.search_fields}
                        onSelect={(selected) => handleChange(field, selected as any, index)}
                        field_name={field.machine}
                        field_label={field.plural}
                        selected={!value ? [] : (Array.isArray(value) ? value : [value]) as RelEntity<any>[]}
                    />
                ) : (
                    <AutocompleteField
                        type={rel}
                        search_fields={subUrl.search_fields}
                        onSelect={(selected) => handleChange(field, selected as any, index)}
                        field_name={field.machine}
                        field_label={field.singular}
                        selected={!value ? null : value as unknown as RelEntity<ModelName>}
                    />
                );
                break;

            default:
                if (field.field_type === "textarea") {
                    baseProps.multiline = true;
                    baseProps.rows = 3;
                }
                input = (
                    <TextField
                        {...baseProps}
                        onChange={(e) => handleChange(field, e.target.value as any, index)}
                        {...topass}
                    />
                );
        }


        return (
            <React.Fragment>
                {input}
                {error && <FormHelperText error>{error.join(", ")}</FormHelperText>}
            </React.Fragment>
        );
    };

    return (
        <FormContext.Provider
            value={{
                entity,
                navItem,
                syncing,
                errors,
                setErrors,
                hasChanges,
                handleFieldIndexChange,
                handleFieldChange,
                renderField,
                handleSubmit,
                handleDelete,
                addFieldValue,
                removeFieldValue
            } as FormContextValue<ModelName>}
        >
            {children}
        </FormContext.Provider>
    );
};

export const useForm = <T extends ModelName>(): FormContextValue<T> => {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error("useForm must be used within a FormProvider");
    }
    return context as FormContextValue<T>;
};
