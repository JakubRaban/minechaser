import { FC, lazy, Suspense, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router'
import { LandingPageButton } from '../lib/LandingPageButton/LandingPageButton'
import { HowToPlay, PrivateGameLoading, Queue } from '../lazy-components'
import { usePreload } from '../../hooks/usePreload'
import { ErrorCode, errorCodeToMessage } from '../../helpers'

const Toaster = lazy(() => import('react-hot-toast').then(module => ({ default: module.Toaster })))

import './LandingPage.scss'

export const LandingPage: FC = () => {
    const { error } = useLocation().state ?? {}
    usePreload(Queue, PrivateGameLoading, HowToPlay)
    const toastId = useRef<string | undefined>()
    
    useEffect(() => {
        const modulePromise = import('react-hot-toast')
        if (error) {
            modulePromise.then(({ toast }) => {
                toastId.current = toast.error(errorCodeToMessage(error as ErrorCode) ?? error)
            })
        }
    }, [error])

    return (
        <div className="landing-page">
            <header>
                <h1 className="title">MineChaser</h1>
                <h6 className="subtitle">Where Minesweeper meets Battle Royale</h6>
            </header>
            <main>
                <section className="menu">
                    <LandingPageButton text="Play Online" link="/queue" tooltip="Join a game with other players on the web" />
                    <LandingPageButton text="Play With Friends" link="/new-game" tooltip="Create a private game for you and your friends with a unique link to join" />
                    <LandingPageButton text="Single Player" link="/new-game/single-player" tooltip="Practice the game on your own" />
                </section>
                <section className="rules">
                    <h2>Quick Rules</h2>
                    <ul>
                        <li>
                            Basic mechanics are the same as in the&nbsp;
                            <a href="https://minesweepergame.com/strategy/how-to-play-minesweeper.php">traditional Minesweeper</a>
                        </li>
                        <li>
                            Instead of clicking on the board, move around it using the arrow keys.
                            Stepping on a cell is like left-clicking it in Minesweeper.
                            If you step on a mine, you&apos;re eliminated!
                        </li>
                        <li>
                            You can only flag adjacent cells using <kbd>WASD</kbd> keys. You get points for flagging a cell with a mine.
                            You also get penalty points for flagging a safe cell.
                        </li>
                        <li>
                            Stay alive and gain more points than your opponents to win!
                        </li>
                    </ul>
                    <div>You can also check the <Link to="/how-to-play">detailed rules</Link></div>
                </section>
            </main>
            <footer>
                (C) Jakub Raban 2023. All rights reserved.
            </footer>
            <Suspense>
                <Toaster position="bottom-center" toastOptions={{ className: 'toast' }} />
            </Suspense>
        </div>
    )
}
