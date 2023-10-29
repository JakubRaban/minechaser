import { FC, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router'
import { LandingPageButton } from '../lib/LandingPageButton/LandingPageButton'
import { HowToPlay, PrivateGameLoading, Queue } from '../lazy-components'
import { usePreload } from '../../hooks/usePreload'
import { useKeyMap } from '../../hooks/useKeyMap'
import { usePreferences } from '../../hooks/context/usePreferences'
import { ExternalPageIcon } from '../../icons/ExternalPage/ExternalPageIcon'

import './LandingPage.scss'

const StatusToast = lazy(() => import('./StatusToast/StatusToast'))

export const LandingPage: FC = () => {
    const { error, success } = useLocation().state ?? {}
    usePreload(Queue, PrivateGameLoading, HowToPlay)
    const { showOnScreenControls: isMobile, name } = usePreferences()
    const { KeyD, KeyW, KeyS, KeyA } = useKeyMap()

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
                    <div className="grid">
                        <LandingPageButton text="Single Player" link="/new-game/single-player" tooltip="Practice the game on your own" />
                        {name && <LandingPageButton text="Preferences" link="/preferences" tooltip="Change your preferences" />}
                    </div>
                </section>
                <section className="rules">
                    <h2>Quick Rules</h2>
                    <ul>
                        <li>
                            Basic mechanics are the same as in the&nbsp;
                            <a href="https://minesweepergame.com/strategy/how-to-play-minesweeper.php" target="_blank" rel="noreferrer">traditional Minesweeper</a>
                            <ExternalPageIcon />
                        </li>
                        <li>
                            Instead of clicking on the board, you start in one of the corners and move around using the {isMobile ? 'on-screen arrow buttons' : 'arrow keys'}.
                        </li>
                        <li>
                            Stepping on a cell is like left-clicking it in Minesweeper.
                            If you step on a mine, you&apos;re eliminated!
                        </li>
                        <li>
                            {isMobile ? <>You can only flag adjacent cells using the &quot;flag&quot; button followed by an arrow button. </> : <>You can only flag adjacent cells using <kbd>{`${KeyW}${KeyA}${KeyS}${KeyD}`}</kbd> keys. </>}
                            You get points for flagging a cell with a mine.
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
            {(error || success) && <Suspense><StatusToast error={error} success={success} /></Suspense>}
        </div>
    )
}
