import { useState } from 'react'

type Position = [number, number]

export enum PlayerColor {
    RED = 'RED',
    BLUE = 'BLUE',
    GREEN = 'GREEN',
    YELLOW = 'YELLOW',
}

export interface GameState {
    game: Game
    isFinished: boolean
}

interface Game {
    board: Board
    players: Partial<Record<PlayerColor, Player>>
}

interface Board {
    dims: Position
    cells: Record<string, Cell>
    minesLeft: number
}

interface Cell {
    position: Position
    hasMine?: boolean
    minesAround?: number
    flaggingPlayer: Player | null
    isUncovered: boolean
    bonus: null
}

interface Player {
    position: Position
    score: number
    inventory: []
    alive: boolean
}

interface ActionResult {
    players: Record<PlayerColor, Player>
    cells: Cell[]
}

const toPositionString = (position: Position) => `(${position[0]}, ${position[1]})`

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
