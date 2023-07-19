import { FC, useEffect, useState } from 'react'
import { useSocket } from '../../hooks/useSocket'
import { GameStateResponse } from './GameWrapper/GameWrapper'
import { useGameState } from '../../hooks/useGameState'
import { Scoreboard } from './Scoreboard/Scoreboard'
import { CellGrid } from './CellGrid/CellGrid'
import { useParams } from 'react-router'
import { ActionResult, RawGameState } from '../../types/model'
import { GameSummary } from '../GameSummary/GameSummary'

import './Game.scss'

export type ActionType = 'STEP' | 'FLAG'
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

export const Game: FC<GameStateResponse> = ({ gameState, playerColor }) => {
    const { socket } = useSocket()
    const { gameId } = useParams()
    const [props, resolveAction, setGameState] = useGameState(gameState)
    const [moveToSummaryScreen, setMoveToSummaryScreen] = useState(false)

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
        return () => {
            document.removeEventListener('keyup', actionListener)
        }
    }, [])

    useEffect(() => {
        socket.on('action_result', (actionResult?: ActionResult) => {
            if (actionResult) {
                resolveAction(actionResult)
            }
        })
        socket.on('game_finished', (gameState: RawGameState) => {
            setGameState(gameState)
        })
        return () => {
            socket.off('action_result')
            socket.off('game_finished')
        }
    }, [])

    useEffect(() => {
        let timeout: NodeJS.Timeout
        if (props.isFinished) {
            timeout = setTimeout(() => {
                setMoveToSummaryScreen(true)
            }, 3000)
        }
        return () => {
            clearTimeout(timeout)
        }
    }, [props.isFinished])

    if (moveToSummaryScreen) {
        return <GameSummary gameDef={props} />
    }
    
    return (
        <div className="game-layout">
            <div>You play as {playerColor} start at {String(props.start)}</div>
            <Scoreboard
                players={props.players}
                minesLeft={props.minesLeft}
                gameStart={props.start}
                endScheduled={props.endScheduled}
                isFinished={props.isFinished}
            />
            <CellGrid dims={props.dims} cells={props.cells} players={props.players} />
            {/*<SteeringBoard onPlayerAction={handlePlayerAction} />*/}
        </div>
    )
}
