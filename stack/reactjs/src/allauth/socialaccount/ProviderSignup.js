import { useState } from 'react'
import FormErrors from '../components/FormErrors'
import { providerSignup } from '../lib/allauth'
import { Box, Button } from '@mui/material'
export default function ProviderSignup () {
  const [email, setEmail] = useState('')
  const [response, setResponse] = useState({ fetching: false, content: null })

  function submit () {
    setResponse({ ...response, fetching: true })
    providerSignup({ email }).then((content) => {
      setResponse((r) => { return { ...r, content } })
    }).catch((e) => {
      console.error(e)
      window.alert(e)
    }).then(() => {
      setResponse((r) => { return { ...r, fetching: false } })
    })
  }

  return (
    <Box p={1}>
      <h1>Sign Up</h1>
      <p>
       Enter email associated with the social app you used to sign up
      </p>

      <FormErrors errors={response.content?.errors}/>

      <div style={{ marginBottom: 10 }}><label>Email <input value={email} onChange={(e) => setEmail(e.target.value)}
                                                            type="email" required/></label>
        <FormErrors param="email" errors={response.content?.errors}/>
      </div>
      <Button variant={'contained'} disabled={response.fetching} onClick={() => submit()}>Sign Up</Button>
    </Box>
  )
}
