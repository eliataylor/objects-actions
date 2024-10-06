import { useState } from 'react'
import FormErrors, { hasError } from '../components/FormErrors'
import { login } from '../lib/allauth'
import { Link } from 'react-router-dom'
import { useConfig } from '../auth'
import ProviderList from '../socialaccount/ProviderList'
import { Button, FormHelperText, Grid, TextField, Typography } from '@mui/material'

export default function Login () {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [response, setResponse] = useState({ fetching: false, content: null })
  const config = useConfig()
  const hasProviders = config.data.socialaccount?.providers?.length > 0

  function submit () {
    setResponse({ ...response, fetching: true })
    login({ email, username: email, password }).then((content) => {
      setResponse((r) => {
        return { ...r, content }
      })
    }).catch((e) => {
      console.error(e)
      window.alert(e)
    }).then(() => {
      setResponse((r) => {
        return { ...r, fetching: false }
      })
    })
  }

  return (
    <Grid container direction="column" p={1} gap={1} mt={8}>
      <Grid item container fullWidth alignContent="center" justifyContent="space-between">
        <Grid item>
          <Typography variant="h5">Sign-In</Typography>
        </Grid>
        <Grid item>
          <Typography variant="body1">
            <Link to="/account/signup">or <b>Sign-Up</b></Link>
          </Typography>
        </Grid>
      </Grid>
      <Grid item>
        <TextField
          label="Email" fullWidth value={email}
          onChange={(e) => setEmail(e.target.value)} type="email" required
          error={hasError(response.content?.errors, 'email')}
        />
        <FormErrors param="email" errors={response.content?.errors}/>
      </Grid>
      <Grid item>
        <TextField
          fullWidth
          value={password} onChange={(e) => setPassword(e.target.value)} type="password" required
          label="Password"
          error={hasError(response.content?.errors, 'password')}
        />
        <FormErrors param="password" errors={response.content?.errors}/>
      </Grid>
      <Grid item container justifyContent={'space-between'} gap={2}>

        <Grid>
          <Button
            disabled={response.fetching} onClick={() => submit()} variant="contained"
            size="small"
          >Login
          </Button>
        </Grid>
        <Grid item>
          <FormHelperText style={{ width: '100%', textAlign: 'right' }}>
            <Link to="/account/password/reset">Forgot your password?</Link>
          </FormHelperText>
        </Grid>
      </Grid>
      <Grid item>
        <FormErrors errors={response.content?.errors}/>
      </Grid>
      {/*
      <Divider fullWidth sx={{ backgroundColor: 'primary.dark' }}/>
      <Grid item style={{ marginTop: 30 }}>
        <Link to="/account/login/code">Email me a sign-in code</Link>
      </Grid>
      <Grid item>
        <WebAuthnLoginButton>Sign in with a passkey</WebAuthnLoginButton>
      </Grid>
        <Divider fullWidth sx={{ backgroundColor: 'primary.dark' }}/>
      */}

      {hasProviders && <Grid item style={{ marginTop: 50 }}>
        <ProviderList callbackURL="/account/provider/callback"/>
      </Grid>}

    </Grid>
  )
}
