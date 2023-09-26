import { FC } from 'react'
import { SocketIOContext } from '../contexts/SocketIOContext'
import { io } from 'socket.io-client'
import config from '../config'
import { AppRouter } from './AppRouter'
import { PreferencesContextProvider } from '../contexts/PreferencesContext'

export const App: FC = () =>
    <SocketIOContext.Provider value={{ socket: io(config.SERVER_URL, { autoConnect: false, closeOnBeforeunload: false }) }}>
        <PreferencesContextProvider>
            <AppRouter />
        </PreferencesContextProvider>
    </SocketIOContext.Provider>
