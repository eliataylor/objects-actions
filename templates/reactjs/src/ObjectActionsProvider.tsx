import React, {createContext, useEffect, useState} from 'react';
import {EntityView, ListView} from "./types/object-actions";

interface ObjectActionsContextProps {
    updateListView: (response: ListView) => void;
    listData: ListView;
    upateEntityView: (response: EntityView) => void;
    entityData: EntityView;
}

const ObjectActionsContext = createContext<ObjectActionsContextProps>({
    updateListView: (response: ListView) => null,
    listData: {meta:{}, data:[]},
    upateEntityView: (response: EntityView) => null,
    entityData: {meta:{}, data:[]},
});

interface CartProviderProps {
    children: React.ReactNode;
    initialState?: ObjectActionsContextProps
}

const ObjectActionsProvider: React.FC<CartProviderProps> = ({children, initialState}) => {
    const [listView, updateLisView] = useState<ListView>(null);
    const [entityView, updateEntityView] = useState<EntityView>(null);

    return (
        <ObjectActionsContext.Provider value={{listData, updateListView, entityData, upateEntityView}}>
            {children}
        </ObjectActionsContext.Provider>
    );
};

export {ObjectActionsProvider, ObjectActionsContext};
