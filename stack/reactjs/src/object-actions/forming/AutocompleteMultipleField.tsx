import React, { useEffect, useMemo, useState } from "react";
import { Autocomplete, Avatar, CircularProgress, ListItem, ListItemAvatar, ListItemText, TextField } from "@mui/material";
import ApiClient from "../../config/ApiClient";
import { EntityTypes, NavItem, NAVITEMS, RelEntity } from "../types/types";
import { AcOption } from "./AutocompleteField";
import NewFormDialog from "./NewFormDialog";
import IconButton from "@mui/material/IconButton";
import { Add } from "@mui/icons-material";

interface MultiAcFieldProps {
  type: string;
  field_name: string;
  image_field?: string | undefined;
  search_fields: string[];
  field_label: string;
  selected: RelEntity[];
  onSelect: (selected: RelEntity[], field_name: string) => void;
}

const AutocompleteField: React.FC<MultiAcFieldProps> = ({
                                                          type,
                                                          image_field,
                                                          search_fields,
                                                          field_name,
                                                          onSelect,
                                                          selected,
                                                          field_label = "Search"
                                                        }) => {
  const [options, setOptions] = useState<AcOption[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [nestedForm, setNestedForm] = useState<EntityTypes | boolean>(false);
  const [selectedOptions, setSelectedOptions] = useState<AcOption[]>(
    Api2Options(selected, ["str"])
  );

  const hasUrl = NAVITEMS.find((nav) => nav.type === type) as NavItem;
  const basePath = hasUrl && hasUrl.api ? hasUrl.api : `/api/${type}`;

  function Api2Options(
    data: RelEntity[] | null,
    search_fields: string[]
  ): AcOption[] {
    if (!data) return [];
    return data.map((obj: any) => {
      let label = search_fields.map((search_field) => obj[search_field]);
      if (label.length === 0) label = [obj.id];
      const image = image_field ? obj[image_field] : undefined;
      return { label: label.join(", "), value: obj.id, image };
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
      console.error("Error fetching options:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const debounceFetch = useMemo(
    () => debounce((search: string) => fetchOptions(search), 300),
    []
  );

  const setNestedEntity = () => {
    const entity: EntityTypes = { id: 0, _type: hasUrl.type };
    /*
    if (hasUrl.search_fields && hasUrl.search_fields.length > 0 && inputValue.length > 0) {
      // TODO: this will result in  "You haven't changed anything" errors or not submitting the data at all
      entity[hasUrl.search_fields[0] as keyof EntityTypes] = inputValue;
    }
     */
    setNestedForm(entity);
  };

  const onNestedCreated = (entity:EntityTypes) => {
    // setSelectedOptions([{}]);
  }

  useEffect(() => {
    if (inputValue.trim() !== "") {
      debounceFetch(inputValue);
    } else {
      setOptions([]);
    }
  }, [inputValue, debounceFetch]);

  return <React.Fragment>
    {typeof nestedForm != "boolean" && <NewFormDialog entity={nestedForm} onClose={() => setNestedForm(false)} onCreated={onNestedCreated} />}

    <Autocomplete
      multiple
      options={options}
      value={selectedOptions}
      getOptionLabel={(option) => option.label}
      loading={loading}
      autoHighlight={true}
      onChange={(event, newValue) => {
        setSelectedOptions(newValue);
        const selectedRels = newValue.map((option) => ({
          id: option.value,
          str: option.label,
          _type: type.toLowerCase()
        }));
        onSelect(selectedRels, field_name);
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderOption={(props, option) => (
        <ListItem {...props}>
          {option.image && (
            <ListItemAvatar>
              <Avatar src={option.image} />
            </ListItemAvatar>
          )}
          <ListItemText primary={option.label} />
        </ListItem>
      )}
      renderInput={(params) => {
        const canAdd = <IconButton size={"small"} onClick={setNestedEntity}><Add /></IconButton>;
        return <TextField
          {...params}
          label={
            selectedOptions.length > 0 ? field_label : `Search ${field_label}`
          }
          name={field_name}
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : canAdd}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      }}
    />
  </React.Fragment>;
};

// Debounce function to limit the rate at which a function can fire.
function debounce(func: (...args: any[]) => void, wait: number) {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default AutocompleteField;
