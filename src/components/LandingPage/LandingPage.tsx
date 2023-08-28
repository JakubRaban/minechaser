import { FC } from 'react'
import { Link } from 'react-router-dom'
import { NameSetter } from './NameSetter/NameSetter'
import { useLocation } from 'react-router'
import { Button } from '../lib/Button/Button'

import './LandingPage.scss'

export const LandingPage: FC = () => {
    const { error } = useLocation().state ?? {}

    return (
        <div className="landing-page">
            <header>
                <h1 className="title">MineChaser</h1>
            </header>
            <main className="grid">
                <div className="menu">
                    <Button text="Play Online" link="/queue" />
                    <Button text="Play With Friends" link="/new-game" />
                    <Button text="Single Player" link="/new-game/single-player" />
                </div>
                <div className="rules">
                    <h2>Quick Rules</h2>
                    <ul>
                        <li>
                            Basic mechanics of this game are the same as in the traditional Minesweeper - for a quick overview you can visit&nbsp;
                            <a href="https://minesweepergame.com/strategy/how-to-play-minesweeper.php">this page</a>
                        </li>
                        <li>
                            Instead of clicking on the board, players move around it using the arrow keys.
                            When you step on a cell, it&apos;s as if you left-clicked it in a Minesweeper game.
                            If you step on a mine, you&apos;re eliminated!
                        </li>
                        <li>
                            Flag an adjacent cell using <kbd>WASD</kbd> keys. You get one point for flagging a cell with a mine.
                            You also get penalty points for flagging a safe cell.
                        </li>
                        <li>
                            Stay alive and gain more points than your opponents to win.
                        </li>
                    </ul>
                    <div>You can find detailed rules <Link to="/how-to-play">here</Link></div>
                </div>
            </main>
            <footer>
                (C) Jakub Raban 2023. All rights reserved.
            </footer>
        </div>
    )
}
