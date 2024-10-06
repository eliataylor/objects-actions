import { useState } from 'react'
import FormErrors from '../components/FormErrors'
import { requestLoginCode } from '../lib/allauth'
import { Navigate } from 'react-router-dom'
import { Box, Button, TextField, Typography } from '@mui/material'

export default function RequestLoginCode () {
  const [email, setEmail] = useState('')
  const [response, setResponse] = useState({ fetching: false, content: null })

  function submit () {
    setResponse({ ...response, fetching: true })
    requestLoginCode(email).then((content) => {
      setResponse((r) => { return { ...r, content } })
    }).catch((e) => {
      console.error(e)
      window.alert(e)
    }).then(() => {
      setResponse((r) => { return { ...r, fetching: false } })
    })
  }

  if (response.content?.status === 401) {
    return <Navigate to="/account/login/code/confirm"/>
  }
  return (
    <Box p={1} mt={8}>
      <Typography variant="h6">E-mail me a one time sign-in code</Typography>
      <Typography variant="body1">
        You will receive an email containing a special code for a password-free sign-in.
      </Typography>

      <FormErrors errors={response.content?.errors}/>

      <Box>
        <TextField
          fullWidth
          value={email} onChange={(e) => setEmail(e.target.value)} type="email" required
          label="Email"
        />
        <FormErrors param="email" errors={response.content?.errors}/>
      </Box>
      <Button disabled={response.fetching} onClick={() => submit()}>Request Code</Button>
    </Box>
  )
}
