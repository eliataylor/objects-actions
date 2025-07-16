import React, {useState} from "react";
import {Autocomplete, TextField} from "@mui/material";
import {ModelName, ModelType, RelEntity} from "../types/types";
import {AcOption, Api2Options, BaseAcFieldProps, useAutocomplete} from "./AutoCompleteUtils";
import {renderInputAdornments, renderOption} from "./AutoCompleteElements";
import NewFormDialog from "./NewFormDialog";

interface SingleAcFieldProps<T extends ModelName> extends BaseAcFieldProps<T> {
    selected: RelEntity<T> | null;
    onSelect: (selected: RelEntity<T> | null, field_name: string) => void;
}

export default function AutocompleteField<T extends ModelName>({
                                                                   type,
                                                                   search_fields,
                                                                   image_field,
                                                                   field_name,
                                                                   onSelect,
                                                                   selected,
                                                                   field_label = "Search"
                                                               }: SingleAcFieldProps<T>) {
    const {
        options,
        loading,
        nestedForm,
        setInputValue,
        setNestedForm,
        setNestedEntity
    } = useAutocomplete({type, search_fields, image_field, field_name, field_label});

    const [selectedOption, setSelectedOption] = useState<AcOption | null>(
        selected
            ? {
                value: selected.id,
                label: selected.str,
                image: selected.img
            }
            : null
    );

    const onNestedCreated = (entity: ModelType<T>) => {
        const option = Api2Options([entity], search_fields, image_field)[0];
        setSelectedOption(option);
        onSelect({id: option.value, str: option.label, _type: type}, field_name);
    };

    return (
        <React.Fragment>
            {typeof nestedForm !== "boolean" && (
                <NewFormDialog
                    entity={nestedForm}
                    onClose={() => setNestedForm(false)}
                    onCreated={onNestedCreated}
                />
            )}

            <Autocomplete
                options={options}
                value={selectedOption}
                getOptionLabel={(option) => option.label}
                loading={loading}
                autoHighlight={true}
                onChange={(event, newValue) => {
                    setSelectedOption(newValue);
                    if (newValue) {
                        onSelect({
                            id: newValue.value,
                            str: newValue.label,
                            _type: type
                        }, field_name);
                    }
                }}
                onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
                renderOption={renderOption}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        name={field_name}
                        placeholder={`Search ${field_label}`}
                        variant="standard"
                        InputProps={{
                            ...params.InputProps,
                            ...renderInputAdornments(loading, setNestedEntity, false)
                        }}
                    />
                )}
            />
        </React.Fragment>
    );
}
