import { FC } from 'react'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router'
import { LandingPageButton } from '../lib/LandingPageButton/LandingPageButton'
import { HowToPlay, PrivateGameLoading, Queue } from '../lazy-components'

import './LandingPage.scss'

export const LandingPage: FC = () => {
    const { error } = useLocation().state ?? {}

    return (
        <div className="landing-page">
            <header>
                <h1 className="title">MineChaser</h1>
                <h6 className="subtitle">Where Minesweeper meets Battle Royale</h6>
            </header>
            <main>
                <section className="menu">
                    <LandingPageButton text="Play Online" link="/queue" onHover={Queue.preload} />
                    <LandingPageButton text="Play With Friends" link="/new-game" onHover={PrivateGameLoading.preload} />
                    <LandingPageButton text="Single Player" link="/new-game/single-player" onHover={PrivateGameLoading.preload} />
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
                    <div onMouseEnter={HowToPlay.preload}>You can also check the <Link to="/how-to-play">detailed rules</Link></div>
                </section>
            </main>
            <footer>
                (C) Jakub Raban 2023. All rights reserved.
            </footer>
        </div>
    )
}
