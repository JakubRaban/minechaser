import { useState } from 'react'
import { ActionResult, GameState } from '../types/model'
import { toPositionString } from '../helpers'

export const useGameState = (initialState: GameState) => {
    const [gameState, setGameState] = useState(initialState)
    const { isFinished, game: { players, board: { cells, dims, minesLeft } } } = gameState
    const resolveAction = (action: ActionResult) => {
        const { players, cells } = action
        setGameState((prev) => ({
            ...prev,
            game: {
                ...prev.game,
                players: { ...prev.game.players, ...players },
                board: {
                    ...prev.game.board,
                    cells: {
                        ...prev.game.board.cells,
                        ...Object.fromEntries(cells.map(cell => [toPositionString(cell.position), cell])),
                    },
                },
            },
        }))
    }

    const finishGame = () => setGameState((prev) => ({ ...prev, isFinished: true }))

    return [{ players, dims, minesLeft, cells, isFinished }, resolveAction, finishGame, setGameState] as const
}
