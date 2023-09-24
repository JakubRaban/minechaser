import { FC, useEffect, useRef, useState } from 'react'
import { Cells, PlayerColor, Players, Position } from '../../../types/model'
import { dateDiff, toPositionString } from '../../../helpers'
import { Cell } from '../Cell/Cell'
import { PositionedEvents } from '../../../hooks/useGameState'
import cn from 'classnames'
import { ArrowIcon } from '../../../icons/Arrow/ArrowIcon'
import { usePlayerColorToClassName } from '../../../hooks/usePlayerColorToClassName'

import './CellGrid.scss'

interface CellGridProps {
    dims: Position
    cells: Cells
    players: Players
    playerColor: PlayerColor
    gameStart: Date
    cellSizePx: number
    events: PositionedEvents | null
}

const colorToCorner: Record<PlayerColor, string> = {
    'RED': 'bottom-left',
    'BLUE': 'top-right',
    'GREEN': 'top-left',
    'YELLOW': 'bottom-right',
}

export const CellGrid: FC<CellGridProps> = ({ dims, cells, players, playerColor, gameStart, cellSizePx, events }) => {
    const [height, width] = dims
    const [secondsUntilStart, setSecondsUntilStart] = useState(dateDiff(gameStart, new Date()).seconds)
    const hasStarted = secondsUntilStart <= 0
    const positionToPlayerColor = Object.fromEntries(
        Object.entries(players)
            .filter(([, player]) => player.alive)
            .map(([color, player]) => [toPositionString(player.position), color]),
    ) as Record<string, PlayerColor>
    const interval = useRef<NodeJS.Timeout | null>(null)
    
    const playerColorToClassName = usePlayerColorToClassName()

    useEffect(() => {
        if (!interval.current && secondsUntilStart > 0) {
            interval.current = setInterval(() => {
                setSecondsUntilStart(dateDiff(gameStart, new Date()).seconds)
            }, 200)
        } else if (secondsUntilStart <= 0) {
            clearInterval(interval.current!)
        }
        return () => {
            if (secondsUntilStart <= 0) clearInterval(interval.current!)
        }
    }, [secondsUntilStart])

    useEffect(() => {
        document.documentElement.style.setProperty('--board-cols', `${width}`)
        document.documentElement.style.setProperty('--board-rows', `${height}`)
        document.documentElement.style.setProperty('--cell-size', `${cellSizePx}px`)
    }, [dims, cellSizePx])

    return (
        <div className="cell-grid">
            {[...Array(height)].map((_, col) => (
                [...Array(width)].map((_, row) => {
                    const positionString = toPositionString([col, row])
                    return (
                        <Cell
                            key={positionString}
                            cell={hasStarted ? cells[positionString] : undefined}
                            steppingPlayerColor={positionToPlayerColor[positionString]}
                            event={events?.[positionString]}
                        />
                    )
                })
            ))}
            {!hasStarted && (
                <div className="game-starting-overlay">
                    <div className="player-info">
                        <div>You play as <span className={cn('color', playerColorToClassName(playerColor))}>{playerColor}</span>,</div>
                        <div>starting in the <span>{colorToCorner[playerColor]}</span> corner</div>
                    </div>
                    <div className="countdown">{secondsUntilStart}</div>
                    <ArrowIcon className={cn(colorToCorner[playerColor], playerColorToClassName(playerColor))} />
                </div>
            )}
        </div>
    )
}
