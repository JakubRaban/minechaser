import { FC } from 'react'
import { Cell as CellType, PlayerColor } from '../../../types/model'
import cn from 'classnames'
import { playerColorToClassName as toClassName } from '../../../helpers'

import './Cell.scss'

interface CellProps {
    cell?: CellType
    playerColor?: PlayerColor
}

export const Cell: FC<CellProps> = ({ cell, playerColor }) => {
    const { hasMine, minesAround, flaggingPlayer, isUncovered, hidePristine } = cell ?? {}
    const uncoveredMine = hasMine && isUncovered
    const className = cn('cell', { ...toClassName(flaggingPlayer, 'flag'), uncovered: isUncovered, mine: uncoveredMine })

    if (!hidePristine && hasMine && !flaggingPlayer && !isUncovered) {
        return (
            <div className={className}>
                |M|
            </div>
        )
    }

    return (
        <div className={className}>
            {isUncovered && (
                hasMine ? 'M' : (minesAround && minesAround > 0 ? minesAround : '')
            )}
            {flaggingPlayer && 'F'}
            <div className={cn('cell-player-overlay', toClassName(playerColor, 'player'))} />
        </div>
    )
}
