import React, {createContext, useContext, useState} from 'react';
import {ApiListResponse, EntityTypes} from "./types/types";

interface ObjectActionsContextProps {
    updateListView: (response: ApiListResponse) => void;
    listData: ApiListResponse | null;
    updateEntityTypes: (response: EntityTypes) => void;
    entityData: EntityTypes | null;
    viewFormat: string;
    setViewFormat: (format: string) => void;
}

const ObjectActionsContext = createContext<ObjectActionsContextProps>({
    updateListView: (response: ApiListResponse) => null,
    listData: null,
    updateEntityTypes: (response: EntityTypes) => null,
    entityData: null,
    viewFormat: 'cards',
    setViewFormat: (format: string) => null,
});

interface ObjectActionsProviderProps {
    children: React.ReactNode;
}

const ObjectActionsProvider: React.FC<ObjectActionsProviderProps> = ({children}) => {
    const [listData, updateListView] = useState<ApiListResponse | null>(null);
    const [entityData, updateEntityTypes] = useState<EntityTypes | null>(null);
    const [viewFormat, setViewFormat] = useState<string>('cards');

    return <ObjectActionsContext.Provider
        value={{viewFormat, setViewFormat, listData, updateListView, entityData, updateEntityTypes}}>
        {children}
    </ObjectActionsContext.Provider>
};

export const useObjectActions = (): ObjectActionsContextProps => {
    const context = useContext(ObjectActionsContext);
    if (!context) {
        throw new Error('useObjectActions must be used within a ObjectActionsProvider');
    }
    return context;
};

export default ObjectActionsProvider;
