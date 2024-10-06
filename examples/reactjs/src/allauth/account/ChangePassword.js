import { useState } from 'react'
import FormErrors from '../components/FormErrors'
import { changePassword } from '../lib/allauth'
import { Navigate } from 'react-router-dom'
import { useUser } from '../auth'
import { Box, Button, TextField, Typography } from '@mui/material'

export default function ChangePassword () {
  const hasCurrentPassword = useUser().has_usable_password
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPassword2, setNewPassword2] = useState('')
  const [newPassword2Errors, setNewPassword2Errors] = useState([])

  const [response, setResponse] = useState({ fetching: false, content: null })

  function submit () {
    if (newPassword !== newPassword2) {
      setNewPassword2Errors([{ param: 'new_password2', message: 'Password does not match.' }])
      return
    }
    setNewPassword2Errors([])
    setResponse({ ...response, fetching: true })
    changePassword({ current_password: currentPassword, new_password: newPassword }).then((resp) => {
      setResponse((r) => {
        return { ...r, content: resp }
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

  if (response.content?.status === 200) {
    return <Navigate to="/"/>
  }
  return (
    <Box p={1} mt={8}>
      <Typography variant="h6">{hasCurrentPassword ? 'Change Password' : 'Set Password'}</Typography>

      <Typography
        variant="body1">{hasCurrentPassword ? 'Enter your current password, followed by your new password.' : 'You currently have no password set. Enter your (new) password.'}</Typography>
      {hasCurrentPassword
        ? <Box>
          <TextField
            fullWidth
            autoComplete="password" value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)} type="password" required
            label="Current Password"
          />
          <FormErrors param="current_password" errors={response.content?.errors}/>
        </Box>
        : null}

      <Box mb={1} mt={2}>
        <TextField
          fullWidth
          autoComplete="new-password" value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)} type="password"
          required
          label="New Password"
        />

        <FormErrors param="new_password" errors={response.content?.errors}/>
      </Box>
      <Box>
        <TextField
          fullWidth
          value={newPassword2} onChange={(e) => setNewPassword2(e.target.value)}
          type="password" required
          label="Confirm Password"
        />

        <FormErrors param="new_password2" errors={newPassword2Errors}/>
      </Box>

      <Button
        disabled={response.fetching}
        onClick={() => submit()}
      >{hasCurrentPassword ? 'Change' : 'Set'}
      </Button>
    </Box>
  )
}
