import { FC, useEffect } from 'react'
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

import './Game.scss'

export type ActionType = 'STEP' | 'FLAG'
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

interface GameProps extends GameStateData {
    isPrivate: boolean
}

const Game: FC<GameProps> = ({ gameState: rawGameState, playerColor, colorMapping, isPrivate }) => {
    const { socket } = useSocket()
    const { gameId } = useParams()
    const [props, gameState, events, resolveAction, setGameState] = useGameState(rawGameState)

    const [fadeOut, goToSummary, startFadingOut] = useDelayedFlag(700)

    const [cellSizePx, containerRef, scoreboardRef] = useCellSize(props.dims)
    const { showOnScreenControls, invertControls } = usePreferences()

    const isSinglePlayer = Object.entries(colorMapping).length === 1

    const handlePlayerAction = (actionType: ActionType, direction: Direction) => {
        socket.emit('player_action', { gameId, actionType, direction })
    }

    useEffect(() => {
        const actionListener = (e: KeyboardEvent) => {
            const arrowAction: ActionType = invertControls ? 'FLAG' : 'STEP'
            const wasdAction: ActionType = invertControls ? 'STEP' : 'FLAG'
            switch (e.code) {
            case 'ArrowUp':
                return handlePlayerAction(arrowAction, 'UP')
            case 'ArrowDown':
                return handlePlayerAction(arrowAction, 'DOWN')
            case 'ArrowLeft':
                return handlePlayerAction(arrowAction, 'LEFT')
            case 'ArrowRight':
                return handlePlayerAction(arrowAction, 'RIGHT')
            case 'KeyW':
                return handlePlayerAction(wasdAction, 'UP')
            case 'KeyS':
                return handlePlayerAction(wasdAction, 'DOWN')
            case 'KeyA':
                return handlePlayerAction(wasdAction, 'LEFT')
            case 'KeyD':
                return handlePlayerAction(wasdAction, 'RIGHT')
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
        <div className={cn('game-page', { disappearing: fadeOut })}>
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
