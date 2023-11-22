import { FC, useEffect, useState } from 'react'
import { useSocket } from '../hooks/context/useSocket'
import { useClockSynchronizer } from '../hooks/useClockSynchronizer'
import config from '../config'
import { AppRouter } from './AppRouter'
import { ErrorBoundary, Provider as RollbarProvider } from '@rollbar/react'
import CookieToast from './CookieToast/CookieToast'
import Rollbar from 'rollbar'
import { usePreferences } from '../hooks/context/usePreferences'

import './App.scss'

const rollbarConfig = {
    environment: import.meta.env.MODE,
    accessToken: import.meta.env.VITE_ROLLBAR_TOKEN,
}

const rollbar = new Rollbar(rollbarConfig)
rollbar.options.enabled = false

const bc = new BroadcastChannel('multiple-tab-detector')

const ErrorUI: FC = () => (
    <div className="error-screen">
        Something went wrong :(
        <a href="/">
            <button className="primary">Back to Main Menu</button>
        </a>
    </div>
)

export const App: FC = () => {
    const { socket } = useSocket()
    const { setName } = usePreferences()

    const [authenticated, setAuthenticated] = useState(false)
    const [disconnected, setDisconnected] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [multipleTabsOpenError, setMultipleTabsOpenError] = useState(false)
    const { STORAGE: storage } = config

    useClockSynchronizer()
    
    useEffect(() => {
        socket.on('connect', () => {
            setDisconnected(false)
            socket.emit('authenticate', { token: storage.getItem('rmAuth') }, ({ token, message }: { token: string; message: string }) => {
                storage.setItem('rmAuth', token)
                setAuthenticated(true)
                setMessage(message ?? null)
                socket.emit('is_name_set', {}, ({ name }: { name: string }) => {
                    if (name) setName(name)
                })
            })
        })
        socket.on('message', ({ message }) => {
            setMessage(message ?? null)
        })
        socket.on('disconnect', () => {
            setDisconnected(true)
        })
        socket.connect()
        return () => {
            socket.off('connect')
            socket.off('disconnect')
            socket.off('message')
            socket.disconnect()
        }
    }, [])

    useEffect(() => {
        const enableRollbar = () => {
            rollbar.options.enabled = true
        }
        const disableRollbar = () => {
            rollbar.options.enabled = false
        }
        const setOnline = () => setDisconnected(false)
        const setOffline = () => setDisconnected(true)
        window.addEventListener('cookiesaccept', enableRollbar)
        window.addEventListener('cookiesnonaccept', disableRollbar)
        window.addEventListener('online', setOnline)
        window.addEventListener('offline', setOffline)
        return () => {
            window.removeEventListener('cookiesaccept', enableRollbar)
            window.removeEventListener('cookiesnonaccept', disableRollbar)
            window.addEventListener('online', setOnline)
            window.addEventListener('offline', setOffline)
        }
    }, [])

    useEffect(() => {
        if (import.meta.env.MODE === 'production') {
            bc.onmessage = event => {
                if (event.data === 'ping') {
                    bc.postMessage('pong')
                }
                if (event.data === 'pong') {
                    setMultipleTabsOpenError(true)
                }
            }
            bc.postMessage('ping')
        }
    }, [])

    return multipleTabsOpenError ? (
        <div className="error-screen">
            Minechaser is already running in another tab
            <button className="primary" onClick={() => location.reload()}>Retry</button>
        </div>
    ) : (
        <RollbarProvider config={rollbarConfig}>
            <ErrorBoundary fallbackUI={ErrorUI}>
                {disconnected && <div className="disconnected-banner">Server connection lost</div>}
                <AppRouter authenticated={authenticated} message={message} />
                <CookieToast />
            </ErrorBoundary>
        </RollbarProvider>
    )
}
