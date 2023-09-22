import { FC, useEffect, useState } from 'react'
import { useSocket } from '../../hooks/useSocket'
import { GameStateData } from './GameWrapper/GameWrapper'
import { useGameState } from '../../hooks/useGameState'
import { Scoreboard } from './Scoreboard/Scoreboard'
import { CellGrid } from './CellGrid/CellGrid'
import { SteeringBoard } from './SteeringBoard/SteeringBoard'
import { useParams } from 'react-router'
import { ActionResult, RawGameState } from '../../types/model'
import { GameSummary } from '../GameSummary/GameSummary'
import { useCellSize } from './useCellSize'
import { useSettings } from '../../hooks/useSettings'
import cn from 'classnames'

import './Game.scss'

export type ActionType = 'STEP' | 'FLAG'
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

export const Game: FC<GameStateData> = ({ gameState: rawGameState, playerColor, colorMapping }) => {
    const { socket } = useSocket()
    const { gameId } = useParams()
    const [props, gameState, events, resolveAction, setGameState] = useGameState(rawGameState)
    const [goToSummary, setGoToSummary] = useState(false)

    const [cellSizePx, containerRef, scoreboardRef] = useCellSize(props.dims)
    const { showOnScreenControls } = useSettings()

    const handlePlayerAction = (actionType: ActionType, direction: Direction) => {
        socket.emit('player_action', { gameId, actionType, direction })
    }

    useEffect(() => {
        const actionListener = (e: KeyboardEvent) => {
            switch (e.code) {
            case 'ArrowUp':
                return handlePlayerAction('STEP', 'UP')
            case 'ArrowDown':
                return handlePlayerAction('STEP', 'DOWN')
            case 'ArrowLeft':
                return handlePlayerAction('STEP', 'LEFT')
            case 'ArrowRight':
                return handlePlayerAction('STEP', 'RIGHT')
            case 'KeyW':
                return handlePlayerAction('FLAG', 'UP')
            case 'KeyS':
                return handlePlayerAction('FLAG', 'DOWN')
            case 'KeyA':
                return handlePlayerAction('FLAG', 'LEFT')
            case 'KeyD':
                return handlePlayerAction('FLAG', 'RIGHT')
            default:
                return
            }
        }
        document.addEventListener('keyup', actionListener)
        return () => document.removeEventListener('keyup', actionListener)
    }, [])

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
            const timeout = setTimeout(() => setGoToSummary(true), 3000)
            return () => clearTimeout(timeout)
        }
    }, [props.end])

    if (goToSummary) {
        return <GameSummary gameState={gameState} colorMapping={colorMapping} playerColor={playerColor} />
    }
    
    return (
        <div className="game-page">
            {/* Ads could go here */}
            <div className="game-container" ref={containerRef}>
                <div className={cn('game-layout', { keyboard: !showOnScreenControls })}>
                    <Scoreboard
                        ref={scoreboardRef}
                        players={props.players}
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
