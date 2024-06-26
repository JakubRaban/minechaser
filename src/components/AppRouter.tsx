import { memo, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LandingPage } from './LandingPage/LandingPage'
import { AuthenticationGuard } from './AuthenticationGuard'
import { GameWrapper, HowToPlay, PrivacyPolicyPage, PrivateGameLoading, Queue } from './lazy-components'
import { LoadingScreen } from './lib/LoadingScreen/LoadingScreen'
import {
    LandingPagePreferencesSetter,
} from './PreferencesSetter/LandingPagePreferencesSetterWrapper/LandingPagePreferencesSetter'

interface AppRouterProps {
    authenticated: boolean
    message: string | null
}

export const AppRouter = memo<AppRouterProps>(({ authenticated, message }) => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage message={message} />} />
                <Route path="/about" element={<LandingPage message={message} showAboutDialog />} />
                <Route path="/contact" element={<LandingPage message={message} showContactDialog />} />
                <Route path="/credits" element={<LandingPage message={message} showCreditsDialog />} />
                <Route path="/queue" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <AuthenticationGuard authenticated={authenticated}>
                            <Queue />
                        </AuthenticationGuard>
                    </Suspense>
                } />
                <Route path="/new-game" element={
                    <Suspense fallback={<LoadingScreen />}>
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
                <Route path="/privacypolicy" element={
                    <Suspense fallback={<LoadingScreen />}>
                        <PrivacyPolicyPage />
                    </Suspense>
                } />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    )
})
