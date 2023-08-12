export type Position = [number, number]
export type Players = Partial<Record<PlayerColor, Player>>
export type Cells = Record<string, Cell>
export type PlayerColor = 'RED' | 'GREEN' | 'BLUE' | 'YELLOW'
export type PlayerColorMapping = Partial<Record<PlayerColor, string>>

export interface RawGameState {
    game: Game
    startTimestamp: string
    endTimestamp: string | null
    endGameScheduledTimestamp: string | null
}

export type GameState = Omit<RawGameState, 'startTimestamp' | 'endTimestamp' | 'endGameScheduledTimestamp'> & {
    start: Date
    end: Date | null
    endScheduled: Date | null
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
    minesLeft: number | null
    endGameScheduledTimestamp: string | null
}

export interface GameDef {
    start: Date
    end: Date | null
    endScheduled: Date | null
    players: Players
    dims: Position
    minesLeft: number
    cells: Cells
    isFinished: boolean
}
