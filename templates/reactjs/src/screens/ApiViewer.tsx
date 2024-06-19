import React from 'react';
import { useLocation } from 'react-router-dom';
import { useObjectActions } from '../ObjectActionsProvider';

const ApiViewer: React.FC = () => {
    const location = useLocation();
    const { listData, entityData } = useObjectActions();

    const isPathEndingWithNumber = (path: string) => {
        const regex = /\/\d+$/;
        return regex.test(path);
    };

    const dataToDisplay = isPathEndingWithNumber(location.pathname) ? entityData : listData;

    return (
        <div>
            {dataToDisplay ? (
                <pre>{JSON.stringify(dataToDisplay, null, 2)}</pre>
            ) : (
                <p>No data available</p>
            )}
        </div>
    );
};

export default ApiViewer;
