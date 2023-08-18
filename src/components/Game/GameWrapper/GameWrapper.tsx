import { FC, useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router'
import { Game } from '../Game'
import { RawGameState, PlayerColor, PlayerColorMapping } from '../../../types/model'
import { PrivateGameInviteeWrapper } from './PrivateGameInviteeWrapper/PrivateGameInviteeWrapper'
import { PrivateGameLobby } from '../../PrivateGameLobby/PrivateGameLobby'
import { useSocket } from '../../../hooks/useSocket'
import { useNavigate } from 'react-router-dom'
import { ErrorCode, errorCodeToMessage } from '../../../helpers'

export interface GameStateData {
    gameState: RawGameState
    playerColor: PlayerColor
    colorMapping: PlayerColorMapping
}

interface GameStateError {
    code: ErrorCode
}

interface GameWrapperState extends GameStateData {
    players: string[]
}

type GameStateResponse = { state: Partial<GameStateData>, error?: GameStateError }

const Loading = () => <div>Loading...</div>

export const GameWrapper: FC = () => {
    const { socket } = useSocket()
    const navigate = useNavigate()
    const { gameId } = useParams()
    const { gameState, playerColor, players , colorMapping } = (useLocation().state ?? {}) as Partial<GameWrapperState>

    const [gameData, setGameData] = useState(
        gameState && playerColor && colorMapping ? { gameState, playerColor, colorMapping } : undefined,
    )
    const [gameStateChecked, setGameStateChecked] = useState(false)

    const isGamePrivate = players || (!players && !gameData)

    const handleStart = (data: GameStateData) => {
        setGameData(data)
    }
    
    useEffect(() => {
        if (!gameData) {
            socket.emit('get_game_state', { gameId }, ({ state, error }: GameStateResponse) => {
                if (state?.gameState) {
                    handleStart(state as GameStateData)
                } else if (error) {
                    navigate('/', { replace: true, state: { error: errorCodeToMessage(error.code) } })
                }
                setGameStateChecked(true)
            })
        }
    }, [])

    if (!gameStateChecked) {
        return <Loading />
    } else if (gameData) {
        return <Game {...gameData} />
    } else if (isGamePrivate) {
        if (players) {
            return <PrivateGameLobby players={players} onGameStart={handleStart} />
        } else {
            return <PrivateGameInviteeWrapper onGameStart={handleStart} />
        }
    } else {
        return <Loading />
    }
}
