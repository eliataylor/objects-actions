// ViewFormats.js
import React from 'react';
import {useObjectActions} from "../ObjectActionsProvider";
import InputLabel from "@mui/material/InputLabel";
import Select, {SelectChangeEvent} from "@mui/material/Select";
import {MenuItem} from "@mui/material";
import ListItemText from "@mui/material/ListItemText";
import FormControl from "@mui/material/FormControl";

const ViewFormats = () => {
    const {setViewFormat, viewFormat} = useObjectActions()

    const handleChange = (event: SelectChangeEvent<typeof viewFormat>) => {
        const {
            target: {value},
        } = event;
        setViewFormat(value);
    };

    return <FormControl fullWidth={true} size={"small"}>
        <InputLabel id="viewformats-label">View Format</InputLabel>
        <Select
            labelId="viewformats-label"
            id="viewformats"
            color={'secondary'}
            fullWidth={true}
            value={viewFormat}
            onChange={handleChange}
        >
            <MenuItem value={'cards'}>
                <ListItemText primary={'cards'}/>
            </MenuItem>
            <MenuItem value={'json'}>
                <ListItemText primary={'json'}/>
            </MenuItem>
        </Select>
    </FormControl>
};

export default ViewFormats;
