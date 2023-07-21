import { FC } from 'react'
import { Cell as CellType, PlayerColor } from '../../../types/model'
import cn from 'classnames'
import { playerColorToClassName as toClassName } from '../../../helpers'
import { FlagIcon } from '../../../icons/Flag/FlagIcon'
import { MineIcon } from '../../../icons/Mine/MineIcon'

import './Cell.scss'

interface CellProps {
    cell?: CellType
    playerColor?: PlayerColor
}

export const Cell: FC<CellProps> = ({ cell, playerColor }) => {
    const { hasMine, minesAround, flaggingPlayer, isUncovered, hidePristine } = cell ?? {}
    const uncoveredMine = hasMine && isUncovered
    const className = cn(
        'cell',
        { ...toClassName(flaggingPlayer, 'flag'), [`mines-${minesAround}`]: !!minesAround && !hasMine, uncovered: isUncovered, mine: uncoveredMine },
    )

    if (!hidePristine && hasMine && !flaggingPlayer && !isUncovered) {
        return (
            <div className={className}>
                <MineIcon />
            </div>
        )
    }

    return (
        <div className={className}>
            {isUncovered && hasMine && <MineIcon />}
            <div className="cell-content">
                {isUncovered && !hasMine && (minesAround && minesAround > 0 ? minesAround : '')}
                {flaggingPlayer && <FlagIcon fill={flaggingPlayer} />}
                <div className={cn('cell-player-overlay', toClassName(playerColor, 'player'))} />
            </div>
        </div>
    )
}
