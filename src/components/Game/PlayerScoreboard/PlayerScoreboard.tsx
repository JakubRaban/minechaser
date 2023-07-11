import { FC } from 'react'
import cn from 'classnames'
import { Player, PlayerColor } from '../../../types/model'
import { playerColorToClassName } from '../../../helpers'

import './PlayerScoreboard.scss'

interface PlayerScoreboardProps {
    color: PlayerColor
    player: Player
}

export const PlayerScoreboard: FC<PlayerScoreboardProps> = ({ color, player }) => {
    return (
        <div className="player-scoreboard">
            <div className={cn('score', playerColorToClassName(color))}>{player.score}</div>
        </div>
    )    
}
