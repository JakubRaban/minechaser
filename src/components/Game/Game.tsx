import { FC, useEffect, useState, useCallback } from 'react'
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

    const [props, gameState, events, resolveAction, setGameState] = useGameState(rawGameState, playerColor)
    const isSinglePlayer = Object.entries(colorMapping).length === 1
    const { position, alive } = props.players[playerColor]!
    const [optimisticPositionState, optimisticPositionRef, setOptimisticPosition] = useStateRef(position)
    const [localActionCounter, setLocalActionCounter] = useState(0)

    const [fadeOut, goToSummary, startFadingOut] = useDelayedFlag(700)

    const [cellSizePx, containerRef, scoreboardRef] = useCellSize(props.dims)
    const { showOnScreenControls, invertControls } = usePreferences()

    const handlePlayerAction = (actionType: ActionType, direction: Direction) => {
        socket.emit('player_action', { gameId, actionType, direction })
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
            if (arrowAction === 'STEP') setOptimisticPosition(calculatePosition(optimisticPositionRef.current, props, direction, playerColor))
            break
        case 'KeyW':
        case 'KeyS':
        case 'KeyA':
        case 'KeyD':
            handlePlayerAction(wasdAction, direction)
            if (wasdAction === 'STEP') setOptimisticPosition(calculatePosition(optimisticPositionRef.current, props, direction, playerColor))
            break
        default:
            break
        }
        setLocalActionCounter(c => c + 1)
    }, [position])

    useEffect(() => {
        if (localActionCounter === props.actionCounter) {
            setOptimisticPosition(position)
        }
    }, [props.actionCounter, localActionCounter])

    useEffect(() => {
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

    if (goToSummary) {
        return <GameSummary
            isPrivate={isPrivate}
            isSinglePlayer={isSinglePlayer}
            gameState={gameState}
            colorMapping={colorMapping}
            playerColor={playerColor}
        />
    }
    
    return (
        <div className={cn('game-page', { disappearing: fadeOut })} tabIndex={0} onKeyUp={actionListener}>
            {/* Ads could go here */}
            <div className="game-container" ref={containerRef}>
                <div className={cn('game-layout', { keyboard: !showOnScreenControls })}>
                    <Scoreboard
                        ref={scoreboardRef}
                        players={props.players}
                        playerColor={playerColor}
                        isPrivate={isPrivate}
                        isSinglePlayer={isSinglePlayer}
                        colorMapping={colorMapping}
                        minesLeft={props.minesLeft}
                        gameStart={props.start}
                        endScheduled={props.endScheduled}
                        isFinished={props.isFinished}
                    />
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
                    <SteeringBoard onAction={handlePlayerAction} />
                </div>
            </div>
        </div>
    )
}

export default Game
