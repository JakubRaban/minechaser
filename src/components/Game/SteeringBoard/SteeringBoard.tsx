import { FC, useState } from 'react'
import { ActionType, Direction } from '../Game'

import './SteeringBoard.scss'

interface SteeringBoardProps {
    onAction: (actionType: ActionType, direction: Direction) => void
}

export const SteeringBoard: FC<SteeringBoardProps> = ({ onAction }) => {
    const [isFlagging, setIsFlagging] = useState(false)

    const handleAction = (direction: Direction) => {
        onAction(isFlagging ? 'FLAG' : 'STEP', direction)
        setIsFlagging(false)
    }

    return (
        <div className="steering-board">
            <div className="buttons">
                <button>a</button>
                <button onClick={() => handleAction('UP')}>u</button>
                <button onClick={() => setIsFlagging(true)}>f</button>
                <button onClick={() => handleAction('LEFT')}>l</button>
                <button onClick={() => handleAction('DOWN')}>d</button>
                <button onClick={() => handleAction('RIGHT')}>r</button>
            </div>
        </div>
    )
}
