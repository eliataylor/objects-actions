import React from "react";
import { Card, CardContent, Grid, ListItem, ListItemAvatar, Typography } from "@mui/material";
import { type FieldTypeDefinition, type ModelName, type ModelType, NAVITEMS, type RelEntity, TypeFieldSchema } from "../../types/types";
import ListItemText, { type ListItemTextProps } from "@mui/material/ListItemText";
import CardHeader, { type CardHeaderProps } from "@mui/material/CardHeader";
import Link from "next/link";
import Avatar from "@mui/material/Avatar";
import RelEntityHead from "./RelEntityHead";
import CardMedia from "@mui/material/CardMedia";
import { AlternatingList } from "../../styles/StyledFields";
import EntityCardActions from "./EntityCardActions";

interface EntityCardProps<T extends ModelName> {
  entity: ModelType<T>;
}

const EntityCard = <T extends ModelName>({ entity }: EntityCardProps<T>) => {
  const displayed: string[] = [];
  const headerProps: Partial<CardHeaderProps> = {};
  const content: React.ReactNode[] = [];

  const hasUrl = NAVITEMS.find((nav) => nav.type === entity._type);
  if (!hasUrl) return <Typography variant="subtitle1" color="error">Unknown Entity Type</Typography>;

  const definitions = TypeFieldSchema[hasUrl.type];
  const imageField = Object.values(definitions).find(
    (d): d is FieldTypeDefinition & { field_type: "image" } => d.field_type === "image"
  );

  if (imageField) {
    displayed.push(imageField.machine);
    const imageSrc = entity[imageField.machine as keyof typeof entity] as string;
    headerProps.avatar = (
      <Avatar
        src={imageSrc}
        alt={imageField.singular}
      />
    );
  }

  // Known possible title fields that should return string or number values
  const titleFields = ["title", "name", "first_name", "last_name", "slug", "id"] as const;

  for (const key of titleFields) {
    if (key in entity) {
      const titleValue = entity[key as keyof typeof entity] as string | number;
      headerProps.title = titleValue.toString();
      displayed.push(key);
      break;
    }
  }

  if ("created_at" in entity) {
    displayed.push("created_at");
    headerProps.subheader = new Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
      timeStyle: "long"
    }).format(new Date(entity.created_at));
  }

  headerProps.action = <EntityCardActions hasUrl={hasUrl} entityId={entity.id} />;

  Object.keys(entity).forEach((key, i) => {
    const typedKey = key as keyof typeof entity;
    let val: any = entity[typedKey];
    if (typeof val === "boolean") val = val.toString();
    if (!val) val = "";
    if (displayed.includes(key)) {
      return true;
    }

    const atts: ListItemTextProps = { primary: key, secondary: val };
    const field = definitions[key];

    if (field) {
      atts.primary = field.cardinality && (field.cardinality > 1 || field.field_type === "integer")
        ? field.plural.toLowerCase()
        : field.singular.toLowerCase();

      if (field.field_type === "json") {
        atts.secondary = JSON.stringify(val, null, 2);
      } else if (val && typeof val === "object") {
        atts.secondary = JSON.stringify(val, null, 2);
        if (Array.isArray(val)) {
          const list = val.map((v: RelEntity) => {
            const relNavItem = NAVITEMS.find((nav) => nav.type === v._type);
            if (relNavItem) {
              return (
                <span key={`rel-${v.id}`} style={{ display: 'block' }}>
                  <Link href={`${relNavItem.segment}/${v.id}`}>
                    {v.str}
                  </Link>
                </span>
              );
            }
            return null;
          });
          if (list.length > 0) {
            atts.secondary = list;
          }
        }

        if (
          isRelEntity(val)
        ) {
          content.push(
            <RelEntityHead
              key={`prop${key}-${i}`}
              rel={val}
              label={field.singular}
            />
          );
          return true;
        }
      } else if (
        key === "modified_at" ||
        field.field_type === "date_time" ||
        field.field_type === "date"
      ) {
        atts.secondary = new Intl.DateTimeFormat("en-US", {
          dateStyle: "full",
          timeStyle: "long"
        }).format(new Date(val));
      } else if (field.field_type === "slug") {
        atts.secondary = (
          <Link href={`/${entity._type.toLowerCase()}/${val}`}>{val}</Link>
        );
      }
    } else if (typeof atts.secondary === "object") {
      if (key === "author" && isRelEntity(val)) {
        content.push(
          <RelEntityHead key={`prop${key}-${i}`} rel={val} label="Author" />
        );
        return true;
      } else {
        atts.secondary = (
          <Typography sx={{ wordBreak: "break-word" }} variant="body2">
            {JSON.stringify(atts.secondary, null, 2)}
          </Typography>
        );
      }
    }

    if (typeof atts.primary === "string") {
      atts.primary = atts.primary;
    }

    if (val === "") {
      // do nothing
    } else if (field?.field_type === "image") {
      if (typeof atts.secondary === "string") {
        atts.secondary = (
          <Typography sx={{ wordBreak: "break-word" }} variant="body2">
            {atts.secondary}
          </Typography>
        );
      }
      content.push(
        <ListItem
          className="EntityImage"
          dense={true}
          key={`prop${key}-${i}`}
          sx={{ maxWidth: "100%" }}
        >
          <ListItemAvatar>
            <Avatar src={val} />
          </ListItemAvatar>
          <ListItemText {...atts} />
        </ListItem>
      );
    } else if (field?.field_type === "video") {
      content.push(
        <Card
          key={`prop${key}-${i}`}
          sx={{ flexGrow: 1, position: "relative" }}
        >
          <CardMedia>
            <video
              width="100%"
              style={{ maxWidth: "600" }}
              autoPlay
              muted
              controls={true}
            >
              <source src={val} type="video/mp4" />
            </video>
          </CardMedia>
          <CardContent>
            <Typography>{atts.title}</Typography>
          </CardContent>
        </Card>
      );
    } else if (field?.field_type === "audio") {
      content.push(
        <Card
          key={`prop${key}-${i}`}
          sx={{ flexGrow: 1, position: "relative" }}
        >
          <CardMedia>
            <audio controls={true}>
              <source src={val} type="audio/mpeg" />
            </audio>
          </CardMedia>
          <CardContent>
            <Typography>{atts.title}</Typography>
          </CardContent>
        </Card>
      );
    } else {
      content.push(<ListItemText key={`prop${key}-${i}`} {...atts} />);
    }
  });

  return (
    <Card elevation={8} sx={{ marginBottom: 4 }}>
      <CardHeader {...headerProps} />
      <CardContent>
        <AlternatingList className="AlternatingList">
          {content}
        </AlternatingList>
      </CardContent>
    </Card>
  );
};

// Type guard for RelEntity
function isRelEntity(value: any): value is RelEntity {
  return (
    value &&
    typeof value === "object" &&
    "id" in value &&
    "_type" in value &&
    "str" in value
  );
}

export default EntityCard;
