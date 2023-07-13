import { useState } from 'react'
import { ActionResult, GameState } from '../types/model'
import { toPositionString } from '../helpers'

export const useGameState = (initialState: GameState) => {
    const [gameState, setGameState] = useState(initialState)
    const { startTimestamp, endTimestamp, game: { players, board: { cells, dims, minesLeft } } } = gameState
    const start = new Date(startTimestamp)
    const end = endTimestamp ? new Date(endTimestamp) : null
    const isFinished = !!endTimestamp

    const resolveAction = (action: ActionResult) => {
        const { players, cells } = action
        setGameState((prev) => ({
            ...prev,
            game: {
                ...prev.game,
                players: { ...prev.game.players, ...players },
                board: {
                    ...prev.game.board,
                    minesLeft: action.minesLeft ?? prev.game.board.minesLeft,
                    cells: {
                        ...prev.game.board.cells,
                        ...Object.fromEntries(cells.map(cell => [toPositionString(cell.position), cell])),
                    },
                },
            },
        }))
    }

    const finishGame = () => setGameState((prev) => ({ ...prev, isFinished: true }))

    return [{ start, end, players, dims, minesLeft, cells, isFinished }, resolveAction, finishGame, setGameState] as const
}
