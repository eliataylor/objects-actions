import React, { useState } from 'react'
import { useConfig } from '../auth'
import { authenticateByToken, URLs } from '../lib/allauth'
import {ReactComponent as Google} from '../../assets/google.svg';
import { Button} from '@mui/material'

function installGoogleOneTap (cb) {
  const id = 'google-one-tap'
  const scr = document.getElementById(id)
  if (!scr) {
    const scr = document.createElement('script')
    scr.id = id
    scr.src = '//accounts.google.com/gsi/client'
    scr.async = true
    scr.addEventListener('load', function () {
      cb()
    })
    document.body.appendChild(scr)
  } else {
    cb()
  }
}

export default function GoogleOneTap (props) {
  const config = useConfig()
  const [enabled, setEnabled] = useState(() => window.sessionStorage.getItem('googleOneTapEnabled') === 'yes')

  function onGoogleOneTapInstalled () {
    const provider = config.data.socialaccount.providers.find(p => p.id === 'google')
    if (provider && window.google) {
      function handleCredentialResponse (token) {
        authenticateByToken(provider.id, {
          id_token: token.credential,
          client_id: provider.client_id
        }, props.process)
      }

      window.google.accounts.id.initialize({
        client_id: provider.client_id,
        callback: handleCredentialResponse
      })
      window.google.accounts.id.prompt()
    }
  }

  if (enabled) {
    installGoogleOneTap(onGoogleOneTapInstalled)
    return <Button
        id="g_id_onload"
                data-client_id="123-secret.apps.googleusercontent.com"
                data-login_uri={`${URLs.PROVIDER_TOKEN}`}
                fullWidth

                startIcon={<Google/>}
                variant={'outlined'}
                color={'inherit'} >Google One Tap</Button>
  }

  function enable () {
    window.sessionStorage.setItem('googleOneTapEnabled', 'yes')
    installGoogleOneTap(onGoogleOneTapInstalled)
    setEnabled(true)
  }

  return <Button
                fullWidth
                variant={'outlined'}
                startIcon={<Google/>}
                color={'inherit'}
    onClick={() => enable()}>Google One Tap</Button>
}
