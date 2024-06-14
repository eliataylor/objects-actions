import React, {createContext, useEffect, useState} from 'react';


interface ObjectActionsContextProps {
    updateCart: (meal: Meal, ObjectActions: number) => void;
    updateFoodMenu: (menu: MenuData) => void;
    weeklyMenu: MenuData;
    cartItems: OrderItems;
    program:Program;
    setProgram: (program:Program) => void;
}

const ObjectActionsContext = createContext<ObjectActionsContextProps>({
    weeklyMenu: null,
    updateFoodMenu: (menu: MenuData) => [],
    cartItems: [],
    program: defaultProgram,
    setProgram: (program:Program) => null
});

interface CartProviderProps {
    children: React.ReactNode;
    initialState?: ObjectActionsContextProps
}

const ObjectActionsProvider: React.FC<CartProviderProps> = ({children, initialState}) => {
    const [cartPrice, setPrice] = useState<number>(0);
    const [cartItems, setCartItems] = useState<Meal[]>([]);
    const [weeklyMenu, updateFoodMenu] = useState<MenuData>(null);
    const [program, setProgram] = useState<Program>(null);

    useEffect(() => {


    }, [cartPrice, cartItems]);



    return (
        <ObjectActionsContext.Provider value={{cartPrice, cartItems, weeklyMenu, updateFoodMenu, program, setProgram}}>
            {children}
        </ObjectActionsContext.Provider>
    );
};

export {ObjectActionsProvider, ObjectActionsContext};
