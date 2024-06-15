import React, {useContext} from 'react';
import {SvgIcon} from '@mui/material';
import {ReactComponent as LOGO} from '../logo.svg';
import {makeStyles} from '@mui/styles';
import {Theme} from '@mui/material/styles';
import {Link} from "react-router-dom";
import {ThemeContext} from "./ThemeContext";

interface LogoProps {
    height?: number;
}

const useStyles = makeStyles<Theme>((theme) => ({
    logo: ({height}: LogoProps) => ({
        fill: theme.palette.mode === 'light' ? '#3B5700' : '#FFFFFF',
        height: 'auto!important',
        filter: `drop-shadow(0 2px 2px rgba(114, 134, 71, 0.6))`,
    })
}));
const Logo: React.FC<LogoProps> = (props) => {
    const { darkMode } = useContext(ThemeContext);

    const classes = useStyles(props); // Pass height prop to useStyles

    const toPass = {
        sx: {
            filter: `drop-shadow(0 2px 2px rgba(114, 134, 71, 0.6))`,
            fill: darkMode === true ? '#FFF' : '#3B5700'
}
    };
    if (props.height && props.height > 0) {
        // @ts-ignore
        toPass.sx.fontSize = props.height;
        // @ts-ignore
        toPass.sx.height = 'auto';
    }


    return <Link to={'/'}>
        <SvgIcon viewBox="0 0 292 116" component={LOGO} className={classes.logo} {...toPass} inheritViewBox/>
    </Link>
};

export default Logo;


