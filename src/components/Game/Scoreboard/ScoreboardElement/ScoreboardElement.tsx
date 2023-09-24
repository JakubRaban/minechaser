import { FC, PropsWithChildren } from 'react'
import { PlayerColor } from '../../../../types/model'
import cn from 'classnames'
import { usePlayerColorToClassName } from '../../../../hooks/usePlayerColorToClassName'

import './ScoreboardElement.scss'

interface ScoreboardElementBaseProps {
    label: string
    className: string
    color?: PlayerColor
    backdrop?: boolean
}

type ScoreboardElementProps = PropsWithChildren<ScoreboardElementBaseProps>

export const ScoreboardElement: FC<ScoreboardElementProps> = ({ label, color, className, children, backdrop }) => {
    const playerColorToClassName = usePlayerColorToClassName()
    
    return (
        <div className={cn('scoreboard-element', className, playerColorToClassName(color))}>
            {backdrop && <div className="scoreboard-element-backdrop" />}
            <div className={cn('scoreboard-element-label')}>
                {label}
            </div>
            <div className="scoreboard-element-content">
                {children}
            </div>
        </div>
    )
}
