export type Position = [number, number]
export type Players = Partial<Record<PlayerColor, Player>>
export type Cells = Record<string, Cell>
export type PlayerColor = 'RED' | 'GREEN' | 'BLUE' | 'YELLOW'

export interface GameState {
    game: Game
    startTimestamp: string
    endTimestamp: string | null
}

export interface Game {
    board: Board
    players: Players
}

export interface Board {
    dims: Position
    cells: Cells
    minesLeft: number
}

export interface Cell {
    position: Position
    hasMine?: boolean
    minesAround?: number
    flaggingPlayer?: PlayerColor
    isUncovered: boolean
    bonus: null
    hidePristine: boolean
}

export interface Player {
    position: Position
    score: number
    inventory: []
    alive: boolean
}

export interface ActionResult {
    players: Players
    cells: Cell[],
    minesLeft?: number
}

export interface GameDef {
    start: Date
    end: Date | null
    players: Players
    dims: Position
    minesLeft: number
    cells: Cells
    isFinished: boolean
}
