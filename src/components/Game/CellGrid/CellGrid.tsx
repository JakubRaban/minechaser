import { FC, useEffect, useRef, useState } from 'react'
import { Cells, PlayerColor, Players, Position } from '../../../types/model'
import { toPositionString } from '../../../helpers'
import { Cell } from '../Cell/Cell'
import { PositionedEvents } from '../../../hooks/useGameState'
import cn from 'classnames'
import { ArrowIcon } from '../../../icons/Arrow/ArrowIcon'
import { usePlayerColorToClassName } from '../../../hooks/usePlayerColorToClassName'
import { usePreferences } from '../../../hooks/context/usePreferences'
import { useDateDiff } from '../../../hooks/useDateDiff'
import { ControlsInstructions } from './ControlsInstructions/ControlsInstructions'

import './CellGrid.scss'

interface CellGridProps {
    dims: Position
    cells: Cells
    players: Players
    playerColor: PlayerColor
    optimisticPosition: Position
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

const playersToPositions = (players: Players, playerColor: PlayerColor, optimisticPosition: Position) => {
    const result: Record<string, PlayerColor[]> = {}
    const playerPositions = Object.entries(players).map(([color, player]) => [color === playerColor ? optimisticPosition : player.position, color as PlayerColor] as const)
    playerPositions.forEach(([position, color]) => {
        const positionString = toPositionString(position)
        result[positionString] ? result[positionString].push(color) : result[positionString] = [color]
    })
    return result
}

export const CellGrid: FC<CellGridProps> = ({ dims, cells, players, playerColor, optimisticPosition, gameStart, cellSizePx, events }) => {
    const dateDiff = useDateDiff()
    
    const [height, width] = dims
    const [secondsUntilStart, setSecondsUntilStart] = useState(dateDiff(gameStart, new Date()).seconds)
    const hasStarted = secondsUntilStart <= 0


    const positionToPlayersColors = playersToPositions(players, playerColor, optimisticPosition)
    const interval = useRef<NodeJS.Timeout | null>(null)
    
    const playerColorToClassName = usePlayerColorToClassName()
    const { colorBlindMode } = usePreferences()

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
                            steppingPlayersColors={positionToPlayersColors[positionString]}
                            event={events?.[positionString]}
                        />
                    )
                })
            ))}
            {!hasStarted && (
                <div className="game-starting-overlay">
                    {colorBlindMode ? (
                        <div className="player-info">
                            <div>You start in the <span className={cn(playerColorToClassName(playerColor))}>{colorToCorner[playerColor]}</span> corner</div>
                        </div>
                    ) : (
                        <div className="player-info">
                            <div>You play as <span className={cn('color', playerColorToClassName(playerColor))}>{playerColor}</span>,</div>
                            <div>starting in the <span>{colorToCorner[playerColor]}</span> corner</div>
                        </div>
                    )}
                    <ControlsInstructions playerColor={playerColor} />
                    <div className="countdown">{secondsUntilStart}</div>
                    <ArrowIcon className={cn(colorToCorner[playerColor], playerColorToClassName(playerColor))} />
                </div>
            )}
        </div>
    )
}
