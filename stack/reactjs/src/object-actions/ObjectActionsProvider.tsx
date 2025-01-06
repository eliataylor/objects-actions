import React, {createContext, useContext, useState} from 'react';
import {ApiListResponse, EntityTypes} from "./types/types";

interface ObjectActionsContextProps {
    navOADrawerWidth: number;
    setNavOADrawerWidth: (width: number) => void;
    updateListView: (response: ApiListResponse) => void;
    listData: ApiListResponse | null;
    updateEntityTypes: (response: EntityTypes) => void;
    entityData: EntityTypes | null;
    viewFormat: string;
    setViewFormat: (format: string) => void;
    accessDefault: string;
    setAccessDefault: (format: string) => void;
}

const ObjectActionsContext = createContext<ObjectActionsContextProps | undefined>(undefined);

interface ObjectActionsProviderProps {
    children: React.ReactNode;
}

const ObjectActionsProvider: React.FC<ObjectActionsProviderProps> = ({children}) => {
    const [listData, updateListView] = useState<ApiListResponse | null>(null);
    const [entityData, updateEntityTypes] = useState<EntityTypes | null>(null);
    const [viewFormat, setViewFormat] = useState<string>('cards');
    const [accessDefault, setAccessDefault] = useState<string>('AllowAny');
    const [navOADrawerWidth, setNavOADrawerWidth] = useState<number>(0); // default width

    return <ObjectActionsContext.Provider
        value={{navOADrawerWidth, setNavOADrawerWidth, accessDefault, setAccessDefault, viewFormat, setViewFormat, listData, updateListView, entityData, updateEntityTypes}}>
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
