import { useState } from "react";
import { Navigate } from "react-router-dom";
import FormErrors from "../components/FormErrors";
import { Button, TextField } from "@mui/material";
import * as allauth from "../lib/allauth";
import { create, parseCreationOptionsFromJSON } from "@github/webauthn-json/browser-ponyfill";

export default function AddWebAuthn (props) {
  const [passwordless, setPasswordless] = useState(false);
  const [name, setName] = useState("");
  const [response, setResponse] = useState({ fetching: false, content: null });

  async function submit () {
    setResponse({ ...response, fetching: true });
    try {
      const optResp = await allauth.getWebAuthnCreateOptions(passwordless);
      const jsonOptions = optResp.data.creation_options;
      const options = parseCreationOptionsFromJSON(jsonOptions);
      const credential = await create(options);
      const addResp = await allauth.addWebAuthnCredential(name, credential);
      setResponse((r) => {
        return { ...r, content: addResp };
      });
    } catch (e) {
      console.error(e);
      window.alert(e);
    }
    setResponse((r) => {
      return { ...r, fetching: false };
    });
  }

  if (response.content?.status === 200) {
    return (
      <Navigate
        to={
          response.content.meta.recovery_codes_generated
            ? "/account/2fa/recovery-codes"
            : "/account/2fa/webauthn"
        }
      />
    );
  }
  return (
    <section>
      <h1>Add Security Key</h1>

      <div>
        <TextField
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          label="Name"
        />
        <FormErrors param="name" errors={response.content?.errors} />
      </div>
      <div>
        <label>
          Passwordless
          <input
            type="checkbox"
            onChange={(e) => setPasswordless(e.target.checked)}
            checked={passwordless}
          />
        </label>
      </div>
      <Button disabled={response.fetching} onClick={() => submit()}>
        Add key
      </Button>
    </section>
  );
}
