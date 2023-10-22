import { FC, useEffect, useRef, useState } from 'react'
import { useSocket } from '../../hooks/context/useSocket'
import { Link, useNavigate } from 'react-router-dom'
import { PlayerList } from '../PlayerList/PlayerList'
import { usePreferences } from '../../hooks/context/usePreferences'
import { dateDiff, pickRandom } from '../../helpers'
import { useLocation } from 'react-router'
import { Game, GameWrapper } from '../lazy-components'
import { useDelayedFlag } from '../../hooks/useDelayedFlag'
import { GameStateData } from '../Game/GameWrapper/GameWrapper'
import cn from 'classnames'
import { usePreload } from '../../hooks/usePreload'
import { ScreenOrientationWarning } from '../lib/ScreenOrientationWarning/ScreenOrientationWarning'
import { MessageBox } from '../lib/MessageBox/MessageBox'

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
    'One incorrect flagging is fine, but for any subsequent you\'ll be receiving an increasing penalty.',
    'If you accidentally leave the game, you can come back to it using the same link.',
    'If you step through the edge of the board, you\'ll find yourself at the opposite side.',
    'Both stepping and flagging a cell with a bonus will award you that bonus.',
    'Stuck in your corner? Step through the edge of the board to get to the other side.',
    'To win, you must not only gain the most points, but also stay alive (unless nobody stays alive).',
    'You can also play with your friends (up to max. 4 players) or practice by yourself.',
    'If no player flags any cell for 2 minutes, the game will end.',
]

const LeaveQueueButton = () => <Link className="leave-queue-link" to="/" replace><button className="outline secondary">Leave the queue</button></Link>

const Queue: FC = () => {
    const { socket } = useSocket()
    const { name: currentPlayerName } = usePreferences()
    const navigate = useNavigate()
    const { pathname } = useLocation()
    usePreload(Game, GameWrapper)

    const [players, setPlayers] = useState<string[]>([])
    const [progress, setProgress] = useState<number>(0)
    const [dequeuedSuccessfully, setDequeuedSuccessfully] = useState<(GameStateData & { gameId: number }) | null>(null)
    const [fadingOut, navigateToGame, startFadingOut] = useDelayedFlag(700)
    const interval = useRef<NodeJS.Timeout | null>(null)

    const tip = useRef(pickRandom(tips))
    const minWaitingTimePromise = useRef(new Promise(resolve => setTimeout(resolve, 1000)))
    
    useEffect(() => {
        socket.emit('join_queue')
        socket.on('queue_updated', ({ players }) => {
            setPlayers(players)
            if (!interval.current) {
                const getProgress = progressUpdaterFactory(new Date())
                interval.current = setInterval(() => setProgress(getProgress()), 100)
            }
        })
        socket.on('public_game_started', ({ gameId, gameState, playerColor, colorMapping }) => {
            minWaitingTimePromise.current.then(() => setDequeuedSuccessfully({ gameId, gameState, playerColor, colorMapping }))
        })
        return () => {
            socket.off('queue_update')
            socket.off('public_game_started')
            clearInterval(interval.current!)
        }
    }, [])

    useEffect(() => {
        if (dequeuedSuccessfully && !navigateToGame) {
            setTimeout(startFadingOut, 1500)
        } else if (dequeuedSuccessfully && navigateToGame) {
            const { gameId, ...stateData } = dequeuedSuccessfully
            navigate(`/game/${gameId}`, { replace: true, state: { ...stateData, origin: pathname } })
        }
    }, [dequeuedSuccessfully, navigateToGame])

    const leaveQueue = () => !dequeuedSuccessfully && socket.emit('leave_queue')

    useEffect(() => {
        window.addEventListener('beforeunload', leaveQueue)
        return () => {
            window.removeEventListener('beforeunload', leaveQueue)
            leaveQueue()
        }
    }, [])

    const header = dequeuedSuccessfully ? 'Let\'s play!' : progress <= 13250 ? 'Finding your opponents...' : 'This is taking a bit longer than expected...'

    return (
        <div className={cn('queue', { disappearing: fadingOut })}>
            <div className="wrapper">
                <main>
                    <h1>{header}</h1>
                    <PlayerList
                        players={players}
                        currentPlayerName={currentPlayerName!}
                        highlight={!!dequeuedSuccessfully}
                        progressComponent={<progress value={dequeuedSuccessfully ? 15000 : progress} max="15000" />}
                    />
                    <LeaveQueueButton />
                </main>
                <div className="tips-wrapper">
                    <ScreenOrientationWarning />
                    <MessageBox>
                        <h3>Tip</h3>
                        {tip.current}
                    </MessageBox>
                    <LeaveQueueButton />
                </div>
            </div>
        </div>
    )
}

export default Queue
