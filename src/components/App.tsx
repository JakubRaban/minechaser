import { FC } from 'react'
import { SocketIOContext } from '../contexts/SocketIOContext'
import { io } from 'socket.io-client'
import config from '../config'
import { AppRouter } from './AppRouter'

export const App: FC = () =>
    <SocketIOContext.Provider value={{ socket: io(config.SERVER_URL, { autoConnect: false, closeOnBeforeunload: true }) }}>
        <AppRouter />
    </SocketIOContext.Provider>
