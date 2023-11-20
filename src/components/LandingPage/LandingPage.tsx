import { FC, lazy, Suspense, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router'
import { LandingPageButton } from '../lib/LandingPageButton/LandingPageButton'
import { AboutDialog, ContactDialog, CreditsDialog, HowToPlay, PrivateGameLoading, Queue } from '../lazy-components'
import { usePreload } from '../../hooks/usePreload'
import { useKeyMap } from '../../hooks/useKeyMap'
import { usePreferences } from '../../hooks/context/usePreferences'
import { ExternalPageIcon } from '../../icons/ExternalPage/ExternalPageIcon'
import { useAudio } from '../../hooks/context/useAudio'

import './LandingPage.scss'

const StatusToast = lazy(() => import('./StatusToast/StatusToast'))

interface LandingPageProps {
    message: string | null
    showAboutDialog?: boolean
    showContactDialog?: boolean
    showCreditsDialog?: boolean
}

export const LandingPage: FC<LandingPageProps> = ({ message, showAboutDialog, showContactDialog, showCreditsDialog }) => {
    const { error, success } = useLocation().state ?? {}
    const { showOnScreenControls: isMobile, name } = usePreferences()
    const { KeyD, KeyW, KeyS, KeyA } = useKeyMap()
    const { playMenuMusic } = useAudio()
    usePreload(Queue, PrivateGameLoading, HowToPlay)

    useEffect(() => {
        const t = setTimeout(playMenuMusic, 500)
        return () => clearTimeout(t)
    }, [])

    return (
        <div className="landing-page">
            {message && <div className="message">{message}</div>}
            <header>
                <h1 className="title">Minechaser</h1>
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
                            The board and mines are generated the same way as in the&nbsp;
                            <a href="https://minesweepergame.com/strategy/how-to-play-minesweeper.php" target="_blank" rel="noreferrer">
                                traditional Minesweeper
                                <ExternalPageIcon />
                            </a>
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
                    <div>For more details, you can check <Link to="/how-to-play">the Rules page</Link></div>
                </section>
            </main>
            <footer>
                <span>
                    &copy; 2023{new Date().getFullYear() > 2023 && `-${new Date().getFullYear()}`}&nbsp;
                    <Link to="/about">Jakub Raban</Link>. All Rights Reserved.
                </span>
                <span><Link to="/privacypolicy">Privacy Policy</Link></span>
                <span><Link to="/contact">Feedback/Report an Issue</Link></span>
                <span><Link to="/credits">Credits</Link></span>
            </footer>
            {(error || success) && <Suspense><StatusToast error={error} success={success} /></Suspense>}
            {showAboutDialog && <Suspense><AboutDialog /></Suspense>}
            {showContactDialog && <Suspense><ContactDialog /></Suspense>}
            {showCreditsDialog && <Suspense><CreditsDialog /></Suspense>}
        </div>
    )
}
