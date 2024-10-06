import { useEffect, useState } from 'react'
import * as allauth from '../lib/allauth'
import ProviderList from './ProviderList'

export default function ProviderConnectButtons () {
  const [accounts, setAccounts] = useState([])

  useEffect(() => {
    allauth.getProviderAccounts().then((resp) => {
      if (resp.status === 200) {
        setAccounts(resp.data)
      }
    })
  }, [])

  return <ProviderList callbackURL="/account/provider/callback" accounts={accounts}
                       process={allauth.AuthProcess.CONNECT}/>

}
