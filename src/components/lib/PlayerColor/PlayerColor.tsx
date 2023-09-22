import { FC } from 'react'
import { PlayerColor as PlayerColorType } from '../../../types/model'
import cn from 'classnames'
import { playerColorToClassName } from '../../../helpers'

import './PlayerColor.scss'

interface PlayerColorProps {
    color?: PlayerColorType
}

export const PlayerColor: FC<PlayerColorProps> = ({ color }) => (
    <div className={cn('player-color', playerColorToClassName(color))} />
)
