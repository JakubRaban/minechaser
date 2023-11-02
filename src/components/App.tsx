import { FC, useEffect, useState } from 'react'
import { SocketIOContext } from '../contexts/SocketIOContext'
import { io } from 'socket.io-client'
import config from '../config'
import { AppRouter } from './AppRouter'
import { PreferencesContextProvider } from '../contexts/PreferencesContext'
import { TimeOffsetContextProvider } from '../contexts/TimeOffsetContext'
import { ErrorBoundary, Provider as RollbarProvider } from '@rollbar/react'

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
    const [useRollbar, setUseRollbar] = useState(false)

    useEffect(() => {
        const enableRollbar = () => {
            console.log('accepted use rollbar')
            setUseRollbar(true)
        }
        const disableRollbar = () => {
            console.log('disabled rollbar')
            setUseRollbar(false)
        }
        window.addEventListener('cookiesaccept', enableRollbar)
        window.addEventListener('cookiesnonaccept', disableRollbar)
        return () => {
            window.removeEventListener('cookiesaccept', enableRollbar)
            window.removeEventListener('cookiesnonaccept', disableRollbar)
        }
    }, [])

    return (
        <RollbarProvider config={useRollbar ? { ...rollbarConfig, accessToken: import.meta.env.VITE_ROLLBAR_TOKEN } : rollbarConfig}>
            <ErrorBoundary fallbackUI={ErrorUI}>
                <SocketIOContext.Provider value={{ socket: io(config.SERVER_URL, { autoConnect: false, closeOnBeforeunload: false }) }}>
                    <PreferencesContextProvider>
                        <TimeOffsetContextProvider>
                            <AppRouter />
                        </TimeOffsetContextProvider>
                    </PreferencesContextProvider>
                </SocketIOContext.Provider>
            </ErrorBoundary>
        </RollbarProvider>
    )
}
