import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { BonusName, Cell as CellType, PlayerColor } from '../../../types/model'
import cn from 'classnames'
import { FlagIcon } from '../../../icons/Flag/FlagIcon'
import { MineIcon } from '../../../icons/Mine/MineIcon'
import { EventDef } from '../../../hooks/useGameState'
import { usePlayerColorToClassName } from '../../../hooks/usePlayerColorToClassName'
import { FreezeBonusIcon } from '../../../icons/bonus/FreezeBonusIcon/FreezeBonusIcon'
import { DoublePointsBonusIcon } from '../../../icons/bonus/DoublePointsBonusIcon/DoublePointsBonusIcon'
import disappear from '/images/disappear.png'
import tippy from 'tippy.js'

import './Cell.scss'

const bonusDisplayedNames: Record<BonusName, string> = {
    x2: 'Double Points',
    freeze: 'Immobility',
    disappear: 'Invisibility',
}

const bonusDescriptions: Record<BonusName, string> = {
    x2: 'Collecting player receives double the points, whether positive or negative.',
    freeze: 'Opponents of the Collecting Player are unable to move.',
    disappear: 'Position of the opponents of the collecting player is hidden. They can still move around and place flags.',
}

interface CellIconsProps {
    className: string
    bonusName?: BonusName | null
    showMine?: boolean
    flaggingPlayer?: PlayerColor
    incorrectFlagColor?: PlayerColor | null
}

export const CellIcons = memo<CellIconsProps>(({ className, bonusName, showMine, flaggingPlayer, incorrectFlagColor }) => {
    const toClassName = usePlayerColorToClassName()

    useEffect(() => {
        if (bonusName) {
            const instances = tippy(`#icons-${className}`, {
                allowHTML: true,
                content: `<strong>${bonusDisplayedNames[bonusName]}</strong><br />${bonusDescriptions[bonusName]}` })
            return () => instances.forEach(i => i.destroy())
        }
    }, [bonusName, className])
    
    return (
        <div className="cell-icons" id={`icons-${className}`}>
            {showMine ? <MineIcon /> : (
                <>
                    {bonusName === 'freeze' && <FreezeBonusIcon />}
                    {bonusName === 'x2' && <DoublePointsBonusIcon />}
                    {bonusName === 'disappear' && <img src={disappear} alt="disappear bonus" />}
                    {flaggingPlayer && <FlagIcon fillClassName={toClassName(flaggingPlayer)} />}
                    {incorrectFlagColor && <FlagIcon fillClassName={toClassName(incorrectFlagColor)} className="incorrect" />}
                </>
            )}
        </div>
    )
})

interface CellProps {
    cell?: CellType
    steppingPlayersColors?: PlayerColor[]
    event?: EventDef
}

export const Cell = memo<CellProps>(({ cell, steppingPlayersColors, event }) => {
    const { hasMine, minesAround, flaggingPlayer, isUncovered, hidePristine, bonus } = cell ?? {}
    const uncoveredMine = hasMine && isUncovered
    
    const toClassNameFlag = usePlayerColorToClassName('flag')
    const toClassNamePlayer = usePlayerColorToClassName('player')
    const cellClassName = `cell-${cell?.position[0]}-${cell?.position[1]}`
    const className = cn(
        'cell',
        {
            [cellClassName]: !!cell,
            [`mines-${minesAround}`]: !!minesAround && !hasMine,
            uncovered: isUncovered,
            mine: uncoveredMine,
            bonus: bonus && !hasMine,
            ...toClassNameFlag(flaggingPlayer),
        },
    )
    const cellRef = useRef<HTMLDivElement>(null)

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
                cellRef.current!.style.setProperty(
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
        <div className={className} ref={cellRef}>
            <CellIcons
                className={cellClassName}
                showMine={isUncovered && hasMine}
                bonusName={bonus?.name}
                flaggingPlayer={flaggingPlayer}
                incorrectFlagColor={incorrectFlagColor}
            />
            <div className="cell-content">
                {isUncovered && !hasMine && (minesAround && minesAround > 0 ? minesAround : '')}
                {pointsChange && (
                    <div className={cn('points-change', { negative: pointsChange < 0 })}>
                        {pointsChange > 0 ? `+${pointsChange}` : pointsChange}
                    </div>
                )}
            </div>
            <div className={cn(
                'cell-player-overlay',
                { [`players-${steppingPlayersColors?.length}`]: steppingPlayersColors?.length },
                ...(steppingPlayersColors?.map(toClassNamePlayer) || []))}
            />
        </div>
    )
})
