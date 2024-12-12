import React from "react";
import {useConfig} from '../auth'
import {redirectToProvider} from '../lib/allauth'
import {Grid, SvgIcon, Button} from '@mui/material'
import {ReactComponent as Spotify} from '../../assets/spotify.svg';
import {ReactComponent as Apple} from '../../assets/apple.svg';
import {ReactComponent as Google} from '../../assets/google.svg';
import {WifiPassword} from "@mui/icons-material";

interface ProviderListProps {
    callbackURL: string;
    process: any;
    accounts?: any;
}

const ProviderList: React.FC<ProviderListProps> = ({callbackURL, process, accounts}) => {
    const config = useConfig()
    const providers = config.data.socialaccount.providers
    if (!providers.length) {
        return null
    }

    function getIcon(provider: string) {
        if (provider === 'apple') {
            return <SvgIcon fontSize={"large"} component={Apple} inheritViewBox/>
        } else if (provider === 'google') {
            return <Google/>
        } else if (provider === 'spotify') {
            return <SvgIcon viewBox="0 0 496 512" component={Spotify} inheritViewBox/>
        }
        return null;
    }


    return (
        <Grid container gap={2}>
            {providers.map((provider: any) => {
                const connected = accounts?.find((a: any) => a.provider.id === provider.id)

                // @ts-ignore
                return (
                    <Button
                        startIcon={getIcon(provider.id)}
                        endIcon={connected ? <WifiPassword/> : undefined}
                        key={provider.id}
                        fullWidth
                        variant={'outlined'}
                        color={'inherit'}
                        onClick={() => redirectToProvider(provider.id, callbackURL, process)}
                    >{provider.name}
                    </Button>
                )
            })}
        </Grid>
    )
}

export default ProviderList;