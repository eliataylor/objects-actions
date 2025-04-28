import { useState } from "react";
import FormErrors from "../components/FormErrors";
import * as allauth from "../lib/allauth";
import { Box, Button, TextField } from "@mui/material";
import { useAuthInfo } from "../auth/hooks";
import { Navigate } from "react-router-dom";
import AuthenticateFlow from "./AuthenticateFlow";

export default function AuthenticateCode (props) {
  const [code, setCode] = useState("");
  const [response, setResponse] = useState({ fetching: false, content: null });
  const authInfo = useAuthInfo();

  if (authInfo?.pendingFlow?.id !== allauth.Flows.MFA_AUTHENTICATE) {
    return <Navigate to="/" />;
  }

  function submit () {
    setResponse({ ...response, fetching: true });
    allauth
      .mfaAuthenticate(code)
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

  return (
    <AuthenticateFlow authenticatorType={props.authenticatorType}>
      {props.children}

      <Box mt={2} mb={1}>
        <TextField
          fullWidth
          type="text"
          label={"Authenticator code"}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </Box>

      <FormErrors param="code" errors={response.content?.errors} />
      <Button variant={"contained"} onClick={() => submit()}>Sign In</Button>
    </AuthenticateFlow>
  );
}
