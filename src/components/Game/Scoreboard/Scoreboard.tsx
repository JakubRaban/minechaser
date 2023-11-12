import { forwardRef, Fragment, memo } from 'react'
import { PlayerScoreboard } from './PlayerScoreboard/PlayerScoreboard'
import { Player, PlayerColor, PlayerColorMapping, Players } from '../../../types/model'
import { ScoreboardElement } from './ScoreboardElement/ScoreboardElement'
import { Stopwatch } from './Stopwatch/Stopwatch'

import './Scoreboard.scss'

interface ScoreboardProps {
    minesLeft: number
    players: Players
    playerColor: PlayerColor
    colorMapping: PlayerColorMapping
    gameStart: Date
    endScheduled: Date | null
    isFinished: boolean
}

export const Scoreboard = memo(forwardRef<HTMLDivElement, ScoreboardProps>(({ minesLeft, players, playerColor, colorMapping, gameStart, endScheduled, isFinished }, ref) => {
    const playerEntries = Object.entries(players) as [PlayerColor, Player][]

    return (
        <div className="scoreboard-wrapper">
            <div className="scoreboard" ref={ref}>
                <ScoreboardElement label="time" className="stopwatch">
                    <Stopwatch timestampAtZero={gameStart} isActive={!isFinished} endScheduled={endScheduled} />
                </ScoreboardElement>
                <div className="separator" />
                <div className="player-scoreboards">
                    {playerEntries.map(([color, player], i) => (
                        <Fragment key={color}>
                            {i > 0 && i < playerEntries.length && <div className="separator" />}
                            <ScoreboardElement highlight={color === playerColor} label={colorMapping[color]!} color={color} backdrop={!player.alive} className="player-scoreboard">
                                <PlayerScoreboard key={color} score={player.score} />
                            </ScoreboardElement>
                        </Fragment>
                    ))}
                </div>
                <div className="separator" />
                <ScoreboardElement label="mines" className="mines-counter">
                    {minesLeft}
                </ScoreboardElement>
            </div>
        </div>
    )
}))
