import { FC, useEffect, useRef, useState } from 'react'
import { Cells, PlayerColor, Players, Position } from '../../../types/model'
import { dateDiff, toPositionString } from '../../../helpers'
import { Cell } from '../Cell/Cell'
import { PositionedEvents } from '../../../hooks/useGameState'

import './CellGrid.scss'

interface CellGridProps {
    dims: Position
    cells: Cells
    players: Players
    gameStart: Date
    cellSizePx: number
    events: PositionedEvents | null
}

export const CellGrid: FC<CellGridProps> = ({ dims, cells, players, gameStart, cellSizePx, events }) => {
    const [height, width] = dims
    const [secondsUntilStart, setSecondsUntilStart] = useState(dateDiff(gameStart, new Date()).seconds)
    const hasStarted = secondsUntilStart <= 0
    const positionToPlayerColor = Object.fromEntries(
        Object.entries(players)
            .filter(([, player]) => player.alive)
            .map(([color, player]) => [toPositionString(player.position), color]),
    ) as Record<string, PlayerColor>
    const interval = useRef<NodeJS.Timeout | null>(null)

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
        </div>
    )
}
