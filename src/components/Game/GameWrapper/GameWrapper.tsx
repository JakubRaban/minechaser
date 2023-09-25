import { FC, useEffect, useRef, useState } from 'react'
import { useLocation, useParams } from 'react-router'
import { RawGameState, PlayerColor, PlayerColorMapping } from '../../../types/model'
import { PrivateGameInviteeWrapper } from './PrivateGameInviteeWrapper/PrivateGameInviteeWrapper'
import { PrivateGameLobby } from '../../PrivateGameLobby/PrivateGameLobby'
import { useSocket } from '../../../hooks/useSocket'
import { useNavigate } from 'react-router-dom'
import { ErrorCode, errorCodeToMessage } from '../../../helpers'
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
    origin: string
}

type GameStateResponse = { state: Partial<GameStateData>, error?: GameStateError }

const GameWrapper: FC = () => {
    const { socket } = useSocket()
    const navigate = useNavigate()
    const { gameId } = useParams()
    const { gameState, playerColor, players , colorMapping, origin } = (useLocation().state ?? {}) as Partial<GameWrapperState>

    const [gameData, setGameData] = useState(
        gameState && playerColor && colorMapping ? { gameState, playerColor, colorMapping } : undefined,
    )
    const [gameStateChecked, setGameStateChecked] = useState(false)
    const [fadeOut, moveToGame, startFadingOut] = useDelayedFlag(700)
    
    const isGamePrivate = useRef(!origin || origin === '/new-game')

    const handleStart = (data: GameStateData) => {
        setGameData(data)
        startFadingOut()
    }
    
    useEffect(() => {
        if (!gameData) {
            Promise.all([
                new Promise<void>(resolve => {
                    socket.emit('get_game_state', { gameId }, ({ state, error }: GameStateResponse) => {
                        if (state?.gameState) {
                            handleStart(state as GameStateData)
                        } else if (error) {
                            navigate('/', { replace: true, state: { error: errorCodeToMessage(error.code) } })
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
        return <Game isPrivate={isGamePrivate.current} {...gameData} />
    } else if (isGamePrivate.current) {
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
