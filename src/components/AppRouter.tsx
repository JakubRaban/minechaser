import { FC, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LandingPage } from './LandingPage/LandingPage'
import { useSocket } from '../hooks/context/useSocket'
import { AuthenticationGuard } from './AuthenticationGuard'
import { GameWrapper, HowToPlay, PrivateGameLoading, Queue } from './lazy-components'
import { LoadingScreen } from './lib/LoadingScreen/LoadingScreen'
import { ErrorBoundary } from './lib/ErrorBoundary/ErrorBoundary'
import { useClockSynchronizer } from '../hooks/useClockSynchronizer'
import config from '../config'

export const AppRouter: FC = () => {
    const { socket } = useSocket()
    const [authenticated, setAuthenticated] = useState(false)
    const { STORAGE: storage } = config
    useClockSynchronizer()
    
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
        <ErrorBoundary>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/queue" errorElement={<ErrorBoundary />} element={
                        <Suspense fallback={<LoadingScreen />}>
                            <AuthenticationGuard authenticated={authenticated}>
                                <Queue />
                            </AuthenticationGuard>
                        </Suspense>
                    
                    } />
                    <Route path="/new-game" element={
                        <Suspense fallback={<div>Loading...</div>}>
                            <AuthenticationGuard authenticated={authenticated}>
                                <PrivateGameLoading singlePlayer={false} />
                            </AuthenticationGuard>
                        </Suspense>
                    } />
                    <Route path="/new-game/single-player" element={
                        <Suspense fallback={<LoadingScreen />}>
                            <AuthenticationGuard authenticated={authenticated}>
                                <PrivateGameLoading singlePlayer={true} />
                            </AuthenticationGuard>
                        </Suspense>
                    } />
                    <Route path="/game/:gameId" element={
                        <Suspense fallback={<LoadingScreen />}>
                            <AuthenticationGuard authenticated={authenticated}>
                                <GameWrapper />
                            </AuthenticationGuard>
                        </Suspense>
                    } />
                    <Route path="/how-to-play" element={
                        <Suspense fallback={<LoadingScreen />}>
                            <HowToPlay />
                        </Suspense>
                    } />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
    )
}
