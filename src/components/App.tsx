import { FC } from 'react'
import { SocketIOContext } from '../contexts/SocketIOContext'
import { io } from 'socket.io-client'
import config from '../config'
import { AppRouter } from './AppRouter'
import { PreferencesContextProvider } from '../contexts/PreferencesContext'
import { TimeOffsetContextProvider } from '../contexts/TimeOffsetContext'
import { ErrorBoundary, Provider } from '@rollbar/react'

import './App.scss'

const rollbarConfig = {
    accessToken: import.meta.env.VITE_ROLLBAR_TOKEN,
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

export const App: FC = () =>
    <Provider config={rollbarConfig}>
        <ErrorBoundary fallbackUI={ErrorUI}>
            <SocketIOContext.Provider value={{ socket: io(config.SERVER_URL, { autoConnect: false, closeOnBeforeunload: false }) }}>
                <PreferencesContextProvider>
                    <TimeOffsetContextProvider>
                        <AppRouter />
                    </TimeOffsetContextProvider>
                </PreferencesContextProvider>
            </SocketIOContext.Provider>
        </ErrorBoundary>
    </Provider>
