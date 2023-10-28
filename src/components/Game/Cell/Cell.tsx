import { useState, memo, useEffect, useLayoutEffect } from 'react'
import { Cell as CellType, PlayerColor } from '../../../types/model'
import cn from 'classnames'
import { FlagIcon } from '../../../icons/Flag/FlagIcon'
import { MineIcon } from '../../../icons/Mine/MineIcon'
import { EventDef } from '../../../hooks/useGameState'
import { usePlayerColorToClassName } from '../../../hooks/usePlayerColorToClassName'

import './Cell.scss'

interface CellProps {
    cell?: CellType
    steppingPlayersColors?: PlayerColor[]
    event?: EventDef
}

export const Cell = memo<CellProps>(({ cell, steppingPlayersColors, event }) => {
    const { hasMine, minesAround, flaggingPlayer, isUncovered, hidePristine } = cell ?? {}
    const uncoveredMine = hasMine && isUncovered

    const toClassName = usePlayerColorToClassName()
    const toClassNameFlag = usePlayerColorToClassName('flag')
    const toClassNamePlayer = usePlayerColorToClassName('player')
    const cellClassName = `cell-${cell?.position[0]}-${cell?.position[1]}`
    const className = cn(
        'cell',
        { [cellClassName]: !!cell },
        { ...toClassNameFlag(flaggingPlayer), [`mines-${minesAround}`]: !!minesAround && !hasMine, uncovered: isUncovered, mine: uncoveredMine },
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

    useEffect(() => {
        if ((steppingPlayersColors?.length || 0) > 1) {
            steppingPlayersColors!.forEach((color, index) => {
                (document.querySelector(`.${cellClassName}`) as HTMLElement).style.setProperty(
                    `--player-${index + 1}-color`,
                    getComputedStyle(document.documentElement).getPropertyValue(`--player-${color.toLowerCase()}`),
                )
            })
        }
    }, [steppingPlayersColors])

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
                {flaggingPlayer && <FlagIcon fillClassName={toClassName(flaggingPlayer)} />}
                {incorrectFlagColor && <FlagIcon fillClassName={toClassName(incorrectFlagColor)} className="incorrect" />}
                {pointsChange && (
                    <div className={cn('points-change', { negative: pointsChange < 0 })}>
                        {pointsChange > 0 ? `+${pointsChange}` : pointsChange}
                    </div>
                )}
                <div className={cn(
                    'cell-player-overlay',
                    { [`players-${steppingPlayersColors?.length}`]: steppingPlayersColors?.length },
                    ...(steppingPlayersColors?.map(toClassNamePlayer) || []))}
                />
            </div>
        </div>
    )
})
