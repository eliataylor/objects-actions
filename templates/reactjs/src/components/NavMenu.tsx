import React, {useContext} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {List, ListItem, ListItemText} from '@mui/material';
import {useTheme} from "@mui/styles";
import {Theme} from "@mui/material/styles";
import {ThemedButton} from "../theme/GlobalStyles";
import ActivePromotions from "./ActivePromotions";
import ViewCartButton from "./ViewCartButton";
import {QuantityContext} from "../ObjectActionsProvider";

const NavMenu = () => {
    const location = useLocation();
    const theme = useTheme() as Theme;
    const price = useContext(QuantityContext).cartPrice;

    return (
        <List>
            <ListItem component={Link} to="/about" selected={location.pathname === '/about'}>
                <ListItemText primary="ABOUT US"/>
            </ListItem>
            <ListItem component={Link} to="/faq" selected={location.pathname === '/faq'}>
                <ListItemText primary="FAQ"/>
            </ListItem>
            <ListItem component={Link} to="/contact" selected={location.pathname === '/contact'}>
                <ListItemText primary="CONTACT"/>
            </ListItem>
            <ListItem component={Link} to="/partners" selected={location.pathname === '/partners'}>
                <ListItemText primary="WORK WITH US!"/>
            </ListItem>
            {price > 0 ? <ListItem sx={{display:'block', width:'100%'}}>
                    <ViewCartButton />
                </ListItem>
                :
                location.pathname !== '/' ?
                    <ListItem component={Link} to="/menus">
                        <ThemedButton sx={{mt: 2, fontWeight: 800}} variant={'contained'}>
                            Place Your Order
                        </ThemedButton>
                    </ListItem>
                    : null
            }

            {/* <ListItem button component={Link} to="/suppliers" selected={location.pathname === '/suppliers'}>
                <ListItemText primary="Suppliers" />
            </ListItem>

            <ListItem button component={Link} to="/testimonials" selected={location.pathname === '/testimonials'}>
                <ListItemText primary="Testimonials" />
            </ListItem>*/}

            {location.pathname.indexOf('/servings') > -1 && <ActivePromotions />}
        </List>
    );
};

export default NavMenu;
