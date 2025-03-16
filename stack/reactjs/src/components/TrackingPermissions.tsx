import React from "react";
import { FormHelperText, MenuItem } from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { Link } from "react-router-dom";

export interface PermissionKeys {
  analytics_storage: string;
  ad_user_data: string;
  ad_storage: string;
  ad_personalization: string;
}

interface PermissionProps {
  permissions: PermissionKeys;
  // onChange: (updatedPermissions: { [key: string]: string }) => void;
}

const permissionsLabels: { [key: string]: string } = {
  analytics_storage: "Only for functionality",
  ad_user_data: "Use ad data",
  ad_storage: "Store advertiser's data",
  ad_personalization: "Personalize ads"
};

const TrackingPermissions: React.FC<PermissionProps> = ({ permissions }) => {
  const [personName, setSelected] = React.useState<string[]>(
    Object.keys(permissions).filter((key) => {
      return permissions[key as keyof PermissionKeys] === "granted";
    })
  );

  const handleChange = (event: SelectChangeEvent<typeof personName>) => {
    const {
      target: { value }
    } = event;
    const updated = typeof value === "string" ? value.split(",") : value;
    setSelected(updated);

    const updatedPermissions = { ...permissions };
    updated.forEach((u) => {
      // @ts-ignore
      updatedPermissions[u] = u === true ? "granted" : "denied";
    });

    sendGTag(updatedPermissions);
  };

  const sendGTag = (allowed: PermissionKeys) => {
    // @ts-ignore
    if (typeof window.gtag === "function") {
      // @ts-ignore
      window.gtag("consent", "update", allowed);
      console.log("[GTAG] UPDATE", allowed);
    } else {
      console.warn("[GTAG] MISSING", allowed);
    }
  };

  return (
    <FormControl fullWidth={true} size={"small"}>
      <InputLabel id="gtag-permissions-label">Allowed</InputLabel>
      <Select
        labelId="gtag-permissions-label"
        id="gtag-permissions"
        size={"small"}
        multiple
        variant={"standard"}
        color={"secondary"}
        value={personName}
        onChange={handleChange}
        input={<OutlinedInput label="Tag" />}
        renderValue={(selected) => {
          return selected
            .reduce((acc, val) => {
              // @ts-ignore
              acc.push(permissionsLabels[val]);
              return acc;
            }, [])
            .join(", ");
        }}
      >
        {Object.keys(permissions).map((key) => {
          return (
            <MenuItem key={key} value={key}>
              <ListItemText primary={permissionsLabels[key]} />
            </MenuItem>
          );
        })}
      </Select>
      <FormHelperText>
        O/A only uses cookies for authentication and traffic
        analysis. The select box here is for demo purposes only. <Link to={"/oa/privacy"}>Read our Privacy Policy.</Link>
      </FormHelperText>
    </FormControl>
  );
};

export default TrackingPermissions;
