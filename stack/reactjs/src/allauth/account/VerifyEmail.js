import { useEffect, useState } from 'react'
import { Navigate, useLoaderData } from 'react-router-dom'
import { getEmailVerification, verifyEmail } from '../lib/allauth'
import { Box, Button, Typography } from '@mui/material'

export async function loader ({ params }) {
  const key = params.key
  const resp = await getEmailVerification(key)
  return { key, verification: resp }
}

export default function VerifyEmail () {
  const { key, verification } = useLoaderData()
  const [response, setResponse] = useState({ fetching: false, content: null })

  useEffect(() => {
    submit()
  }, [])

  function submit () {
    setResponse({ ...response, fetching: true })
    verifyEmail(key).then((content) => {
      setResponse((r) => { return { ...r, content } })
    }).catch((e) => {
      console.error(e)
      window.alert(e)
    }).then(() => {
      setResponse((r) => { return { ...r, fetching: false } })
    })
  }

  if ([200, 401].includes(response.content?.status)) {
    return <Navigate to="/account/email"/>
  }

  let body = null
  if (verification.status === 200) {
    body = (
      <>
        <Typography variant="body1">Please confirm that <a
          href={'mailto:' + verification.data.email}>{verification.data.email}</a> is an email address for
          user {verification.data.user.str}.</Typography>
        <Button disabled={response.fetching} onClick={() => submit()}>Confirm</Button>
      </>
    )
  } else if (!verification.data?.email) {
    body = <Typography variant="body1">Invalid verification link.</Typography>
  } else {
    body = <Typography variant="body1">Unable to confirm email <a
      href={'mailto:' + verification.data.email}>{verification.data.email}</a> because it is already
      confirmed.</Typography>
  }
  return (
    <Box p={1} mt={8}>
      <Typography variant="h6">Confirm Email Address</Typography>
      {body}
    </Box>
  )
}
