import React, {useState} from "react";
import {Autocomplete, TextField} from "@mui/material";
import {ModelName, ModelType, RelEntity} from "../types/types";
import {AcOption, Api2Options, BaseAcFieldProps, useAutocomplete} from "./AutoCompleteUtils";
import {renderInputAdornments, renderOption} from "./AutoCompleteElements";
import NewFormDialog from "./NewFormDialog";


interface MultiAcFieldProps<T extends ModelName> extends BaseAcFieldProps<T> {
    selected: RelEntity<T>[];
    onSelect: (selected: RelEntity<T>[], field_name: string) => void;
}

export default function AutocompleteMultipleField<T extends ModelName>({
                                                                           type,
                                                                           image_field,
                                                                           search_fields,
                                                                           field_name,
                                                                           onSelect,
                                                                           selected,
                                                                           field_label = "Search"
                                                                       }: MultiAcFieldProps<T>) {
    const {
        options,
        loading,
        nestedForm,
        setInputValue,
        setNestedForm,
        setNestedEntity
    } = useAutocomplete<T>({type, search_fields, image_field, field_name, field_label});

    const [selectedOptions, setSelectedOptions] = useState<AcOption[]>(
        Api2Options(selected, ["str"])
    );

    const onNestedCreated = (entity: ModelType<T>) => {
        const option = Api2Options([entity], search_fields, image_field)[0];
        const newOptions = [...selectedOptions, option];
        setSelectedOptions(newOptions);

        const selectedRels: RelEntity<T>[] = newOptions.map((opt) => ({
            id: opt.value,
            str: opt.label,
            _type: type,
            img: opt.image
        }));

        onSelect(selectedRels, field_name);
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
                multiple
                options={options}
                value={selectedOptions}
                getOptionLabel={(option) => option.label}
                loading={loading}
                autoHighlight={true}
                onChange={(event, newValue) => {
                    setSelectedOptions(newValue);
                    const selectedRels: RelEntity<T>[] = newValue.map((option) => ({
                        id: option.value,
                        str: option.label,
                        _type: type,
                        img: option.image
                    }));
                    onSelect(selectedRels, field_name);
                }}
                onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
                renderOption={renderOption}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={selectedOptions.length > 0 ? field_label : `Search ${field_label}`}
                        name={field_name}
                        variant="outlined"
                        InputProps={{
                            ...params.InputProps,
                            ...renderInputAdornments(loading, setNestedEntity, true)
                        }}
                    />
                )}
            />
        </React.Fragment>
    );
}
