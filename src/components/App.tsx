import { FC, useEffect, useState } from 'react'
import { useSocket } from '../hooks/context/useSocket'
import { useClockSynchronizer } from '../hooks/useClockSynchronizer'
import config from '../config'
import { AppRouter } from './AppRouter'
import { ErrorBoundary, Provider as RollbarProvider } from '@rollbar/react'
import CookieToast from './CookieToast/CookieToast'

import './App.scss'

const rollbarConfig = {
    environment: import.meta.env.MODE,
}

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
    
    const [useRollbar, setUseRollbar] = useState(false)
    const [authenticated, setAuthenticated] = useState(false)
    const [disconnected, setDisconnected] = useState(false)
    const { STORAGE: storage } = config
    
    useClockSynchronizer()
    
    useEffect(() => {
        socket.on('connect', () => {
            setDisconnected(false)
            socket.emit('authenticate', { token: storage.getItem('rmAuth') }, ({ token }: { token: string }) => {
                storage.setItem('rmAuth', token)
                setAuthenticated(true)
            })
        })
        socket.on('disconnect', () => {
            setDisconnected(true)
        })
        socket.connect()
        return () => {
            socket.off('connect')
            socket.off('disconnect')
            socket.disconnect()
        }
    }, [])

    useEffect(() => {
        const enableRollbar = () => {
            console.log('accepted use rollbar')
            setUseRollbar(true)
        }
        const disableRollbar = () => {
            console.log('disabled rollbar')
            setUseRollbar(false)
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

    return (
        <RollbarProvider config={useRollbar ? { ...rollbarConfig, accessToken: import.meta.env.VITE_ROLLBAR_TOKEN } : rollbarConfig}>
            <ErrorBoundary fallbackUI={ErrorUI}>
                {disconnected && <div className="disconnected-banner">Server connection lost</div>}
                <AppRouter authenticated={authenticated} />
                <CookieToast />
            </ErrorBoundary>
        </RollbarProvider>
    )
}
