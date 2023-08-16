import { FC, useEffect, useState } from 'react'
import { useSocket } from '../../hooks/useSocket'
import { PlayerColor, PlayerColorMapping, RawGameState } from '../../types/model'
import { useParams } from 'react-router'

interface PrivateGameLobbyProps {
    players: string[]
    onGameStart: (gameState: RawGameState, playerColor: PlayerColor, colorMapping: PlayerColorMapping) => void
}

export const PrivateGameLobby: FC<PrivateGameLobbyProps> = ({ players: playersProp, onGameStart }) => {
    const { socket } = useSocket()
    const { gameId } = useParams()
    const [players, setPlayers] = useState(playersProp)
    let gameStarted = false

    useEffect(() => {
        socket.on('private_game_lobby_update', ({ players }) => setPlayers(players))
        socket.on('private_game_started', ({ gameState, playerColor, colorMapping }) => onGameStart(gameState, playerColor, colorMapping))
        return () => {
            socket.off('private_game_lobby_update')
            socket.off('private_game_started')
        }
    }, [])

    const leaveGame = () => !gameStarted && socket.emit('leave_private_game', { gameId })

    useEffect(() => {
        window.addEventListener('beforeunload', leaveGame)
        return () => {
            window.removeEventListener('beforeunload', leaveGame)
            leaveGame()
        }
    }, [])

    const handleStart = () => {
        gameStarted = true
        socket.emit('start_private_game', { gameId })
    }

    return (
        <>
            <div>Send this link to your friends to invite them to your game: {window.location.href}</div>
            <div>Players in the game:</div>
            {players.map(player => <div key={player}>{player}</div>)}
            <button disabled={players.length < 2} onClick={handleStart}>Start game</button>
        </>
    )
}
