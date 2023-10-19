import { FC } from 'react'
import { Direction } from '../../components/Game/Game'
import cn from 'classnames'

import './SteeringBoardArrow.scss'

interface SteeringBoardArrowProps {
    direction: Direction
}

export const SteeringBoardArrow: FC<SteeringBoardArrowProps> = ({ direction }) => {
    return (
        <svg className={cn('steering-board-arrow', direction.toLowerCase())} viewBox="390.754 -692.744 214.191 423.558" xmlns="http://www.w3.org/2000/svg">
            <path d="M400-280v-400l200 200-200 200Z" />
        </svg>
    )
}
