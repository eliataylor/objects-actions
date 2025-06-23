import { Grid, IconButton } from "@mui/material";
import { Edit, ReadMore } from "@mui/icons-material";
import Link from "next/link";
import { type NavItem, type ModelName } from "../../types/types";

interface EntityCardActionsProps<T extends ModelName> {
  hasUrl: NavItem<T>;
  entityId: string | number;
}

export default function EntityCardActions<T extends ModelName>({ 
  hasUrl, 
  entityId 
}: EntityCardActionsProps<T>) {
  return (
    <Grid container gap={2}>
      <IconButton
        color="secondary"
        size="small"
        component={Link}
        href={`/${hasUrl.segment}/${entityId}`}
      >
        <ReadMore />
      </IconButton>
      <IconButton
        color="secondary"
        size="small"
        component={Link}
        href={`/forms/${hasUrl.segment}/${entityId}/edit`}
      >
        <Edit />
      </IconButton>
    </Grid>
  );
} 