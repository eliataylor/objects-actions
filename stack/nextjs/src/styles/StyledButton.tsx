import { Button, type ButtonProps } from "@mui/material"
import { forwardRef } from "react"

interface StyledButtonProps extends ButtonProps {
  children: React.ReactNode
}

const StyledButton = forwardRef<HTMLButtonElement, StyledButtonProps>(
  ({ children, sx, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        sx={{
          textTransform: "none",
          fontWeight: 500,
          // Merge with any additional sx props
          ...sx,
        }}
        {...props}
      >
        {children}
      </Button>
    )
  }
)

StyledButton.displayName = "StyledButton"

export default StyledButton 