import { FC, lazy } from 'react'

export type Preloadable = ReturnType<typeof lazy> & { preload: () => void }

const lazyPreload = (factory: () => Promise<{ default: FC<any> }>) => {
    const Component = lazy(factory) as Preloadable
    Component.preload = factory
    return Component
}

export const Queue = lazyPreload(() => import('./Queue/Queue'))
export const Game = lazyPreload(() => import('./Game/Game'))
export const PrivateGameLoading = lazyPreload(() => import('./PrivateGameLoading/PrivateGameLoading'))
export const GameWrapper = lazyPreload(() => import('./Game/GameWrapper/GameWrapper'))
export const HowToPlay = lazyPreload(() => import('./HowToPlay/HowToPlay'))
export const GameSummary = lazyPreload(() => import('./GameSummary/GameSummary'))
export const ShareDialog = lazyPreload(() => import('./ShareDialog/ShareDialog'))
export const AboutDialog = lazyPreload(() => import('./LandingPage/AboutDialog/AboutDialog'))
export const ContactDialog = lazyPreload(() => import('./LandingPage/ContactDialog/ContactDialog'))
export const PrivacyPolicyPage = lazyPreload(() => import('./PrivacyPolicyPage/PrivacyPolicyPage'))
