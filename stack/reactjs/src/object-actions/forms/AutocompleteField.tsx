import React, {useEffect, useMemo, useState} from 'react';
import {Autocomplete, Avatar, CircularProgress, ListItem, ListItemAvatar, ListItemText, TextField} from '@mui/material';
import ApiClient from "../../config/ApiClient";
import {NAVITEMS, RelEntity} from "../types/types";
import {Search} from "@mui/icons-material";

export interface AcOption {
    label: string;
    value: string | number;
    subheader?: string;
    image?: string;
}

export interface AcFieldProps {
    type: string;
    field_name: string;
    search_fields: string[];
    image_field?: string | undefined;
    field_label: string;
    selected: RelEntity | null;
    onSelect: (selected: RelEntity | null, field_name: string) => void;
}

const AutocompleteField: React.FC<AcFieldProps> = ({
                                                       type,
                                                       search_fields,
                                                       image_field,
                                                       field_name,
                                                       onSelect,
                                                       selected,
                                                       field_label = "Search"
                                                   }) => {
    const [options, setOptions] = useState<AcOption[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState<AcOption | null>(selected ? {
        value: selected.id,
        label: selected.str
    } : null);

    const hasUrl = NAVITEMS.find(nav => nav.type === type);
    const basePath = hasUrl && hasUrl.api ? hasUrl.api : `/api/${type}`;

    function Api2Options(data: RelEntity[] | null, search_fields: string[]): AcOption[] {
        if (!data) return [];
        return data.map((obj: any) => {
            let label = search_fields.map(search_field => {
                if (search_field === 'username') {
                    return `@${obj[search_field]}`
                }
                return obj[search_field]
            })
            if (label.length === 0) label = [obj.id]
            const image = image_field ? obj[image_field] : undefined;
            return {label: label.join(', '), value: obj.id, image};
        });
    }

    const fetchOptions = async (search: string) => {
        setLoading(true);
        try {
            const response = await ApiClient.get(`${basePath}?search=${search}`);
            if (response.success && response.data) {
                // @ts-ignore
                const options = Api2Options(response.data.results, search_fields);
                setOptions(options);
            }
        } catch (error) {
            console.error('Error fetching options:', error);
            setOptions([]);
        } finally {
            setLoading(false);
        }
    };

    const debounceFetch = useMemo(
        () => debounce((search: string) => fetchOptions(search), 300),
        []
    );

    useEffect(() => {
        if (inputValue.trim() !== '') {
            debounceFetch(inputValue);
        } else {
            setOptions([]);
        }
    }, [inputValue, debounceFetch]);

    return (
        <Autocomplete
            options={options}
            value={selectedOption}
            getOptionLabel={(option) => option.label}
            loading={loading}
            autoHighlight={true}
            onChange={(event, newValue) => {
                setSelectedOption(newValue);
                if (newValue) {
                    const selectedRels = {
                        id: newValue.value,
                        str: newValue.label,
                        _type: type
                    };
                    onSelect(selectedRels, field_name);
                }
            }}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            renderOption={(props, option) => (
                <ListItem {...props}>
                    {option.image && (
                        <ListItemAvatar>
                            <Avatar src={option.image}/>
                        </ListItemAvatar>
                    )}
                    <ListItemText primary={option.label}/>
                </ListItem>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={selectedOption ? field_label : `Search ${field_label}`}
                    variant="outlined"
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {loading ? <CircularProgress color="inherit" size={20}/> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                        startAdornment: (
                            <>
                                <Search/>
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
        />
    );
};

// Debounce function to limit the rate at which a function can fire.
export function debounce(func: (...args: any[]) => void, wait: number) {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

export default AutocompleteField;
