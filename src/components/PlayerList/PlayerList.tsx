import { FC, ReactNode } from 'react'
import cn from 'classnames'
import { PlayerColor as PlayerColorComponent } from '../lib/PlayerColor/PlayerColor'
import { PlayerColor } from '../../types/model'

import './PlayerList.scss'

interface PlayerListProps {
    players: string[]
    currentPlayerName: string
    highlight: boolean
    progressComponent?: ReactNode
}

const colors = ['RED', 'BLUE', 'GREEN', 'YELLOW'] as PlayerColor[]

export const PlayerList: FC<PlayerListProps> = ({ players, currentPlayerName, highlight, progressComponent }) => (
    <div className={cn('player-list-wrapper', { highlight })}>
        {progressComponent}
        <div className={cn('player-list', { pad: !!progressComponent })}>
            {[...Array(4)].map((_, index) => (
                <div key={players[index] || index} className="entry">
                    <PlayerColorComponent color={players[index] ? colors[index] : undefined} />
                    <div className={cn('name', { own: players[index] === currentPlayerName })}>{players[index] ?? ''}</div>
                </div>
            ))}
        </div>
    </div>
)
