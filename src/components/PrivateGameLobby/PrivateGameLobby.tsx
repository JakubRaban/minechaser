import { FC, useEffect, useRef, useState } from 'react'
import { useSocket } from '../../hooks/context/useSocket'
import { useParams } from 'react-router'
import { GameStateData } from '../Game/GameWrapper/GameWrapper'
import { PlayerList } from '../PlayerList/PlayerList'
import { usePreferences } from '../../hooks/context/usePreferences'
import { BoardSizeForm } from './BoardSizeForm/BoardSizeForm'
import { Game } from '../lazy-components'
import { usePreload } from '../../hooks/usePreload'
import cn from 'classnames'
import { ScreenOrientationWarning } from '../lib/ScreenOrientationWarning/ScreenOrientationWarning'
import { Tooltip } from 'react-tooltip'
import { Link } from 'react-router-dom'
import { ConfirmCancelContainer } from '../lib/ConfirmCancelContainer/ConfirmCancelContainer'
import { useAudio } from '../../hooks/context/useAudio'

import './PrivateGameLobby.scss'

export type GameStartFn = (data: GameStateData) => void

interface PrivateGameLobbyProps {
    players: string[]
    onGameStart: GameStartFn
    className?: string
}

export const PrivateGameLobby: FC<PrivateGameLobbyProps> = ({ players: playersProp, onGameStart, className }) => {
    const { socket } = useSocket()
    const { gameId } = useParams()
    const { name: currentPlayerName } = usePreferences()
    const { stopMusic } = useAudio()
    usePreload(Game)

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
            stopMusic()
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

    const copyGameLink = () => navigator.clipboard.writeText(window.location.href).then(() => {
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 5000)
    })
    const joiningDisabled = players.length < 2

    return (
        <div className={cn('private-game-lobby-wrapper', className)}>
            <h1>New Private Game by {players[0]}</h1>
            <div className="private-game-lobby">
                <div>
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
                        Players in the Game:
                        <PlayerList players={players} currentPlayerName={currentPlayerName!} highlight={players.length === 4} />
                    </div>

                    <ScreenOrientationWarning />
                </div>

                <div>
                    <label className="board-size-label">
                        Board Size:
                        <BoardSizeForm size={size} onChange={setSize} />
                    </label>

                    <ConfirmCancelContainer>
                        <button
                            className="start-game-button"
                            disabled={joiningDisabled}
                            onClick={handleStart}
                            data-tooltip-id="cannot-join-tooltip"
                            data-tooltip-content={joiningDisabled ? 'Wait for at least one more player to start' : undefined}
                        >
                            Start the Game
                        </button>
                        <button className="leave-game-button outline">
                            <Link to="/">Leave the Game</Link>
                        </button>
                    </ConfirmCancelContainer>
                    <Tooltip id="cannot-join-tooltip" />
                </div>
            </div>
        </div>
    )
}
