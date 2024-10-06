import { useState } from 'react'
import FormErrors from '../components/FormErrors'
import { Flows, reauthenticate } from '../lib/allauth'
import ReauthenticateFlow from './ReauthenticateFlow'
import { Box, Button, TextField, Typography } from '@mui/material'

export default function Reauthenticate () {
  const [password, setPassword] = useState('')
  const [response, setResponse] = useState({ fetching: false, content: null })

  function submit () {
    setResponse({ ...response, fetching: true })
    reauthenticate({ password }).then((content) => {
      setResponse((r) => { return { ...r, content } })
    }).catch((e) => {
      console.error(e)
      window.alert(e)
    }).then(() => {
      setResponse((r) => { return { ...r, fetching: false } })
    })
  }

  return (
    <ReauthenticateFlow flow={Flows.REAUTHENTICATE}>
      <Typography variant="body1">Enter your password:</Typography>

      <FormErrors errors={response.content?.errors}/>

      <Box>
        <TextField
          fullWidth
          value={password} onChange={(e) => setPassword(e.target.value)} type="password" required
          label="Password"
        />
        <FormErrors param="password" errors={response.content?.errors}/>
      </Box>
      <Button disabled={response.fetching} onClick={() => submit()}>Confirm</Button>
    </ReauthenticateFlow>
  )
}
