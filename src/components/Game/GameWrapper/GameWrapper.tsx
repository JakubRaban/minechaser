import { FC, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { useSocket } from '../../../hooks/useSocket'
import { Game } from '../Game'
import { RawGameState, PlayerColor } from '../../../types/model'

export interface GameStateResponse {
    gameState: RawGameState
    playerColor: PlayerColor
}

type MaybeGameStateResponse = Partial<GameStateResponse>

export const GameWrapper: FC<MaybeGameStateResponse> = ({ gameState: gameStateProp, playerColor: playerColorProp }) => {
    const { socket } = useSocket()
    const { gameId } = useParams()
    const [gameState, setGameState] = useState(gameStateProp)
    const [playerColor, setPlayerColor] = useState(playerColorProp)
    
    useEffect(() => {
        if (!gameState) {
            socket.emit('get_game_state', { gameId }, ({ gameState, playerColor }: GameStateResponse) => {
                setGameState(gameState)
                setPlayerColor(playerColor)
            })
        }
    }, [])
    
    if (gameState && playerColor) {
        return <Game gameState={gameState} playerColor={playerColor} />
    } else {
        return <div>Loading game {gameId}...</div>
    }
}
