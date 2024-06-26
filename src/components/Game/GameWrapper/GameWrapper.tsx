import { FC, useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router'
import { PlayerColor, PlayerColorMapping, RawGameState } from '../../../types/model'
import { PrivateGameInviteeWrapper } from './PrivateGameInviteeWrapper/PrivateGameInviteeWrapper'
import { PrivateGameLobby } from '../../PrivateGameLobby/PrivateGameLobby'
import { useSocket } from '../../../hooks/context/useSocket'
import { useNavigate } from 'react-router-dom'
import { ErrorCode } from '../../../helpers'
import { Game } from '../../lazy-components'
import { useDelayedFlag } from '../../../hooks/useDelayedFlag'
import { LoadingScreen } from '../../lib/LoadingScreen/LoadingScreen'

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

interface GameStateResponse {
    state: Partial<GameStateData>
    isPrivate?: boolean
    error?: GameStateError
}

const GameWrapper: FC = () => {
    const { socket } = useSocket()
    const navigate = useNavigate()
    const { gameId } = useParams()
    const { gameState, playerColor, players , colorMapping } = (useLocation().state ?? {}) as Partial<GameWrapperState>

    const [gameData, setGameData] = useState(
        gameState && playerColor && colorMapping ? { gameState, playerColor, colorMapping } : undefined,
    )
    const [gameStateChecked, setGameStateChecked] = useState(false)
    const [isPrivate, setIsPrivate] = useState(false)
    const [fadeOut, moveToGame, startFadingOut] = useDelayedFlag(700)

    const handleStart = (data: GameStateData) => {
        setGameData(data)
        startFadingOut()
    }

    useEffect(() => {
        socket.emit('game_connect', { gameId })
        const gameDisconnect = () => socket.emit('game_disconnect', { gameId })
        window.addEventListener('beforeunload', gameDisconnect)
        return () => {
            gameDisconnect()
            window.removeEventListener('beforeunload', gameDisconnect)
        }
    }, [])
    
    useEffect(() => {
        if (!gameData) {
            Promise.all([
                new Promise<void>(resolve => {
                    socket.emit('get_game_state', { gameId }, ({ state, isPrivate, error }: GameStateResponse) => {
                        setIsPrivate(isPrivate ?? false)
                        if (state?.gameState) {
                            handleStart(state as GameStateData)
                        } else if (error) {
                            navigate('/', { replace: true, state: { error: error.code } })
                        }
                        resolve()
                    })
                }),
                new Promise(resolve => setTimeout(resolve, 300)),
            ]).then(() => setGameStateChecked(true))
        }
    }, [])

    const className = fadeOut ? 'disappearing' : undefined

    if (!gameStateChecked) {
        return <LoadingScreen />
    } else if (gameData && moveToGame) {
        return <Game isPrivate={isPrivate} {...gameData} />
    } else if (isPrivate && !fadeOut) {
        if (players) {
            return <PrivateGameLobby players={players} onGameStart={handleStart} className={className} />
        } else {
            return <PrivateGameInviteeWrapper onGameStart={handleStart} className={className} />
        }
    } else {
        return <LoadingScreen />
    }
}

export default GameWrapper
