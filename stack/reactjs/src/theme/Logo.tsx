import React, {useContext} from 'react';
import {SvgIcon} from '@mui/material';
import {ReactComponent as LOGO} from '../logo.svg';
import {Link} from "react-router-dom";
import {ThemeContext} from "./ThemeContext";

interface LogoProps {
    height?: number;
}

const Logo: React.FC<LogoProps> = (props) => {
    const {darkMode} = useContext(ThemeContext);

    const toPass = {
        sx: {
            height: 'auto!important',
            filter: `drop-shadow(0 2px 2px rgba(114, 134, 71, 0.6))`,
        }
    };
    if (props.height && props.height > 0) {
        // @ts-ignore
        toPass.sx.fontSize = props.height;
        // @ts-ignore
        toPass.sx.height = 'auto';
    }


    return <Link to={'/'}>
        <SvgIcon viewBox="0 0 292 116" component={LOGO} {...toPass} inheritViewBox/>
    </Link>
};

export default Logo;


