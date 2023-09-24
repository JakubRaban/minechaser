import { GameStartFn, PrivateGameLobby } from '../../../PrivateGameLobby/PrivateGameLobby'
import { FC, useEffect, useState } from 'react'
import { useSocket } from '../../../../hooks/useSocket'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router'
import { ErrorCode } from '../../../../helpers'

interface PrivateGameInviteeWrapperProps {
    onGameStart: GameStartFn
    className?: string
}

export const PrivateGameInviteeWrapper: FC<PrivateGameInviteeWrapperProps> = ({ onGameStart, className }) => {
    const { socket } = useSocket()
    const navigate = useNavigate()
    const { gameId } = useParams()
    const [players, setPlayers] = useState<string[]>([])
    
    useEffect(() => {
        socket.emit('join_private_game', { gameId }, ({ players, error }: { players: string[], error: { code: ErrorCode } }) => {
            if (!error) {
                setPlayers(players)
            } else {
                navigate('/', { replace: true, state: { error: error.code } })
            }
        })
    }, [])

    if (players.length) {
        return <PrivateGameLobby players={players} onGameStart={onGameStart} className={className} />
    } else {
        return <div>Joining game...</div>
    }
}
