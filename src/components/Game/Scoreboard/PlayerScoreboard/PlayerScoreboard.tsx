import { memo } from 'react'
import cn from 'classnames'

interface PlayerScoreboardProps {
    score: number
}

export const PlayerScoreboard = memo<PlayerScoreboardProps>(({ score }) => {
    return (
        <div className={cn('player-scoreboard-wrapper')}>
            <div className={cn('score')}>
                {score}
            </div>
        </div>
    )
})
