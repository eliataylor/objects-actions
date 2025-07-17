// autocompleteRender.tsx
import {Avatar, CircularProgress, ListItem, ListItemAvatar, ListItemText} from "@mui/material";
import {Add, Search} from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import {AcOption} from "./AutoCompleteUtils";

export function renderOption(props: React.HTMLAttributes<HTMLLIElement>, option: AcOption) {
    return (
        <ListItem {...props}>
            {option.image && (
                <ListItemAvatar>
                    <Avatar src={option.image}/>
                </ListItemAvatar>
            )}
            <ListItemText primary={option.label}/>
        </ListItem>
    );
}

export function renderInputAdornments(loading: boolean, onAddClick: () => void, isMultiple: boolean) {
    const canAdd = (
        <IconButton size="small" onClick={onAddClick}>
            <Add/>
        </IconButton>
    );

    return {
        startAdornment: !isMultiple ? (
            <Search
                sx={{
                    color: "text.disabled",
                    marginRight: 0.5,
                    marginLeft: 1
                }}
            />
        ) : null,
        endAdornment: (
            <>
                {loading ? <CircularProgress color="inherit" size={20}/> : canAdd}
            </>
        )
    };
}
