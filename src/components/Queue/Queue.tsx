import { FC, useEffect, useRef, useState } from 'react'
import { useSocket } from '../../hooks/useSocket'
import { useNavigate } from 'react-router-dom'
import { PlayerList } from '../PlayerList/PlayerList'
import { useSettings } from '../../hooks/useSettings'
import { dateDiff, pickRandom } from '../../helpers'

import './Queue.scss'

const progressUpdaterFactory = (waitingStart: Date) => {
    const start = waitingStart
    return () => {
        const timeElapsed = dateDiff(new Date(), start).millis
        return timeElapsed < 12000 ? timeElapsed : Math.min(14500, Math.floor(1500 * Math.log10(timeElapsed - 11000) + 7500))
    }
}

const tips = [
    'All corner areas of the board are mine-free, whether a player starts there or not.',
    'One incorrect flagging is fine, but for any subsequent you\'ll be receiving increasing penalty.',
    'If you accidentally leave the game, you can come back to it using the same link.',
    'If you step through the border of the board, you\'ll find yourself the opposite side.',
    'Both stepping and flagging a cell with a bonus will award you that bonus.',
    'Stuck in your corner? Step through the board edge to get to the other side.',
    'The winner is the player with the highest score, but who also stayed alive (unless all players died).',
    'You can also play with your friends (up to max. 4 players) or practice by yourself.',
    'If no player flags any cell for 2 minutes, the game will end.',
]

export const Queue: FC = () => {
    const { socket } = useSocket()
    const { name: currentPlayerName } = useSettings()
    const navigate = useNavigate()

    const [players, setPlayers] = useState<string[]>([])
    const [progress, setProgress] = useState<number>(0)
    const [joinedSuccessfully, setJoinedSuccessfully] = useState(false)
    const interval = useRef<NodeJS.Timeout | null>(null)

    const tip = useRef(pickRandom(tips))
    
    useEffect(() => {
        let timeout: NodeJS.Timeout
        socket.emit('join_queue')
        socket.on('queue_updated', ({ players }) => {
            setPlayers(players)
            if (!interval.current) {
                const getProgress = progressUpdaterFactory(new Date())
                interval.current = setInterval(() => setProgress(getProgress()), 100)
            }
        })
        socket.on('public_game_started', ({ gameId, gameState, playerColor, colorMapping }) => {
            setJoinedSuccessfully(true)
            timeout = setTimeout(() => navigate(`/game/${gameId}`, { replace: true, state: { gameState, playerColor, colorMapping } }), 2000)
        })
        return () => {
            socket.off('queue_update')
            socket.off('public_game_started')
            clearInterval(interval.current!)
            clearTimeout(timeout)
        }
    }, [])

    const leaveQueue = () => !joinedSuccessfully && socket.emit('leave_queue')

    useEffect(() => {
        window.addEventListener('beforeunload', leaveQueue)
        return () => {
            window.removeEventListener('beforeunload', leaveQueue)
            leaveQueue()
        }
    }, [])

    const header = joinedSuccessfully ? 'Let\'s play!' : progress <= 13250 ? 'You\'ll join a new game soon' : 'This is taking a bit longer than expected...'
    
    return (
        <div className="queue">
            <div className="wrapper">
                <main>
                    <h1>{header}</h1>
                    <PlayerList
                        players={players}
                        currentPlayer={currentPlayerName!}
                        highlight={joinedSuccessfully}
                        progressComponent={<progress value={joinedSuccessfully ? 15000 : progress} max="15000" />}
                    />
                    <button className="outline secondary" onClick={() => navigate('/', { replace: true })}>Leave the queue</button>
                </main>
                <aside>
                    <h3>Tip</h3>
                    {tip.current}
                </aside>
            </div>
        </div>
    )
}
