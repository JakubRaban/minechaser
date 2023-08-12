import { FC, useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router'
import { useSocket } from '../../../hooks/useSocket'
import { Game } from '../Game'
import { RawGameState, PlayerColor, PlayerColorMapping } from '../../../types/model'
import { PrivateGameLobby } from '../../PrivateGameLobby/PrivateGameLobby'
import { NameSetter } from '../../LandingPage/NameSetter/NameSetter'

export interface GameStateResponse {
    gameState: RawGameState
    playerColor: PlayerColor
    colorMapping: PlayerColorMapping
}

interface GameWrapperState extends GameStateResponse {
    players: string[]
}

type MaybeGameStateResponse = Partial<GameStateResponse>

export const GameWrapper: FC = () => {
    const { socket } = useSocket()
    const { gameId } = useParams()
    const {
        gameState: gameStateProp,
        playerColor: playerColorProp,
        players: playersProp ,
        colorMapping: colorMappingProp,
    } = (useLocation().state ?? {}) as Partial<GameWrapperState>

    const [gameState, setGameState] = useState(gameStateProp)
    const [playerColor, setPlayerColor] = useState(playerColorProp)
    const [colorMapping, setColorMapping] = useState(colorMappingProp)
    const [players, setPlayers] = useState(playersProp)

    const [privateGame, setPrivateGame] = useState(false)
    const [playerNameSet, setPlayerNameSet] = useState(false)
    const [notAPlayer, setNotAPlayer] = useState(false)

    const isGamePrivate = players || (!players && !gameState)

    const handleStart = (gameState: RawGameState, playerColor: PlayerColor, colorMapping: PlayerColorMapping) => {
        setGameState(gameState)
        setPlayerColor(playerColor)
        setColorMapping(colorMapping)
    }
    
    useEffect(() => {
        socket.emit('is_name_set', {}, ({ name }: { name: string }) => setPlayerNameSet(!!name))

        if (isGamePrivate) {
            setPrivateGame(true)
        } else if (!gameState) {
            socket.emit('get_game_state', { gameId }, ({ gameState, playerColor, colorMapping }: MaybeGameStateResponse) => {
                if (gameState && playerColor && colorMapping) {
                    handleStart(gameState, playerColor, colorMapping)
                } else {
                    setNotAPlayer(true)
                }
            })
        }
    }, [])

    useEffect(() => {
        if (playerNameSet && isGamePrivate) {
            socket.emit('join_private_game', { gameId }, ({ players }: { players: string[] }) => setPlayers(players))
        }
    }, [playerNameSet])

    if (!playerNameSet) {
        return <NameSetter onNameSet={() => setPlayerNameSet(true)} />
    } else if (gameState && playerColor && colorMapping) {
        return <Game gameState={gameState} playerColor={playerColor} colorMapping={colorMapping} />
    } else if (privateGame && players) {
        return <PrivateGameLobby players={players} onGameStart={handleStart} />
    } else if (notAPlayer) {
        return <div>You are not playing in this game</div>
    } else {
        return <div>Loading game {gameId}...</div>
    }
}
