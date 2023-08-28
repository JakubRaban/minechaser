import { FC } from 'react'
import cn from 'classnames'
import { Player } from '../../../../types/model'

interface PlayerScoreboardProps {
    player: Player
}

export const PlayerScoreboard: FC<PlayerScoreboardProps> = ({ player }) => {
    return (
        <div className={cn('player-scoreboard-wrapper')}>
            <div className={cn('score')}>
                {player.score}
            </div>
        </div>
    )
}
