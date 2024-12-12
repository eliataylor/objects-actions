import React from 'react';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import {styled} from '@mui/material/styles';
import {Button, ButtonProps, Drawer} from '@mui/material';
import Badge from "@mui/material/Badge";
import Paper from "@mui/material/Paper";
import BottomNavigation from "@mui/material/BottomNavigation";

export const TextFieldH1 = styled((props) => <TextField
    variant={'filled'}
    {...props} />)({
    '&.MuiTextField-root': {
        textAlign: 'center',
        '& .MuiFormLabel-root[data-shrink="false"]': {
            width: '100%'
        },
        '& .MuiInputBase-root': {
            border: 'none', // Remove the border
            borderRadius: '16px', // Rounded corners
            textAlign: 'center',
            '&:before, &:after': {
                border: 'none'
            }
        },
        '& input': {
            textAlign: 'center', // Center align text
        },
    },
});

export const TextFieldH2 = styled((props) => <TextField
    variant={'standard'}
    {...props} />)({
    '&.MuiTextField-root': {
        '& .MuiInputLabel-root': {
            color: 'rgba(255,255,255,1)',
        },
        '& .MuiInputBase-root': {
            border: 'none', // Remove the border
            borderRadius: '16px', // Rounded corners
            '&:before, &:after': {
                border: 'none'
            }
        }
    },
});


// Define a styled wrapper with pseudo-element styling
export const UploadArea = styled('div')({
    position: 'relative',
    borderStyle: 'dashed',
    border: "1pt dashed #868484",
    boxSizing: "border-box",
    borderRadius: 16,
    minHeight: 120,
    textAlign: 'center',
    '& label, & button': {
        width: '100%', height: '100%',
        zIndex: 2
    },
    '& img, & label, & button': {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1
    },
    '& .MuiTypography-caption': {
        position: 'absolute',
        top: '70%',
        color: '#868484',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1
    },
});

export const StyledAccordion = styled(Accordion)(({theme}) => ({
    border: 0,
    borderRadius: 16,
    width: '100%',
    backgroundColor: '#262626',
    '& :before, & :after': {
        border: 'none'
    },
    '& .MuiAccordionSummary-root': {
        borderRadius: 16,
        border: 0,
    },

    '& .MuiAccordionDetails-root': {
        border: 0,
        padding: theme.spacing(2),
    },
}));

export const SelectPill = styled(TextField)(({theme}) => ({
    border: 0,
    borderRadius: 16,
    '& :before, & :after': {
        border: 'none',
        display: 'none'
    },
    '& .MuiInputBase-root': {
        borderRadius: 16,
        border: 0,
    },
    '& .MuiInputBase-input': {
        paddingTop: 4,
        borderRadius: 16,
        border: 0,
    }
}));

export const ButtonPill = styled((props: ButtonProps & { to?: string }) => {
    return <Button {...props} />;
})({
    borderRadius: 16,
    textTransform: 'none',
    margin: 'auto',
    maxWidth: 600
});

export const FriendButton = styled(Button)(({theme}) => ({
    borderRadius: 10,
    textTransform: 'none',
    color: theme.palette.text.primary,
    margin: 'auto',
    maxWidth: 400
}));

export const GradientButton = styled(Button)(({theme}) => ({
    height: 100,
    minWidth: '80%',
    borderRadius: 16,
    textTransform: 'none',
    background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
    color: theme.palette.common.white,
    '&:hover': {
        background: `linear-gradient(90deg, ${theme.palette.secondary.dark}, ${theme.palette.primary.dark})`,
    },
}));

export const FadedPaper = styled(Paper)(({theme}) => ({
    background: `linear-gradient(
    180deg,
    ${theme.palette.background.default} 0%,
    ${theme.palette.background.default}B3 70%, /* 70% opacity */
    ${theme.palette.background.paper}00 100%   /* 0% opacity */
  )`,
    '&:hover': {
        background: `linear-gradient(
        180deg,
        ${theme.palette.background.default} 0%,
        ${theme.palette.background.default}B3 40%, /* 70% opacity */
        ${theme.palette.background.paper}00 100%   /* 0% opacity */
    )`,
    },
}));


export const StyledBadge = styled(Badge)(({theme}) => ({
    '& .MuiBadge-badge': {
        backgroundColor: theme.palette.text.primary,
        border: `2px solid ${theme.palette.background.default}`,
        borderRadius: 25,
        padding: '13px',
        color: theme.palette.primary.main,
        height: 25, width: 25
    },
}));

export const SecondaryBottomMenu = styled(BottomNavigation)(({theme}) => ({
    position: 'fixed',
    bottom: '55px',
    left: 0,
    right: 0,
    background: `linear-gradient(to top, rgba(0,0,0) 0%, rgba(0,0,0,.7) 50%, rgba(0,0,0,0) 100%)`,
}));

export const StyledDrawer = styled(Drawer)(({theme}) => ({
    '& .MuiDrawer-paper': {
        background: 'linear-gradient(to bottom, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0))',
        color: 'white', // Optional: set text color to white for better contrast
        borderRight: '1px solid rgba(255, 255, 255, 0.12)', // Optional: add border for better visibility
    },
}));