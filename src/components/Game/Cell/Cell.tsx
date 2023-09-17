import { useState, memo, useEffect, useLayoutEffect } from 'react'
import { Cell as CellType, PlayerColor } from '../../../types/model'
import cn from 'classnames'
import { playerColorToClassName as toClassName } from '../../../helpers'
import { FlagIcon } from '../../../icons/Flag/FlagIcon'
import { MineIcon } from '../../../icons/Mine/MineIcon'
import { EventDef } from '../../../hooks/useGameState'

import './Cell.scss'

interface CellProps {
    cell?: CellType
    steppingPlayerColor?: PlayerColor
    event?: EventDef
}

export const Cell = memo<CellProps>(({ cell, steppingPlayerColor, event }) => {
    const { hasMine, minesAround, flaggingPlayer, isUncovered, hidePristine } = cell ?? {}
    const uncoveredMine = hasMine && isUncovered
    const className = cn(
        'cell',
        { ...toClassName(flaggingPlayer, 'flag'), [`mines-${minesAround}`]: !!minesAround && !hasMine, uncovered: isUncovered, mine: uncoveredMine },
    )

    const [incorrectFlagColor, setIncorrectFlagColor] = useState<PlayerColor | null>(null)
    const [pointsChange, setPointsChange] = useState<number | null>(null)

    useLayoutEffect(() => {
        setIncorrectFlagColor(null)
        setPointsChange(null)
    }, [event])

    useEffect(() => {
        setPointsChange(event?.pointsChange || null)
        if (event?.type === 'MineFreeCellFlagged') {
            setIncorrectFlagColor(event.originatorColor)
        }
        const timeout = setTimeout(() => {
            setIncorrectFlagColor(null)
            setPointsChange(null)
        }, 1000)
        return () => {
            clearTimeout(timeout)
        }
    }, [event])

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
                {incorrectFlagColor && <FlagIcon fill={incorrectFlagColor} className="incorrect" />}
                {pointsChange && (
                    <div className={cn('points-change', { negative: pointsChange < 0 })}>
                        {pointsChange > 0 ? `+${pointsChange}` : pointsChange}
                    </div>
                )}
                <div className={cn('cell-player-overlay', toClassName(steppingPlayerColor, 'player'))} />
            </div>
        </div>
    )
})
