import { useState } from 'react'
import FormErrors from '../components/FormErrors'
import { requestPasswordReset } from '../lib/allauth'
import { Link } from 'react-router-dom'
import { Box, Button, TextField, Typography } from '@mui/material'

export default function RequestPasswordReset () {
  const [email, setEmail] = useState('')
  const [response, setResponse] = useState({ fetching: false, content: null })

  function submit () {
    setResponse({ ...response, fetching: true })
    requestPasswordReset(email).then((content) => {
      setResponse((r) => { return { ...r, content } })
    }).catch((e) => {
      console.error(e)
      window.alert(e)
    }).then(() => {
      setResponse((r) => { return { ...r, fetching: false } })
    })
  }

  if (response.content?.status === 200) {
    return (
      <Box p={1} mt={8}>
        <Typography variant="h6">Reset Password</Typography>
        <Typography variant="body1">Password reset sent.</Typography>
      </Box>
    )
  }
  return (
    <Box p={1} mt={8}>
      <Typography variant="h6">Reset Password</Typography>
      <Typography variant="body1">
        Remember your password? <Link to="/account/login">Back to login.</Link>
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
      <Button disabled={response.fetching} onClick={() => submit()}>Reset</Button>
    </Box>
  )
}
