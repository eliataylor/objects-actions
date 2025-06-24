import { styled } from "@mui/material/styles";
import Button, { type ButtonProps } from "@mui/material/Button";
import { type PaletteColor } from "@mui/material/styles";

interface GradientButtonProps extends ButtonProps {
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

interface CustomGradientProps extends ButtonProps {
  startColor?: string;
  endColor?: string;
}

export const GradientButton = styled(Button)<GradientButtonProps>(({ theme, color = 'primary' }) => {
  // Get the color object from theme
  const colorObj = theme.palette[color] as PaletteColor;

  return {
    background: `linear-gradient(120deg, ${colorObj.light}, ${colorObj.dark})`,
    border: 0,
    borderRadius: theme.shape.borderRadius,
    color: "white",
    textTransform: "none",
    transition: "all 1s ease-in-out",
    "&:hover": {
      boxShadow: "0 5px 15px 3px rgba(0, 0, 0, .2)",
      background: `linear-gradient(120deg, ${colorObj.dark}, ${colorObj.light})`, // Reverse gradient on hover
    },
    "&:active": {
      boxShadow: "0 2px 5px 1px rgba(0, 0, 0, .1)",
    },
    "&:disabled": {
      background: theme.palette.action.disabledBackground,
      color: theme.palette.action.disabled,
      boxShadow: "none",
      transform: "none",
    }
  };
});

export const CustomGradientButton = styled(Button)<CustomGradientProps>(
  ({ theme, startColor = theme.palette.primary.light, endColor = theme.palette.primary.dark }) => ({
    background: `linear-gradient(120deg, ${startColor}, ${endColor})`,
    border: 0,
    borderRadius: theme.shape.borderRadius,
    boxShadow: "0 3px 5px 2px rgba(0, 0, 0, .15)",
    color: "white",
    padding: "8px 24px",
    textTransform: "none",
    transition: "all 0.3s ease-in-out",
    "&:hover": {
      boxShadow: "0 5px 15px 3px rgba(0, 0, 0, .2)",
      transform: "translateY(-1px)",
      background: `linear-gradient(120deg, ${endColor}, ${startColor})`, // Reverse gradient on hover
    },
    "&:active": {
      boxShadow: "0 2px 5px 1px rgba(0, 0, 0, .1)",
      transform: "translateY(1px)",
    },
    "&:disabled": {
      background: theme.palette.action.disabledBackground,
      color: theme.palette.action.disabled,
      boxShadow: "none",
      transform: "none",
    }
  })
);

// Usage examples:
// <GradientButton>Primary Theme Colors</GradientButton>
// <GradientButton color="secondary">Secondary Theme Colors</GradientButton>
// <GradientButton color="error">Error Theme Colors</GradientButton>
// <CustomGradientButton startColor="#ff4081" endColor="#7c4dff">Custom Colors</CustomGradientButton>