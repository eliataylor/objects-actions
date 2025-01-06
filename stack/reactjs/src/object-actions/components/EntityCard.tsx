import React from 'react';
import {
  Card,
  CardContent,
  Grid,
  ListItem,
  ListItemAvatar,
  Typography,
} from '@mui/material';
import {
  EntityTypes,
  FieldTypeDefinition,
  getProp,
  NAVITEMS,
  TypeFieldSchema,
} from '../types/types';
import ListItemText, { ListItemTextProps } from '@mui/material/ListItemText';
import CardHeader, { CardHeaderProps } from '@mui/material/CardHeader';
import { Link, useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import { Edit, ReadMore } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import RelEntityHead from './RelEntityHead';
import CardMedia from '@mui/material/CardMedia';
import { humanize } from '../../utils';
import { AlternatingList } from '../../theme/StyledFields';

interface EntityCardProps {
  entity: EntityTypes;
}

const EntityCard: React.FC<EntityCardProps> = ({ entity }) => {
  const navigate = useNavigate();

  const displayed: string[] = [];
  const headerProps: Partial<CardHeaderProps> = {};
  const content: React.ReactNode[] = [];

  const hasUrl = NAVITEMS.find((nav) => nav.type === entity['_type']);
  if (!hasUrl) return <Typography>Unknown Entity Type</Typography>;

  const defintions = TypeFieldSchema[hasUrl.type];
  const imageField: FieldTypeDefinition | undefined = Object.values(
    defintions,
  ).find((d) => d.field_type === 'image');
  if (imageField) {
    displayed.push(imageField.machine);
    headerProps.avatar = (
      <Avatar
        src={entity[imageField.machine as keyof EntityTypes] as string}
        alt={imageField.singular}
      />
    );
  }

  const titles = ['title', 'name', 'first_name', 'last_name', 'slug', 'id'];
  for (let key of titles) {
    if (key in entity) {
      headerProps.title = getProp(entity, key) as string;
      displayed.push(key);
      break;
    }
  }

  if ('created_at' in entity) {
    displayed.push('created_at');
    headerProps.subheader = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'full',
      timeStyle: 'long',
    }).format(new Date(entity.created_at));
  }

  headerProps.action = (
    <Grid container gap={2}>
      <IconButton
        color="secondary"
        size="small"
        onClick={() => navigate(`${hasUrl.screen}/${getProp(entity, 'id')}`)}
      >
        <ReadMore />
      </IconButton>
      <IconButton
        color="secondary"
        size="small"
        onClick={() =>
          navigate(`/forms${hasUrl.screen}/${getProp(entity, 'id')}/edit`)
        }
      >
        <Edit />
      </IconButton>
    </Grid>
  );

  Object.keys(entity).forEach((key, i) => {
    let val: any = entity[key as keyof EntityTypes];
    if (typeof val === 'boolean') val = val.toString();
    if (!val) val = '';
    if (displayed.indexOf(key) > -1) {
      return true;
    }
    const atts: ListItemTextProps = { primary: key, secondary: val };
    const field = defintions[key];
    if (field) {
      atts.primary =
        (field.cardinality && field.cardinality > 1) ||
        field.field_type === 'integer'
          ? field.plural.toLowerCase()
          : field.singular.toLowerCase();
      if (val && typeof val === 'object') {
        atts.secondary = JSON.stringify(val, null, 2);
        if (Array.isArray(val)) {
          const list = val.map((v) => {
            const relNavItem = NAVITEMS.find((nav) => nav.type === v['_type']);
            if (relNavItem) {
              return (
                <div key={`rel-${v['id']}`}>
                  <Link to={`${relNavItem.screen}/${v['id']}`}>
                    {' '}
                    {v['str']}
                  </Link>
                </div>
              );
            }
          });
          if (list.length > 0) {
            atts.secondary = list;
          }
        }
        if (
          typeof val['id'] !== 'undefined' &&
          typeof val['_type'] !== 'undefined' &&
          typeof val['str'] !== 'undefined'
        ) {
          content.push(
            <RelEntityHead
              key={`prop${key}-${i}`}
              rel={val}
              label={field.singular}
            />,
          );
          return true;
        }
      } else if (
        key === 'modified_at' ||
        field.field_type === 'date_time' ||
        field.field_type === 'date'
      ) {
        atts.secondary = new Intl.DateTimeFormat('en-US', {
          dateStyle: 'full',
          timeStyle: 'long',
        }).format(new Date(val));
      } else if (field.field_type === 'slug') {
        atts.secondary = (
          <Link to={`/${entity['_type'].toLowerCase()}/${val}`}> {val}</Link>
        );
      }
    } else if (typeof atts.secondary === 'object') {
      if (key === 'author') {
        content.push(
          <RelEntityHead key={`prop${key}-${i}`} rel={val} label={'Author'} />,
        );
        return true;
      } else {
        atts.secondary = (
          <Typography sx={{ wordBreak: 'break-word' }} variant={'body2'}>
            {JSON.stringify(atts.secondary, null, 2)}
          </Typography>
        );
      }
    }

    if (typeof atts.primary === 'string') {
      atts.primary = humanize(atts.primary);
    }

    if (field && field.field_type === 'image') {
      if (typeof atts.secondary === 'string') {
        atts.secondary = (
          <Typography sx={{ wordBreak: 'break-word' }} variant={'body2'}>
            {atts.secondary}
          </Typography>
        );
      }
      content.push(
        <ListItem
          className={'EntityImage'}
          dense={true}
          key={`prop${key}-${i}`}
          sx={{ maxWidth: '100%' }}
        >
          <ListItemAvatar>
            <Avatar src={val} />
          </ListItemAvatar>
          <ListItemText {...atts} />
        </ListItem>,
      );
    } else if (field && field.field_type === 'video') {
      content.push(
        <Card
          key={`prop${key}-${i}`}
          sx={{ flexGrow: 1, position: 'relative' }}
        >
          <CardMedia>
            <video
              width={'100%'}
              style={{ maxWidth: '600' }}
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
        </Card>,
      );
    } else {
      content.push(<ListItemText key={`prop${key}-${i}`} {...atts} />);
    }
  });

  return (
    <Card elevation={8} sx={{ marginBottom: 4 }}>
      <CardHeader {...headerProps} />
      <CardContent>
        <AlternatingList className={'AlternatingList'}>
          {content}
        </AlternatingList>
      </CardContent>
    </Card>
  );
};

export default EntityCard;
