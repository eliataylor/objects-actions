import React, { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { EntityTypes, NAVITEMS } from '../object-actions/types/types';
import EntityCard from '../object-actions/components/EntityCard';
import ApiClient from '../config/ApiClient';

const EntityView: React.FC = () => {
  const location = useLocation();
  const { id } = useParams();

  const [entityData, updateData] = React.useState<EntityTypes | null | string>(
    null,
  );

  useEffect(() => {
    const hasUrl = NAVITEMS.find((nav) => location.pathname.indexOf(`/${nav.segment}`) === 0);
    if (hasUrl) {
      const fetchData = async () => {
        let apiUrl = `/api/`;
        if (id && parseInt(id) > 0) {
          apiUrl += `${location.pathname}${location.search}`;
        } else {
          apiUrl += `u/${hasUrl.type.toLowerCase()}/${id}/${location.search}`;
        }
        const response = await ApiClient.get(apiUrl);
        if (response.error) {
          return updateData(response.error);
        }
        if (response.success && response.data) {
          updateData(response.data as EntityTypes);
        }
      };

      fetchData();
    }
  }, [location.pathname, location.search]);

  if (!entityData) return <div>loading...</div>;

  if (typeof entityData === 'string') return <div>{entityData}</div>;

  return (
    <div id={'EntityView'}>
      <EntityCard entity={entityData} />
    </div>
  );
};

export default EntityView;
