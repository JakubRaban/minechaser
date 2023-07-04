import { FC, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LandingPage } from './LandingPage/LandingPage'
import { Queue } from './game/Queue/Queue'
import { Game } from './game/Game/Game'
import { HowToPlay } from './HowToPlay/HowToPlay'
import { useSocket } from '../hooks/useSocket'

export const AppRouter: FC = () => {
    const { socket } = useSocket()
    
    useEffect(() => {
        socket.connect()
        return () => {
            socket.disconnect()
        }
    }, [])
    
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/queue" element={<Queue />} />
                <Route path="/game/:gameId" element={<Game />} />
                <Route path="/how-to-play" element={<HowToPlay />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    )
}