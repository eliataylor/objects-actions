import React from 'react';
import {Card, CardContent, Grid, Typography} from "@mui/material";
import {EntityTypes, FieldTypeDefinition, getProp, NAVITEMS, TypeFieldSchema} from "./types/types";
import ListItemText, {ListItemTextProps} from "@mui/material/ListItemText";
import CardHeader, {CardHeaderProps} from '@mui/material/CardHeader';
import {Link, useNavigate} from "react-router-dom";
import Avatar from '@mui/material/Avatar';
import {Edit, ReadMore} from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";

interface EntityCardProps {
    entity: EntityTypes;
}

const EntityCard: React.FC<EntityCardProps> = ({entity}) => {
    const navigate = useNavigate();

    const displayed: string[] = [];
    const headerProps: Partial<CardHeaderProps> = {};
    const content: React.ReactNode[] = []

    const hasUrl = NAVITEMS.find(nav => nav.type === entity['_type']);
    if (!hasUrl) return <Typography>Unknown Type</Typography>

    const defintions = TypeFieldSchema[hasUrl.type]
    const imageField: FieldTypeDefinition | undefined = Object.values(defintions).find(d => d.field_type === 'image')
    if (imageField) {
        displayed.push(imageField.machine)
        headerProps.avatar =
            <Avatar src={entity[imageField.machine as keyof EntityTypes] as string} alt={imageField.singular}/>
    }

    const titles = ['title', 'name', 'first_name', 'last_name', 'slug', 'id']
    for (let key of titles) {
        if (key in entity) {
            headerProps.title = getProp(entity, key)
            displayed.push(key)
            break;
        }
    }

    if ("created_at" in entity) {
        displayed.push('created_at')
        headerProps.subheader = new Intl.DateTimeFormat('en-US', {
            dateStyle: 'full',
            timeStyle: 'long'
        }).format(new Date(entity.created_at));
    }

    headerProps.action = <Grid container gap={2}>
        <IconButton color="secondary"
                    size="small"
                    onClick={() => navigate(`${hasUrl.screen}/${getProp(entity, "id")}`)}>
            <ReadMore/>
        </IconButton>
        <IconButton color="secondary"
                    size="small"
                    onClick={() => navigate(`/forms${hasUrl.screen}/${getProp(entity, "id")}/edit`)}>
            <Edit/>
        </IconButton>
    </Grid>

    Object.keys(entity).forEach((key, i) => {
        let val: any = entity[key as keyof EntityTypes]
        if (typeof val === 'boolean') val = val.toString()
        if (!val) val = '';
        if (val === '') {
            console.log('null');
        } else if (displayed.indexOf(key) === -1) {
            const atts: ListItemTextProps = {primary: key, secondary: val}
            const field = defintions[key]
            if (field) {
                atts.primary = field.cardinality && field.cardinality > 1 || field.field_type === 'integer' ? field.plural.toLowerCase() : field.singular.toLowerCase();
                if (val && typeof val === 'object') {
                    atts.secondary = JSON.stringify(val, null, 2)
                    if (Array.isArray(val)) {
                        const list = val.map(v => {
                            const relNavItem = NAVITEMS.find(nav => nav.type === v['_type']);
                            if (relNavItem) {
                                return <div key={`rel-${v['id']}`}><Link
                                    to={`${relNavItem.screen}/${v['id']}`}> {v['str']}</Link></div>
                            }
                        })
                        if (list.length > 0) {
                            atts.secondary = list;
                        }
                    }
                    if (typeof val['id'] !== 'undefined' && typeof val['_type'] !== 'undefined' && typeof val['str'] !== 'undefined') {
                        const relNavItem = NAVITEMS.find(nav => nav.type === val['_type']);
                        if (relNavItem) {
                            atts.secondary = <Link to={`${relNavItem.screen}/${val['id']}`}> {val['str']}</Link>
                        }
                    }
                } else if (key === 'modified_at' || field.field_type === 'date_time' || field.field_type === 'date') {
                    atts.secondary = new Intl.DateTimeFormat('en-US', {
                        dateStyle: 'full',
                        timeStyle: 'long'
                    }).format(new Date(val))
                } else if (field.field_type === 'slug') {
                    atts.secondary = <Link to={`/${entity['_type'].toLowerCase()}/${val}`}> {val}</Link>
                }
            } else if (typeof atts.secondary === 'object') {
                atts.secondary = <Typography sx={{wordBreak: 'break-word'}}
                                             variant={'body2'}>{JSON.stringify(atts.secondary, null, 2)}</Typography>
            }
            content.push(<ListItemText key={`prop${key}-${i}`} {...atts} />)
        }
    });


    return <Card elevation={8} sx={{marginBottom: 4}}>
        <CardHeader {...headerProps} />
        <CardContent>
            {content}
        </CardContent>
    </Card>
}

export default EntityCard;
