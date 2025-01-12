import React, { useEffect, useMemo, useState } from "react";
import { Autocomplete, Avatar, CircularProgress, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import ApiClient from "../../config/ApiClient";
import { EntityTypes, NavItem, NAVITEMS, RelEntity } from "../types/types";
import { Add, Search } from "@mui/icons-material";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import NewFormDialog from "./NewFormDialog";

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
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [nestedForm, setNestedForm] = useState<EntityTypes | boolean>(false);
  const [selectedOption, setSelectedOption] = useState<AcOption | null>(
    selected
      ? {
        value: selected.id,
        label: selected.str
      }
      : null
  );

  const hasUrl = NAVITEMS.find((nav) => nav.type === type) as NavItem;
  const basePath = hasUrl && hasUrl.api ? hasUrl.api : `/api/${type}`;

  function Api2Options(
    data: RelEntity[] | null,
    search_fields: string[]
  ): AcOption[] {
    if (!data) return [];
    return data.map((obj: any) => {
      let label = search_fields.map((search_field) => {
        if (search_field === "username") {
          return `@${obj[search_field]}`;
        }
        return obj[search_field];
      });
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

  const onNestedCreated = (entity: EntityTypes) => {
    const sel: AcOption = { value: entity.id, label: type };
    if (hasUrl.search_fields && hasUrl.search_fields.length > 0 && inputValue.length > 0) {
      sel.label = entity[hasUrl.search_fields[0] as keyof EntityTypes] as string;
    } else {
      console.warn("Could not read label from entity", entity);
    }
    setSelectedOption(sel);
    const selectedRels = {
      id: sel.value,
      str: sel.label,
      _type: type
    };
    onSelect(selectedRels, field_name);
  };

  const setNestedEntity = () => {
    const entity: EntityTypes = { id: 0, _type: hasUrl.type };
    /* if (hasUrl.search_fields && hasUrl.search_fields.length > 0 && inputValue.length > 0) {
      // TODO: this will result in  "You haven't changed anything" errors or not submitting the data at all
      entity[hasUrl.search_fields[0] as keyof EntityTypes] = inputValue;
    } */
    setNestedForm(entity);
  };

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
          name={field_name}
          placeholder={`Search ${field_label}`}
          variant="standard"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : canAdd}
                {params.InputProps.endAdornment}
              </>
            ),
            startAdornment: (
              <>
                <Search
                  sx={{
                    color: "text.disabled",
                    marginRight: 0.5,
                    marginLeft: 1
                  }}
                />
                {params.InputProps.startAdornment}
              </>
            )
          }}
        />;
      }}
    />
  </React.Fragment>;
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
