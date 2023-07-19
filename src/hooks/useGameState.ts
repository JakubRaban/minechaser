import { useState } from 'react'
import { ActionResult, GameDef, GameState, RawGameState } from '../types/model'
import { toPositionString } from '../helpers'

const parseRawGameState = (rawGameState: RawGameState): GameState => {
    const { endTimestamp, endGameScheduledTimestamp } = rawGameState
    return {
        ...rawGameState,
        start: new Date(rawGameState.startTimestamp),
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

    const resolveAction = (action: ActionResult) => {
        const { players, cells, endGameScheduledTimestamp } = action
        setRawGameState((prev: RawGameState): RawGameState => ({
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
            endGameScheduledTimestamp: endGameScheduledTimestamp ?? prev.endGameScheduledTimestamp,
        }))
    }

    const props: GameDef = { start, end, endScheduled, players, dims, minesLeft, cells, isFinished }
    return [props, resolveAction, setRawGameState] as const
}
