import { FC, useState } from 'react'
import { ActionType, Direction } from '../Game'
import { SteeringBoardArrow } from '../../../icons/SteeringBoardArrow/SteeringBoardArrow'
import { FlagIcon } from '../../../icons/Flag/FlagIcon'
import { PlayerColor } from '../../../types/model'
import { usePlayerColorToClassName } from '../../../hooks/usePlayerColorToClassName'
import cn from 'classnames'

import './SteeringBoard.scss'

interface SteeringBoardProps {
    onAction: (actionType: ActionType, direction: Direction) => void
    playerColor: PlayerColor
}

export const SteeringBoard: FC<SteeringBoardProps> = ({ onAction, playerColor }) => {
    const [isFlagging, setIsFlagging] = useState(false)
    const toClassName = usePlayerColorToClassName()

    const handleAction = (direction: Direction) => () => {
        onAction(isFlagging ? 'FLAG' : 'STEP', direction)
        setIsFlagging(false)
    }

    const PlayerFlag: FC<{ standalone?: boolean; light?: boolean }> = ({ standalone, light }) => standalone || isFlagging ? <FlagIcon className={cn({ standalone })} fillClassName={cn(toClassName(playerColor))} light={light} /> : null

    return (
        <div className="steering-board">
            <div className="buttons">
                <button className="dummy" />
                <button className="vertical" onClick={handleAction('UP')}>
                    <SteeringBoardArrow direction="UP" />
                    <PlayerFlag light />
                </button>
                <button onClick={() => setIsFlagging(c => !c)} className={cn('activate-flag-button', { inactive: !isFlagging })}><PlayerFlag standalone /></button>
                <button onClick={handleAction('LEFT')}>
                    <SteeringBoardArrow direction="LEFT" />
                    <PlayerFlag light />
                </button>
                <button className="vertical" onClick={handleAction('DOWN')}>
                    <PlayerFlag light />
                    <SteeringBoardArrow direction="DOWN" />
                </button>
                <button onClick={handleAction('RIGHT')}>
                    <PlayerFlag light />
                    <SteeringBoardArrow direction="RIGHT" />
                </button>
            </div>
        </div>
    )
}
