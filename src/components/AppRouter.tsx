import { FC, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LandingPage } from './LandingPage/LandingPage'
import { useSocket } from '../hooks/context/useSocket'
import { AuthenticationGuard } from './AuthenticationGuard'
import { GameWrapper, HowToPlay, PrivateGameLoading, Queue } from './lazy-components'
import { LoadingScreen } from './lib/LoadingScreen/LoadingScreen'
import { useClockSynchronizer } from '../hooks/useClockSynchronizer'
import config from '../config'
import { LandingPagePreferencesSetter } from './PreferencesSetter/LandingPagePreferencesSetterWrapper/LandingPagePreferencesSetter'

export const AppRouter: FC = () => {
    const { socket } = useSocket()
    const [authenticated, setAuthenticated] = useState(false)
    const { STORAGE: storage } = config
    useClockSynchronizer()
    
    useEffect(() => {
        socket.on('connect', () => {
            socket.emit('authenticate', { token: storage.getItem('rmAuth') }, ({ token }: { token: string }) => {
                storage.setItem('rmAuth', token)
                setAuthenticated(true)
            })
        })
        socket.on('disconnect', () => {
            window.location.href = '/'
        })
        socket.connect()
        return () => {
            socket.off('connect')
            socket.off('disconnect')
            socket.disconnect()
        }
    }, [])
    
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/queue" element={
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
                <Route path="/preferences" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <LandingPagePreferencesSetter />
                    </Suspense>
                } />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    )
}
