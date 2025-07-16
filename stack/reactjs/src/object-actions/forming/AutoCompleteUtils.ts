import {useEffect, useMemo, useState} from "react";
import ApiClient, {HttpResponse} from "../../config/ApiClient";
import {ApiListResponse, ModelName, ModelType, NavItem, NAVITEMS, RelEntity} from "../types/types";

export interface AcOption {
    label: string;
    value: string | number;
    subheader?: string;
    image?: string;
}

export interface BaseAcFieldProps<T extends ModelName> {
    type: T;
    field_name: string;
    image_field?: keyof ModelType<T>;
    search_fields: string[];
    field_label: string;
}

export function getBasePath<T extends ModelName>(type: T): string {
    const hasUrl = NAVITEMS.find((nav) => nav.type === type) as NavItem<T>;
    return hasUrl?.api ?? `/api/${type}`;
}

export function Api2Options<T extends ModelName>(
    data: ModelType<T>[] | RelEntity<T>[],
    search_fields: string[],
    image_field?: keyof ModelType<T>
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
        return {label: label.join(", "), value: obj.id, image};
    });
}

export function debounce<T extends unknown[]>(func: (...args: T) => void, wait: number) {
    let timeout: NodeJS.Timeout;
    return (...args: T) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

export function createBaseEntity<T extends ModelName>(type: T) {
    return {
        id: 0,
        _type: type
    } as unknown as ModelType<T>;
}

// Custom hook for handling autocomplete state and API calls
export function useAutocomplete<T extends ModelName>({
                                                         type,
                                                         search_fields,
                                                         image_field
                                                     }: BaseAcFieldProps<T>) {
    const [options, setOptions] = useState<AcOption[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [nestedForm, setNestedForm] = useState<ModelType<T> | boolean>(false);

    const basePath = getBasePath(type);

    const fetchOptions = async (search: string) => {
        setLoading(true);
        try {
            const response: HttpResponse<ApiListResponse<T>> = await ApiClient.get(`${basePath}?search=${search}`);
            if (response.success && response.data?.results) {
                const options = Api2Options(response.data.results, search_fields, image_field);
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
        // Remove the dependency on fetchOptions which changes on every render
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [basePath]
    );

    useEffect(() => {
        // Only fetch if inputValue is not empty
        if (inputValue.trim() !== "") {
            debounceFetch(inputValue);
        } else {
            // Clear options when input is empty without making an API call
            setOptions([]);
        }
        // This effect should only run when inputValue changes, not on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputValue]);

    // Wrapper function to update inputValue
    const handleInputChange = (value: string) => {
        setInputValue(value);
    };

    const setNestedEntity = () => {
        setNestedForm(createBaseEntity(type));
    };

    return {
        options,
        inputValue,
        loading,
        nestedForm,
        setInputValue: handleInputChange,
        setNestedForm,
        setNestedEntity,
        setOptions
    };
}
