import { useEffect, useState } from 'react'
import * as allauth from '../lib/allauth'
import ProviderList from './ProviderList'
import FormErrors from '../components/FormErrors'
import { Box, Button, Paper } from '@mui/material'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableContainer from '@mui/material/TableContainer'

export default function ManageProviders () {
  const [accounts, setAccounts] = useState([])
  const [response, setResponse] = useState({ fetching: false, content: { status: 200, data: [] } })

  useEffect(() => {
    setResponse((r) => { return { ...r, fetching: true } })
    allauth.getProviderAccounts().then((resp) => {
      if (resp.status === 200) {
        setAccounts(resp.data)
      }
    }).then(() => {
      setResponse((r) => { return { ...r, fetching: false } })
    })
  }, [])

  function disconnect (account) {
    setResponse({ ...response, fetching: true })
    allauth.disconnectProviderAccount(account.provider.id, account.uid).then((resp) => {
      setResponse((r) => { return { ...r, content: resp } })
      if (resp.status === 200) {
        setAccounts(resp.data)
      }
    }).catch((e) => {
      console.error(e)
      window.alert(e)
    }).then(() => {
      setResponse((r) => { return { ...r, fetching: false } })
    })
  }

  return (
    <Box p={1}>
      <h2>My Auth Providers</h2>
      <TableContainer component={Paper}>
        <Table size={'small'}>
          <TableHead>
            <TableRow>
              <TableCell>UID</TableCell>
              <TableCell>Account</TableCell>
              <TableCell>Provider</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map(account => {
              return (
                <TableRow key={account.uid}>
                  <TableCell style={{ wordBreak: 'break-all' }}>{account.uid}</TableCell>
                  <TableCell>{account.display}</TableCell>
                  <TableCell>{account.provider.name}</TableCell>
                  <TableCell>
                    <Button onClick={() => disconnect(account)} disabled={response.fetching}>Disconnect</Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <FormErrors errors={response.content?.errors}/>

      <h2>Connect</h2>
      <ProviderList callbackURL="/account/providers" process={allauth.AuthProcess.CONNECT}/>
    </Box>
  )
}
