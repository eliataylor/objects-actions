import React from 'react';
import {FormHelperText, MenuItem} from '@mui/material';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, {SelectChangeEvent} from '@mui/material/Select';


export interface PermissionKeys {
    analytics_storage: string;
    ad_user_data: string;
    ad_storage: string;
    ad_personalization: string;
};

interface PermissionProps {
    permissions: PermissionKeys;
    // onChange: (updatedPermissions: { [key: string]: string }) => void;
}

const permissionsLabels: { [key: string]: string } = {
    analytics_storage: 'General traffic analysis',
    ad_user_data: 'Use ad data',
    ad_storage: 'Store advertiser\'s data',
    ad_personalization: 'Personalize ads'
};

const TrackingPermissions: React.FC<PermissionProps> = ({permissions}) => {
    const [personName, setSelected] = React.useState<string[]>(Object.keys(permissions).filter((key) => {
        // @ts-ignore
        return permissions[key] === 'granted'
    }));

    const handleChange = (event: SelectChangeEvent<typeof personName>) => {
        const {
            target: { value },
        } = event;
        const updated = typeof value === 'string' ? value.split(',') : value
        setSelected(
            // On autofill we get a stringified value.
            updated,
        );

        const updatedPermissions = {...permissions}
        updated.forEach(u => {
            // @ts-ignore
            updatedPermissions[u] = u === true ? 'granted' : 'denied';
        })

        sendGTag(updatedPermissions)
    };


    const sendGTag = (allowed: PermissionKeys) => {
        console.log("[GTAG] UPDATE", allowed)
        // @ts-ignore
        if (typeof window.gtag === 'function') {
            // @ts-ignore
            window.gtag('consent', 'update', allowed);
        } else {
            console.error("[GTAG] MISSING", allowed)
        }
    };

    return (<FormControl fullWidth={true} >
            <InputLabel id="gtag-permissions-label" >Allowed</InputLabel>
            <Select
                labelId="gtag-permissions-label"
                id="gtag-permissions"
                multiple
                sx={{ color:'#202020'}}
                color={'secondary'}
                fullWidth={true}
                value={personName}
                onChange={handleChange}
                input={<OutlinedInput label="Tag"/>}
                renderValue={(selected) => {
                    return selected.reduce((acc, val) => {
                        // @ts-ignore
                        acc.push(permissionsLabels[val])
                        return acc;
                    }, []).join(', ')
                }}
            >
                {Object.keys(permissions).map((key) => {
                    // @ts-ignore
                    return <MenuItem key={key} value={key} >
                        <ListItemText primary={permissionsLabels[key]}/>
                    </MenuItem>
                })}
            </Select>
            <FormHelperText>We only use minimal cookies for functionality and general traffic analysis. No Ads.</FormHelperText>
        </FormControl>
    );
};

export default TrackingPermissions;
