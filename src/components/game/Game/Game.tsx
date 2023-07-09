import { FC, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { useSocket } from '../../../hooks/useSocket'

interface GameState {
    game: 'whatever'
}

export const Game: FC = () => {
    const { socket } = useSocket()
    const { gameId } = useParams()
    const [game, setGame] = useState<GameState>()

    useEffect(() => {
        socket.emit('get_game_state', { gameId }, (game: GameState) => {
            debugger
            setGame(game)
        })
    }, [gameId])
    
    if (game) {
        return <div>Game loaded</div>
    } else {
        return <div>Loading game {gameId}...</div>
    }
}
