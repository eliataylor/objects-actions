import React, {useEffect, useState} from 'react'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import Home from './screens/Home'
import Layout from './theme/Layout'

import {NAVITEMS} from './object-actions/types/types'
import EntityView from './screens/EntityView'
import EntityList from './screens/EntityList'
import EntityForm from './screens/EntityForm'
import {AnonymousRoute, AuthChangeRedirector, AuthenticatedRoute} from './allauth/auth'
import Login from './allauth/account/Login'
import RequestLoginCode from './allauth/account/RequestLoginCode'
import ConfirmLoginCode from './allauth/account/ConfirmLoginCode'
import Logout from './allauth/account/Logout'
import Signup from './allauth/account/Signup'
import ProviderSignup from './allauth/socialaccount/ProviderSignup'
import ProviderCallback from './allauth/socialaccount/ProviderCallback'
import ChangeEmail from './allauth/account/ChangeEmail'
import ManageProviders from './allauth/socialaccount/ManageProviders'
import VerifyEmail, {loader as verifyEmailLoader} from './allauth/account/VerifyEmail'
import VerificationEmailSent from './allauth/account/VerificationEmailSent'
import RequestPasswordReset from './allauth/account/RequestPasswordReset'
import ChangePassword from './allauth/account/ChangePassword'
import MFAOverview, {loader as mfaOverviewLoader} from './allauth/mfa/MFAOverview'
import ActivateTOTP, {loader as activateTOTPLoader} from './allauth/mfa/ActivateTOTP'
import DeactivateTOTP from './allauth/mfa/DeactivateTOTP'
import RecoveryCodes, {loader as recoveryCodesLoader} from './allauth/mfa/RecoveryCodes'
import AddWebAuthn from './allauth/mfa/AddWebAuthn'
import ReauthenticateWebAuthn from './allauth/mfa/ReauthenticateWebAuthn'
import ListWebAuthn, {loader as listWebAuthnLoader} from './allauth/mfa/ListWebAuthn'
import GenerateRecoveryCodes, {loader as generateRecoveryCodesLoader} from './allauth/mfa/GenerateRecoveryCodes'
import ResetPassword, {loader as resetPasswordLoader} from './allauth/account/ResetPassword'
import AuthenticateTOTP from './allauth/mfa/AuthenticateTOTP'
import AuthenticateRecoveryCodes from './allauth/mfa/AuthenticateRecoveryCodes'
import AuthenticateWebAuthn from './allauth/mfa/AuthenticateWebAuthn'
import ReauthenticateRecoveryCodes from './allauth/mfa/ReauthenticateRecoveryCodes'
import ReauthenticateTOTP from './allauth/mfa/ReauthenticateTOTP'
import Reauthenticate from './allauth/account/Reauthenticate'
import Sessions from './allauth/usersessions/Sessions'
import SmsSigninOrUp from "./allauth/SmsSigninOrUp";
import UserView from "./screens/UserView";
import ReadMe from "./object-actions/docs/ReadMe";
import Privacy from "./screens/Privacy";
import Install from "./object-actions/docs/Install";

function createRouter() {
    const allRoutes = [
        {
            path: '/',
            element: <AuthChangeRedirector><Layout/></AuthChangeRedirector>,
            children: [
                {
                    path: '/',
                    element: <Home/>
                },
                {
                    path: '/account/sms',
                    element: <AnonymousRoute><SmsSigninOrUp/></AnonymousRoute>
                },
                {
                    path: '/account/login',
                    element: <AnonymousRoute><Login/></AnonymousRoute>
                },
                {
                    path: '/account/login/code',
                    element: <AnonymousRoute><RequestLoginCode/></AnonymousRoute>
                },
                {
                    path: '/account/login/code/confirm',
                    element: <AnonymousRoute><ConfirmLoginCode/></AnonymousRoute>
                },
                {
                    path: '/account/email',
                    element: <AuthenticatedRoute><ChangeEmail/></AuthenticatedRoute>
                },
                {
                    path: '/account/logout',
                    element: <Logout/>
                },
                {
                    path: '/account/:provider/callback',
                    element: <ProviderCallback />
                },
                {
                    path: '/account/provider/signup',
                    element: <AnonymousRoute><ProviderSignup/></AnonymousRoute>
                },
                {
                    path: '/account/providers',
                    element: <AuthenticatedRoute><ManageProviders/></AuthenticatedRoute>
                },
                {
                    path: '/account/signup',
                    element: <AnonymousRoute><Signup/></AnonymousRoute>
                },
                {
                    path: '/account/verify-email',
                    element: <VerificationEmailSent/>
                },
                {
                    path: '/account/verify-email/:key',
                    element: <VerifyEmail/>,
                    loader: verifyEmailLoader
                },
                {
                    path: '/account/password/reset',
                    element: <AnonymousRoute><RequestPasswordReset/></AnonymousRoute>
                },
                {
                    path: '/account/password/reset/key/:key',
                    element: <AnonymousRoute><ResetPassword/></AnonymousRoute>,
                    loader: resetPasswordLoader
                },
                {
                    path: '/account/password/change',
                    element: <AuthenticatedRoute><ChangePassword/></AuthenticatedRoute>
                },
                {
                    path: '/account/2fa',
                    element: <AuthenticatedRoute><MFAOverview/></AuthenticatedRoute>,
                    loader: mfaOverviewLoader
                },
                {
                    path: '/account/reauthenticate',
                    element: <AuthenticatedRoute><Reauthenticate/></AuthenticatedRoute>
                },
                {
                    path: '/account/reauthenticate/totp',
                    element: <AuthenticatedRoute><ReauthenticateTOTP/></AuthenticatedRoute>
                },
                {
                    path: '/account/reauthenticate/recovery-codes',
                    element: <AuthenticatedRoute><ReauthenticateRecoveryCodes/></AuthenticatedRoute>
                },
                {
                    path: '/account/reauthenticate/webauthn',
                    element: <AuthenticatedRoute><ReauthenticateWebAuthn/></AuthenticatedRoute>
                },
                {
                    path: '/account/authenticate/totp',
                    element: <AnonymousRoute><AuthenticateTOTP/></AnonymousRoute>
                },
                {
                    path: '/account/authenticate/recovery-codes',
                    element: <AnonymousRoute><AuthenticateRecoveryCodes/></AnonymousRoute>
                },
                {
                    path: '/account/authenticate/webauthn',
                    element: <AnonymousRoute><AuthenticateWebAuthn/></AnonymousRoute>
                },
                {
                    path: '/account/2fa/totp/activate',
                    element: <AuthenticatedRoute><ActivateTOTP/></AuthenticatedRoute>,
                    loader: activateTOTPLoader
                },
                {
                    path: '/account/2fa/totp/deactivate',
                    element: <AuthenticatedRoute><DeactivateTOTP/></AuthenticatedRoute>
                },
                {
                    path: '/account/2fa/recovery-codes',
                    element: <AuthenticatedRoute><RecoveryCodes/></AuthenticatedRoute>,
                    loader: recoveryCodesLoader
                },
                {
                    path: '/account/2fa/recovery-codes/generate',
                    element: <AuthenticatedRoute><GenerateRecoveryCodes/></AuthenticatedRoute>,
                    loader: generateRecoveryCodesLoader
                },
                {
                    path: '/account/2fa/webauthn',
                    element: <AuthenticatedRoute><ListWebAuthn/></AuthenticatedRoute>,
                    loader: listWebAuthnLoader
                },
                {
                    path: '/account/2fa/webauthn/add',
                    element: <AuthenticatedRoute><AddWebAuthn/></AuthenticatedRoute>
                },
                {
                    path: '/account/sessions',
                    element: <AuthenticatedRoute><Sessions/></AuthenticatedRoute>
                }
            ]
        }
    ]

    allRoutes[0].children.push({path: `/users/:uid`, element: <UserView/>})
    NAVITEMS.forEach(item => {
        allRoutes[0].children.push({path: `/${item.segment}`, element: <EntityList showFab={true}/>})
        allRoutes[0].children.push({path: `/${item.segment}/:id`, element: <EntityView />})
        allRoutes[0].children.push({path: `/forms/${item.segment}/:id/edit`, element: <EntityForm/>})
        allRoutes[0].children.push({path: `/forms/${item.segment}/0/add`, element: <EntityForm/>})
    })

    allRoutes[0].children.push({path: `/readme`, element: <ReadMe />}) // legacy route
    allRoutes[0].children.push({path: `/oa/readme`, element: <ReadMe />})
    allRoutes[0].children.push({path: `/oa/install`, element: <Install />})
    allRoutes[0].children.push({path: `/oa/customize`, element: <ReadMe />})
    allRoutes[0].children.push({path: `/oa/extend`, element: <ReadMe />})
    allRoutes[0].children.push({path: `/oa/contribute`, element: <ReadMe />})
    allRoutes[0].children.push({path: `/oa/sponsor`, element: <ReadMe />})
    allRoutes[0].children.push({path: `/oa/source`, element: <ReadMe />})
    allRoutes[0].children.push({path: `/oa/privacy`, element: <Privacy />})

    return createBrowserRouter(allRoutes)
}

export default function Router() {
    // If we create the router globally, the loaders of the routes already trigger
    // even before the <AuthContext/> trigger the initial loading of the auth.
    // state.
    const [router, setRouter] = useState(null)
    useEffect(() => {
        // @ts-ignore
        return setRouter(createRouter())
    }, [])
    return router ? <RouterProvider router={router}/> : null
}
