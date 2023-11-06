import { Suspense, memo } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LandingPage } from './LandingPage/LandingPage'
import { AuthenticationGuard } from './AuthenticationGuard'
import { GameWrapper, HowToPlay, PrivateGameLoading, Queue, PrivacyPolicyPage } from './lazy-components'
import { LoadingScreen } from './lib/LoadingScreen/LoadingScreen'
import { LandingPagePreferencesSetter } from './PreferencesSetter/LandingPagePreferencesSetterWrapper/LandingPagePreferencesSetter'

interface AppRouterProps {
    authenticated: boolean
}

export const AppRouter = memo<AppRouterProps>(({ authenticated }) => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<LandingPage showAboutDialog />} />
                <Route path="/contact" element={<LandingPage showContactDialog />} />
                <Route path="/credits" element={<LandingPage showCreditsDialog />} />
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
