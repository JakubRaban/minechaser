import { FC } from 'react'
import { useSocket } from '../../hooks/useSocket'
import { GameStateResponse } from './GameWrapper/GameWrapper'
import { useGameState } from '../../hooks/useGameState'
import { Scoreboard } from './Scoreboard/Scoreboard'
import { CellGrid } from './CellGrid/CellGrid'
import { useParams } from 'react-router'

import './Game.scss'

export type ActionType = 'STEP' | 'FLAG'
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

export const Game: FC<GameStateResponse> = ({ gameState, playerColor }) => {
    const { socket } = useSocket()
    const { gameId } = useParams()
    const [props, resolveAction, finishGame, setGameState] = useGameState(gameState)

    const handlePlayerAction = (actionType: ActionType, direction: Direction) => {
        socket.emit('player_action', { gameId, actionType, direction })
    }
    
    return (
        <div className="game-layout">
            <Scoreboard players={props.players} minesLeft={props.minesLeft} />
            <CellGrid dims={props.dims} cells={props.cells} players={props.players} />
            {/*<SteeringBoard onPlayerAction={handlePlayerAction} />*/}
        </div>
    )
}
