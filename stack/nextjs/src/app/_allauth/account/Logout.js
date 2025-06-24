import { useState } from "react";
import { Navigate } from "react-router-dom";
import { logout } from "../lib/allauth";
import { Box, Button, Typography } from "@mui/material";

export default function Logout () {
  const [response, setResponse] = useState({ fetching: false, content: null });

  function submit () {
    setResponse({ ...response, fetching: true });
    logout()
      .then((content) => {
        setResponse((r) => {
          return { ...r, content };
        });
      })
      .catch((e) => {
        console.error(e);
        window.alert(e);
      })
      .then(() => {
        setResponse((r) => {
          return { ...r, fetching: false };
        });
      });
  }

  if (response.content) {
    return <Navigate to="/" />;
  }
  return (
    <Box mt={7}>
      <Typography variant="body1" gutterBottom={true}>
        Are you sure you want to logout?
      </Typography>

      <Button
        variant={"contained"}
        disabled={response.fetching}
        onClick={() => submit()}
      >
        Logout
      </Button>
    </Box>
  );
}
