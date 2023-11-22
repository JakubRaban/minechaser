import { FC } from 'react'
import { Link } from 'react-router-dom'
import { useKeyMap } from '../../hooks/useKeyMap'
import { DoublePointsBonusIcon } from '../../icons/bonus/DoublePointsBonusIcon/DoublePointsBonusIcon'
import { FreezeBonusIcon } from '../../icons/bonus/FreezeBonusIcon/FreezeBonusIcon'
import { bonusDescriptions, bonusDisplayedNames } from '../../helpers'
import disappear from '/images/disappear.png'

import './HowToPlay.scss'

const HowToPlay: FC = () => {
    const { KeyD, KeyW, KeyS, KeyA } = useKeyMap()
    
    return (
        <div className="how-to-play-page">
            <h1>Minechaser Rules</h1>
            <p>Minechaser is a Minesweeper-inspired game where you get a chance to actually walk on the minefield &mdash; one hasty step and it might be over!</p>

            <h2>Objective</h2>
            <p>Gain more points than your opponents by flagging cells with mines and stay alive until all the mines are cleared.</p>

            <h2>Controls</h2>
            <p>There are only two types of action you can perform:</p>
            <ul>
                <li><strong>Move to a neighboring cell</strong> using arrow keys on desktop or on-screen arrows on mobile devices</li>
                <li><strong>Flag a neighboring cell</strong> using <kbd>{KeyW}{KeyA}{KeyS}{KeyD}</kbd> buttons on desktop or a flag button followed by an arrow for mobile devices.</li>
            </ul>
            <p>
                Additionally, you can invert the controls for the desktop &ndash; just mark the &quot;Invert Keyboard Controls&quot; option in the preferences
                (visible after clicking &quot;Show more options&quot;).
            </p>

            <h2>The Board</h2>
            <p>The board is similar to the one we know from Minesweeper. The mines are placed randomly, with a few exceptions:</p>
            <ul>
                <li>All the 4 corners of the board are always free of mines, allowing players for a soft landing on the minefield</li>
                <li>Every cell with a mine is reachable through cells without a mine, allowing all mines to be safely flagged</li>
            </ul>
            <p>
                The board is wrapped, which means you can move through its edge and move to its other side. If you&apos;re stuck,
                just walk through the edge and you may find a better place to go ahead.
            </p>

            <h2>Scoring</h2>
            <p>The points are awarded based on the number of cells marked with a flag.</p>
            <ul>
                <li>You get 1 point for correctly flagging a mine</li>
                <li>You get an increasing penalty from -1 to -3 points for incorrectly placing a flag, although the penalty starts from the second mistake.</li>
            </ul>

            <h2>Bonuses</h2>
            <p>
                From time to time, bonuses will appear in a random place of the board. Players can collect them by both flagging or stepping on the cell 
                (depending on whether the bonus appeared on a cell with or without a mine). 
                After collecting the bonus, it will take effect for a short period of time, positively affecting the beneficiary or negatively impacting 
                other players. Currently, three types of bonuses exist:
            </p>
            <ul>
                <li>
                    <DoublePointsBonusIcon />
                    <strong>{bonusDisplayedNames.x2}</strong> &ndash; {bonusDescriptions.x2}
                </li>
                <li>
                    <FreezeBonusIcon />
                    <strong>{bonusDisplayedNames.freeze}</strong> &ndash; {bonusDescriptions.freeze}
                </li>
                <li>
                    <img src={disappear} className="bonus-icon" alt="disappear bonus" />
                    <strong>{bonusDisplayedNames.disappear}</strong> &ndash; {bonusDescriptions.disappear}
                </li>
            </ul>

            <h2>End of Game</h2>
            <p>
                The game ends once all the mines are flagged or all the players are eliminated.
                Players who stayed alive until the end of the game are awarded higher positions in the final standings,
                even if they scored less points than the players eliminated earlier on.
            </p>
            <p>
                The game will also come to an end if no flag is correctly placed for 2 minutes.
                In this case, the standings are awarded regardless of whether a player has been eliminated or not.
            </p>

            <div className="action-buttons">
                <Link to="/queue"><button>Play Online</button></Link>
                <Link to="/new-game"><button>Play With Friends</button></Link>
                <Link to="/"><button className="outline">Back to Main Menu</button></Link>
            </div>
        </div>
    )
}

export default HowToPlay
