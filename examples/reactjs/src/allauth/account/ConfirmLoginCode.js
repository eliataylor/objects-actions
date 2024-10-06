import { useState } from 'react'
import FormErrors from '../components/FormErrors'
import { confirmLoginCode, Flows } from '../lib/allauth'
import { Navigate } from 'react-router-dom'
import { Box, Button, TextField, Typography } from '@mui/material'
import { useAuthStatus } from '../auth'

export default function ConfirmLoginCode () {
  const [, authInfo] = useAuthStatus()
  const [code, setCode] = useState('')
  const [response, setResponse] = useState({ fetching: false, content: null })

  function submit () {
    setResponse({ ...response, fetching: true })
    confirmLoginCode(code).then((content) => {
      setResponse((r) => { return { ...r, content } })
    }).catch((e) => {
      console.error(e)
      window.alert(e)
    }).then(() => {
      setResponse((r) => { return { ...r, fetching: false } })
    })
  }

  if (authInfo.pendingFlow?.id !== Flows.LOGIN_BY_CODE) {
    return <Navigate to="/account/login/code"/>
  }
  return (
    <Box p={1} mt={8}>
      <Typography variant="h6">Enter Sign-In Code </Typography>
      <Typography variant="body1">
        The code expires shortly, so please enter it soon.
      </Typography>

      <FormErrors errors={response.content?.errors}/>

      <Box>
        <TextField
          fullWidth
          value={code} onChange={(e) => setCode(e.target.value)} type="code" required
          label="Code"
        />
        <FormErrors param="code" errors={response.content?.errors}/>
      </Box>
      <Button disabled={response.fetching} onClick={() => submit()}>Sign In</Button>
    </Box>
  )
}
