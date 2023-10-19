import { forwardRef, Fragment, useEffect, useLayoutEffect, useState } from 'react'
import { PlayerScoreboard } from './PlayerScoreboard/PlayerScoreboard'
import { Player, PlayerColor, PlayerColorMapping, Players } from '../../../types/model'
import { ScoreboardElement } from './ScoreboardElement/ScoreboardElement'
import { Stopwatch } from './Stopwatch/Stopwatch'
import { Link } from 'react-router-dom'
import { usePreferences } from '../../../hooks/context/usePreferences'

import './Scoreboard.scss'

interface ScoreboardProps {
    minesLeft: number
    players: Players
    playerColor: PlayerColor
    isPrivate: boolean
    isSinglePlayer: boolean
    colorMapping: PlayerColorMapping
    gameStart: Date
    endScheduled: Date | null
    isFinished: boolean
}

export const Scoreboard = forwardRef<HTMLDivElement, ScoreboardProps>(({ minesLeft, players, playerColor, isPrivate, isSinglePlayer, colorMapping, gameStart, endScheduled, isFinished }, ref) => {
    const playerEntries = Object.entries(players) as [PlayerColor, Player][]
    const [showDefeatedMessage, setShowDefeatedMessage] = useState(false)
    const { colorBlindMode } = usePreferences()
    
    useEffect(() => {
        let timeout: NodeJS.Timeout
        if (!players[playerColor]!.alive && Object.values(players).some(p => p.alive)) {
            timeout = setTimeout(() => setShowDefeatedMessage(true), 1000)
        }
        return () => clearTimeout(timeout)
    }, [players])
    
    useLayoutEffect(() => {
        if (showDefeatedMessage) {
            window.dispatchEvent(new Event('resize'))
        }
    }, [showDefeatedMessage])

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
            {showDefeatedMessage && (
                <div className="defeated-player-message">
                    You&apos;re spectating.&nbsp;
                    {!isPrivate && !isSinglePlayer && <Link to="/queue">Play again</Link>}
                    <Link to="/">Main Menu</Link>
                </div>
            )}
        </div>
    )
})
