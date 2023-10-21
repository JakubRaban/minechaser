import { useKeyMap } from '../../../../hooks/useKeyMap'
import { usePreferences } from '../../../../hooks/context/usePreferences'
import { FC, PropsWithChildren } from 'react'
import { SteeringBoardArrow } from '../../../../icons/SteeringBoardArrow/SteeringBoardArrow'
import { FlagIcon } from '../../../../icons/Flag/FlagIcon'
import { PlayerColor } from '../../../../types/model'
import { usePlayerColorToClassName } from '../../../../hooks/usePlayerColorToClassName'

import './ControlsInstructions.scss'

const KeysVisualization: FC<{ keys: readonly [string, string, string, string] }> = ({ keys }) => (
    <div className="keys">
        <div className="key dummy" />
        <div className="key">{keys[0]}</div>
        <div className="key dummy" />
        <div className="key">{keys[1]}</div>
        <div className="key">{keys[2]}</div>
        <div className="key">{keys[3]}</div>
    </div>
)

const KeyVisualization: FC<PropsWithChildren> = ({ children }) => (
    <div className="key">{children}</div>
)

const ArrowVisualization = () => (
    <div className="keys">
        <div className="key dummy" />
        <div className="key"><SteeringBoardArrow direction="UP" /></div>
        <div className="key dummy" />
        <div className="key"><SteeringBoardArrow direction="LEFT" /></div>
        <div className="key"><SteeringBoardArrow direction="DOWN" /></div>
        <div className="key"><SteeringBoardArrow direction="RIGHT" /></div>
    </div>
)

export const ControlsInstructions: FC<{ playerColor: PlayerColor }> = ({ playerColor }) => {
    const { KeyW, KeyA, KeyS, KeyD } = useKeyMap()
    const { showOnScreenControls, invertControls } = usePreferences()
    const toClassName = usePlayerColorToClassName()
    
    const keys = [KeyW, KeyA, KeyS, KeyD] as const
    
    return (
        <div className="controls-instructions">
            <div className="instructions left">
                {showOnScreenControls || !invertControls ? <ArrowVisualization /> : <KeysVisualization keys={keys} />}
                <div className="action">to move</div>
            </div>
            <div className="instructions right">
                {showOnScreenControls ? (
                    <>
                        <KeyVisualization><FlagIcon light fillClassName={toClassName(playerColor)} /></KeyVisualization>
                        +
                        <ArrowVisualization />
                    </>
                ) : invertControls ? <ArrowVisualization /> : <KeysVisualization keys={keys} />}
                <div className="action">to flag</div>
            </div>
        </div>
    )
}
