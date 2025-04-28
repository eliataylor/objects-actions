import { useEffect, useState } from "react";
import * as allauth from "../lib/allauth";
import { Navigate, useLoaderData } from "react-router-dom";
import FormErrors from "../components/FormErrors";
import { Box, Button, TextField } from "@mui/material";
import QRCode from "qrcode";
import { useTheme } from "@mui/system";

export async function loader ({ params }) {
  const resp = await allauth.getTOTPAuthenticator();
  return { totp: resp };
}

export default function ActivateTOTP (props) {
  const { totp } = useLoaderData();
  const [code, setCode] = useState("");
  const [response, setResponse] = useState({ fetching: false, content: null });
  const [imgSrc, setImgSrc] = useState(null);
  const theme = useTheme();

  function submit () {
    setResponse({ ...response, fetching: true });
    allauth
      .activateTOTPAuthenticator(code)
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

  useEffect(() => {
    if (totp.meta.totp_url) {
      QRCode.toDataURL(totp.meta.totp_url, {
        errorCorrectionLevel: "H",
        type: "image/jpeg",
        quality: 0.3,
        margin: 1,
        color: {
          dark: theme.palette.secondary.main,
          light: theme.palette.background.paper,
        }
      }, function(err, url) {
        if (err) throw err;
        setImgSrc(url);
      });
    }
  }, [totp.meta.secret]);

  if (totp.status === 200 || response.content?.status === 200) {
    return <Navigate to="/account/2fa" />;
  }
  return (
    <section>
      <h1>Activate TOTP</h1>

      <Box mt={2} mb={2}>
        <TextField
          fullWidth
          disabled
          type="text"
          value={totp.meta.secret}
          label="Authenticator secret"
          helperText="You can store this secret and use it to reinstall your authenticator app at a later time."
        />
      </Box>
      <Box>
        {imgSrc && <img src={imgSrc} alt="QR code" />}
      </Box>

      <Box mt={2} mb={2}>

        <TextField
          fullWidth
          type="text"
          label={"Authenticator code"}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <FormErrors param="code" errors={response.content?.errors} />
      </Box>
      <Button variant={"contained"} onClick={() => submit()}>Activate</Button>
    </section>
  );
}
