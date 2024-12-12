import { useState } from 'react'
import FormErrors from '../components/FormErrors'
import { getPasswordReset, resetPassword } from '../lib/allauth'
import { Link, Navigate, useLoaderData } from 'react-router-dom'
import { Box, Button, TextField, Typography } from '@mui/material'

export async function loader ({ params }) {
  const key = params.key
  const resp = await getPasswordReset(key)
  return { key, keyResponse: resp }
}

export default function ResetPassword () {
  const { key, keyResponse } = useLoaderData()

  const [password1, setPassword1] = useState('')
  const [password2, setPassword2] = useState('')
  const [password2Errors, setPassword2Errors] = useState([])

  const [response, setResponse] = useState({ fetching: false, content: null })

  function submit () {
    if (password2 !== password1) {
      setPassword2Errors([{ param: 'password2', message: 'Password does not match.' }])
      return
    }
    setPassword2Errors([])
    setResponse({ ...response, fetching: true })
    resetPassword({ key, password: password1 }).then((resp) => {
      setResponse((r) => { return { ...r, content: resp } })
    }).catch((e) => {
      console.error(e)
      window.alert(e)
    }).then(() => {
      setResponse((r) => { return { ...r, fetching: false } })
    })
  }

  if ([200, 401].includes(response.content?.status)) {
    return <Navigate to="/account/login"/>
  }
  let body
  if (keyResponse.status !== 200) {
    body = <FormErrors param="key" errors={keyResponse.errors}/>
  } else if (response.content?.error?.detail?.key) {
    body = <FormErrors param="key" errors={response.content?.errors}/>
  } else {
    body = (
      <>
        <Box>
          <TextField
            fullWidth
            autoComplete="new-password" value={password1} onChange={(e) => setPassword1(e.target.value)} type="password"
            required
            label="Password"
          />
          <FormErrors param="password" errors={response.content?.errors}/>
        </Box>
        <Box>
          <TextField
            fullWidth
            value={password2} onChange={(e) => setPassword2(e.target.value)} type="password" required
            label="Confirm Password"
          />
          <FormErrors param="password2" errors={password2Errors}/>
        </Box>

        <Button disabled={response.fetching} onClick={() => submit()}>Reset</Button>
      </>
    )
  }

  return (
    <Box p={1} mt={8}>
      <Typography variant="h6">Reset Password</Typography>
      <Typography variant="body1">
        Remember your password? <Link to="/account/login">Back to login.</Link>
      </Typography>
      {body}
    </Box>
  )
}
