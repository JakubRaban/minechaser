import { FC } from 'react'
import { Cells, PlayerColor, Players, Position } from '../../../types/model'
import { toPositionString } from '../../../helpers'
import { Cell } from '../Cell/Cell'

import './CellGrid.scss'

interface CellGridProps {
    dims: Position
    cells: Cells
    players: Players
}

export const CellGrid: FC<CellGridProps> = ({ dims, cells, players }) => {
    const [height, width] = dims
    const positionToPlayerColor = Object.fromEntries(
        Object.entries(players)
            .filter(([, player]) => player.alive)
            .map(([color, player]) => [toPositionString(player.position), color]),
    ) as Record<string, PlayerColor>

    return (
        <div className="cell-grid" style={{ gridTemplateRows: `repeat(${height}, 1fr)`, gridTemplateColumns: `repeat(${width}, 1fr)` }}>
            {[...Array(height)].map((_, col) => (
                [...Array(width)].map((_, row) => {
                    const positionString = toPositionString([col, row])
                    return (
                        <Cell
                            key={positionString}
                            cell={cells[positionString]}
                            playerColor={positionToPlayerColor[positionString]}
                        />
                    )
                })
            ))}
        </div>
    )
}
