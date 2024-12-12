import { useState } from 'react'
import { Link, Navigate, useLoaderData } from 'react-router-dom'
import { Button } from '@mui/material'
import * as allauth from '../lib/allauth'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

export async function loader ({ params }) {
  const resp = await allauth.getAuthenticators()
  return { authenticators: resp.data }
}

function Authenticator (props) {
  const [name, setName] = useState(props.authenticator.name)
  const { authenticator } = props

  function onSubmit (e) {
    e.preventDefault()
    props.onSave(name)
  }

  return (
    <TableRow>
      {props.editting
        ? <TableCell>
          <form onSubmit={onSubmit}>
            <input onChange={(e) => setName(e.target.value)} value={name} type="text"/>
            <Button type="button" onClick={() => props.onCancel()}> Cancel</Button>
          </form>
        </TableCell>
        : <TableCell>{authenticator.name} <Button onClick={() => props.onEdit()}> Edit</Button>
        </TableCell>}
      <TableCell>{typeof authenticator.is_passwordless === 'undefined'
        ? 'Type unspecified'
        : (authenticator.is_passwordless ? 'Passkey' : 'Security key')}
      </TableCell>
      <TableCell>{new Date(authenticator.created_at * 1000).toLocaleString()}</TableCell>
      <TableCell>{authenticator.last_used_at ? new Date(authenticator.last_used_at * 1000).toLocaleString() : 'Unused'}</TableCell>
      <TableCell>
        <Button onClick={() => props.onDelete()}>Delete</Button>
      </TableCell>
    </TableRow>
  )
}

export default function ListWebAuthn (props) {
  const { authenticators } = useLoaderData()
  const [editId, setEditId] = useState(null)
  const [keys, setKeys] = useState(() => authenticators.filter(authenticator => authenticator.type === allauth.AuthenticatorType.WEBAUTHN))
  const [response, setResponse] = useState({ fetching: false, content: null })

  async function optimisticSetKeys (newKeys, op) {
    setResponse({ ...response, fetching: true })
    const oldKeys = keys
    setEditId(null)
    setKeys(newKeys)
    try {
      const ok = await op()
      if (!ok) {
        setKeys(oldKeys)
      }
    } catch (e) {
      setKeys(oldKeys)
      console.error(e)
      window.alert(e)
    }
    setResponse((r) => { return { ...r, fetching: false } })
  }

  async function deleteKey (key) {
    const newKeys = keys.filter((k) => k.id !== key.id)
    await optimisticSetKeys(newKeys, async () => {
      const resp = await allauth.deleteWebAuthnCredential([key.id])
      return (resp.status === 200)
    })
  }

  async function onSave (key, name) {
    const newKeys = keys.filter((k) => k.id !== key.id)
    newKeys.push({ ...key, name })
    await optimisticSetKeys(newKeys, async () => {
      const resp = await allauth.updateWebAuthnCredential(key.id, { name })
      return (resp.status === 200)
    })
  }

  if (!keys.length && !response.fetching) {
    return <Navigate to="/account/2fa"/>
  }

  return (
    <section>
      <h1>Security Keys</h1>

      <Table className="table table-striped">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Last Used At</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {keys.map(key => {
            return (
              <Authenticator
                key={key.id}
                editting={key.id === editId} authenticator={key} onCancel={() => setEditId(null)}
                onSave={(name) => onSave(key, name)}
                onEdit={() => setEditId(key.id)} onDelete={() => deleteKey(key)}
              />
            )
          })}
        </TableBody>
      </Table>
      <Link to="/account/2fa/webauthn/add">Add</Link>
    </section>
  )
}
