import { Link, useLoaderData } from "react-router-dom";

import * as allauth from "../lib/allauth";
import { Box } from "@mui/material";

export async function loader ({ params }) {
  const resp = await allauth.getAuthenticators();
  return { authenticators: resp.data };
}

export default function MFAOverview (props) {
  const { authenticators } = useLoaderData();
  const totp = authenticators.find(
    (authenticator) => authenticator.type === allauth.AuthenticatorType.TOTP
  );
  const webauthn = authenticators.filter(
    (authenticator) =>
      authenticator.type === allauth.AuthenticatorType.WEBAUTHN
  );
  const recoveryCodes = authenticators.find(
    (authenticator) =>
      authenticator.type === allauth.AuthenticatorType.RECOVERY_CODES
  );
  return (
    <Box p={1}>
      <h1>Two-Factor Authentication</h1>

      <h2>Authenticator App</h2>

      {totp ? (
        <>
          <p>Authentication using an authenticator app is active.</p>
          <Link to="/account/2fa/totp/deactivate">Deactivate</Link>
        </>
      ) : (
        <>
          <p>An authenticator app is not active..</p>
          <Link to="/account/2fa/totp/activate">Activate</Link>
        </>
      )}

      <h2>Security Keys and Devices</h2>

      {webauthn.length ? (
        <>
          <p>You have added {webauthn.length} security keys/devices.</p>
          <Link to="/account/2fa/webauthn">Manage</Link>
        </>
      ) : (
        <>
          <p>No security keys have been added.</p>
          <Link to="/account/2fa/webauthn/add">Add</Link>
        </>
      )}

      <h2>Recovery Codes</h2>

      {!recoveryCodes ? (
        <>
          <p>No recovery codes set up.</p>
          <Link to="/account/2fa/recovery-codes/generate">Generate</Link>
        </>
      ) : (
        <>
          <p>
            There are {recoveryCodes.unused_code_count} out of{" "}
            {recoveryCodes.total_code_count} recovery codes available.
          </p>
          <Link to="/account/2fa/recovery-codes">View</Link>
          <Link to="/account/2fa/recovery-codes/generate">Regenerate</Link>
        </>
      )}
    </Box>
  );
}
