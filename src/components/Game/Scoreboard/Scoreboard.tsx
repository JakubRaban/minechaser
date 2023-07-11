import { FC } from 'react'
import { PlayerScoreboard } from '../PlayerScoreboard/PlayerScoreboard'
import { Player, PlayerColor, Players } from '../../../types/model'

import './Scoreboard.scss'

interface ScoreboardProps {
    minesLeft: number
    players: Players
}

export const Scoreboard: FC<ScoreboardProps> = ({ minesLeft, players }) => {
    const playerEntries = Object.entries(players) as [PlayerColor, Player][]

    return (
        <div className="scoreboard">
            <div className="stopwatch">50</div>
            {playerEntries.map(([color, player]) => (
                <PlayerScoreboard key={color} color={color} player={player} />
            ))}
            <div className="mines-counter">{minesLeft}</div>
        </div>
    )
}
