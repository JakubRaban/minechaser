import { FC } from 'react'
import { PlayerColor as PlayerColorType } from '../../../types/model'
import cn from 'classnames'
import { usePlayerColorToClassName } from '../../../hooks/usePlayerColorToClassName'

import './PlayerColor.scss'

interface PlayerColorProps {
    color?: PlayerColorType
}

export const PlayerColor: FC<PlayerColorProps> = ({ color }) => {
    const playerColorToClassName = usePlayerColorToClassName()
    
    return <div className={cn('player-color', playerColorToClassName(color))} />
}
