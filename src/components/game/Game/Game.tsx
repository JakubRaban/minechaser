import { FC } from 'react'
import { useSocket } from '../../../hooks/useSocket'
import { GameStateResponse } from './GameWrapper/GameWrapper'
import { useGameState } from '../../../hooks/useGameState'

export const Game: FC<GameStateResponse> = ({ gameState, playerColor }) => {
    const { socket } = useSocket()
    const [props, resolveAction, finishGame, setGameState] = useGameState(gameState)
    
    return (
        <>
            <div>Mines left {props.minesLeft}</div>
            <div>Dims {props.dims}</div>
        </>
    )
}
