import { FC, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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
import { calculatePosition, pickRandom } from '../../helpers'
import { useDateDiff } from '../../hooks/useDateDiff'
import { useStateRef } from '../../hooks/useStateRef'
import { Link } from 'react-router-dom'
import { useAudio } from '../../hooks/context/useAudio'

import flag1 from '/sounds/flag1.mp3'
import flag2 from '/sounds/flag2.mp3'
import flag3 from '/sounds/flag3.mp3'
import flag4 from '/sounds/flag4.mp3'
import flag5 from '/sounds/flag5.mp3'
import step1 from '/sounds/step1.mp3'
import step2 from '/sounds/step2.mp3'
import step3 from '/sounds/step3.mp3'
import step4 from '/sounds/step4.mp3'
import step5 from '/sounds/step5.mp3'
import uncover1 from '/sounds/uncover1.mp3'
import uncover2 from '/sounds/uncover2.mp3'
import uncover3 from '/sounds/uncover3.mp3'
import incorrectFlag from '/sounds/incorrectflag.mp3'
import explode from '/sounds/explode.mp3'
import gameSuccess from '/sounds/gamesuccess.mp3'

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

const flagSounds = [flag1, flag2, flag3, flag4, flag5].map(f => {
    const a = new Audio(f)
    a.volume = 0.6
    return a
})
const stepSounds = [step1, step2, step3, step4, step5].map(f => new Audio(f))
const uncoverSounds = [uncover1, uncover2, uncover3].map(f => {
    const a = new Audio(f)
    a.volume = 0.8
    return a
})
const incorrectFlagSound = new Audio(incorrectFlag)
incorrectFlagSound.volume = 0.5
const explodeSound = new Audio(explode)
const gameSuccessSound = new Audio(gameSuccess)

const Game: FC<GameProps> = ({ gameState: rawGameState, playerColor, colorMapping, isPrivate }) => {
    const { socket } = useSocket()
    const { gameId } = useParams()
    const dateDiff = useDateDiff()
    const gamePageRef = useRef<HTMLDivElement>(null)
    const { playGameMusic, stopMusic } = useAudio()

    const [props, gameState, events, resolveAction, setGameState] = useGameState(rawGameState, playerColor)
    const isSinglePlayer = Object.entries(colorMapping).length === 1
    const { position, alive } = props.players[playerColor]!
    const [optimisticPositionState, optimisticPositionRef, setOptimisticPosition] = useStateRef(position)
    const [localActionCounter, setLocalActionCounter] = useState(0)

    const [showDefeatedMessage, setShowDefeatedMessage] = useState(false)
    const [fadeOut, goToSummary, startFadingOut] = useDelayedFlag(700)

    const [cellSizePx, containerRef, scoreboardRef, defeatedMessageRef] = useCellSize(props.dims)
    const { showOnScreenControls, invertControls, controlsOnLeft, disableSoundEffects, setSettings } = usePreferences()

    const handlePlayerAction = (actionType: ActionType, direction: Direction) => {
        socket.emit('player_action', { gameId, actionType, direction })
        if (actionType === 'STEP') setOptimisticPosition(calculatePosition(optimisticPositionRef.current, props, direction))
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
        playGameMusic()

        const actionHandler = (serverSide: boolean) => (actionResult?: ActionResult) => {
            if (actionResult) {
                resolveAction(actionResult, serverSide)
                if (!disableSoundEffects) {
                    if (actionResult.events?.includes('MineCellStepped')) explodeSound.play()
                    if (actionResult.players?.[playerColor]) {
                        if (actionResult.events?.includes('MineFreeCellFlagged')) incorrectFlagSound.play()
                        else if (actionResult.events?.includes('MineCellFlagged')) pickRandom(flagSounds).play()
                        else if (actionResult.events?.includes('MineFreeCellStepped')) pickRandom(uncoverSounds).play()
                        else if (actionResult.events?.includes('UncoveredCellStepped')) pickRandom(stepSounds).play()
                    }
                }
            }
        }

        socket.on('action_result', actionHandler(false))
        socket.on('server_action_result', actionHandler(true))

        socket.on('game_finished', (finalGameState: RawGameState) => {
            setGameState(finalGameState)
        })

        return () => {
            socket.off('action_result')
            socket.off('game_finished')
        }
    }, [])

    useEffect(() => {
        if (props.end) {
            if (!disableSoundEffects && props.minesLeft === 0 && Object.values(props.players).some(p => p.alive)) {
                gameSuccessSound.play()
            }
            GameSummary.preload()
            stopMusic()
            const timeout = setTimeout(startFadingOut, 2000)
            return () => clearTimeout(timeout)
        }
    }, [props.end])

    useEffect(() => {
        let timeout: NodeJS.Timeout
        if (!alive && Object.values(props.players).some(p => p.alive)) {
            timeout = setTimeout(() => setShowDefeatedMessage(true), 1000)
        }
        return () => clearTimeout(timeout)
    }, [alive])

    useLayoutEffect(() => {
        if (showDefeatedMessage) {
            window.dispatchEvent(new Event('resize'))
        }
    }, [showDefeatedMessage])

    const scoreboardPlayers = useMemo(
        () => props.players,
        [
            props.players.RED?.score, props.players.GREEN?.score, props.players.BLUE?.score, props.players.YELLOW?.score,
            props.players.RED?.alive, props.players.GREEN?.alive, props.players.BLUE?.alive, props.players.YELLOW?.alive,
            props.players.RED?.bonus?.name, props.players.GREEN?.bonus?.name,
            props.players.BLUE?.bonus?.name, props.players.YELLOW?.bonus?.name,
        ],
    )

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
                <div className={cn('game-layout', { keyboard: !showOnScreenControls, 'controls-on-left': controlsOnLeft })}>
                    {showOnScreenControls && (
                        <div className="controls-on-left-panel">
                            <label>
                                <input type="checkbox" role="switch" checked={controlsOnLeft} onChange={e => setSettings(s => ({ ...s, controlsOnLeft: e.target.checked }))} />
                                Show on the left
                            </label>
                        </div>
                    )}
                    <Scoreboard
                        ref={scoreboardRef}
                        players={scoreboardPlayers}
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
