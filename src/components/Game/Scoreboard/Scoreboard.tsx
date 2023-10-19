import { forwardRef, Fragment } from 'react'
import { PlayerScoreboard } from './PlayerScoreboard/PlayerScoreboard'
import { Player, PlayerColor, PlayerColorMapping, Players } from '../../../types/model'
import { ScoreboardElement } from './ScoreboardElement/ScoreboardElement'
import { Stopwatch } from './Stopwatch/Stopwatch'
import { usePreferences } from '../../../hooks/context/usePreferences'

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

export const Scoreboard = forwardRef<HTMLDivElement, ScoreboardProps>(({ minesLeft, players, playerColor, colorMapping, gameStart, endScheduled, isFinished }, ref) => {
    const playerEntries = Object.entries(players) as [PlayerColor, Player][]
    const { colorBlindMode } = usePreferences()

    return (
        <div className="scoreboard-wrapper" ref={ref}>
            <div className="scoreboard">
                <ScoreboardElement label="time" className="stopwatch">
                    <Stopwatch timestampAtZero={gameStart} isActive={!isFinished} endScheduled={endScheduled} />
                </ScoreboardElement>
                <div className="separator" />
                {playerEntries.map(([color, player]) => (
                    <Fragment key={color}>
                        <ScoreboardElement highlight={color === playerColor} label={colorMapping[color]!} color={color} backdrop={!colorBlindMode && !player.alive} className="player-scoreboard">
                            <PlayerScoreboard key={color} player={player} />
                        </ScoreboardElement>
                        <div className="separator" />
                    </Fragment>
                ))}
                <ScoreboardElement label="mines" className="mines-counter">
                    {minesLeft}
                </ScoreboardElement>
            </div>
        </div>
    )
})
