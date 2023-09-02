import { FC, ReactNode } from 'react'
import cn from 'classnames'

import './PlayerList.scss'

interface PlayerListProps {
    players: string[]
    currentPlayer: string
    highlight: boolean
    progressComponent: ReactNode
}

const colors = ['red', 'blue', 'green', 'yellow']

export const PlayerList: FC<PlayerListProps> = ({ players, currentPlayer, highlight, progressComponent }) => (
    <div className={cn('player-list-wrapper', { highlight })}>
        {progressComponent}
        <div className="player-list">
            {[...Array(4)].map((_, index) => (
                <div key={players[index] || index} className="entry">
                    <div className={cn('color', { [colors[index]]: !!players[index] })} />
                    <div className={cn('name', { own: players[index] === currentPlayer })}>{players[index] ?? ''}</div>
                </div>
            ))}
        </div>
    </div>
)
