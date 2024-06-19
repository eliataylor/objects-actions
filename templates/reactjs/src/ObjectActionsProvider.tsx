import React, {createContext, useState} from 'react';
import {EntityView, ListView} from "./types/object-actions";

interface ObjectActionsContextProps {
    updateListView: (response: ListView) => void;
    listData: ListView;
    updateEntityView: (response: EntityView) => void;
    entityData: EntityView;
}

const ObjectActionsContext = createContext<ObjectActionsContextProps>({
    updateListView: (response: ListView) => null,
    listData: {meta:{}, data:[]},
    updateEntityView: (response: EntityView) => null,
    entityData: {meta:{}, data:[]},
});

interface ObjectActionsProviderProps {
    children: React.ReactNode;
    initialState?: ObjectActionsContextProps
}

const ObjectActionsProvider: React.FC<ObjectActionsProviderProps> = ({children, initialState}) => {
    const [listView, updateListView] = useState<ListView>(null);
    const [entityView, updateEntityView] = useState<EntityView>(null);


    useEffect(() => {
        fetch(/)
    }, []);


    return <ObjectActionsContext.Provider value={{listData, updateListView, entityData, upateEntityView}} >
            {children}
        </ObjectActionsContext.Provider>
};

export {ObjectActionsProvider, ObjectActionsContext};
