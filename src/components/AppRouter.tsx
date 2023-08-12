import { FC, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LandingPage } from './LandingPage/LandingPage'
import { Queue } from './Queue/Queue'
import { HowToPlay } from './HowToPlay/HowToPlay'
import { useSocket } from '../hooks/useSocket'
import { GameWrapper } from './Game/GameWrapper/GameWrapper'
import { AuthenticationGuard } from './AuthenticationGuard'
import { PrivateGameLoading } from './PrivateGameLoading/PrivateGameLoading'

const storage = process.env.NODE_ENV === 'development' ? sessionStorage : localStorage

export const AppRouter: FC = () => {
    const { socket } = useSocket()
    const [authenticated, setAuthenticated] = useState(false)
    
    useEffect(() => {
        socket.connect()
        socket.on('connect', () => {
            socket.emit('authenticate', { token: storage.getItem('rmAuth') }, ({ token }: { token: string }) => {
                storage.setItem('rmAuth', token)
                setAuthenticated(true)
            })
        })
        return () => {
            socket.off('connect')
            socket.disconnect()
        }
    }, [])
    
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/queue" element={
                    <AuthenticationGuard authenticated={authenticated}>
                        <Queue />
                    </AuthenticationGuard>
                } />
                <Route path="/new-game" element={
                    <AuthenticationGuard authenticated={authenticated}>
                        <PrivateGameLoading />
                    </AuthenticationGuard>
                } />
                <Route path="/game/:gameId" element={
                    <AuthenticationGuard authenticated={authenticated}>
                        <GameWrapper />
                    </AuthenticationGuard>
                } />
                <Route path="/how-to-play" element={<HowToPlay />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    )
}
