import { FC, Fragment } from 'react'
import { PlayerScoreboard } from './PlayerScoreboard/PlayerScoreboard'
import { Player, PlayerColor, Players } from '../../../types/model'
import { ScoreboardElement } from './ScoreboardElement/ScoreboardElement'
import { Stopwatch } from './Stopwatch/Stopwatch'

import './Scoreboard.scss'

interface ScoreboardProps {
    minesLeft: number
    players: Players
    gameStart: Date
    endScheduled: Date | null
    isFinished: boolean
}

export const Scoreboard: FC<ScoreboardProps> = ({ minesLeft, players, gameStart, endScheduled, isFinished }) => {
    const playerEntries = Object.entries(players) as [PlayerColor, Player][]

    return (
        <div className="scoreboard">
            <ScoreboardElement label="time" className="stopwatch">
                <Stopwatch timestampAtZero={gameStart} isActive={!isFinished} endScheduled={endScheduled} />
            </ScoreboardElement>
            <div className="separator" />
            {playerEntries.map(([color, player], i) => (
                <Fragment key={color}>
                    <ScoreboardElement label={`Player${i + 1}`} color={color} backdrop={!player.alive} className="player-scoreboard">
                        <PlayerScoreboard key={color} player={player} />
                    </ScoreboardElement>
                    <div className="separator" />
                </Fragment>
            ))}
            <ScoreboardElement label="mines" className="mines-counter">
                {minesLeft}
            </ScoreboardElement>
        </div>
    )
}
