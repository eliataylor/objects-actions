import React, { useEffect, useState } from 'react'
import * as allauth from '../lib/allauth'
import FormErrors from '../components/FormErrors'
import { Box, Button, InputAdornment, TextField, Typography } from '@mui/material'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

export default function ChangeEmail () {
  const [email, setEmail] = useState('')
  const [emailAddresses, setEmailAddresses] = useState([])
  const [response, setResponse] = useState({ fetching: false, content: { status: 200, data: [] } })

  useEffect(() => {
    setResponse((r) => {
      return { ...r, fetching: true }
    })
    allauth.getEmailAddresses().then((resp) => {
      if (resp.status === 200) {
        setEmailAddresses(resp.data)
      }
    }).then(() => {
      setResponse((r) => {
        return { ...r, fetching: false }
      })
    })
  }, [])

  function addEmail () {
    setResponse({ ...response, fetching: true })
    allauth.addEmail(email).then((resp) => {
      setResponse((r) => {
        return { ...r, content: resp }
      })
      if (resp.status === 200) {
        setEmailAddresses(resp.data)
        setEmail('')
      }
    }).catch((e) => {
      console.error(e)
      window.alert(e)
    }).then(() => {
      setResponse((r) => {
        return { ...r, fetching: false }
      })
    })
  }

  function requestEmailVerification (email) {
    setResponse({ ...response, fetching: true })
    allauth.requestEmailVerification(email).catch((e) => {
      console.error(e)
      window.alert(e)
    }).then(() => {
      setResponse((r) => {
        return { ...r, fetching: false }
      })
    })
  }

  function deleteEmail (email) {
    setResponse({ ...response, fetching: true })
    allauth.deleteEmail(email).then((resp) => {
      setResponse((r) => {
        return { ...r, content: resp }
      })
      if (resp.status === 200) {
        setEmailAddresses(resp.data)
      }
    }).catch((e) => {
      console.error(e)
      window.alert(e)
    }).then(() => {
      setResponse((r) => {
        return { ...r, fetching: false }
      })
    })
  }

  function markAsPrimary (email) {
    setResponse({ ...response, fetching: true })
    allauth.markEmailAsPrimary(email).then((resp) => {
      setResponse((r) => {
        return { ...r, content: resp }
      })
      if (resp.status === 200) {
        setEmailAddresses(resp.data)
      }
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
    <Box p={1} mt={8}>
      <Typography variant="h6">My Phones / Emails</Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Email / Phone</TableCell>
            <TableCell>Verified</TableCell>
            <TableCell>Primary</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {emailAddresses.map(ea => {
            return (
              <TableRow key={ea.email}>
                <TableCell>{ea.email.indexOf('@sms-placeholder.com') > -1 ? ea.email.split('@')[0] : ea.email}</TableCell>
                <TableCell>{ea.verified
                  ? '✅'
                  : '❌'}
                </TableCell>
                <TableCell>
                  <input onChange={() => markAsPrimary(ea.email)} type="radio" checked={ea.primary}/>
                </TableCell>
                <TableCell>
                  {ea.verified
                    ? ''
                    : <Button
                      onClick={() => requestEmailVerification(ea.email)}
                      disabled={response.fetching}
                    >Resend
                    </Button>}
                  {ea.primary
                    ? ''
                    : <Button
                      onClick={() => deleteEmail(ea.email)}
                      disabled={response.fetching}
                    >Remove
                    </Button>}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <FormErrors errors={response.content.errors}/>

      <Box mt={4}>
        <TextField
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)} type="email" required
          label="Add Email"
          endAdornment={
            <InputAdornment position="end">
              <Button disabled={response.fetching} onClick={() => addEmail()}>Add</Button>
            </InputAdornment>
          }
        />

        <FormErrors param="email" errors={response.content?.errors}/>
      </Box>
    </Box>
  )
}
