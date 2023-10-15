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

    return (
        <div className="steering-board">
            <div className="buttons">
                <button style={{ visibility: 'hidden' }} />
                <button onClick={handleAction('UP')}><SteeringBoardArrow direction="UP" /></button>
                <button onClick={() => setIsFlagging(true)} className={cn({ inactive: !isFlagging })}><FlagIcon fillClassName={toClassName(playerColor)} /></button>
                <button onClick={handleAction('LEFT')}><SteeringBoardArrow direction="LEFT" /></button>
                <button onClick={handleAction('DOWN')}><SteeringBoardArrow direction="DOWN" /></button>
                <button onClick={handleAction('RIGHT')}><SteeringBoardArrow direction="RIGHT" /></button>
            </div>
        </div>
    )
}
