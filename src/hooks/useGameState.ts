import { useRef, useState } from 'react'
import { ActionResult, GameDef, GameState, PlayerColor, RawGameState } from '../types/model'
import { toPositionString } from '../helpers'
import { EventType } from '../types/model'

export interface EventDef {
    id: number
    type: EventType
    originatorColor: PlayerColor
    pointsChange: number
}

export type PositionedEvents = Record<string, EventDef>

const parseRawGameState = (rawGameState: RawGameState): GameState => {
    const { startTimestamp, endTimestamp, endGameScheduledTimestamp } = rawGameState
    return {
        ...rawGameState,
        start: new Date(startTimestamp),
        end: endTimestamp ? new Date(endTimestamp) : null,
        endScheduled: endGameScheduledTimestamp ? new Date(endGameScheduledTimestamp) : null,
    }
}

export const useGameState = (initialState: RawGameState, playerColor: PlayerColor) => {
    const [rawGameState, setRawGameState] = useState(initialState)
    const gameState = parseRawGameState(rawGameState)
    const {
        start,
        end,
        endScheduled,
        game: { players, board: { cells, dims, minesLeft } },
    } = gameState
    const isFinished = !!end

    const [events, setEvents] = useState<PositionedEvents | null>(null)
    const eventId = useRef(0)

    const [playerActionCounter, setPlayerActionCounter] = useState(0)

    const resolveActionResult = (result: ActionResult) => {
        const { players, cells, endGameScheduledTimestamp, originatorColor, events, pointsChange } = result
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
                        ...(cells ? Object.fromEntries(cells.map(cell => [toPositionString(cell.position), cell])) : {}),
                    },
                },
            },
            endGameScheduledTimestamp: endGameScheduledTimestamp ?? prev.endGameScheduledTimestamp,
        }))
        if ((events?.includes('MineFreeCellFlagged') || events?.includes('MineCellFlagged')) && cells) {
            const type = events.find(e => ['MineFreeCellFlagged', 'MineCellFlagged'].includes(e))!
            setEvents(e => ({
                ...(e ?? {}),
                [toPositionString(cells[0].position)]: { originatorColor, type, pointsChange: pointsChange || 0, id: eventId.current++ },
            }))
        }
        setPlayerActionCounter(c => originatorColor === playerColor ? c + 1 : c)
    }

    const props: GameDef = { start, end, endScheduled, players, dims, minesLeft, cells, isFinished, actionCounter: playerActionCounter }
    return [props, gameState, events, resolveActionResult, setRawGameState] as const
}
