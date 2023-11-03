import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { io } from 'socket.io-client'
import { App } from './components/App'
import config from './config'
import { PreferencesContextProvider } from './contexts/PreferencesContext'
import { SocketIOContext } from './contexts/SocketIOContext'
import { TimeOffsetContextProvider } from './contexts/TimeOffsetContext'

import './styles/setup.scss'

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(
    // <StrictMode>
    <SocketIOContext.Provider value={{ socket: io(config.SERVER_URL, { autoConnect: false, closeOnBeforeunload: false }) }}>
        <PreferencesContextProvider>
            <TimeOffsetContextProvider>
                <App />
            </TimeOffsetContextProvider>
        </PreferencesContextProvider>
    </SocketIOContext.Provider>,
)
