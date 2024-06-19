import React, {createContext, useContext, useState} from 'react';
import {EntityView, ListView} from "./types/object-actions";

interface ObjectActionsContextProps {
    updateListView: (response: ListView) => void;
    listData: ListView | null;
    updateEntityView: (response: EntityView) => void;
    entityData: EntityView | null;
}

const ObjectActionsContext = createContext<ObjectActionsContextProps>({
    updateListView: (response: ListView) => null,
    listData: null,
    updateEntityView: (response: EntityView) => null,
    entityData: null,
});

interface ObjectActionsProviderProps {
    children: React.ReactNode;
}

const ObjectActionsProvider: React.FC<ObjectActionsProviderProps> = ({children}) => {
    const [listData, updateListView] = useState<ListView | null>(null);
    const [entityData, updateEntityView] = useState<EntityView | null>(null);

    return <ObjectActionsContext.Provider value={{listData, updateListView, entityData, updateEntityView}} >
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
