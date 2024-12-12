import React, {createContext, ReactNode, useEffect, useState} from 'react';
import {getAuth, getConfig} from '../lib/allauth';
import Snackbar from '@mui/material/Snackbar';
import SplashScreen from "../../screens/SplashScreen";

interface AuthContextType {
    auth: any;
    config: any;
}

interface Props {
    children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | null>(null);

function Loading() {
    return <SplashScreen loading={''}/>;
}

function LoadingError() {
    return <SplashScreen loading={'Error loading'}/>;
}

export function AuthContextProvider({children}: Props) {
    const [auth, setAuth] = useState<any | undefined>(undefined);
    const [config, setConfig] = useState<any | undefined>(undefined);
    const [snack, showSnackBar] = useState<string>("");

    const closeSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        showSnackBar("");
    };

    useEffect(() => {
        const onAuthChanged = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            setAuth((prevAuth: any) => {
                if (typeof prevAuth === 'undefined') {
                    console.log('Authentication status loaded', detail);
                } else {
                    if (detail?.meta.is_authenticated === false && Array.isArray(detail?.data?.flows)) {
                        const pending: string[] = []
                        detail.data.flows.forEach((flow: { [key: string]: any }) => {
                            if (flow.is_pending === true) {
                                if (flow.id === 'verify_email') {
                                    pending.push(`Please verify your email`)
                                } else {
                                    pending.push(`${flow.id} is pending`)
                                }
                            }
                        })
                        if (pending.length > 0) {
                            showSnackBar(pending.join(', \n'))
                        }

                    }
                    // check if something is pending !
                    console.log('Authentication status updated', detail);
                }
                return detail;
            });
        };

        document.addEventListener('allauth.auth.change', onAuthChanged);

        getAuth()
            .then(data => setAuth(data))
            .catch((e) => {
                console.error(e);
                setAuth(false);
            });

        getConfig()
            .then(data => setConfig(data))
            .catch((e) => {
                console.error(e);
                setConfig(false);
            });

        return () => {
            document.removeEventListener('allauth.auth.change', onAuthChanged);
        };
    }, []);

    const loading = (typeof auth === 'undefined') || config?.status !== 200;

    return (
        <AuthContext.Provider value={{auth, config}}>
            <Snackbar
                sx={{color: 'primary.main'}}
                open={snack.length > 0}
                autoHideDuration={8000}
                onClose={closeSnackbar}
                message={snack}
            />
            {loading ? <Loading/> : (auth === false ? <LoadingError/> : children)}
        </AuthContext.Provider>
    );
}
