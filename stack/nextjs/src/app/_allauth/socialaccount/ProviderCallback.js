import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { pathForPendingFlow, URLs, useAuthStatus } from "../auth";
import { Box } from "@mui/material";

export default function ProviderCallback () {
  const location = useLocation();
  const { provider } = useParams();
  const params = new URLSearchParams(location.search);
  const error = params.get("error");
  const [auth, status] = useAuthStatus();

  const providerName = provider !== 'provider' ? provider : (params.provider ? params.provider : "Third-Party");

  let url = URLs.LOGIN_URL;
  if (status.isAuthenticated) {
    url = URLs.LOGIN_REDIRECT_URL;
  } else {
    url = pathForPendingFlow(auth) || url;
  }

  console.log(`PROVIDER CALLBACK [${providerName}]: ` + url, auth, status);

  if (!error) {
    return <Navigate to={url} />;
  }
  return (
    <Box p={2} mt={7}>
      <h1>{providerName} login failed</h1>
      <p>
        Something went wrong. This account may already be linked to another
        user.
      </p>
      <Link to={url}>Continue</Link>
    </Box>
  );
}
