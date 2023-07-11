import { FC, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LandingPage } from './LandingPage/LandingPage'
import { Queue } from './Queue/Queue'
import { HowToPlay } from './HowToPlay/HowToPlay'
import { useSocket } from '../hooks/useSocket'
import { GameWrapper } from './Game/GameWrapper/GameWrapper'

const storage = process.env.NODE_ENV === 'development' ? sessionStorage : localStorage

export const AppRouter: FC = () => {
    const { socket } = useSocket()
    
    useEffect(() => {
        socket.connect()
        socket.on('connect', () => {
            socket.emit('authenticate', { token: storage.getItem('rmAuth') })
        })
        socket.on('authenticated', ({ token }) => {
            storage.setItem('rmAuth', token)
        })
        return () => {
            socket.off('connect')
            socket.off('authenticated')
            socket.disconnect()
        }
    }, [])
    
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/queue" element={<Queue />} />
                <Route path="/game/:gameId" element={<GameWrapper />} />
                <Route path="/how-to-play" element={<HowToPlay />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    )
}
