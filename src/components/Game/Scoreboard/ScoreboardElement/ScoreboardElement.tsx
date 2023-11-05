import { memo, PropsWithChildren } from 'react'
import { PlayerColor } from '../../../../types/model'
import cn from 'classnames'
import { usePlayerColorToClassName } from '../../../../hooks/usePlayerColorToClassName'
import { usePreferences } from '../../../../hooks/context/usePreferences'

import './ScoreboardElement.scss'

interface ScoreboardElementBaseProps {
    label: string
    className: string
    color?: PlayerColor
    highlight?: boolean
    backdrop?: boolean
}

type ScoreboardElementProps = PropsWithChildren<ScoreboardElementBaseProps>

export const ScoreboardElement = memo<ScoreboardElementProps>(({ label, color, className, children, backdrop, highlight }) => {
    const playerColorToClassName = usePlayerColorToClassName()
    const { colorBlindMode } = usePreferences()

    return (
        <div className={cn('scoreboard-element', className, playerColorToClassName(color))}>
            {backdrop && !colorBlindMode && <div className="scoreboard-element-backdrop" />}
            <div className={cn('scoreboard-element-label', { highlight, strike: backdrop && colorBlindMode })}>
                {label}
            </div>
            <div className="scoreboard-element-content">
                {children}
            </div>
        </div>
    )
})
