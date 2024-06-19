import React, { useEffect, useState } from 'react';
import GenericForm from '../object-actions/forms/GenericForm';
import { CircularProgress, Grid } from '@mui/material';
import {EntityView, NAVITEMS, parseFormURL, TypeFieldSchema} from '../object-actions/types/types'
import {useLocation} from "react-router-dom";

type EntityFormProps = {
  entityView: EntityView;
  entityId: number;
};

const EntityForm: React.FC<EntityFormProps> = ({ entityView, entityId }) => {
  const [entity, setEntity] = useState<EntityView | null>(entityView);
  const [loading, setLoading] = useState(!entityView);
  const location = useLocation();

  const target = parseFormURL(location.pathname)
  const fields = TypeFieldSchema[target.object]

  useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const hasUrl = NAVITEMS.find(nav => nav.screen === location.pathname);
                if (hasUrl) {
                    let verb = '/add'
                    const response = await fetch(`//${process.env.REACT_APP_API_HOST}${hasUrl.api}${verb}${location.search}`, {
                        headers: {
//                            'Authorization': 'Bearer YOUR_TOKEN_HERE',
                            'Content-Type': 'application/json'
                        }
                    });
                    const result = await response.json();
                    setEntity(result)
                    setLoading(false)
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [entityId]);

  if (loading) {
    return (
      <Grid container justifyContent="center" alignItems="center" style={{ height: '100vh' }}>
        <CircularProgress />
      </Grid>
    );
  }

  return (
    <GenericForm
      fields={fields}
      entity={entityView}
    />
  );
};

export default EntityForm;
