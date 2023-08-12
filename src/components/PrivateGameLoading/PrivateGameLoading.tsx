import { FC, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../../hooks/useSocket'

export const PrivateGameLoading: FC = () => {
    const { socket } = useSocket()
    const navigate = useNavigate()

    useEffect(() => {
        socket.emit('create_private_game')
        socket.on('private_game_lobby_update', ({ gameId, players }) => {
            navigate(`/game/${gameId}`, { state: { players } })
        })
        return () => {
            socket.off('private_game_lobby_update')
        }
    })

    return <div>Creating private game...</div>
}
