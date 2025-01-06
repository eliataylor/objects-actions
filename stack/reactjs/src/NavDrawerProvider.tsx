import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';

// Define the shape of the context value
interface NavDrawerContextType {
    navDrawerWidth: number;
    setNavDrawerWidth: (width: number) => void;
    isMounted: boolean;
    setMounting: (isOpen: boolean) => void;
    keyword: string;
    setKeyword: (keyword: string) => void;
}

// Create the context with a default value
const NavDrawerContext = createContext<NavDrawerContextType | undefined>(undefined);

// Custom hook to use the NavDrawerContext
export const useNavDrawer = (): NavDrawerContextType => {
    const context = useContext(NavDrawerContext);
    if (!context) {
        throw new Error('useNavDrawer must be used within a NavDrawerProvider');
    }
    return context;
};

// Context provider component props
interface NavDrawerProviderProps {
    children: ReactNode;
}

// Provider component
export const NavDrawerProvider: React.FC<NavDrawerProviderProps> = ({children}) => {
    const [navDrawerWidth, setNavDrawerWidth] = useState<number>(125); // default width
    const [isMounted, setMounting] = useState<boolean>(window.innerWidth > 600);
    const [keyword, setKeyword] = useState<string>('');

    useEffect(() => {
        const handleResize = () => {
            setMounting(window.innerWidth > 600);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <NavDrawerContext.Provider
            value={{navDrawerWidth, setNavDrawerWidth, isMounted, setMounting, keyword, setKeyword}}>
            {children}
        </NavDrawerContext.Provider>
    );
};
