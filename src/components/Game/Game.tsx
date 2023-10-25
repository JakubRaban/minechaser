import { FC, useEffect, useState, useCallback, useRef, useLayoutEffect } from 'react'
import { useSocket } from '../../hooks/context/useSocket'
import { GameStateData } from './GameWrapper/GameWrapper'
import { useGameState } from '../../hooks/useGameState'
import { Scoreboard } from './Scoreboard/Scoreboard'
import { CellGrid } from './CellGrid/CellGrid'
import { SteeringBoard } from './SteeringBoard/SteeringBoard'
import { useParams } from 'react-router'
import { ActionResult, RawGameState } from '../../types/model'
import { useCellSize } from './useCellSize'
import { usePreferences } from '../../hooks/context/usePreferences'
import cn from 'classnames'
import { GameSummary } from '../lazy-components'
import { useDelayedFlag } from '../../hooks/useDelayedFlag'
import { calculatePosition } from '../../helpers'
import { useDateDiff } from '../../hooks/useDateDiff'
import { useStateRef } from '../../hooks/useStateRef'
import { Link } from 'react-router-dom'

import './Game.scss'

export type ActionType = 'STEP' | 'FLAG'
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

interface GameProps extends GameStateData {
    isPrivate: boolean
}

const keyToDirection: Record<string, Direction> = {
    ArrowUp: 'UP',
    ArrowDown: 'DOWN',
    ArrowLeft: 'LEFT',
    ArrowRight: 'RIGHT',
    KeyW: 'UP',
    KeyA: 'LEFT',
    KeyS: 'DOWN',
    KeyD: 'RIGHT',
}

const Game: FC<GameProps> = ({ gameState: rawGameState, playerColor, colorMapping, isPrivate }) => {
    const { socket } = useSocket()
    const { gameId } = useParams()
    const dateDiff = useDateDiff()
    const gamePageRef = useRef<HTMLDivElement>(null)

    const [props, gameState, events, resolveAction, setGameState] = useGameState(rawGameState, playerColor)
    const isSinglePlayer = Object.entries(colorMapping).length === 1
    const { position, alive } = props.players[playerColor]!
    const [optimisticPositionState, optimisticPositionRef, setOptimisticPosition] = useStateRef(position)
    const [localActionCounter, setLocalActionCounter] = useState(0)

    const [showDefeatedMessage, setShowDefeatedMessage] = useState(false)
    const [fadeOut, goToSummary, startFadingOut] = useDelayedFlag(700)

    const [cellSizePx, containerRef, scoreboardRef, defeatedMessageRef] = useCellSize(props.dims)
    const { showOnScreenControls, invertControls } = usePreferences()

    const handlePlayerAction = (actionType: ActionType, direction: Direction) => {
        socket.emit('player_action', { gameId, actionType, direction })
        if (actionType === 'STEP') setOptimisticPosition(calculatePosition(optimisticPositionRef.current, props, direction, playerColor))
        setLocalActionCounter(c => c + 1)
    }

    const actionListener = useCallback((e: any) => {
        if (dateDiff(props.start, new Date()).millis > 0 || !alive) return
        const arrowAction: ActionType = invertControls ? 'FLAG' : 'STEP'
        const wasdAction: ActionType = invertControls ? 'STEP' : 'FLAG'
        const direction = keyToDirection[e.code]
        switch (e.code) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
            handlePlayerAction(arrowAction, direction)
            break
        case 'KeyW':
        case 'KeyS':
        case 'KeyA':
        case 'KeyD':
            handlePlayerAction(wasdAction, direction)
            break
        default:
            break
        }
    }, [position])

    useEffect(() => {
        if (localActionCounter === props.actionCounter) {
            setOptimisticPosition(position)
        }
    }, [props.actionCounter, localActionCounter])

    useEffect(() => {
        gamePageRef.current?.focus()

        let timeout: NodeJS.Timeout
        socket.on('action_result', (actionResult?: ActionResult) => {
            if (actionResult) {
                resolveAction(actionResult)
            }
        })
        socket.on('game_finished', (finalGameState: RawGameState) => {
            setGameState(finalGameState)
        })
        return () => {
            socket.off('action_result')
            socket.off('game_finished')
            clearTimeout(timeout)
        }
    }, [])

    useEffect(() => {
        if (props.end) {
            GameSummary.preload()
            const timeout = setTimeout(startFadingOut, 2500)
            return () => clearTimeout(timeout)
        }
    }, [props.end])

    useEffect(() => {
        let timeout: NodeJS.Timeout
        if (!props.players[playerColor]!.alive && Object.values(props.players).some(p => p.alive)) {
            timeout = setTimeout(() => setShowDefeatedMessage(true), 1000)
        }
        return () => clearTimeout(timeout)
    }, [props.players])

    useLayoutEffect(() => {
        if (showDefeatedMessage) {
            window.dispatchEvent(new Event('resize'))
        }
    }, [showDefeatedMessage])

    if (goToSummary) {
        return (
            <GameSummary
                isPrivate={isPrivate}
                isSinglePlayer={isSinglePlayer}
                gameState={gameState}
                colorMapping={colorMapping}
                playerColor={playerColor}
            />
        )
    }
    
    return (
        <div className={cn('game-page', { disappearing: fadeOut })} tabIndex={0} onKeyUp={actionListener} ref={gamePageRef}>
            {/* Ads could go here */}
            <div className="game-container" ref={containerRef}>
                <div className={cn('game-layout', { keyboard: !showOnScreenControls })}>
                    <Scoreboard
                        ref={scoreboardRef}
                        players={props.players}
                        playerColor={playerColor}
                        colorMapping={colorMapping}
                        minesLeft={props.minesLeft}
                        gameStart={props.start}
                        endScheduled={props.endScheduled}
                        isFinished={props.isFinished}
                    />
                    <div className={cn('defeated-player-message', { hidden: !showDefeatedMessage })} ref={defeatedMessageRef}>
                        You&apos;re spectating.&nbsp;
                        {!isPrivate && !isSinglePlayer && <Link to="/queue">Play again</Link>}
                        <Link to="/">Main Menu</Link>
                    </div>
                    <CellGrid
                        dims={props.dims}
                        cells={props.cells}
                        players={props.players}
                        playerColor={playerColor}
                        optimisticPosition={optimisticPositionState}
                        gameStart={props.start}
                        cellSizePx={cellSizePx}
                        events={events}
                    />
                    <SteeringBoard onAction={handlePlayerAction} playerColor={playerColor} />
                </div>
            </div>
        </div>
    )
}

export default Game
