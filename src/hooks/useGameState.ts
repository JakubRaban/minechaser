import { useState } from 'react'
import { ActionResult, GameDef, GameState, RawGameState } from '../types/model'
import { toPositionString } from '../helpers'

const parseRawGameState = (rawGameState: RawGameState): GameState => {
    const { startTimestamp, endTimestamp, endGameScheduledTimestamp } = rawGameState
    return {
        ...rawGameState,
        start: new Date(startTimestamp),
        end: endTimestamp ? new Date(endTimestamp) : null,
        endScheduled: endGameScheduledTimestamp ? new Date(endGameScheduledTimestamp) : null,
    }
}

export const useGameState = (initialState: RawGameState) => {
    const [rawGameState, setRawGameState] = useState(initialState)
    const gameState = parseRawGameState(rawGameState)
    const {
        start,
        end,
        endScheduled,
        game: { players, board: { cells, dims, minesLeft } },
    } = gameState
    const isFinished = !!end

    const resolveActionResult = (result: ActionResult) => {
        const { players, cells, endGameScheduledTimestamp } = result
        setRawGameState((prev: RawGameState): RawGameState => ({
            ...prev,
            game: {
                ...prev.game,
                players: { ...prev.game.players, ...players },
                board: {
                    ...prev.game.board,
                    minesLeft: result.minesLeft ?? prev.game.board.minesLeft,
                    cells: {
                        ...prev.game.board.cells,
                        ...Object.fromEntries(cells.map(cell => [toPositionString(cell.position), cell])),
                    },
                },
            },
            endGameScheduledTimestamp: endGameScheduledTimestamp ?? prev.endGameScheduledTimestamp,
        }))
    }

    const props: GameDef = { start, end, endScheduled, players, dims, minesLeft, cells, isFinished }
    return [props, resolveActionResult, setRawGameState] as const
}
