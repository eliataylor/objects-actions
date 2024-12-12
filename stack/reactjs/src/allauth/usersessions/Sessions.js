import { useEffect, useState } from 'react'
import { useConfig } from '../auth'
import * as allauth from '../lib/allauth'
import { Button } from '@mui/material'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Box from '@mui/material/Box'

export default function Sessions () {
  const config = useConfig()
  const [sessions, setSessions] = useState([])
  const [response, setResponse] = useState({ fetching: false, content: { status: 200, data: [] } })

  useEffect(() => {
    setResponse((r) => { return { ...r, fetching: true } })
    allauth.getSessions().then((resp) => {
      if (resp.status === 200) {
        setSessions(resp.data)
      }
    }).then(() => {
      setResponse((r) => { return { ...r, fetching: false } })
    })
  }, [])

  const otherSessions = sessions.filter(session => !session.is_current)

  function logout (sessions) {
    setResponse({ ...response, fetching: true })
    allauth.endSessions(sessions.map(s => s.id)).then((resp) => {
      setResponse((r) => { return { ...r, content: resp } })
      if (resp.status === 200) {
        setSessions(resp.data)
      }
    }).catch((e) => {
      console.error(e)
      window.alert(e)
    }).then(() => {
      setResponse((r) => { return { ...r, fetching: false } })
    })
  }

  return (
    <Box mt={8} p={1}>
      <h1>Sessions</h1>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Started At</TableCell>
            <TableCell>IP Address</TableCell>
            <TableCell>Browser</TableCell>
            {config.data.usersessions.track_activity ? <TableCell>Last Seen At</TableCell> : null}
            <TableCell>Current</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sessions.map((session, i) => {
            return (
              <TableRow key={i}>
                <TableCell>{new Date(session.created_at).toLocaleString()}</TableCell>
                <TableCell>{session.ip}</TableCell>
                <TableCell>{session.user_agent}</TableCell>
                {config.data.usersessions.Hantrack_activity ? <TableCell>{session.last_seen_at}</TableCell> : null}
                <TableCell>{session.is_current ? '⭐' : ''}</TableCell>
                <TableCell><Button onClick={() => logout([session])}>Logout</Button></TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <Button disabled={otherSessions.length <= 1} onClick={() => logout(otherSessions)}>Logout elsewhere</Button>

    </Box>
  )
}
