import React from 'react';
import TextField from '@mui/material/TextField';
import {InputAdornment} from "@mui/material";
import {Search} from "@mui/icons-material";
import {useNavDrawer} from "../NavDrawerProvider";

const SearchField: React.FC = () => {
    const { keyword, setKeyword } = useNavDrawer();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setKeyword(value);
    };

    return (
        <TextField
            label="Search ingredients"
            id="search"
            value={keyword}
            onChange={handleChange}
            variant={'outlined'} fullWidth={true}
            InputProps={{
                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
            }}
        />
    );
};

export default SearchField;
