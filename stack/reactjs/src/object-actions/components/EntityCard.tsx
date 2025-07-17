import React from "react";
import {Card, CardContent, Grid, ListItem, ListItemAvatar, Typography} from "@mui/material";
import {FieldTypeDefinition, ModelName, ModelType, NAVITEMS, RelEntity, TypeFieldSchema} from "../types/types";
import ListItemText, {ListItemTextProps} from "@mui/material/ListItemText";
import CardHeader, {CardHeaderProps} from "@mui/material/CardHeader";
import {Link, useNavigate} from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import {Edit, ReadMore} from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import RelEntityHead from "./RelEntityHead";
import CardMedia from "@mui/material/CardMedia";
import {humanize} from "../../utils";
import {AlternatingList} from "../../theme/StyledFields";
import {canDo} from "../types/access";
import {useAuth} from "../../allauth/auth";
import PermissionError from "../../components/PermissionError";

interface EntityCardProps<T extends ModelName> {
    entity: ModelType<T>;
}

const EntityCard = <T extends ModelName>({entity}: EntityCardProps<T>) => {
    const navigate = useNavigate();

    const displayed: string[] = [];
    const headerProps: Partial<CardHeaderProps> = {};
    const content: React.ReactNode[] = [];
    const me = useAuth()?.data?.user;

    const hasUrl = NAVITEMS.find((nav): nav is typeof nav & { type: T } => nav.type === entity._type);
    if (!hasUrl) return <Typography variant="subtitle1" color="error">Unknown Entity Type</Typography>;

    const canView = canDo("view", entity, me);
    if (typeof canView === "string") {
        return <PermissionError error={canView}/>;
    }

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

    headerProps.action = (
        <Grid container gap={2}>
            <IconButton
                color="secondary"
                size="small"
                onClick={() => navigate(`/${hasUrl.segment}/${entity.id}`)}
            >
                <ReadMore/>
            </IconButton>
            <IconButton
                color="secondary"
                size="small"
                onClick={() =>
                    navigate(`/forms/${hasUrl.segment}/${entity.id}/edit`)
                }
            >
                <Edit/>
            </IconButton>
        </Grid>
    );

    Object.keys(entity).forEach((key, i) => {
        const typedKey = key as keyof typeof entity;
        let val: any = entity[typedKey];
        if (typeof val === "boolean") val = val.toString();
        if (!val) val = "";
        if (displayed.includes(key)) {
            return true;
        }

        const atts: ListItemTextProps = {primary: key, secondary: val};
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
                                <div key={`rel-${v.id}`}>
                                    <Link to={`${relNavItem.segment}/${v.id}`}>
                                        {v.str}
                                    </Link>
                                </div>
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
                if (val) {
                    atts.secondary = new Intl.DateTimeFormat("en-US", {
                        dateStyle: "full",
                        timeStyle: "long"
                    }).format(new Date(val));
                }
            } else if (field.field_type === "slug") {
                atts.secondary = (
                    <Link to={`/${entity._type.toLowerCase()}/${val}`}>{val}</Link>
                );
            }
        } else if (typeof atts.secondary === "object") {
            if (key === "author" && isRelEntity(val)) {
                content.push(
                    <RelEntityHead key={`prop${key}-${i}`} rel={val} label="Author"/>
                );
                return true;
            } else {
                atts.secondary = (
                    <Typography sx={{wordBreak: "break-word"}} variant="body2">
                        {JSON.stringify(atts.secondary, null, 2)}
                    </Typography>
                );
            }
        }

        if (typeof atts.primary === "string") {
            atts.primary = humanize(atts.primary);
        }

        if (val === "") {
            // do nothing
        } else if (field?.field_type === "image") {
            if (typeof atts.secondary === "string") {
                atts.secondary = (
                    <Typography sx={{wordBreak: "break-word"}} variant="body2">
                        {atts.secondary}
                    </Typography>
                );
            }
            content.push(
                <ListItem
                    className="EntityImage"
                    dense={true}
                    key={`prop${key}-${i}`}
                    sx={{maxWidth: "100%"}}
                >
                    <ListItemAvatar>
                        <Avatar src={val}/>
                    </ListItemAvatar>
                    <ListItemText {...atts} />
                </ListItem>
            );
        } else if (field?.field_type === "video") {
            content.push(
                <Card
                    key={`prop${key}-${i}`}
                    sx={{flexGrow: 1, position: "relative"}}
                >
                    <CardMedia>
                        <video
                            width="100%"
                            style={{maxWidth: "600"}}
                            autoPlay
                            muted
                            controls={true}
                        >
                            <source src={val} type="video/mp4"/>
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
                    sx={{flexGrow: 1, position: "relative"}}
                >
                    <CardMedia>
                        <audio controls={true}>
                            <source src={val} type="audio/mpeg"/>
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
        <Card elevation={8} sx={{marginBottom: 4}}>
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
