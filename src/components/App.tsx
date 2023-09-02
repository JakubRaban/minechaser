import { FC } from 'react'
import { SocketIOContext } from '../contexts/SocketIOContext'
import { io } from 'socket.io-client'
import config from '../config'
import { AppRouter } from './AppRouter'
import { SettingsContextProvider } from '../contexts/SettingsContext'

export const App: FC = () =>
    <SocketIOContext.Provider value={{ socket: io(config.SERVER_URL, { autoConnect: false, closeOnBeforeunload: false }) }}>
        <SettingsContextProvider>
            <AppRouter />
        </SettingsContextProvider>
    </SocketIOContext.Provider>
