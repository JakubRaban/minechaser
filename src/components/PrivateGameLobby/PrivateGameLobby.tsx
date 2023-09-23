import { FC, useEffect, useRef, useState } from 'react'
import { useSocket } from '../../hooks/useSocket'
import { useParams } from 'react-router'
import { GameStateData } from '../Game/GameWrapper/GameWrapper'
import { PlayerList } from '../PlayerList/PlayerList'
import { useSettings } from '../../hooks/useSettings'
import { BoardSizeForm } from './BoardSizeForm/BoardSizeForm'

import './PrivateGameLobby.scss'

export type GameStartFn = (data: GameStateData) => void

interface PrivateGameLobbyProps {
    players: string[]
    onGameStart: GameStartFn
}

export const PrivateGameLobby: FC<PrivateGameLobbyProps> = ({ players: playersProp, onGameStart }) => {
    const { socket } = useSocket()
    const { gameId } = useParams()
    const { name: currentPlayerName } = useSettings()

    const [players, setPlayers] = useState(playersProp)
    const [linkCopied, setLinkCopied] = useState(false)
    const [size, setSize] = useState<[number, number]>([18, 27])

    const gameStarted = useRef(false)

    useEffect(() => {
        socket.on('private_game_lobby_update', ({ players }) => {
            setPlayers(players)
        })
        socket.on('private_game_started', ({ state }) => {
            gameStarted.current = true
            onGameStart(state)
        })
        return () => {
            socket.off('private_game_lobby_update')
            socket.off('private_game_started')
        }
    }, [])

    const leaveGame = () => !gameStarted.current && socket.emit('leave_private_game', { gameId })

    useEffect(() => {
        window.addEventListener('beforeunload', leaveGame)
        return () => {
            window.removeEventListener('beforeunload', leaveGame)
            leaveGame()
        }
    }, [])

    const handleStart = () => {
        gameStarted.current = true
        socket.emit('start_private_game', { gameId, size })
    }

    const copyGameLink = () => {
        setLinkCopied(true)
        navigator.clipboard.writeText(window.location.href)
    }

    return (
        <div className="private-game-lobby-wrapper">
            <h1>New Private Game by {players[0]}</h1>
            <div className="private-game-lobby">
                <label className="link-label">
                    <div>Your friends can join this game using the link below:</div>
                    <div role="group">
                        <input type="text" value={window.location.href} readOnly onFocus={e => e.target.select()} />
                        <button onClick={copyGameLink}>
                            {linkCopied && <span className="copied-icon" />}
                            {linkCopied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                </label>

                <div className="players">
                    Players in the game:
                    <PlayerList players={players} currentPlayerName={currentPlayerName!} highlight={players.length === 4} />
                </div>

                <label className="board-size-label">
                    Board size:
                    <BoardSizeForm size={size} onChange={setSize} />
                </label>

                <button className="game-start-button" disabled={players.length < 2} onClick={handleStart}>Start the game</button>
            </div>
        </div>
    )
}
