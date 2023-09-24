import { FC, lazy } from 'react'

export type Preloadable = ReturnType<typeof lazy> & { preload: () => void }

export const lazyPreload = (factory: () => Promise<{ default: FC }>) => {
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
